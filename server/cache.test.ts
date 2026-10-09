import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { prewarmPopularContent, SegmentCache } from "./cache";

describe("SegmentCache", () => {
  it("serves a stored range and counts a hit; unknown ranges count misses", () => {
    const cache = new SegmentCache(1024, 512);
    const data = Buffer.alloc(200, 7);
    cache.store("video-a", 0, data);
    expect(cache.lookup("video-a", 0, 99)).toEqual(Buffer.alloc(100, 7));
    expect(cache.lookup("video-a", 0, 300)).toBeNull();
    expect(cache.lookup("video-b", 0, 10)).toBeNull();
    const stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(2);
    expect(stats.hitRate).toBeCloseTo(1 / 3);
    expect(stats.bytes).toBe(200);
  });

  it("evicts the least recently used block when capacity is exceeded", () => {
    const cache = new SegmentCache(100, 64);
    cache.store("video-a", 0, Buffer.alloc(60, 1));
    cache.store("video-b", 0, Buffer.alloc(60, 2));
    expect(cache.has("video-a", 0)).toBe(false);
    expect(cache.has("video-b", 0)).toBe(true);
    expect(cache.stats().evictions).toBe(1);
  });

  it("keeps a touched block resident ahead of a stale one", () => {
    const cache = new SegmentCache(100, 64);
    cache.store("video-a", 0, Buffer.alloc(40, 1));
    cache.store("video-b", 0, Buffer.alloc(40, 2));
    cache.lookup("video-a", 0, 10);
    cache.store("video-c", 0, Buffer.alloc(40, 3));
    expect(cache.has("video-a", 0)).toBe(true);
    expect(cache.has("video-b", 0)).toBe(false);
  });

  it("refuses oversized and empty blocks", () => {
    const cache = new SegmentCache(1024, 32);
    cache.store("video-a", 0, Buffer.alloc(64, 1));
    cache.store("video-a", 0, Buffer.alloc(0));
    expect(cache.stats().stores).toBe(0);
    expect(cache.stats().entries).toBe(0);
  });

  it("stores blocks with different offsets independently", () => {
    const cache = new SegmentCache(1024, 64);
    cache.store("video-a", 0, Buffer.alloc(16, 1));
    cache.store("video-a", 16, Buffer.alloc(16, 2));
    expect(cache.lookup("video-a", 0, 15)).toEqual(Buffer.alloc(16, 1));
    expect(cache.lookup("video-a", 16, 31)).toEqual(Buffer.alloc(16, 2));
  });
});

describe("prewarmPopularContent", () => {
  it("warms the most-played local title and skips missing ones", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "jini-cache-"));
    const localTitle = path.join(directory, "local-title.mp4");
    await writeFile(localTitle, Buffer.alloc(128, 9));

    const cache = new SegmentCache(1024, 256);
    const local = new Map([
      ["local-title", { path: localTitle, contentType: "video/mp4" }],
    ]);
    const plays = new Map([
      ["missing-title", 5],
      ["local-title", 3],
    ]);

    try {
      const result = await prewarmPopularContent(cache, (key) => local.get(key) ?? null, plays, 128);
      expect(result?.videoKey).toBe("local-title");
      expect(cache.lookup("local-title", 0, 127)).toEqual(Buffer.alloc(128, 9));
      expect(cache.has("missing-title", 0)).toBe(false);
      expect(cache.stats().hits).toBe(1);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});