import type { AbrContext, AbrDecision, AbrLadderConfig } from './types'

export interface BbaZeroConfig {
  reservoirSeconds: number
  cushionSeconds: number
}

export const DEFAULT_BBA_ZERO_CONFIG: BbaZeroConfig = {
  reservoirSeconds: 4,
  cushionSeconds: 12,
}

export interface BbaZeroState {
  rateIndex: number
}

export function createBbaZeroControl(
  ladder: AbrLadderConfig,
  config: BbaZeroConfig = DEFAULT_BBA_ZERO_CONFIG,
) {
  const state: BbaZeroState = { rateIndex: 0 }
  const { levels } = ladder
  const rateMapAt = (bufferSeconds: number) => {
    const low = config.reservoirSeconds
    const high = config.reservoirSeconds + config.cushionSeconds
    if (bufferSeconds <= low) return 0
    if (bufferSeconds >= high) return levels[levels.length - 1].bitrateKbps
    const fraction = (bufferSeconds - low) / (high - low)
    return levels[0].bitrateKbps + fraction * (levels[levels.length - 1].bitrateKbps - levels[0].bitrateKbps)
  }
  return {
    state,
    decide(ctx: AbrContext): AbrDecision {
      const current = state.rateIndex
      const high = config.reservoirSeconds + config.cushionSeconds
      let nextIndex: number

      if (ctx.bufferSeconds <= config.reservoirSeconds) {
        nextIndex = 0
      } else if (ctx.bufferSeconds >= high) {
        nextIndex = levels.length - 1
      } else {
        const suggested = rateMapAt(ctx.bufferSeconds)
        const ratePlus = current === levels.length - 1 ? Infinity : levels[current + 1].bitrateKbps
        const rateMinus = current === 0 ? -Infinity : levels[current - 1].bitrateKbps
        const aboveCurrent = levels.filter((level) => level.bitrateKbps < suggested)
        if (suggested >= ratePlus) {
          nextIndex = aboveCurrent.length > 0 ? aboveCurrent.length - 1 : 0
        } else if (suggested <= rateMinus) {
          const belowCurrent = levels.findIndex((level) => level.bitrateKbps > suggested)
          nextIndex = belowCurrent === -1 ? current : belowCurrent
        } else {
          nextIndex = current
        }
      }

      const safeIndex = Math.max(0, Math.min(nextIndex, levels.length - 1))
      state.rateIndex = safeIndex
      return { index: safeIndex, bitrateKbps: levels[safeIndex].bitrateKbps }
    },
  }
}