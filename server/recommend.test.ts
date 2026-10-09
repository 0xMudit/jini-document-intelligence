import { describe, expect, it } from "vitest";
import {
  applyPersonalization,
  ecs,
  ImplicitMF,
  similarTitles,
  takeRate,
  type Interaction,
  type TitleFacts,
} from "./recommend";
import type { BrowseResponse } from "./types";

/** Deterministic PRNG so latent-factor training is reproducible. */
function seededRng() {
  let state = 123456789;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const FACTS: TitleFacts[] = [
  { id: "horror-1", popularity: 80, rating: 3.8, genres: ["Horror", "Thriller"] },
  { id: "horror-2", popularity: 60, rating: 4.1, genres: ["Horror"] },
  { id: "action-1", popularity: 95, rating: 4.5, genres: ["Action"] },
  { id: "action-2", popularity: 70, rating: 4.0, genres: ["Action", "Adventure"] },
];

const HORROR_FAN: Interaction[] = [
  { userId: "user-a", titleId: "horror-1", playCount: 3, watchFraction: 0.9 },
  { userId: "user-a", titleId: "horror-2", playCount: 2, watchFraction: 0.7 },
  { userId: "other", titleId: "action-1", playCount: 5, watchFraction: 1 },
];

describe("ImplicitMF", () => {
  it("learns latent factors that pull same-genre titles above unrelated ones", () => {
    const model = new ImplicitMF({ rng: seededRng() }).train(HORROR_FAN, FACTS);
    expect(model.predict("user-a", "horror-1")).toBeGreaterThan(model.predict("user-a", "action-1"));
    expect(model.predict("other", "action-1")).toBeGreaterThan(model.predict("other", "horror-1"));
  });

  it("cold-start users rank by the global baseline", () => {
    const model = new ImplicitMF({ rng: seededRng() }).train(HORROR_FAN, FACTS);
    const cold = model.predict("nobody", "horror-1");
    expect(Number.isFinite(cold)).toBe(true);
  });

  it("ranks popularity first under pop, prediction under pvr", () => {
    const model = new ImplicitMF({ rng: seededRng() }).train(HORROR_FAN, FACTS);
    const pop = model.rank("user-a", FACTS, "pop");
    expect(pop[0]).toBe("action-1");
    const pvr = model.rank("user-a", FACTS, "pvr");
    expect(pvr[0]).toBe("horror-1");
  });

  it("trains without any interactions", () => {
    const model = new ImplicitMF({ rng: seededRng() }).train([], FACTS);
    expect(model.metrics().items).toBe(FACTS.length);
    expect(model.metrics().iterations).toBe(0);
  });
});

describe("similarTitles", () => {
  it("returns k matches excluding the seed title", () => {
    const model = new ImplicitMF({ rng: seededRng() }).train(HORROR_FAN, FACTS);
    const matches = similarTitles("horror-1", FACTS, model, 4);
    expect(matches).not.toContain("horror-1");
    expect(matches).toHaveLength(3);
    expect(matches[0]).toBe("horror-2");
  });

  it("falls back to content similarity without a model", () => {
    const matches = similarTitles("action-1", FACTS, null, 4);
    expect(matches[0]).toBe("action-2");
  });
});

describe("engagement metrics", () => {
  it("computes the entropy-based effective catalog size", () => {
    expect(ecs([1, 1, 1, 1])).toBeCloseTo(4, 2);
    expect(ecs([10])).toBeCloseTo(1, 2);
    expect(ecs([500, 1])).toBeGreaterThan(1);
    expect(ecs([500, 1])).toBeLessThan(2);
    expect(ecs([])).toBe(0);
  });

  it("computes take-rate", () => {
    expect(takeRate(0, 0)).toBe(0);
    expect(takeRate(5, 100)).toBe(0.05);
  });
});

describe("applyPersonalization", () => {
  const lite = (id: string) => ({ id, kind: "movie" as const, title: id, year: 2024, maturity: "U" as const, genres: ["Horror"], rating: 4, runtimeMinutes: 100, isNew: false, isOriginal: false, palette: "#000000" });

  const browse: BrowseResponse = {
    featured: null,
    rows: [
      { id: "continue-watching", label: "Continue Watching", items: [lite("horror-1")] },
      { id: "trending-now", label: "Trending Now", items: [lite("action-1"), lite("horror-1"), lite("horror-2")] },
    ],
  };

  const engine: Parameters<typeof applyPersonalization>[1] = {
    recommender: new ImplicitMF({ rng: seededRng() }).train(HORROR_FAN, FACTS),
    facts: FACTS,
    interactions: HORROR_FAN,
    playCounts: new Map(),
    impressionCounts: new Map(),
  };

  const toLite = (ids: string[]) => ids.map((id) => lite(id));

  it("leaves the pop variant untouched", () => {
    const result = applyPersonalization(browse, engine, "user-a", "pop", toLite);
    expect(result.rows.map((row) => row.id)).toEqual(["continue-watching", "trending-now"]);
  });

  it("adds Top Picks and reorders Trending under pvr", () => {
    const result = applyPersonalization(browse, engine, "user-a", "pvr", toLite);
    const ids = result.rows.map((row) => row.id);
    expect(ids).toContain("top-picks");
    const trending = result.rows.find((row) => row.id === "trending-now")!;
    expect(trending.items[0].id).toBe("horror-1");
    const top = result.rows.find((row) => row.id === "top-picks")!;
    expect(top.items[0].id).toBe("horror-2");
    expect(top.items.map((item) => item.id)).not.toContain("horror-1");
  });

  it("returns the page unchanged without engine or interactions", () => {
    const none: Parameters<typeof applyPersonalization>[1] = null;
    expect(applyPersonalization(browse, none, "user-a", "pvr", toLite).rows.map((row) => row.id)).toEqual(["continue-watching", "trending-now"]);
  });
});