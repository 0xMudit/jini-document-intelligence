import { createBolaControl, type BolaConfig } from './bola'
import type { AbrContext, AbrDecision, AbrLadderConfig } from './types'

export interface DynamicConfig extends BolaConfig {
  throughputThresholdSeconds: number
  throughputMargin: number
}

export const DEFAULT_DYNAMIC_CONFIG: DynamicConfig = {
  V: 80,
  gamma: 1,
  upStep: 1,
  throughputThresholdSeconds: 4,
  throughputMargin: 0.85,
}

export function createDynamicControl(
  ladder: AbrLadderConfig,
  config: DynamicConfig = DEFAULT_DYNAMIC_CONFIG,
) {
  const bola = createBolaControl(ladder, config)
  const { levels } = ladder
  return {
    state: bola.state,
    decide(ctx: AbrContext): AbrDecision {
      if (ctx.bufferSeconds < config.throughputThresholdSeconds) {
        const cap = (ctx.throughputKbps ?? 0) * config.throughputMargin
        let index = 0
        for (let i = 0; i < levels.length; i += 1) {
          if (levels[i].bitrateKbps <= cap) index = i
          else break
        }
        bola.state.currentIndex = index
        return { index, bitrateKbps: levels[index].bitrateKbps }
      }
      const decision = bola.decide(ctx)
      return decision
    },
  }
}