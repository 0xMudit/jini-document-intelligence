#!/usr/bin/env node
/**
 * Per-title HLS encoder (docs/papers/: "Netflix Per-Title Encode Optimization",
 * "Netflix VMAF", "HLS RFC 8216").
 *
 * Builds an adaptive bitrate package for titles whose master file lives in
 * data/videos/<key>.mp4:
 *
 *   data/media/<key>/ladder.json      encode ladder + source metadata
 *   data/media/<key>/master.m3u8      multi-bitrate master playlist
 *   data/media/<key>/R<height>/index.m3u8      per-rung VOD media playlist
 *   data/media/<key>/R<height>/seg-*.ts        MPEG-TS segments (6s each)
 *
 * The encode ladder is derived from the source (per-title): rung heights scale
 * from the master height and target bitrates scale with the ~1.35 power of the
 * height ratio, capped near the source bitrate so the top rung never spends
 * bandwidth reproducing the source exactly.
 *
 * The package is built in a temporary directory and only swapped into place
 * after every rung validates, so an interrupted or failed encode can never
 * publish a half-written package that the server would advertise.
 *
 * Usage:
 *   node scripts/encode-hls.mjs <key> [<key>...]   encode specific titles
 *   node scripts/encode-hls.mjs --all              encode every local file
 *   node scripts/encode-hls.mjs --all --jobs 3     parallel ffmpeg rungs
 *   node scripts/encode-hls.mjs <key> --force      overwrite an existing package
 *   node scripts/encode-hls.mjs --all --verify     check existing packages, encode nothing
 *   node scripts/encode-hls.mjs --all --clip 90    encode only the first 90s
 *   node scripts/encode-hls.mjs --all --clip 90:600   90s starting at 10m (start:length)
 */

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(projectRoot, "data");
const videosDir = path.join(dataDir, "videos");
const mediaDir = path.join(dataDir, "media");

const SEGMENT_SECONDS = 6;
const HEIGHT_FRACTIONS = [0.4, 0.6, 0.8, 1];
const KEYFRAME = { fps: 24, interval: SEGMENT_SECONDS };

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 16 * 1024 * 1024 }, (error, _stdout, stderr) => {
      if (error) reject(new Error(`\n${stderr?.slice(-4000) ?? error.message}`));
      else resolve();
    });
  });
}

async function probe(key) {
  const input = path.join(videosDir, `${key}.mp4`);
  if (!existsSync(input)) throw new Error(`Master file not found: ${input}`);
  const { streams, format } = await runJson("ffprobe", [
      "-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width,height,r_frame_rate,bit_rate",
      "-show_entries", "format=size,duration,bit_rate",
      "-of", "json", input,
    ]);
  const audioCodec = (await runText("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name", "-of", "default=nw=1", input])).trim().toLowerCase();
  const video = streams?.[0] ?? {};
  const width = Number(video.width) || 1280;
  const height = Number(video.height) || 720;
  const [num, den] = String(video.r_frame_rate).split("/").map(Number);
  const fps = num && den ? num / den : 24;
  const streamBitrate = Number(video.bit_rate ?? 0);
  const formatBitrate = Number(format?.bit_rate ?? 0);
  const duration = Number(format?.duration ?? 0);
  const derivedBitrate = duration > 0 ? ((Number(format?.size ?? 0) * 8) / duration) * 0.94 : 0;
  const bitrateKbps = Math.max(400, Math.round((streamBitrate || formatBitrate || derivedBitrate) / 1000));
  return {
    key,
    input,
    width,
    height,
    fps,
    bitrateKbps,
    durationSeconds: duration,
    audioCodec,
    hasAudio: Boolean(audioCodec),
  };
}

function runJson(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 16 * 1024 * 1024 }, (error, stdout) => {
      if (error) reject(error);
      else resolve(JSON.parse(stdout));
    });
  });
}

function runText(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout.trim());
    });
  });
}

function buildLadder(source) {
  const aspect = source.width / source.height;
  const heights = [...new Set(HEIGHT_FRACTIONS.map((fraction) => Math.round((source.height * fraction) / 2) * 2))]
    .filter((h) => h >= 160 && h <= source.height);
  const rungs = heights.map((height) => {
    const ratio = height / source.height;
    const width = Math.max(2, Math.round((height * aspect) / 2) * 2);
    const bitrateKbps = Math.max(220, Math.round((source.bitrateKbps * ratio ** 1.35) / 50) * 50);
    return { index: 0, height, width, bitrateKbps, dir: `R${height}` };
  });
  return rungs.sort((a, b) => a.bitrateKbps - b.bitrateKbps).map((rung, index) => ({ ...rung, index }));
}

/** Segment count a complete encode of `durationSeconds` must produce. */
function expectedSegmentCount(durationSeconds) {
  return Math.max(1, Math.ceil(durationSeconds / KEYFRAME.interval));
}

/** Media-playlist URIs (segment lines), excluding comments and blank lines. */
function playlistSegments(playlist) {
  return playlist
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

/** Summed #EXTINF durations of a media playlist, in seconds. */
function playlistDuration(playlist) {
  let total = 0;
  for (const match of playlist.matchAll(/#EXTINF:([\d.]+)/g)) {
    total += Number(match[1]) || 0;
  }
  return total;
}

/**
 * Validates a freshly built package. Every rung must be a complete VOD playlist
 * (ffmpeg only writes #EXT-X-ENDLIST when it finished) covering the requested
 * duration to within one segment, with every referenced segment present on
 * disk, and all rungs must agree on segment count — an interrupted parallel
 * encode leaves short rungs behind, which is what this guards against.
 *
 * The per-rung count is checked against the duration rather than an exact
 * number because ffmpeg can emit a trailing partial segment (audio priming
 * pushes the stream just past the trim point), which is a valid VOD package.
 */
function verifyPackage(pkgDir, rungs, durationSeconds) {
  const problems = [];
  const tolerance = KEYFRAME.interval * 1.5;
  let reference = null;

  for (const rung of rungs) {
    const rungDir = path.join(pkgDir, rung.dir);
    const playlistPath = path.join(rungDir, "index.m3u8");
    if (!existsSync(playlistPath)) {
      problems.push(`${rung.dir}: no index.m3u8`);
      continue;
    }
    const playlist = readFileSync(playlistPath, "utf8");
    if (!playlist.startsWith("#EXTM3U")) problems.push(`${rung.dir}: playlist is not an M3U8`);
    if (!playlist.includes("#EXT-X-ENDLIST")) {
      problems.push(`${rung.dir}: encode never finished (no #EXT-X-ENDLIST)`);
    }

    const segments = playlistSegments(playlist);
    if (!segments.length) {
      problems.push(`${rung.dir}: playlist has no segments`);
      continue;
    }

    const covered = playlistDuration(playlist);
    if (durationSeconds > 0 && Math.abs(covered - durationSeconds) > tolerance) {
      problems.push(`${rung.dir}: covers ${covered.toFixed(1)}s, expected ~${durationSeconds.toFixed(1)}s`);
    }

    if (reference === null) reference = segments.length;
    else if (segments.length !== reference) {
      problems.push(`${rung.dir}: ${segments.length} segments, but the first rung has ${reference}`);
    }

    const missing = segments.filter((segment) => !existsSync(path.join(rungDir, segment)));
    if (missing.length) problems.push(`${rung.dir}: ${missing.length} segment files missing (e.g. ${missing[0]})`);
  }

  return problems;
}

async function encodeRung(source, rung, outputDir, clip) {
  const keyInt = Math.round(KEYFRAME.fps * KEYFRAME.interval);
  const audioArgs = source.hasAudio
    ? ["aac", "mp3", "ac3", "eac3", "flac"].includes(source.audioCodec)
      ? ["-map", "0:a:0", "-c:a", "copy"]
      : ["-map", "0:a:0", "-c:a", "aac", "-b:a", "128k"]
    : [];
  // Trim before the input so ffmpeg never decodes the parts we discard; this
  // keeps short demo encodes fast even though the masters are ~2GB.
  const clipArgs = clip ? ["-ss", clip.startSeconds.toFixed(3), "-t", clip.lengthSeconds.toFixed(3)] : [];
  const started = Date.now();
  const args = [
    "-y", "-hide_banner", "-loglevel", "error", "-nostats",
    ...clipArgs,
    "-i", source.input,
    "-vf", `scale=${rung.width}:${rung.height}`,
    "-map", "0:v:0", ...audioArgs,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
    "-maxrate", `${rung.bitrateKbps}k`, "-bufsize", `${rung.bitrateKbps * 2}k`,
    "-profile:v", "main", "-level", "4.0",
    "-g", String(keyInt), "-keyint_min", String(keyInt), "-sc_threshold", "0",
    "-force_key_frames", `expr:gte(t,n_forced*${KEYFRAME.interval})`,
    ...audioArgs,
    "-f", "hls",
    "-hls_time", String(KEYFRAME.interval),
    "-hls_playlist_type", "vod",
    "-hls_segment_type", "mpegts",
    "-hls_flags", "independent_segments",
    "-hls_segment_filename", path.join(outputDir, "seg-%06d.ts"),
    path.join(outputDir, "index.m3u8"),
  ];
  process.stdout.write(`  [${rung.dir}] ${rung.width}x${rung.height} @ ${rung.bitrateKbps}k ...\n`);
  await run("ffmpeg", args);
  const seconds = ((Date.now() - started) / 1000).toFixed(0);
  process.stdout.write(`  [${rung.dir}] done in ${seconds}s\n`);
}

function writeMasterPlaylist(pkgDir, rungs, source) {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-INDEPENDENT-SEGMENTS"];
  for (const rung of rungs) {
    const videoBandwidth = rung.bitrateKbps * 1000;
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${videoBandwidth + 200000},AVG-BANDWIDTH=${videoBandwidth + 150000},RESOLUTION=${rung.width}x${rung.height},FRAME-RATE=${source.fps.toFixed(2)},NAME="${rung.dir}"`,
      `${rung.dir}/index.m3u8`,
    );
  }
  writeFileSync(path.join(pkgDir, "master.m3u8"), lines.join("\n") + "\n");
}

function stagingDir(key) {
  // Leading dot keeps staging (and trash) directories out of findHlsPackage's
  // key pattern, so a build in progress is never mistaken for a package.
  return path.join(mediaDir, `.staging-${key}-${process.pid}`);
}

function trashDir(key) {
  return path.join(mediaDir, `.trash-${key}-${process.pid}`);
}

function swapIntoPlace(key, builtDir) {
  const target = path.join(mediaDir, key);
  const trash = trashDir(key);
  if (existsSync(target)) renameSync(target, trash);
  try {
    renameSync(builtDir, target);
  } catch (error) {
    if (existsSync(trash)) renameSync(trash, target);
    throw error;
  }
  if (existsSync(trash)) rmSync(trash, { recursive: true, force: true });
}

async function encodeTitle(key, { force, clip }) {
  const pkgDir = path.join(mediaDir, key);
  if (existsSync(pkgDir) && !force) {
    process.stdout.write(`  ${key}: package already exists (use --force to re-encode). Skipping.\n`);
    return;
  }
  const source = await probe(key);
  const rungs = buildLadder(source);
  const span = resolveClip(source, clip);
  const durationSeconds = span.lengthSeconds;

  process.stdout.write(
    `\n${key} (${source.width}x${source.height}, ${source.bitrateKbps}k, ` +
      `${(source.durationSeconds / 60).toFixed(0)}m${clip ? ` -> ${durationSeconds.toFixed(0)}s clip` : ""}): ` +
      `${rungs.length} rungs\n`,
  );

  const built = stagingDir(key);
  rmSync(built, { recursive: true, force: true });
  mkdirSync(built, { recursive: true });

  const started = Date.now();
  try {
    for (const rung of rungs) {
      mkdirSync(path.join(built, rung.dir), { recursive: true });
    }
    writeMasterPlaylist(built, rungs, source);
    writeFileSync(
      path.join(built, "ladder.json"),
      JSON.stringify({ key, segmentSeconds: SEGMENT_SECONDS, clip: span.range, source, rungs }, null, 2) + "\n",
    );
    let index = 0;
    const worker = async () => {
      while (index < rungs.length) {
        const rung = rungs[index];
        index += 1;
        await encodeRung(source, rung, path.join(built, rung.dir), span);
      }
    };
    await Promise.all(Array.from({ length: Math.min(jobs, rungs.length) }, worker));

    const problems = verifyPackage(built, rungs, durationSeconds);
    if (problems.length) {
      throw new Error(`package failed validation, nothing published:\n    - ${problems.join("\n    - ")}`);
    }

    swapIntoPlace(key, built);
    process.stdout.write(
      `  ${key}: packaged in ${((Date.now() - started) / 1000).toFixed(0)}s ` +
        `(${rungs.length} rungs, ${expectedSegmentCount(durationSeconds)} segments each)\n`,
    );
  } catch (error) {
    rmSync(built, { recursive: true, force: true });
    throw new Error(`${key} encode failed and nothing was published: ${error.message}`);
  }
}

/** Checks an already-published package the same way the encoder does. */
function verifyExisting(key) {
  const pkgDir = path.join(mediaDir, key);
  const ladderPath = path.join(pkgDir, "ladder.json");
  if (!existsSync(pkgDir) || !existsSync(ladderPath)) {
    return { key, ok: false, problems: ["not packaged"] };
  }
  let ladder;
  try {
    ladder = JSON.parse(readFileSync(ladderPath, "utf8"));
  } catch (error) {
    return { key, ok: false, problems: [`unreadable ladder.json: ${error.message}`] };
  }
  const rungs = Array.isArray(ladder.rungs) ? ladder.rungs : [];
  if (!rungs.length) return { key, ok: false, problems: ["ladder.json has no rungs"] };
  if (!existsSync(path.join(pkgDir, "master.m3u8"))) {
    return { key, ok: false, problems: ["master.m3u8 missing"] };
  }
  const duration = ladder.clip?.lengthSeconds ?? ladder.source?.durationSeconds ?? 0;
  return { key, ok: true, problems: verifyPackage(pkgDir, rungs, duration) };
}

/**
 * Resolves the encode window. Default is the whole source; `--clip 90` takes
 * the first 90s, `--clip 90:600` takes 600s starting at 90s. The window is
 * clamped to the source so a clip never runs past the end of the master.
 */
function resolveClip(source, clip) {
  if (!clip) {
    return { startSeconds: 0, lengthSeconds: source.durationSeconds, range: null };
  }
  const start = Math.max(0, Math.min(clip.startSeconds, Math.max(0, source.durationSeconds - 1)));
  const length = Math.max(1, Math.min(clip.lengthSeconds, Math.max(1, source.durationSeconds - start)));
  return { startSeconds: start, lengthSeconds: length, range: { startSeconds: start, lengthSeconds: length } };
}

function parseClipArg(value) {
  if (value === undefined) return null;
  const [startText, lengthText] = String(value).split(":");
  const lengthSeconds = Number(lengthText ?? startText);
  const startSeconds = lengthText === undefined ? 0 : Number(startText);
  if (!Number.isFinite(lengthSeconds) || lengthSeconds <= 0) {
    throw new Error(`--clip expects seconds or start:length, got "${value}"`);
  }
  return { startSeconds: Number.isFinite(startSeconds) ? startSeconds : 0, lengthSeconds };
}

/** Consumes `--name value` and bare `--name` flags, returning both the value map and the positional args. */
function parseOptions(rawArgs) {
  const values = new Map();
  const positional = [];
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const name = arg.slice(2);
    if (name === "force" || name === "all" || name === "verify") {
      values.set(name, true);
      continue;
    }
    const next = rawArgs[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      values.set(name, next);
      index += 1;
    } else {
      values.set(name, true);
    }
  }
  return { values, positional };
}

const { values: options, positional: keys } = parseOptions(process.argv.slice(2));

const explicitJobs = options.has("jobs") ? Number(options.get("jobs")) : Number.NaN;
const clip =
  options.has("clip") && options.get("clip") !== true ? parseClipArg(options.get("clip")) : null;
const force = options.get("force") === true;
const verifyOnly = options.get("verify") === true;
const jobs = Math.min(
  4,
  Math.max(1, Number.isFinite(explicitJobs) ? explicitJobs : Math.max(1, Number(os.cpus().length) - 1)),
);

const VIDEO_SUFFIXES = [".mp4", ".m4v"];

function availableKeys() {
  if (!existsSync(videosDir)) return [];
  return readdirSync(videosDir)
    .filter((file) => VIDEO_SUFFIXES.some((extension) => file.endsWith(extension)))
    .map((file) => file.slice(0, file.lastIndexOf(".")));
}

async function main() {
  mkdirSync(mediaDir, { recursive: true });
  const targets = options.get("all") ? availableKeys() : keys;

  if (verifyOnly) {
    const verifyTargets = targets.length ? targets : availableKeys();
    if (!verifyTargets.length) {
      process.stdout.write("No local video files to verify.\n");
      process.exit(1);
    }
    let bad = 0;
    for (const key of verifyTargets) {
      const result = verifyExisting(key);
      if (result.ok && !result.problems.length) {
        const ladder = JSON.parse(readFileSync(path.join(mediaDir, key, "ladder.json"), "utf8"));
        const clipNote = ladder.clip ? ` (${ladder.clip.lengthSeconds.toFixed(0)}s clip)` : "";
        process.stdout.write(`  ${key}: OK - ${ladder.rungs.length} rungs${clipNote}\n`);
      } else {
        bad += 1;
        process.stdout.write(`  ${key}: BROKEN - ${result.problems.join("; ")}\n`);
      }
    }
    process.stdout.write(bad ? `\n${bad} of ${verifyTargets.length} package(s) need re-encoding (--force).\n` : "\nAll packages valid.\n");
    process.exitCode = bad ? 1 : 0;
    return;
  }

  if (!targets.length) {
    process.stdout.write("No titles. Pass video keys (matching data/videos/<key>.mp4) or --all.\n");
    process.exit(1);
  }
  for (const key of targets) {
    try {
      await encodeTitle(key, { force, clip });
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
  process.stdout.write("\nDone.\n");
}

await main();
