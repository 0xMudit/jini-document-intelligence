import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { dataDir } from "./storage";
import { sortLadder, type LadderVariant } from "../shared/abr";

/** Directory where per-title HLS packages (from scripts/encode-hls.mjs) live. */
export const mediaDir = () => path.join(dataDir, "media");

export interface HlsPackageRung {
  index: number;
  height: number;
  width: number;
  bitrateKbps: number;
  /** Directory name under the package (also the variant playlist folder). */
  dir: string;
}

export interface HlsPackage {
  key: string;
  dir: string;
  masterPath: string;
  segmentSeconds: number;
  durationSeconds: number;
  clip: { startSeconds: number; lengthSeconds: number } | null;
  rungs: HlsPackageRung[];
}

const KEY_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i;

/** Bits per second reserved above each rung's video ceiling for the audio track. */
const AUDIO_HEADROOM_BPS = 200_000;

export function sanitizeKey(videoKey: string | undefined) {
  return videoKey && KEY_PATTERN.test(videoKey) ? videoKey : null;
}

interface LadderFile {
  key: string;
  segmentSeconds?: number;
  clip?: { startSeconds: number; lengthSeconds: number };
  source?: { durationSeconds?: number };
  rungs: Array<{ index?: number; height: number; width: number; bitrateKbps: number; dir: string }>;
}

/**
 * A rung is only usable if it has a finished media playlist. Without this check
 * a half-written package still advertises its variants from master.m3u8 and the
 * player 404s on the first playlist it asks for.
 */
function rungPlaylistPath(pkgDir: string, dir: string) {
  if (!/^R\d{2,4}$/.test(dir)) return null;
  return path.join(pkgDir, dir, "index.m3u8");
}

function rungIsPlayable(pkgDir: string, dir: string) {
  const playlistPath = rungPlaylistPath(pkgDir, dir);
  if (!playlistPath) return false;
  try {
    const playlist = readFileSync(playlistPath, "utf8");
    return playlist.startsWith("#EXTM3U") && playlist.includes("#EXTINF:");
  } catch {
    return false;
  }
}

/**
 * Resolves the ladder to sorted rungs, dropping any rung whose media playlist is
 * missing or truncated. Returns null when nothing is playable, which tells the
 * caller to fall back to serving the master file directly.
 */
function readPackage(key: string, dir: string): HlsPackage | null {
  const masterPath = path.join(dir, "master.m3u8");
  const ladderPath = path.join(dir, "ladder.json");
  if (!existsSync(dir) || !existsSync(masterPath) || !existsSync(ladderPath)) return null;

  let ladder: LadderFile;
  try {
    ladder = JSON.parse(readFileSync(ladderPath, "utf8")) as LadderFile;
  } catch {
    return null;
  }
  if (!Array.isArray(ladder.rungs) || !ladder.rungs.length) return null;

  const variants: LadderVariant[] = ladder.rungs.map((rung, index) => ({
    rung: index,
    height: rung.height,
    width: rung.width,
    bitrateKbps: rung.bitrateKbps,
  }));
  const sorted = sortLadder(variants);
  const rungs: HlsPackageRung[] = [];
  for (const variant of sorted) {
    const raw = ladder.rungs[variant.rung];
    if (!raw || !rungIsPlayable(dir, raw.dir)) continue;
    rungs.push({
      index: rungs.length,
      height: variant.height,
      width: variant.width,
      bitrateKbps: variant.bitrateKbps,
      dir: raw.dir,
    });
  }
  if (!rungs.length) return null;

  return {
    key,
    dir,
    masterPath,
    segmentSeconds: ladder.segmentSeconds ?? 6,
    durationSeconds: ladder.clip?.lengthSeconds ?? ladder.source?.durationSeconds ?? 0,
    clip: ladder.clip ?? null,
    rungs,
  };
}

/**
 * findHlsPackage is on the hot path for every segment request, so results are
 * memoised against the package's mtime. Re-encoding a title changes the mtime
 * and invalidates the entry without a restart.
 */
const packageCache = new Map<string, { stamp: number; pkg: HlsPackage | null }>();

function dirStamp(dir: string) {
  try {
    return statSync(path.join(dir, "ladder.json")).mtimeMs;
  } catch {
    return 0;
  }
}

export function findHlsPackage(videoKey: string | undefined): HlsPackage | null {
  const key = sanitizeKey(videoKey);
  if (!key) return null;
  const dir = path.join(mediaDir(), key);
  const stamp = dirStamp(dir);
  const cached = packageCache.get(key);
  if (cached && cached.stamp === stamp) return cached.pkg;

  const pkg = readPackage(key, dir);
  packageCache.set(key, { stamp, pkg });
  return pkg;
}

/** Drops memoised packages (used by tests and after a re-encode). */
export function clearPackageCache() {
  packageCache.clear();
}

export function mediaMasterUrl(videoKey: string) {
  return `/api/media/${videoKey}/master.m3u8`;
}

export function mediaLadderUrl(videoKey: string) {
  return `/api/media/${videoKey}/ladder.json`;
}

export function packageRung(pkg: HlsPackage, rungName: string) {
  return pkg.rungs.find((rung) => rung.dir === rungName || String(rung.index) === rungName) ?? null;
}

/** Resolves a path strictly inside the package (blocks `..` traversal). */
export function packageArtifact(pkg: HlsPackage, relativePath: string) {
  const full = path.resolve(pkg.dir, relativePath);
  const resolvedRoot = path.resolve(pkg.dir);
  if (full !== resolvedRoot && !full.startsWith(resolvedRoot + path.sep)) return null;
  return existsSync(full) ? full : null;
}

/**
 * The master playlist is generated from the validated rungs rather than read
 * off disk, so it can never advertise a variant the server would then refuse to
 * serve. BANDWIDTH leaves headroom above each rung's VBV ceiling for audio.
 */
export function masterPlaylist(pkg: HlsPackage) {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-INDEPENDENT-SEGMENTS"];
  for (const rung of pkg.rungs) {
    const video = rung.bitrateKbps * 1000;
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${video + AUDIO_HEADROOM_BPS},AVG-BANDWIDTH=${Math.round(
        video * 0.95,
      ) + AUDIO_HEADROOM_BPS},RESOLUTION=${rung.width}x${rung.height},NAME="${rung.dir}"`,
      `${rung.dir}/index.m3u8`,
    );
  }
  return `${lines.join("\n")}\n`;
}

/** Compact public description of a package's ladder for the ABR client. */
export function ladderToJson(pkg: HlsPackage) {
  return {
    key: pkg.key,
    segmentSeconds: pkg.segmentSeconds,
    durationSeconds: pkg.durationSeconds,
    rungs: pkg.rungs.map((rung) => ({
      rung: rung.index,
      height: rung.height,
      width: rung.width,
      bitrateKbps: rung.bitrateKbps,
    })),
  };
}