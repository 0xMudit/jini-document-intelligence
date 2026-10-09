import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import type { WatchProgress } from "./types";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(serverDir, "..");
// Serverless (Vercel) has an ephemeral, read-only function dir; /tmp is the only
// writable location. Local dev keeps the DB + library beside the repo by default.
export const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : process.env.VERCEL === "1"
    ? path.join("/tmp", "jini")
    : path.join(projectRoot, "data");
export const videosDir = path.join(dataDir, "videos");

const databasePath = path.join(dataDir, "jini.sqlite");

mkdirSync(videosDir, { recursive: true });

export const database = new DatabaseSync(databasePath);
let initialized = false;

export async function ensureDataDirs() {
  mkdirSync(videosDir, { recursive: true });
  await initializeMediaDatabase();
}

export function initializeMediaDatabase() {
  if (initialized) return;

  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS media_progress (
      user_id TEXT NOT NULL,
      title_id TEXT NOT NULL,
      episode_id TEXT NOT NULL DEFAULT '',
      position_seconds REAL NOT NULL DEFAULT 0,
      duration_seconds REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, title_id, episode_id)
    );

    CREATE TABLE IF NOT EXISTS media_list (
      user_id TEXT NOT NULL,
      title_id TEXT NOT NULL,
      added_at TEXT NOT NULL,
      PRIMARY KEY (user_id, title_id)
    );

    -- Implicit feedback: watch events, aggregated per (user, title). play_count
    -- only advances when watch_fraction exceeds the previously stored value, so
    -- progress heartbeats do not inflate it (a completed view lifts it to 1).
    CREATE TABLE IF NOT EXISTS interactions (
      user_id TEXT NOT NULL,
      title_id TEXT NOT NULL,
      play_count INTEGER NOT NULL DEFAULT 1,
      watch_fraction REAL NOT NULL DEFAULT 0,
      first_watched_at TEXT NOT NULL,
      last_watched_at TEXT NOT NULL,
      PRIMARY KEY (user_id, title_id)
    );

    -- Browse impressions: how many times a title was surfaced in a row.
    -- Take-rate (plays / impressions) is computed from these two tables.
    CREATE TABLE IF NOT EXISTS impressions (
      user_id TEXT NOT NULL,
      title_id TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, title_id)
    );

    -- One row per playback session, reported by the player when a title starts
    -- and again when it ends. QoE is measured per session, not per request, so
    -- startup delay and rebuffering can be attributed to a single viewing.
    CREATE TABLE IF NOT EXISTS qoe_sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title_id TEXT NOT NULL,
      episode_id TEXT NOT NULL DEFAULT '',
      stream_mode TEXT NOT NULL DEFAULT 'direct',
      algorithm TEXT NOT NULL DEFAULT '',
      started_at TEXT NOT NULL,
      ended_at TEXT,
      startup_ms REAL NOT NULL DEFAULT 0,
      watch_ms REAL NOT NULL DEFAULT 0,
      rebuffer_count INTEGER NOT NULL DEFAULT 0,
      rebuffer_ms REAL NOT NULL DEFAULT 0,
      switches INTEGER NOT NULL DEFAULT 0,
      bytes_loaded INTEGER NOT NULL DEFAULT 0,
      segments_loaded INTEGER NOT NULL DEFAULT 0,
      avg_bitrate_kbps REAL NOT NULL DEFAULT 0,
      peak_bitrate_kbps REAL NOT NULL DEFAULT 0,
      avg_buffer_seconds REAL NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0
    );

    -- Per-segment bitrate history, the raw material for a bitrate-vs-time plot.
    CREATE TABLE IF NOT EXISTS qoe_samples (
      session_id TEXT NOT NULL,
      at_ms REAL NOT NULL,
      level INTEGER NOT NULL,
      bitrate_kbps REAL NOT NULL,
      buffer_seconds REAL NOT NULL,
      throughput_kbps REAL NOT NULL
    );

    CREATE INDEX IF NOT EXISTS media_progress_user_updated_idx
      ON media_progress(user_id, updated_at DESC);

    CREATE INDEX IF NOT EXISTS media_list_user_added_idx
      ON media_list(user_id, added_at DESC);

    CREATE INDEX IF NOT EXISTS interactions_title_idx
      ON interactions(title_id);

    CREATE INDEX IF NOT EXISTS qoe_sessions_title_idx
      ON qoe_sessions(title_id, started_at DESC);

    CREATE INDEX IF NOT EXISTS qoe_sessions_user_idx
      ON qoe_sessions(user_id, started_at DESC);

    CREATE INDEX IF NOT EXISTS qoe_samples_session_idx
      ON qoe_samples(session_id, at_ms);
  `);

  initialized = true;
}

export function saveProgress(
  userId: string,
  titleId: string,
  episodeId: string | null,
  positionSeconds: number,
  durationSeconds: number,
) {
  const normalizedEpisode = episodeId ?? "";
  const percent = durationSeconds > 0 ? positionSeconds / durationSeconds : 0;

  if (positionSeconds <= 0 || percent >= 0.95) {
    database.prepare("DELETE FROM media_progress WHERE user_id = ? AND title_id = ? AND episode_id = ?").run(
      userId,
      titleId,
      normalizedEpisode,
    );
    return null;
  }

  database
    .prepare(
      `INSERT INTO media_progress (user_id, title_id, episode_id, position_seconds, duration_seconds, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, title_id, episode_id) DO UPDATE SET
         position_seconds = excluded.position_seconds,
         duration_seconds = excluded.duration_seconds,
         updated_at = excluded.updated_at`,
    )
    .run(userId, titleId, normalizedEpisode, positionSeconds, durationSeconds, new Date().toISOString());

  return toProgress({
    user_id: userId,
    title_id: titleId,
    episode_id: normalizedEpisode,
    position_seconds: positionSeconds,
    duration_seconds: durationSeconds,
    updated_at: new Date().toISOString(),
  });
}

export function listProgress(userId: string): WatchProgress[] {
  const rows = database
    .prepare("SELECT * FROM media_progress WHERE user_id = ? ORDER BY updated_at DESC LIMIT 40")
    .all(userId) as unknown as ProgressRow[];
  return rows.map(toProgress);
}

export function getProgress(userId: string, titleId: string, episodeId: string | null) {
  const row = database
    .prepare("SELECT * FROM media_progress WHERE user_id = ? AND title_id = ? AND episode_id = ?")
    .get(userId, titleId, episodeId ?? "") as unknown as ProgressRow | undefined;
  return row ? toProgress(row) : null;
}

export function listMyListIds(userId: string) {
  const rows = database
    .prepare("SELECT title_id FROM media_list WHERE user_id = ? ORDER BY added_at DESC")
    .all(userId) as unknown as Array<{ title_id: string }>;
  return rows.map((row) => row.title_id);
}

export function isInList(userId: string, titleId: string) {
  const row = database.prepare("SELECT 1 AS found FROM media_list WHERE user_id = ? AND title_id = ?").get(userId, titleId) as
    | { found: number }
    | undefined;
  return Boolean(row);
}

export function addToList(userId: string, titleId: string) {
  database
    .prepare("INSERT OR IGNORE INTO media_list (user_id, title_id, added_at) VALUES (?, ?, ?)")
    .run(userId, titleId, new Date().toISOString());
  return true;
}

export function removeFromList(userId: string, titleId: string) {
  database.prepare("DELETE FROM media_list WHERE user_id = ? AND title_id = ?").run(userId, titleId);
  return false;
}

export interface InteractionRow {
  user_id: string;
  title_id: string;
  play_count: number;
  watch_fraction: number;
  first_watched_at: string;
  last_watched_at: string;
}

/**
 * Records implicit feedback from a play event. The first play inserts a row;
 * a deeper watch lifts watch_fraction and counts as a new play. Replaying at a
 * fraction already reached just touches last_watched_at.
 */
export function recordPlay(userId: string, titleId: string, watchFraction: number) {
  const now = new Date().toISOString();
  const existing = database
    .prepare("SELECT watch_fraction FROM interactions WHERE user_id = ? AND title_id = ?")
    .get(userId, titleId) as { watch_fraction: number } | undefined;

  if (!existing) {
    database
      .prepare(
        `INSERT INTO interactions (user_id, title_id, play_count, watch_fraction, first_watched_at, last_watched_at)
         VALUES (?, ?, 1, ?, ?, ?)`,
      )
      .run(userId, titleId, watchFraction, now, now);
    return;
  }

  if (watchFraction > existing.watch_fraction) {
    database
      .prepare(
        `UPDATE interactions SET play_count = play_count + 1, watch_fraction = ?, last_watched_at = ?
         WHERE user_id = ? AND title_id = ?`,
      )
      .run(watchFraction, now, userId, titleId);
  } else {
    database
      .prepare("UPDATE interactions SET last_watched_at = ? WHERE user_id = ? AND title_id = ?")
      .run(now, userId, titleId);
  }
}

/** Bumps the impression counter for every title id served in a row set. */
export function recordImpressions(userId: string, titleIds: string[]) {
  const unique = [...new Set(titleIds)];
  if (!unique.length) return;
  const statement = database.prepare(
    "INSERT INTO impressions (user_id, title_id, count) VALUES (?, ?, 1) ON CONFLICT(user_id, title_id) DO UPDATE SET count = count + 1",
  );
  database.exec("BEGIN");
  try {
    for (const id of unique) statement.run(userId, id);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function allInteractions(): InteractionRow[] {
  return database
    .prepare("SELECT * FROM interactions")
    .all() as unknown as InteractionRow[];
}

/** Distinct titles a user has watched this far — used for cold-start gating. */
export function countUserInteractions(userId: string) {
  return database
    .prepare("SELECT COUNT(*) AS n FROM interactions WHERE user_id = ?")
    .get(userId) as { n: number };
}

/** Total plays per title across all users (the engagement distribution). */
export function getPlayCounts() {
  const rows = database
    .prepare("SELECT title_id, SUM(play_count) AS plays FROM interactions GROUP BY title_id")
    .all() as unknown as Array<{ title_id: string; plays: number }>;
  return new Map(rows.map((row) => [row.title_id, row.plays]));
}

export function getImpressionCounts() {
  const rows = database
    .prepare("SELECT title_id, SUM(count) AS count FROM impressions GROUP BY title_id")
    .all() as unknown as Array<{ title_id: string; count: number }>;
  return new Map(rows.map((row) => [row.title_id, row.count]));
}

export interface InteractionSummary {
  interactions: number;
  plays: number;
  impressions: number;
  activeUsers: number;
}

export function getInteractionSummary(): InteractionSummary {
  const interactions = database
    .prepare("SELECT COUNT(*) AS n FROM interactions")
    .get() as { n: number };
  const plays = database
    .prepare("SELECT COALESCE(SUM(play_count), 0) AS n FROM interactions")
    .get() as { n: number };
  const impressions = database
    .prepare("SELECT COALESCE(SUM(count), 0) AS n FROM impressions")
    .get() as { n: number };
  const activeUsers = database
    .prepare("SELECT COUNT(DISTINCT user_id) AS n FROM interactions")
    .get() as { n: number };
  return {
    interactions: interactions.n,
    plays: plays.n,
    impressions: impressions.n,
    activeUsers: activeUsers.n,
  };
}

interface ProgressRow {
  user_id: string;
  title_id: string;
  episode_id: string;
  position_seconds: number;
  duration_seconds: number;
  updated_at: string;
}

function toProgress(row: ProgressRow): WatchProgress {
  const percent =
    row.duration_seconds > 0 ? Math.min(100, Math.round((row.position_seconds / row.duration_seconds) * 100)) : 0;
  return {
    titleId: row.title_id,
    episodeId: row.episode_id || null,
    positionSeconds: Math.round(row.position_seconds),
    durationSeconds: Math.round(row.duration_seconds),
    updatedAt: row.updated_at,
    percent,
  };
}