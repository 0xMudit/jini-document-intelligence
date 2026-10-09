import type { AbrLadderConfig } from './types'

export const YOUTUBE_LADDER: AbrLadderConfig = {
  segmentDuration: 4,
  levels: [
    { bitrateKbps: 235, utility: 0.56 },
    { bitrateKbps: 375, utility: 0.92 },
    { bitrateKbps: 560, utility: 1.32 },
    { bitrateKbps: 750, utility: 1.67 },
    { bitrateKbps: 1050, utility: 1.9 },
    { bitrateKbps: 1400, utility: 2 },
  ],
}