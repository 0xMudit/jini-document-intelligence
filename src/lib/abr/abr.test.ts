import { describe, expect, it } from 'vitest'
import { createBbaZeroControl } from './bba'
import { createBolaControl } from './bola'
import { createDynamicControl } from './dynamic'
import { YOUTUBE_LADDER } from './ladder'
import { simulate } from './simulator'
import { createThroughputEstimator } from './throughput'
import type { AbrLadderConfig } from './types'

const LADDER: AbrLadderConfig = {
  segmentDuration: 4,
  levels: [
    { bitrateKbps: 500, utility: 0.5 },
    { bitrateKbps: 1000, utility: 1 },
    { bitrateKbps: 2000, utility: 2 },
  ],
}

describe('throughput', () => {
  it('returns zero before any samples', () => {
    const t = createThroughputEstimator()
    expect(t.estimate()).toBe(0)
  })

  it('converges toward repeated samples', () => {
    const t = createThroughputEstimator(0.5)
    for (let i = 0; i < 20; i += 1) t.record(1000)
    expect(t.estimate()).toBe(1000)
  })

  it('smooths spikes', () => {
    const t = createThroughputEstimator(0.5)
    t.record(1000)
    t.record(2000)
    expect(t.estimate()).toBeGreaterThan(1000)
    expect(t.estimate()).toBeLessThan(2000)
  })
})

describe('BOLA', () => {
  it('picks lowest level when buffer is low', () => {
    const bola = createBolaControl(LADDER, { V: 80, gamma: 1, upStep: 100 })
    const decision = bola.decide({ bufferSeconds: 2, lastBitrateKbps: 500 })
    expect(decision.index).toBe(0)
  })

  it('picks top level when buffer is high', () => {
    const bola = createBolaControl(LADDER, { V: 80, gamma: 1, upStep: 100 })
    const decision = bola.decide({ bufferSeconds: 200, lastBitrateKbps: 500 })
    expect(decision.index).toBe(LADDER.levels.length - 1)
  })

  it('restricts upward jumps with upStep', () => {
    const bola = createBolaControl(LADDER, { V: 80, gamma: 1, upStep: 1 })
    bola.state.currentIndex = 0
    const decision = bola.decide({ bufferSeconds: 100, lastBitrateKbps: 500 })
    expect(decision.index).toBe(1)
  })

  it('drops freely', () => {
    const bola = createBolaControl(LADDER, { V: 80, gamma: 1, upStep: 1 })
    bola.state.currentIndex = 2
    const decision = bola.decide({ bufferSeconds: 2, lastBitrateKbps: 2000 })
    expect(decision.index).toBe(0)
  })
})

describe('BBA-0', () => {
  it('picks lowest level in the reservoir', () => {
    const bba = createBbaZeroControl(LADDER, { reservoirSeconds: 4, cushionSeconds: 12 })
    expect(bba.decide({ bufferSeconds: 2, lastBitrateKbps: 500 }).index).toBe(0)
    expect(bba.decide({ bufferSeconds: 4, lastBitrateKbps: 500 }).index).toBe(0)
  })

  it('picks top level above the cushion', () => {
    const bba = createBbaZeroControl(LADDER, { reservoirSeconds: 4, cushionSeconds: 12 })
    const decision = bba.decide({ bufferSeconds: 16, lastBitrateKbps: 500 })
    expect(decision.index).toBe(LADDER.levels.length - 1)
  })

  it('interpolates within the cushion', () => {
    const bba = createBbaZeroControl(LADDER, { reservoirSeconds: 4, cushionSeconds: 12 })
    const mid = bba.decide({ bufferSeconds: 10, lastBitrateKbps: 500 })
    expect(mid.index).toBeGreaterThanOrEqual(1)
    expect(mid.index).toBeLessThan(LADDER.levels.length - 1)
  })
})

describe('DYNAMIC', () => {
  it('uses throughput when buffer is low', () => {
    const dynamic = createDynamicControl(LADDER, {
      V: 80,
      gamma: 1,
      upStep: 100,
      throughputThresholdSeconds: 4,
      throughputMargin: 0.85,
    })
    const decision = dynamic.decide({ bufferSeconds: 1, lastBitrateKbps: 500, throughputKbps: 800 })
    expect(decision.bitrateKbps).toBe(500)
  })

  it('delegates to BOLA when buffer is high', () => {
    const dynamic = createDynamicControl(LADDER, {
      V: 80,
      gamma: 1,
      upStep: 100,
      throughputThresholdSeconds: 4,
      throughputMargin: 0.85,
    })
    const decision = dynamic.decide({ bufferSeconds: 200, lastBitrateKbps: 500, throughputKbps: 500 })
    expect(decision.index).toBe(LADDER.levels.length - 1)
  })
})

describe('simulator', () => {
  it('returns sane metrics for a uniform trace', () => {
    const trace = Array.from({ length: 120 }, () => 2000)
    const result = simulate({
      algorithm: 'bola',
      ladder: LADDER,
      bandwidthTraceKbps: trace,
      bolaConfig: { V: 80, gamma: 1, upStep: 1 },
    })
    expect(result.segments).toBe(120)
    expect(result.averageBitrateKbps).toBeGreaterThanOrEqual(500)
    expect(result.averageBitrateKbps).toBeLessThanOrEqual(2000)
    expect(result.rebufferRatio).toBe(0)
    expect(result.stalls).toBe(0)
    expect(result.switches).toBeGreaterThanOrEqual(0)
  })

  it('never stalls when bandwidth is always higher than top bitrate', () => {
    const trace = Array.from({ length: 60 }, () => 10000)
    for (const algo of ['bola', 'bba0', 'dynamic'] as const) {
      const result = simulate({
        algorithm: algo,
        ladder: YOUTUBE_LADDER,
        bandwidthTraceKbps: trace,
      })
      expect(result.stalls).toBe(0)
    }
  })

  it('stalls when bandwidth drops below minimum', () => {
    const trace = Array.from({ length: 60 }, () => 50)
    const result = simulate({
      algorithm: 'bola',
      ladder: LADDER,
      bandwidthTraceKbps: trace,
    })
    expect(result.stalls).toBeGreaterThan(0)
    expect(result.rebufferRatio).toBeGreaterThan(0)
  })
})