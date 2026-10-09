import type { AbrContext, AbrDecision, AbrLadderConfig } from './types'

export interface BolaConfig {
  V: number
  gamma: number
  upStep: number
}

export const DEFAULT_BOLA_CONFIG: BolaConfig = { V: 80, gamma: 1, upStep: 1 }

export interface BolaState {
  currentIndex: number
}

export function createBolaControl(
  ladder: AbrLadderConfig,
  config: BolaConfig = DEFAULT_BOLA_CONFIG,
) {
  const state: BolaState = { currentIndex: 0 }
  return {
    state,
    decide(ctx: AbrContext): AbrDecision {
      const { levels, segmentDuration } = ladder
      let best: { index: number; score: number } | null = null
      for (let i = 0; i < levels.length; i += 1) {
        const numerator = config.V * (levels[i].utility + config.gamma) - ctx.bufferSeconds
        if (numerator <= 0) continue
        const denominator = levels[i].bitrateKbps * segmentDuration
        const score = numerator / denominator
        if (best === null || score > best.score) best = { index: i, score }
      }
      if (best === null) return { index: state.currentIndex, bitrateKbps: levels[state.currentIndex].bitrateKbps }

      const clamp = Math.min(best.index, state.currentIndex + config.upStep)
      const index = best.index < state.currentIndex ? best.index : clamp
      state.currentIndex = index
      return { index, bitrateKbps: levels[index].bitrateKbps }
    },
  }
}