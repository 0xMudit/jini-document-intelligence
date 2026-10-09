import { existsSync } from "node:fs";
import { open, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { SegmentCache } from "./cache";
import { dataDir } from "./storage";
import { SAMPLE_VIDEO_BASE, SAMPLE_VIDEOS } from "./catalog";

/**
 * Video resolution. A videoKey can resolve three ways:
 *  1. A file in data/videos/ — streamed locally with HTTP Range support
 *     (seeking works, fully offline, no size limit).
 *  2. A bundled sample clip — redirected to the public sample CDN.
 *  3. Nothing — reported as unavailable (the player shows a "coming soon"
 *     state).
 *
 * Drop <videoKey>.mp4 (or .webm/.m4v/.mkv) into data/videos/ to make any
 * catalog entry stream from your own library.
 */

export const videosDir = path.join(dataDir, "videos");

/** Edge cache for local byte ranges; telemetry at /api/cache. */
export const videoCache = new SegmentCache();

const VIDEO_EXTENSIONS = [".mp4", ".m4v", ".webm", ".mkv"] as const;

function contentTypeFor(extension: string) {
  switch (extension) {
    case ".webm":
      return "video/webm";
    case ".mkv":
      return "video/x-matroska";
    default:
      return "video/mp4";
  }
}

export function findLocalVideo(videoKey: string): { path: string; contentType: string } | null {
  for (const extension of VIDEO_EXTENSIONS) {
    const candidate = path.join(videosDir, `${videoKey}${extension}`);
    if (existsSync(candidate)) {
      return { path: candidate, contentType: contentTypeFor(extension) };
    }
  }
  return null;
}

const SAMPLE_KEYS = new Set(SAMPLE_VIDEOS);

export type StreamSource =
  | { type: "local"; path: string; contentType: string }
  | { type: "remote"; url: string }
  | { type: "missing" };

export function resolveStreamSource(videoKey: string): StreamSource {
  const local = findLocalVideo(videoKey);
  if (local) return { type: "local", ...local };
  if (SAMPLE_KEYS.has(videoKey)) {
    return { type: "remote", url: `${SAMPLE_VIDEO_BASE}/${videoKey}.mp4` };
  }
  return { type: "missing" };
}

function parseRange(range: string | undefined, total: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range ?? "");
  if (!match) return null;
  const startText = match[1];
  const endText = match[2];
  if (!startText && !endText) return null;
  const start = startText ? Number.parseInt(startText, 10) : 0;
  const end = endText ? Number.parseInt(endText, 10) : total - 1;
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  if (start < 0 || start > end || end >= total) return null;
  return { start, end };
}

async function readRangeSlice(filePath: string, start: number, length: number) {
  const fileHandle = await open(filePath, "r");
  try {
    const data = Buffer.alloc(length);
    const { bytesRead } = await fileHandle.read(data, 0, length, start);
    return data.subarray(0, bytesRead);
  } finally {
    await fileHandle.close();
  }
}

export function createVideoStreamHandler() {
  return async (request: Request, response: Response) => {
    const videoKey = String(request.params.key);
    const source = resolveStreamSource(videoKey);

    if (source.type === "remote") {
      response.setHeader("Cache-Control", "public, max-age=3600");
      response.redirect(302, source.url);
      return;
    }

    if (source.type === "missing") {
      response.status(404).json({ error: "No video is available for this key." });
      return;
    }

    let fileStat;
    try {
      fileStat = await stat(source.path);
    } catch {
      response.status(404).json({ error: "Video not found" });
      return;
    }

    const total = fileStat.size;
    response.setHeader("Accept-Ranges", "bytes");
    response.setHeader("Content-Type", source.contentType);
    response.setHeader("Cache-Control", "public, max-age=3600");

    const range = parseRange(request.headers.range, total);
    if (!range) {
      response.setHeader("Content-Length", String(total));
      response.status(200);
      createReadStream(source.path).pipe(response);
      return;
    }

    response.status(206);
    response.setHeader("Content-Length", String(range.end - range.start + 1));
    response.setHeader("Content-Range", `bytes ${range.start}-${range.end}/${total}`);

    const requestStart = range.start;
    const requestLength = range.end - range.start + 1;
    const cached = videoCache.lookup(videoKey, requestStart, range.end);
    response.setHeader("X-Cache", cached ? "HIT" : "MISS");
    if (cached) {
      response.end(cached);
      return;
    }

    if (requestLength <= videoCache.maxChunkBytes) {
      const slice = await readRangeSlice(source.path, requestStart, requestLength);
      response.end(slice);
      if (slice.length === requestLength) {
        videoCache.store(videoKey, requestStart, slice);
      }
      return;
    }

    createReadStream(source.path, { start: range.start, end: range.end }).pipe(response);
  };
}