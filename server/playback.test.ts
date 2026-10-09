import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildPlaybackInfo } from "./playback";
import { ensureDataDirs, saveProgress } from "./storage";

const TEST_USER = "playback-test-user";
const TEST_USER_2 = "playback-test-user-2";

beforeAll(async () => {
  await ensureDataDirs();
});

afterAll(() => {
  // Keep the test database lean for repeat runs.
  saveProgress(TEST_USER, "the-last-horizon", null, 0, 0);
  saveProgress(TEST_USER_2, "the-last-horizon", null, 0, 0);
});

describe("playback", () => {
  it("resolves a movie to its master stream", () => {
    const playback = buildPlaybackInfo(TEST_USER, "the-last-horizon");
    expect(playback).not.toBeNull();
    expect(playback!.titleId).toBe("the-last-horizon");
    expect(playback!.kind).toBe("movie");
    expect(playback!.episode).toBeNull();
    expect(playback!.streamUrl).toMatch(/\/api\/video\//);
    expect(playback!.durationSeconds).toBeGreaterThan(0);
  });

  it("starts a series at the requested episode", () => {
    const playback = buildPlaybackInfo(TEST_USER, "the-quarter-life", "s2e1");
    expect(playback).not.toBeNull();
    expect(playback!.episode?.id).toBe("s2e1");
    expect(playback!.durationSeconds).toBeGreaterThan(0);
  });

  it("falls back to the pilot when no episode is requested", () => {
    const playback = buildPlaybackInfo(TEST_USER, "quantum-detectives");
    expect(playback).not.toBeNull();
    expect(playback!.episode?.episode).toBe(1);
  });

  it("returns a resumable position after progress is saved", () => {
    const before = buildPlaybackInfo(TEST_USER, "the-last-horizon")!;
    expect(before.positionSeconds).toBe(0);

    saveProgress(TEST_USER, "the-last-horizon", null, 720, before.durationSeconds);
    const after = buildPlaybackInfo(TEST_USER, "the-last-horizon")!;
    expect(after.positionSeconds).toBe(720);
  });

  it("keeps positions isolated per user and per episode", () => {
    saveProgress(TEST_USER, "the-last-horizon", null, 999, 4000);
    saveProgress(TEST_USER_2, "the-last-horizon", null, 321, 4000);
    saveProgress(TEST_USER, "the-quarter-life", "s1e1", 150, 1800);

    expect(buildPlaybackInfo(TEST_USER, "the-last-horizon")!.positionSeconds).toBe(999);
    expect(buildPlaybackInfo(TEST_USER_2, "the-last-horizon")!.positionSeconds).toBe(321);
    expect(buildPlaybackInfo(TEST_USER, "the-quarter-life", "s1e1")!.positionSeconds).toBe(150);
  });

  it("returns null for unknown titles", () => {
    expect(buildPlaybackInfo(TEST_USER, "does-not-exist")).toBeNull();
  });
});