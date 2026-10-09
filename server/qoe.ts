import { randomUUID } from "node:crypto";
import { database } from "./storage";

/**
 * Quality-of-experience recording.
 *
 * The player reports a session when a title starts and again when it ends,
 * carrying the measurements only the client can observe: how long the first
 * frame took, how often and how long playback stalled, which rendition was
 * requested versus which actually played, and how much data moved.
 *
 * Sessions are stored rather than accumulated into counters so the raw numbers
 * stay available — the aggregates below can be recomputed, and a single
 * pathological session can be excluded without losing the rest.
 */

export interface QoeSampleInput {
  atMs: number;
  level: number;
  bitrateKbps: number;
  bufferSeconds: number;
  throughputKbps: number;
}

export interface QoeStartInput {
  sessionId?: string;
  titleId: string;
  episodeId?: string | null;
  streamMode: "direct" | "hls";
  algorithm?: string;
  startupMs?: number;
}

export interface QoeReportInput {
  sessionId: string;
  startupMs?: number;
  watchMs?: number;
  rebufferCount?: number;
  rebufferMs?: number;
  switches?: number;
  bytesLoaded?: number;
  segmentsLoaded?: number;
  avgBitrateKbps?: number;
  peakBitrateKbps?: number;
  avgBufferSeconds?: number;
  completed?: boolean;
  samples?: QoeSampleInput[];
}

export interface QoeSessionRow {
  sessionId: string;
  userId: string;
  titleId: string;
  streamMode: string;
  algorithm: string;
  startedAt: string;
  endedAt: string | null;
  startupMs: number;
  watchMs: number;
  rebufferCount: number;
  rebufferMs: number;
  switches: number;
  bytesLoaded: number;
  segmentsLoaded: number;
  avgBitrateKbps: number;
  peakBitrateKbps: number;
  avgBufferSeconds: number;
  completed: boolean;
}

function clampNumber(value: number | undefined, min: number, max: number, fallback = 0) {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function startQoeSession(userId: string, input: QoeStartInput) {
  const sessionId = input.sessionId?.slice(0, 64) || randomUUID();
  database
    .prepare(
      `INSERT INTO qoe_sessions
         (session_id, user_id, title_id, episode_id, stream_mode, algorithm, started_at, startup_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id) DO NOTHING`,
    )
    .run(
      sessionId,
      userId,
      input.titleId,
      input.episodeId ?? "",
      input.streamMode,
      (input.algorithm ?? "").slice(0, 32),
      new Date().toISOString(),
      clampNumber(input.startupMs, 0, 120_000),
    );
  return sessionId;
}

/** Folds a session's final measurements in. Samples are replaced, not appended. */
export function finishQoeSession(userId: string, input: QoeReportInput) {
  const sessionId = input.sessionId.slice(0, 64);
  const existing = database
    .prepare("SELECT user_id FROM qoe_sessions WHERE session_id = ?")
    .get(sessionId) as { user_id: string } | undefined;
  if (!existing || existing.user_id !== userId) return false;

  const samples = (input.samples ?? []).slice(0, 600);
  if (samples.length) {
    database.prepare("DELETE FROM qoe_samples WHERE session_id = ?").run(sessionId);
    const insert = database.prepare(
      `INSERT INTO qoe_samples (session_id, at_ms, level, bitrate_kbps, buffer_seconds, throughput_kbps)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const sample of samples) {
      insert.run(
        sessionId,
        clampNumber(sample.atMs, 0, 24 * 3600_000),
        Math.round(clampNumber(sample.level, 0, 64)),
        clampNumber(sample.bitrateKbps, 0, 200_000),
        clampNumber(sample.bufferSeconds, 0, 3600),
        clampNumber(sample.throughputKbps, 0, 500_000),
      );
    }
  }

  database
    .prepare(
      `UPDATE qoe_sessions SET
         ended_at = ?, watch_ms = ?, rebuffer_count = ?, rebuffer_ms = ?, switches = ?,
         bytes_loaded = ?, segments_loaded = ?, avg_bitrate_kbps = ?, peak_bitrate_kbps = ?,
         avg_buffer_seconds = ?, completed = ?,
         startup_ms = CASE WHEN ? > 0 THEN ? ELSE startup_ms END
       WHERE session_id = ? AND user_id = ?`,
    )
    .run(
      new Date().toISOString(),
      clampNumber(input.watchMs, 0, 24 * 3600_000),
      Math.round(clampNumber(input.rebufferCount, 0, 10_000)),
      clampNumber(input.rebufferMs, 0, 24 * 3600_000),
      Math.round(clampNumber(input.switches, 0, 10_000)),
      Math.round(clampNumber(input.bytesLoaded, 0, 1e12)),
      Math.round(clampNumber(input.segmentsLoaded, 0, 1_000_000)),
      clampNumber(input.avgBitrateKbps, 0, 200_000),
      clampNumber(input.peakBitrateKbps, 0, 200_000),
      clampNumber(input.avgBufferSeconds, 0, 3600),
      input.completed ? 1 : 0,
      clampNumber(input.startupMs, 0, 120_000),
      clampNumber(input.startupMs, 0, 120_000),
      sessionId,
      userId,
    );
  return true;
}

const SESSION_COLUMNS = `session_id, user_id, title_id, episode_id, stream_mode, algorithm, started_at,
  ended_at, startup_ms, watch_ms, rebuffer_count, rebuffer_ms, switches, bytes_loaded,
  segments_loaded, avg_bitrate_kbps, peak_bitrate_kbps, avg_buffer_seconds, completed`;

function toSession(row: Record<string, unknown>): QoeSessionRow {
  return {
    sessionId: String(row.session_id),
    userId: String(row.user_id),
    titleId: String(row.title_id),
    streamMode: String(row.stream_mode),
    algorithm: String(row.algorithm),
    startedAt: String(row.started_at),
    endedAt: row.ended_at === null ? null : String(row.ended_at),
    startupMs: Number(row.startup_ms),
    watchMs: Number(row.watch_ms),
    rebufferCount: Number(row.rebuffer_count),
    rebufferMs: Number(row.rebuffer_ms),
    switches: Number(row.switches),
    bytesLoaded: Number(row.bytes_loaded),
    segmentsLoaded: Number(row.segments_loaded),
    avgBitrateKbps: Number(row.avg_bitrate_kbps),
    peakBitrateKbps: Number(row.peak_bitrate_kbps),
    avgBufferSeconds: Number(row.avg_buffer_seconds),
    completed: Number(row.completed) === 1,
  };
}

/** Only sessions that have reported an end, so aggregates are not skewed by live ones. */
export function listQoeSessions(limit = 50, titleId?: string): QoeSessionRow[] {
  const bounded = Math.max(1, Math.min(500, Math.round(limit)));
  const rows = titleId
    ? (database
        .prepare(
          `SELECT ${SESSION_COLUMNS} FROM qoe_sessions
           WHERE title_id = ? AND ended_at IS NOT NULL
           ORDER BY started_at DESC LIMIT ?`,
        )
        .all(titleId, bounded) as Record<string, unknown>[])
    : (database
        .prepare(
          `SELECT ${SESSION_COLUMNS} FROM qoe_sessions
           WHERE ended_at IS NOT NULL
           ORDER BY started_at DESC LIMIT ?`,
        )
        .all(bounded) as Record<string, unknown>[]);
  return rows.map(toSession);
}

export function listQoeSamples(sessionId: string, limit = 300) {
  const bounded = Math.max(1, Math.min(2000, Math.round(limit)));
  return (
    database
      .prepare(
        `SELECT at_ms, level, bitrate_kbps, buffer_seconds, throughput_kbps
         FROM qoe_samples WHERE session_id = ? ORDER BY at_ms LIMIT ?`,
      )
      .all(sessionId.slice(0, 64), bounded) as Record<string, unknown>[]
  ).map((row) => ({
    atMs: Number(row.at_ms),
    level: Number(row.level),
    bitrateKbps: Number(row.bitrate_kbps),
    bufferSeconds: Number(row.buffer_seconds),
    throughputKbps: Number(row.throughput_kbps),
  }));
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], fraction: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * fraction)));
  return sorted[index];
}

export interface QoeAggregates {
  sessions: number;
  completed: number;
  completionRate: number;
  startupMs: { mean: number; p50: number; p95: number };
  rebufferRatio: number;
  rebufferCount: number;
  watchMs: number;
  switches: number;
  avgBitrateKbps: number;
  peakBitrateKbps: number;
  avgBufferSeconds: number;
  bytesLoaded: number;
  /** 0-100, weighted towards stalls: a session that buffered is a bad session. */
  qoeScore: number;
}

export function aggregateQoe(sessions: QoeSessionRow[]): QoeAggregates {
  const startups = sessions.map((session) => session.startupMs).filter((value) => value > 0);
  const watchTotal = sessions.reduce((sum, session) => sum + session.watchMs, 0);
  const rebufferTotal = sessions.reduce((sum, session) => sum + session.rebufferMs, 0);
  const rebufferCount = sessions.reduce((sum, session) => sum + session.rebufferCount, 0);
  const completed = sessions.filter((session) => session.completed).length;

  // Rebuffer ratio is the industry measure: stalled time over total play time.
  const rebufferRatio = watchTotal + rebufferTotal > 0 ? rebufferTotal / (watchTotal + rebufferTotal) : 0;
  const startupPenalty = Math.min(1, percentile(startups, 0.95) / 8000);
  const qoeScore = Math.round(
    100 * (1 - Math.min(1, rebufferRatio * 4 + startupPenalty * 0.5)),
  );

  return {
    sessions: sessions.length,
    completed,
    completionRate: sessions.length ? completed / sessions.length : 0,
    startupMs: {
      mean: mean(startups),
      p50: percentile(startups, 0.5),
      p95: percentile(startups, 0.95),
    },
    rebufferRatio,
    rebufferCount,
    watchMs: watchTotal,
    switches: sessions.reduce((sum, session) => sum + session.switches, 0),
    avgBitrateKbps: mean(sessions.map((session) => session.avgBitrateKbps)),
    peakBitrateKbps: sessions.length ? Math.max(...sessions.map((session) => session.peakBitrateKbps)) : 0,
    avgBufferSeconds: mean(sessions.map((session) => session.avgBufferSeconds)),
    bytesLoaded: sessions.reduce((sum, session) => sum + session.bytesLoaded, 0),
    qoeScore,
  };
}

/** Per-title rollup for the analytics table. */
export function qoeByTitle(limit = 25) {
  const rows = database
    .prepare(
      `SELECT title_id, COUNT(*) AS sessions,
              SUM(rebuffer_ms) AS rebuffer_ms,
              SUM(watch_ms) AS watch_ms,
              SUM(switches) AS switches,
              AVG(startup_ms) AS startup_ms,
              AVG(avg_bitrate_kbps) AS avg_bitrate_kbps,
              SUM(completed) AS completed,
              SUM(bytes_loaded) AS bytes_loaded
       FROM qoe_sessions WHERE ended_at IS NOT NULL
       GROUP BY title_id ORDER BY sessions DESC, watch_ms DESC LIMIT ?`,
    )
    .all(Math.max(1, Math.min(200, Math.round(limit)))) as Record<string, unknown>[];

  return rows.map((row) => {
    const watch = Number(row.watch_ms);
    const rebuffer = Number(row.rebuffer_ms);
    return {
      titleId: String(row.title_id),
      sessions: Number(row.sessions),
      completed: Number(row.completed),
      completionRate: Number(row.sessions) ? Number(row.completed) / Number(row.sessions) : 0,
      watchMs: watch,
      rebufferRatio: watch + rebuffer > 0 ? rebuffer / (watch + rebuffer) : 0,
      switches: Number(row.switches),
      startupMs: Number(row.startup_ms),
      avgBitrateKbps: Number(row.avg_bitrate_kbps),
      bytesLoaded: Number(row.bytes_loaded),
    };
  });
}
