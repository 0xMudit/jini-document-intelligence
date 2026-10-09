import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { createBbaZeroControl } from './bba'
import { createBolaControl } from './bola'
import { createDynamicControl } from './dynamic'
import { YOUTUBE_LADDER } from './ladder'
import { createThroughputEstimator } from './throughput'
import type {
  AbrAlgorithmName,
  AbrDecision,
  AbrInstrumentationSnapshot,
  AbrLadderConfig,
} from './types'

const SAMPLE_INTERVAL_MS = 1000
const MAX_HISTORY = 40

type AbrController =
  | ReturnType<typeof createBolaControl>
  | ReturnType<typeof createBbaZeroControl>
  | ReturnType<typeof createDynamicControl>

export interface AbrControlOptions {
  /**
   * The ladder to control. Falls back to a generic ladder only when the title
   * has no published one, which keeps the panel meaningful rather than blank.
   */
  ladder?: AbrLadderConfig | null
  /** When false the loop stops deciding (a title with no ladder to switch). */
  enabled?: boolean
  /**
   * Real measured throughput in kbps. When supplied it replaces the estimate
   * derived from buffer growth, which cannot distinguish a slow link from a
   * short segment.
   */
  getThroughputKbps?: () => number | null
  /** Index of the level currently applied, or null when unknown. */
  getAppliedIndex?: () => number | null
  /**
   * The actuator. Called with a rung index whenever the controller wants a
   * different quality; without it the hook only reports suggestions.
   */
  applyLevel?: (index: number) => void
}

function emptySnapshot(algorithm: AbrAlgorithmName, ladder: AbrLadderConfig): AbrInstrumentationSnapshot {
  return {
    algorithm,
    bufferSeconds: 0,
    throughputKbps: 0,
    suggestedIndex: 0,
    suggestedBitrateKbps: ladder.levels[0]?.bitrateKbps ?? 0,
    appliedIndex: null,
    history: [],
    metrics: { switches: 0, averageBitrateKbps: 0, uptimeSeconds: 0, bytesLoaded: 0 },
  }
}

/** Buffer seconds of media ahead of the playhead, and the furthest buffered point. */
function readBuffer(video: HTMLVideoElement) {
  let bufferSeconds = 0
  let maxBufferedEnd = 0
  for (let index = 0; index < video.buffered.length; index += 1) {
    const start = video.buffered.start(index)
    const end = video.buffered.end(index)
    if (end > maxBufferedEnd) maxBufferedEnd = end
    if (video.currentTime >= start && video.currentTime <= end) bufferSeconds = end - video.currentTime
  }
  return { bufferSeconds, maxBufferedEnd }
}

/**
 * Runs an ABR controller against a real player.
 *
 * On each sample it measures the buffer, reads throughput (measured by the
 * engine when available), asks the controller for a rung, and — crucially —
 * applies that rung through `applyLevel`. The snapshot then reports the level
 * that is actually playing alongside the one that was requested, so a
 * controller that is being ignored is visible rather than silent.
 */
export function useAbrInstrumentation(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: AbrControlOptions = {},
) {
  const { ladder, enabled = true, getThroughputKbps, getAppliedIndex, applyLevel } = options
  const activeLadder = ladder ?? YOUTUBE_LADDER

  const [algorithm, setAlgorithm] = useState<AbrAlgorithmName>('dynamic')
  const [snapshot, setSnapshot] = useState<AbrInstrumentationSnapshot>(() =>
    emptySnapshot('dynamic', activeLadder),
  )

  const controllerRef = useRef<{ name: AbrAlgorithmName; controller: AbrController } | null>(null)
  const fallbackThroughputRef = useRef(createThroughputEstimator())
  const lastBitrateRef = useRef(activeLadder.levels[0]?.bitrateKbps ?? 0)
  const maxBufferedEndRef = useRef(0)
  const lastNowRef = useRef(0)
  const optionsRef = useRef({ getThroughputKbps, getAppliedIndex, applyLevel, enabled })
  optionsRef.current = { getThroughputKbps, getAppliedIndex, applyLevel, enabled }

  const snapshotRef = useRef(snapshot)
  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  const rebuild = useCallback(
    (name: AbrAlgorithmName) => {
      const controller =
        name === 'bba0'
          ? createBbaZeroControl(activeLadder)
          : name === 'dynamic'
            ? createDynamicControl(activeLadder)
            : createBolaControl(activeLadder)
      controllerRef.current = { name, controller }
      fallbackThroughputRef.current = createThroughputEstimator()
      lastBitrateRef.current = activeLadder.levels[0]?.bitrateKbps ?? 0
      maxBufferedEndRef.current = 0
      lastNowRef.current = 0
      setSnapshot(emptySnapshot(name, activeLadder))
    },
    [activeLadder],
  )

  useEffect(() => {
    rebuild(algorithm)
  }, [algorithm, rebuild])

  const sample = useCallback(() => {
    const video = videoRef.current
    const holder = controllerRef.current
    const current = optionsRef.current
    if (!video || !holder || video.readyState === 0) return
    if (!current.enabled) return

    const now = performance.now()
    const dt = lastNowRef.current === 0 ? SAMPLE_INTERVAL_MS / 1000 : (now - lastNowRef.current) / 1000
    lastNowRef.current = now

    const { bufferSeconds, maxBufferedEnd } = readBuffer(video)

    // Only used when the engine has no measurement of its own (progressive
    // playback, or native HLS where per-fragment stats are unavailable).
    const growth = Math.max(0, maxBufferedEnd - maxBufferedEndRef.current)
    maxBufferedEndRef.current = maxBufferedEnd
    const bytesDelta = growth * lastBitrateRef.current * 125
    const measured = current.getThroughputKbps?.() ?? null
    if (measured === null && dt > 0 && bytesDelta > 0) {
      fallbackThroughputRef.current.record((bytesDelta * 8) / 1000 / dt)
    }
    const throughputKbps = measured ?? fallbackThroughputRef.current.estimate()

    const decision: AbrDecision = holder.controller.decide({
      bufferSeconds,
      lastBitrateKbps: lastBitrateRef.current,
      throughputKbps,
    })

    const previous = snapshotRef.current
    const appliedIndex = current.getAppliedIndex?.() ?? null
    // A switch counts only once the engine confirms a different level is
    // actually playing, so a request the player ignored is not counted.
    const switched =
      appliedIndex !== null && previous.appliedIndex !== null && appliedIndex !== previous.appliedIndex
    lastBitrateRef.current = decision.bitrateKbps

    current.applyLevel?.(decision.index)

    const history = [...previous.history, { index: decision.index, bitrateKbps: decision.bitrateKbps }].slice(
      -MAX_HISTORY,
    )

    setSnapshot({
      algorithm: holder.name,
      bufferSeconds,
      throughputKbps,
      suggestedIndex: decision.index,
      suggestedBitrateKbps: decision.bitrateKbps,
      appliedIndex,
      history,
      metrics: {
        switches: previous.metrics.switches + (switched ? 1 : 0),
        averageBitrateKbps:
          previous.metrics.uptimeSeconds + dt > 0
            ? (previous.metrics.averageBitrateKbps * previous.metrics.uptimeSeconds +
                decision.bitrateKbps * dt) /
              (previous.metrics.uptimeSeconds + dt)
            : decision.bitrateKbps,
        uptimeSeconds: previous.metrics.uptimeSeconds + dt,
        bytesLoaded: previous.metrics.bytesLoaded + bytesDelta,
      },
    })
  }, [videoRef])

  useEffect(() => {
    const interval = window.setInterval(sample, SAMPLE_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [sample])

  return { snapshot, algorithm, setAlgorithm, ladder: activeLadder }
}
