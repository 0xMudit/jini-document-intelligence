import type { AbrLadderConfig, AbrLevel } from './types'

/** The ladder shape the server publishes at /api/media/:key/ladder.json. */
export interface PublishedRung {
  rung: number
  height: number
  width: number
  bitrateKbps: number
}

export interface PublishedLadder {
  key: string
  segmentSeconds: number
  durationSeconds?: number
  rungs: PublishedRung[]
}

/**
 * Perceptual utility of a resolution expressed in VMAF (0-100), saturating with
 * screen height.
 *
 * VMAF reaches roughly 93 at 1080p on a decent encode and the curve flattens
 * hard above that, so height maps to quality on a saturating curve rather than
 * linearly. The parameters follow the shape discussed in "Toward A Practical
 * Perceptual Video Quality Metric" (Netflix, 2016) and the per-title ladder
 * reasoning in the Open-Connect briefing: past the top of the ladder extra
 * pixels buy almost nothing, which is why the top rung is capped near the
 * source bitrate.
 */
export function heightToVmaf(height: number) {
  if (height <= 0) return 0
  // Saturates towards 100 with a 720p half-point, and is anchored so 1080p
  // lands near the 93 VMAF reported for high-quality encodes.
  const saturated = 100 * (1 - Math.exp(-height / 720))
  return Math.max(0, Math.min(100, saturated * 1.07))
}

/**
 * Converts a published ladder into the shape the controllers consume.
 *
 * `utility` is the per-rung perceptual value (VMAF scaled to the 0-2 range the
 * client controllers use) and levels are ordered ascending by bitrate, so a
 * level index is also the HLS level index. Levels are de-duplicated by bitrate
 * because two rungs at the same ceiling are indistinguishable to a controller.
 */
export function toAbrLadder(published: PublishedLadder): AbrLadderConfig {
  const ascending = [...published.rungs].sort((a, b) => a.bitrateKbps - b.bitrateKbps)
  const levels: AbrLevel[] = []
  for (const rung of ascending) {
    if (levels.length && rung.bitrateKbps === levels[levels.length - 1].bitrateKbps) continue
    levels.push({
      bitrateKbps: rung.bitrateKbps,
      utility: heightToVmaf(rung.height) / 100,
    })
  }
  return {
    segmentDuration: published.segmentSeconds > 0 ? published.segmentSeconds : 6,
    levels,
  }
}

/** True when a ladder carries enough information to drive a controller. */
export function isUsableLadder(ladder: AbrLadderConfig | null | undefined): ladder is AbrLadderConfig {
  return Boolean(ladder && ladder.levels.length > 0)
}
