import { createBbaZeroControl, type BbaZeroConfig } from './bba'
import { createBolaControl, type BolaConfig } from './bola'
import { createDynamicControl, type DynamicConfig } from './dynamic'
import { createThroughputEstimator } from './throughput'
import type { AbrAlgorithmName, AbrLadderConfig, SimulationResult } from './types'

export interface SimulationOptions {
  algorithm: AbrAlgorithmName
  ladder: AbrLadderConfig
  bandwidthTraceKbps: readonly number[]
  bolaConfig?: BolaConfig
  bbaConfig?: BbaZeroConfig
  dynamicConfig?: DynamicConfig
}

export function simulate(options: SimulationOptions): SimulationResult {
  const { ladder, bandwidthTraceKbps } = options
  const algorithm = options.algorithm
  const controller =
    algorithm === 'bba0'
      ? createBbaZeroControl(ladder, options.bbaConfig)
      : algorithm === 'dynamic'
        ? createDynamicControl(ladder, options.dynamicConfig)
        : createBolaControl(ladder, options.bolaConfig)

  const throughput = createThroughputEstimator()
  let bufferSeconds = ladder.segmentDuration
  let lastBitrateKbps = ladder.levels[0].bitrateKbps
  let switches = 0
  let stalls = 0
  let rebufferTime = 0
  let playedTime = 0
  let totalBitrateTime = 0

  for (const bandwidthKbps of bandwidthTraceKbps) {
    const decision = controller.decide({
      bufferSeconds,
      lastBitrateKbps,
      throughputKbps: throughput.estimate(),
    })

    if (decision.bitrateKbps !== lastBitrateKbps) switches += 1
    lastBitrateKbps = decision.bitrateKbps

    const bits = decision.bitrateKbps * ladder.segmentDuration
    const downloadSeconds = bits / bandwidthKbps

    if (downloadSeconds > bufferSeconds) {
      rebufferTime += downloadSeconds - bufferSeconds
      stalls += 1
    }
    bufferSeconds = Math.max(0, bufferSeconds - downloadSeconds) + ladder.segmentDuration

    throughput.record(bandwidthKbps)
    playedTime += ladder.segmentDuration
    totalBitrateTime += decision.bitrateKbps * ladder.segmentDuration
  }

  return {
    algorithm,
    segments: bandwidthTraceKbps.length,
    rebufferRatio: rebufferTime / playedTime,
    averageBitrateKbps: totalBitrateTime / playedTime,
    switches,
    stalls,
    finalBufferSeconds: bufferSeconds,
  }
}