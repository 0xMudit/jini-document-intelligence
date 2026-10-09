import { describe, expect, it } from "vitest";
import {
  bbaDecide,
  buildLadder,
  decideAbr,
  sortLadder,
  type LadderVariant,
} from "../shared/abr";

const LADDER: LadderVariant[] = [
  { rung: 0, height: 360, width: 640, bitrateKbps: 600 },
  { rung: 1, height: 540, width: 960, bitrateKbps: 1200 },
  { rung: 2, height: 720, width: 1280, bitrateKbps: 2200 },
  { rung: 3, height: 960, width: 1920, bitrateKbps: 3600 },
];

const state = (bufferSeconds: number, currentRung = 1, extra: Partial<Parameters<typeof decideAbr>[0]> = {}) => ({
  bufferSeconds,
  currentRung,
  segmentSeconds: 6,
  ...extra,
});

describe("sortLadder", () => {
  it("sorts ascending and re-indexes rungs", () => {
    const out = sortLadder([LADDER[3], LADDER[0], LADDER[2], LADDER[1]]);
    expect(out.map((rung) => rung.bitrateKbps)).toEqual([600, 1200, 2200, 3600]);
    expect(out.map((rung) => rung.rung)).toEqual([0, 1, 2, 3]);
  });
});

describe("buildLadder (per-title encode optimization)", () => {
  it("produces a monotonic ladder capped near the source bitrate", () => {
    const ladder = sortLadder(buildLadder({ width: 1920, height: 800, bitrateKbps: 3000 }));
    expect(ladder[0].bitrateKbps).toBeGreaterThanOrEqual(220);
    for (let i = 1; i < ladder.length; i += 1) {
      expect(ladder[i].bitrateKbps).toBeGreaterThan(ladder[i - 1].bitrateKbps);
      expect(ladder[i].height).toBeGreaterThan(ladder[i - 1].height);
    }
    expect(ladder[ladder.length - 1].height).toBe(800);
    expect(ladder[ladder.length - 1].bitrateKbps).toBeLessThanOrEqual(3000);
    expect(ladder[ladder.length - 1].width / ladder[ladder.length - 1].height).toBeCloseTo(1920 / 800, 1);
  });

  it("falls back to a single sane rung for a tiny source", () => {
    const ladder = buildLadder({ width: 240, height: 160, bitrateKbps: 1500 });
    expect(ladder.length).toBe(1);
    expect(ladder[0].height).toBeGreaterThanOrEqual(160);
  });
});

describe("BOLA", () => {
  it("picks the floor rung at an empty buffer and climbs towards the ceiling at a full buffer", () => {
    const empty = decideAbr(state(0, 1), LADDER, "bola");
    expect(empty.rung).toBe(0);

    const full = decideAbr(state(28, 1), LADDER, "bola");
    expect(full.rung).toBe(LADDER.length - 1);
  });

  it("is monotonic non-decreasing in buffer occupancy", () => {
    let previous = 0;
    for (let buffer = 0; buffer <= 30; buffer += 1) {
      const pick = decideAbr(state(buffer, previous), LADDER, "bola");
      expect(pick.rung).toBeGreaterThanOrEqual(previous);
      previous = pick.rung;
    }
  });

  it("switches down as the buffer drains", () => {
    const hungry = decideAbr(state(4, 3), LADDER, "bola");
    expect(hungry.rung).toBeLessThan(3);
  });

  it("holds steady when the buffer is past capacity (do not download, per the paper)", () => {
    const pick = decideAbr(state(40, 2), LADDER, "bola");
    expect(pick.rung).toBe(2);
    expect(pick.reason).toBe("buffer-full");
  });

  it("ties to the lowest rung for stability", () => {
    const pick = decideAbr(state(12, 1), LADDER, "bola");
    expect(pick.rung).toBeGreaterThanOrEqual(0);
    expect(pick.bitrateKbps).toBe(LADDER[pick.rung].bitrateKbps);
  });
});

describe("BBA (buffer-based, Huang et al.)", () => {
  it("drops to the floor below the reservoir", () => {
    const pick = bbaDecide(state(2, 3), LADDER);
    expect(pick.rung).toBe(0);
    expect(pick.reason).toBe("reservoir");
  });

  it("climbs to the ceiling once the cushion is filled", () => {
    const pick = bbaDecide(state(40, 0), LADDER);
    expect(pick.rung).toBe(LADDER.length - 1);
  });

  it("is sticky: small buffer movement inside a rate band keeps the rung", () => {
    const base = bbaDecide(state(10, 1), LADDER);
    expect(base.rung).toBe(1);
    const still = bbaDecide(state(10.6, 1), LADDER);
    expect(still.rung).toBe(1);
  });

  it("steps up one rung at a time as the rate map crosses barriers", () => {
    let rung = 0;
    for (let buffer = 0; buffer <= 40; buffer += 1) {
      const pick = bbaDecide(state(buffer, rung), LADDER);
      expect(pick.rung).toBeGreaterThanOrEqual(rung);
      expect(pick.rung - rung).toBeLessThanOrEqual(1);
      rung = pick.rung;
    }
    expect(rung).toBe(LADDER.length - 1);
  });

  it("steps down once the map falls below the previous barrier", () => {
    const centered = bbaDecide(state(14, 3), LADDER);
    expect(centered.rung).toBeLessThan(3);
  });
});

describe("decideAbr default", () => {
  it("defaults to BOLA", () => {
    const pick = decideAbr(state(20, 0), LADDER);
    expect(pick.algorithm).toBe("bola");
  });

  it("handles a single-rung ladder", () => {
    const one = [LADDER[0]];
    const pick = decideAbr(state(0, 0), one, "bola");
    expect(pick.rung).toBe(0);
    expect(pick.reason).toBe("single-rung");
  });

  it("clamps a stale current rung that no longer exists", () => {
    const pick = decideAbr(state(0, 999), LADDER, "bola");
    expect(pick.rung).toBe(0);
  });
});