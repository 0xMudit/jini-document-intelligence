import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { request } from './api'

/**
 * Client-side quality-of-experience measurement.
 *
 * Only the browser can observe what decides whether a stream feels good: how
 * long the first frame took, how often playback stalled and for how long, and
 * how much data crossed the wire. This hook measures those and posts one
 * session record when playback ends.
 *
 * A rebuffer is counted from `waiting` (playback ran dry) to `playing` again.
 * Stalls shorter than 100ms are ignored as ordinary jitter, and anything before
 * the first frame is startup delay rather than a rebuffer, so the two are never
 * double-counted.
 */

const MIN_REBUFFER_MS = 100
const HEARTBEAT_MS = 5_000
const MAX_TRACES = 300

export interface QoeStartPayload {
  titleId: string
  episodeId?: string | null
  streamMode: 'direct' | 'hls'
  algorithm?: string
}

export interface QoeTracePoint {
  atMs: number
  level: number
  bitrateKbps: number
  bufferSeconds: number
  throughputKbps: number
}

export interface QoeSnapshot {
  appliedIndex: number | null
  bufferSeconds: number
  throughputKbps: number
  /** Engine-measured startup delay, reported with the session. */
  startupMs: number | null
}

export interface QoeReporterOptions {
  /** Latest ABR + engine readings, sampled on the heartbeat and at the end. */
  getSnapshot: () => QoeSnapshot
  /** Bitrate of the rung currently playing, in kbps (0 when unknown). */
  getAppliedBitrateKbps: () => number
  /** Segments the engine has actually delivered. */
  getSegmentsLoaded: () => number
  getBytesLoaded: () => number
  /** Whether playback reached the end of the title. */
  isCompleted: () => boolean
}

export interface QoeController {
  start: (payload: QoeStartPayload) => void
  finish: () => void
}

interface Accumulator {
  rebufferCount: number
  rebufferMs: number
  watchMs: number
  bufferTotal: number
  bufferSamples: number
  bitrateTotal: number
  bitrateSamples: number
  peakBitrateKbps: number
  switches: number
  traces: QoeTracePoint[]
}

function emptyAccumulator(): Accumulator {
  return {
    rebufferCount: 0,
    rebufferMs: 0,
    watchMs: 0,
    bufferTotal: 0,
    bufferSamples: 0,
    bitrateTotal: 0,
    bitrateSamples: 0,
    peakBitrateKbps: 0,
    switches: 0,
    traces: [],
  }
}

export function useQoeReporter(videoRef: RefObject<HTMLVideoElement | null>, options: QoeReporterOptions) {
  const sessionIdRef = useRef<string | null>(null)
  const topicRef = useRef<string | null>(null)
  const startedAtRef = useRef(0)
  const sentRef = useRef(false)
  const firstFrameRef = useRef(false)
  const firstFrameMsRef = useRef<number | null>(null)
  const stallStartRef = useRef<number | null>(null)
  const lastLevelRef = useRef<number | null>(null)
  const accRef = useRef<Accumulator>(emptyAccumulator())

  const optionsRef = useRef(options)
  optionsRef.current = options

  const reset = useCallback(() => {
    accRef.current = emptyAccumulator()
    firstFrameRef.current = false
    firstFrameMsRef.current = null
    stallStartRef.current = null
    lastLevelRef.current = null
    sentRef.current = false
    startedAtRef.current = performance.now()
  }, [])

  const start = useCallback(
    (payload: QoeStartPayload) => {
      if (sessionIdRef.current && topicRef.current === payload.titleId) return
      reset()
      topicRef.current = payload.titleId
      sessionIdRef.current = null
      void request<{ sessionId: string }>('/api/qoe/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((data) => {
          // A response for a title the user already left is not worth recording.
          if (topicRef.current === payload.titleId) sessionIdRef.current = data.sessionId
        })
        .catch(() => {
          sessionIdRef.current = null
        })
    },
    [reset],
  )

  const finish = useCallback(() => {
    const sessionId = sessionIdRef.current
    if (!sessionId || sentRef.current) {
      sessionIdRef.current = null
      topicRef.current = null
      return
    }
    sentRef.current = true
    const acc = accRef.current
    const report = {
      // Measured here rather than in the start call, because the first frame
      // arrives after the session has already been opened.
      startupMs: Math.round(firstFrameMsRef.current ?? optionsRef.current.getSnapshot().startupMs ?? 0),
      watchMs: Math.round(acc.watchMs),
      rebufferCount: acc.rebufferCount,
      rebufferMs: Math.round(acc.rebufferMs),
      switches: acc.switches,
      bytesLoaded: optionsRef.current.getBytesLoaded(),
      segmentsLoaded: optionsRef.current.getSegmentsLoaded(),
      avgBitrateKbps: acc.bitrateSamples ? Math.round(acc.bitrateTotal / acc.bitrateSamples) : 0,
      peakBitrateKbps: Math.round(acc.peakBitrateKbps),
      avgBufferSeconds: acc.bufferSamples
        ? Number((acc.bufferTotal / acc.bufferSamples).toFixed(2))
        : 0,
      completed: optionsRef.current.isCompleted(),
      samples: acc.traces,
    }
    sessionIdRef.current = null
    topicRef.current = null

    const url = `/api/qoe/sessions/${encodeURIComponent(sessionId)}`
    // sendBeacon survives the page unloading, which is when most reports fire.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(report)], { type: 'application/json' })
      if (navigator.sendBeacon(url, blob)) return
    }
    void request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      keepalive: true,
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const elapsed = () => Math.max(0, performance.now() - startedAtRef.current)

    const onPlaying = () => {
      const at = elapsed()
      if (stallStartRef.current !== null) {
        const stalled = at - stallStartRef.current
        if (stalled >= MIN_REBUFFER_MS && firstFrameRef.current) {
          accRef.current.rebufferCount += 1
          accRef.current.rebufferMs += stalled
        }
        stallStartRef.current = null
      }
      if (!firstFrameRef.current) {
        firstFrameRef.current = true
        firstFrameMsRef.current = at
      }
    }

    const onWaiting = () => {
      // A stall before the first frame is startup delay, already measured there.
      if (firstFrameRef.current && stallStartRef.current === null) stallStartRef.current = elapsed()
    }

    const onPause = () => {
      // Pausing is not watch time, and it cancels any in-flight stall.
      stallStartRef.current = null
    }

    const onTimeUpdate = () => {
      if (!video.paused && firstFrameRef.current) accRef.current.watchMs = elapsed()
    }

    const onEnded = () => finish()

    video.addEventListener('playing', onPlaying)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)

    const heartbeat = window.setInterval(() => {
      if (!sessionIdRef.current || !firstFrameRef.current || video.paused) return
      const acc = accRef.current
      const snapshot = optionsRef.current.getSnapshot()
      const level = snapshot.appliedIndex

      if (level !== null) {
        if (lastLevelRef.current !== null && level !== lastLevelRef.current) acc.switches += 1
        lastLevelRef.current = level

        const bitrate = optionsRef.current.getAppliedBitrateKbps()
        if (bitrate > 0) {
          acc.bitrateTotal += bitrate
          acc.bitrateSamples += 1
          if (bitrate > acc.peakBitrateKbps) acc.peakBitrateKbps = bitrate
        }

        acc.traces = [
          ...acc.traces.slice(-(MAX_TRACES - 1)),
          {
            atMs: Math.round(elapsed()),
            level,
            bitrateKbps: Math.round(bitrate),
            bufferSeconds: Number(snapshot.bufferSeconds.toFixed(2)),
            throughputKbps: Math.round(snapshot.throughputKbps),
          },
        ]
      }

      acc.bufferTotal += snapshot.bufferSeconds
      acc.bufferSamples += 1
    }, HEARTBEAT_MS)

    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
      window.clearInterval(heartbeat)
      // Leaving the player must still report what we measured.
      finish()
    }
  }, [videoRef, finish])

  return { start, finish }
}
