import { open } from "node:fs/promises";
import path from "node:path";

/**
 * A tiny in-memory edge cache for video byte ranges, in the spirit of the
 * Open Connect paper's proactive caching: popular content lives in RAM so a
 * seek-back or a second viewer is served without touching disk twice. Blocks
 * are evicted LRU once the capacity is hit and every look-up feeds the
 * hit/miss telemetry exposed at /api/cache.
 */

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  bytes: number;
  capacityBytes: number;
  entries: number;
  evictions: number;
  stores: number;
}

interface Block {
  start: number;
  data: Buffer;
}

export class SegmentCache {
  readonly maxChunkBytes: number;
  private readonly capacityBytes: number;
  private readonly blocks = new Map<string, Block>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private stores = 0;
  private bytes = 0;

  constructor(capacityBytes = 64 * 1024 * 1024, maxChunkBytes = 4 * 1024 * 1024) {
    this.capacityBytes = capacityBytes;
    this.maxChunkBytes = maxChunkBytes;
  }

  private keyFor(videoKey: string, start: number) {
    return `${videoKey}:${start}`;
  }

  /** Returns a Buffer covering [start, end] when the block is resident. */
  lookup(videoKey: string, start: number, end: number): Buffer | null {
    const key = this.keyFor(videoKey, start);
    const block = this.blocks.get(key);
    if (!block) {
      this.misses += 1;
      return null;
    }
    const length = end - start + 1;
    if (length > block.data.length) {
      // The block covers the start but not the full request; a miss, but the
      // block stays resident for shorter future lookups.
      this.misses += 1;
      return null;
    }
    this.blocks.delete(key);
    this.blocks.set(key, block);
    this.hits += 1;
    return block.data.slice(0, length);
  }

  /** Stores a range slice. Oversized blocks are refused outright. */
  store(videoKey: string, start: number, data: Buffer) {
    if (data.length > this.maxChunkBytes || data.length === 0) return;
    const key = this.keyFor(videoKey, start);
    if (this.blocks.has(key)) return;
    this.blocks.set(key, { start, data });
    this.bytes += data.length;
    this.stores += 1;
    while (this.bytes > this.capacityBytes && this.blocks.size > 1) {
      const oldestKey = this.blocks.keys().next().value as string;
      const oldest = this.blocks.get(oldestKey);
      if (oldest) this.bytes -= oldest.data.length;
      this.blocks.delete(oldestKey);
      this.evictions += 1;
    }
  }

  has(videoKey: string, start: number) {
    return this.blocks.has(this.keyFor(videoKey, start));
  }

  stats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      bytes: this.bytes,
      capacityBytes: this.capacityBytes,
      entries: this.blocks.size,
      evictions: this.evictions,
      stores: this.stores,
    };
  }
}

export type LocalVideo = { path: string; contentType: string };

/**
 * Open Connect-style proactive caching: warm the head of the most-played local
 * title so its first viewers are served from memory.
 */
export async function prewarmPopularContent(
  cache: SegmentCache,
  resolveLocal: (videoKey: string) => LocalVideo | null,
  playCounts: ReadonlyMap<string, number>,
  chunkBytes: number,
) {
  const ranked = [...playCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [videoKey] of ranked) {
    const local = resolveLocal(videoKey);
    if (!local) continue;
    const size = Math.min(chunkBytes, cache.maxChunkBytes);
    const fileHandle = await open(path.resolve(local.path), "r");
    try {
      const data = Buffer.alloc(size);
      const { bytesRead } = await fileHandle.read(data, 0, size, 0);
      cache.store(videoKey, 0, data.subarray(0, bytesRead));
    } finally {
      await fileHandle.close();
    }
    return { videoKey, bytes: size };
  }
  return null;
}