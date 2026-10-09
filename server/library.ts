import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { dataDir, projectRoot, videosDir } from "./storage";

/**
 * Local library console: what can be streamed, and how to turn a source file
 * into a playable HLS package.
 *
 * Encoding shells out to `scripts/encode-hls.mjs` rather than reimplementing
 * ffmpeg here, so the dashboard and the CLI always produce identical packages.
 * Only one encode runs at a time — ffmpeg is CPU-saturating, and parallel jobs
 * inside the script already use every available core.
 */

const mediaDir = path.join(dataDir, "media");
const encoderScript = path.join(projectRoot, "scripts", "encode-hls.mjs");

export interface LibrarySource {
  key: string;
  file: string;
  bytes: number;
  modifiedAt: string;
}

export interface LibraryPackage {
  key: string;
  rungs: string[];
  segmentSeconds: number;
  sourceDurationSeconds: number;
  clipLengthSeconds: number | null;
  complete: boolean;
  problems: string[];
  bytes: number;
  encodedAt: string;
}

export interface LibraryState {
  dataDir: string;
  encoderAvailable: boolean;
  busy: boolean;
  activeKey: string | null;
  sources: LibrarySource[];
  packages: LibraryPackage[];
}

const VIDEO_EXTENSIONS = new Set([".mp4", ".mkv", ".webm", ".mov", ".m4v"]);

let activeKey: string | null = null;
let lastLog: string[] = [];

export function encodeLog(): string[] {
  return lastLog;
}

export function isKeySafe(key: string): boolean {
  // Keys become directory names and CLI arguments, so keep them to one segment.
  return /^[a-z0-9][a-z0-9._-]{0,63}$/i.test(key) && !key.includes("..");
}

function directoryBytes(dir: string): number {
  let total = 0;
  const walk = (current: string) => {
    let entries: string[] = [];
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry);
      let stats;
      try {
        stats = statSync(full);
      } catch {
        continue;
      }
      if (stats.isDirectory()) walk(full);
      else total += stats.size;
    }
  };
  walk(dir);
  return total;
}

export function listLibrary(): LibraryState {
  const sources: LibrarySource[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(videosDir);
  } catch {
    entries = [];
  }
  for (const file of entries.sort()) {
    if (!VIDEO_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
    const full = path.join(videosDir, file);
    let stats;
    try {
      stats = statSync(full);
    } catch {
      continue;
    }
    sources.push({
      key: path.basename(file, path.extname(file)),
      file,
      bytes: stats.size,
      modifiedAt: stats.mtime.toISOString(),
    });
  }

  const packages: LibraryPackage[] = [];
  let mediaEntries: string[] = [];
  try {
    mediaEntries = readdirSync(mediaDir);
  } catch {
    mediaEntries = [];
  }
  for (const key of mediaEntries.sort()) {
    const pkgDir = path.join(mediaDir, key);
    const ladderPath = path.join(pkgDir, "ladder.json");
    if (!existsSync(ladderPath)) continue;
    let ladder: {
      segmentSeconds?: number;
      clip?: { lengthSeconds?: number };
      source?: { durationSeconds?: number };
      rungs?: Array<{ name: string; playlist?: string }>;
    };
    try {
      ladder = JSON.parse(readFileSync(ladderPath, "utf8"));
    } catch {
      continue;
    }
    const rungs = (ladder.rungs ?? []).map((rung) => rung.name);
    // A package is only playable if the master and every rung survived.
    const problems: string[] = [];
    if (!existsSync(path.join(pkgDir, "master.m3u8"))) problems.push("missing master.m3u8");
    for (const rung of rungs) {
      const playlist = path.join(pkgDir, rung, "index.m3u8");
      if (!existsSync(playlist)) {
        problems.push(`missing ${rung}/index.m3u8`);
        continue;
      }
      const text = readFileSync(playlist, "utf8");
      if (!text.includes("#EXT-X-ENDLIST")) problems.push(`${rung} is not a complete VOD playlist`);
      const segments = [...text.matchAll(/^(?!#)[^\s]+\.ts$/gm)].map((m) => m[0]);
      if (segments.length === 0) {
        problems.push(`${rung} has no segments`);
        continue;
      }
      for (const segment of segments) {
        if (!existsSync(path.join(pkgDir, rung, segment))) {
          problems.push(`${rung}/${segment} missing on disk`);
          break;
        }
      }
    }
    packages.push({
      key,
      rungs,
      segmentSeconds: ladder.segmentSeconds ?? 0,
      sourceDurationSeconds: ladder.source?.durationSeconds ?? 0,
      clipLengthSeconds: ladder.clip?.lengthSeconds ?? null,
      complete: problems.length === 0,
      problems,
      bytes: directoryBytes(pkgDir),
      encodedAt: safeMtime(ladderPath),
    });
  }

  return {
    dataDir,
    encoderAvailable: existsSync(encoderScript),
    busy: activeKey !== null,
    activeKey,
    sources,
    packages,
  };
}

function safeMtime(file: string): string {
  try {
    return statSync(file).mtime.toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

export interface EncodeRequest {
  key: string;
  /** Re-encode even if a package already exists. */
  force?: boolean;
  /** Limit output to the first N seconds; omit for the whole file. */
  clipSeconds?: number | null;
}

export interface EncodeHandle {
  key: string;
  pid: number;
  log: string[];
}

/**
 * Starts an encode. Returns null when another encode is already running, so the
 * dashboard can show "busy" rather than queueing a second ffmpeg storm.
 */
export function startEncode(request_: EncodeRequest): EncodeHandle | null {
  if (activeKey) return null;
  if (!isKeySafe(request_.key)) throw new Error("Invalid title key");
  const source = readdirSync(videosDir).find(
    (file) => path.basename(file, path.extname(file)) === request_.key,
  );
  if (!source) throw new Error(`No source file for "${request_.key}"`);

  const args = [request_.key];
  if (request_.force) args.push("--force");
  if (request_.clipSeconds && request_.clipSeconds > 0) {
    args.push("--clip", String(Math.round(request_.clipSeconds)));
  }

  const child = spawn(process.execPath, [encoderScript, ...args], {
    cwd: projectRoot,
    windowsHide: true,
  });
  activeKey = request_.key;
  lastLog = [];

  const push = (line: string) => {
    lastLog = [...lastLog.slice(-199), line];
  };
  child.stdout?.on("data", (chunk: Buffer) => {
    for (const line of chunk.toString().split(/\r?\n/)) if (line.trim()) push(line.trim());
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    for (const line of chunk.toString().split(/\r?\n/)) if (line.trim()) push(line.trim());
  });

  child.on("close", (code) => {
    push(code === 0 ? "done" : `failed (exit ${code})`);
    activeKey = null;
  });
  child.on("error", (err) => {
    push(`error: ${err.message}`);
    activeKey = null;
  });

  return { key: request_.key, pid: child.pid ?? 0, log: lastLog };
}
