import { useCallback, useEffect, useRef, useState } from 'react'
import Hls, { Events, type ErrorData, type LevelSwitchedData } from 'hls.js'
import type { RefObject } from 'react'
import { createThroughputEstimator } from './throughput'

/** How playback is actually being delivered. */
export type StreamKind = 'hls-mse' | 'hls-native' | 'progressive'

export interface LevelSwitch {
  /** Milliseconds since the engine started. */
  atMs: number
  from: number
  to: number
}

export interface HlsEngineState {
  kind: StreamKind
  ready: boolean
  error: string | null
  /** Index of the level currently being played, or -1 when not yet known. */
  currentIndex: number
  /** Levels hls.js discovered from the master playlist. */
  levelCount: number
  /** Time from attach to the first playable frame, in milliseconds. */
  startupMs: number | null
  switches: LevelSwitch[]
  throughputKbps: number
  bytesLoaded: number
  /** Fragments hls.js has delivered — the denominator for per-segment cost. */
  segmentsLoaded: number
}

export interface HlsEngineOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  /** ABR master playlist, or null when the title has no packaged ladder. */
  masterUrl: string | null
  /** Progressive fallback, always available. */
  progressiveUrl: string
}

const INITIAL: HlsEngineState = {
  kind: 'progressive',
  ready: false,
  error: null,
  currentIndex: -1,
  levelCount: 0,
  startupMs: null,
  switches: [],
  throughputKbps: 0,
  bytesLoaded: 0,
  segmentsLoaded: 0,
}

/** Safari and iOS play HLS natively; MSE is unavailable or worse there. */
export function nativeHlsSupported(video: HTMLVideoElement | null) {
  return Boolean(video?.canPlayType('application/vnd.apple.mpegurl'))
}

/**
 * Owns the delivery of a title to the <video> element.
 *
 * Three paths, in order of preference: hls.js over MSE (gives us level
 * switching and real fragment-level throughput), native HLS where MSE is
 * unavailable, and the progressive file as a last resort. A fatal hls.js error
 * downgrades to progressive rather than leaving a dead player.
 *
 * The engine owns `src` exclusively — the caller must not set one — because
 * handing the element to hls.js and setting an attribute on it fight over the
 * same resource.
 */
export function useHlsEngine({ videoRef, masterUrl, progressiveUrl }: HlsEngineOptions) {
  const [state, setState] = useState<HlsEngineState>(INITIAL)
  const hlsRef = useRef<Hls | null>(null)
  const throughputRef = useRef(createThroughputEstimator())
  const startedRef = useRef(0)
  const bytesRef = useRef(0)
  const segmentsRef = useRef(0)
  const fallbackRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // A new title restarts every counter.
    throughputRef.current = createThroughputEstimator()
    bytesRef.current = 0
    segmentsRef.current = 0
    startedRef.current = performance.now()
    fallbackRef.current = false
    setState(INITIAL)

    let disposed = false
    let hls: Hls | null = null

    const markReady = () => {
      if (disposed) return
      setState((prev) =>
        prev.ready
          ? prev
          : { ...prev, ready: true, startupMs: Math.round(performance.now() - startedRef.current) },
      )
    }

    const useProgressive = () => {
      if (disposed || fallbackRef.current) return
      fallbackRef.current = true
      hls?.destroy()
      hls = null
      hlsRef.current = null
      video.src = progressiveUrl
      video.load()
      setState((prev) => ({ ...prev, kind: 'progressive', levelCount: 0, currentIndex: -1 }))
    }

    if (!masterUrl) {
      useProgressive()
      return () => {
        disposed = true
      }
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        // The controllers drive level selection; hls.js must not second-guess it.
        autoStartLoad: true,
        startLevel: -1,
        capLevelToPlayerSize: false,
        enableWorker: true,
      })
      hlsRef.current = hls

      hls.on(Events.MANIFEST_PARSED, (_event, data) => {
        if (disposed) return
        setState((prev) => ({ ...prev, kind: 'hls-mse', levelCount: data.levels.length }))
      })

      hls.on(Events.LEVEL_SWITCHED, (_event: Events.LEVEL_SWITCHED, data: LevelSwitchedData) => {
        if (disposed) return
        setState((prev) => ({
          ...prev,
          currentIndex: data.level,
          switches: [
            ...prev.switches.slice(-19),
            { atMs: Math.round(performance.now() - startedRef.current), from: prev.currentIndex, to: data.level },
          ],
        }))
      })

      // Real per-fragment throughput: bytes actually fetched over the wall-clock
      // time the fetch took. This replaces the old guess derived from buffer
      // growth, which could not tell a slow link from a short segment.
      hls.on(Events.FRAG_LOADED, (_event, data) => {
        if (disposed) return
        const stats = data.frag.stats
        const elapsed = stats.loading.end - stats.loading.start
        if (stats.loaded > 0 && elapsed > 0) {
          throughputRef.current.record((stats.loaded * 8) / 1000 / (elapsed / 1000))
        }
        bytesRef.current += stats.loaded
        segmentsRef.current += 1
        setState((prev) => ({
          ...prev,
          throughputKbps: throughputRef.current.estimate(),
          bytesLoaded: bytesRef.current,
          segmentsLoaded: segmentsRef.current,
        }))
      })

      hls.on(Events.ERROR, (_event, data: ErrorData) => {
        if (disposed || !data.fatal) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          // A transient segment failure is worth retrying; a dead source is not.
          if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            useProgressive()
            return
          }
          hls?.startLoad()
          return
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls?.recoverMediaError()
          return
        }
        setState((prev) => ({ ...prev, error: 'This stream could not be played.' }))
      })

      hls.attachMedia(video)
      hls.loadSource(masterUrl)
    } else if (nativeHlsSupported(video)) {
      video.src = masterUrl
      setState({ ...INITIAL, kind: 'hls-native' })
    } else {
      useProgressive()
    }

    const onPlaying = () => markReady()
    video.addEventListener('playing', onPlaying)
    video.addEventListener('loadeddata', onPlaying)

    return () => {
      disposed = true
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('loadeddata', onPlaying)
      hls?.destroy()
      hlsRef.current = null
    }
  }, [videoRef, masterUrl, progressiveUrl])

  /**
   * The ABR actuator. Assigning `nextLevel` (rather than `currentLevel`) makes
   * hls.js switch at the next segment boundary, so the change does not flush
   * the buffer mid-playback.
   */
  const applyLevel = useCallback((index: number) => {
    const hls = hlsRef.current
    if (!hls) return
    const levelCount = hls.levels.length
    if (levelCount === 0) return
    const target = Math.max(0, Math.min(levelCount - 1, Math.round(index)))
    if (hls.nextLevel !== -1 && hls.nextLevel === target) return
    hls.nextLevel = target
  }, [])

  /** Number of levels the engine can switch between (0 when not HLS). */
  const levelCount = state.kind === 'hls-mse' ? state.levelCount : 0

  return { state, applyLevel, levelCount }
}
