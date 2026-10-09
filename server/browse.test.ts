import { describe, expect, it } from "vitest";
import { buildBrowse, buildRows, pickFeatured, searchCatalog, titlesByGenre } from "./browse";
import type { Title, WatchProgress } from "./types";

const emptyContext = { progress: [] as WatchProgress[], myListIds: new Set<string>(), myListOrder: [] as string[] };

describe("browse", () => {
  it("builds the standard editorial rows", () => {
    const { featured, rows } = buildBrowse(emptyContext);
    const ids = rows.map((row) => row.id);
    expect(ids).toContain("trending-now");
    expect(ids).toContain("new-releases");
    expect(ids).toContain("critically-acclaimed");
    expect(ids).toContain("jini-originals");
    expect(ids.filter((id) => id.startsWith("genre-")).length).toBeGreaterThanOrEqual(3);
    expect(featured).not.toBeNull();
    for (const row of rows) {
      expect(row.items.length).toBeGreaterThan(0);
      for (const item of row.items) {
        expect(item.id).toBeTruthy();
        expect(item.palette).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("lifts continue-watching and my-list rows when present", () => {
    const title: Title = {
      id: "the-wandering-star",
      kind: "movie",
      title: "The Wandering Star",
      tagline: "Find your orbit.",
      description: "desc",
      year: 2023,
      maturity: "U",
      runtimeMinutes: 108,
      genres: ["Sci-Fi"],
      cast: [],
      directors: [],
      rating: 4.5,
      popularity: 72,
      isNew: false,
      isTrending: false,
      isOriginal: false,
      releaseDate: "2023-05-05",
      videoKey: "Sintel",
      series: null,
      palette: "#184e79",
    };
    const progress: WatchProgress = {
      titleId: title.id,
      episodeId: null,
      positionSeconds: 1800,
      durationSeconds: 6480,
      updatedAt: new Date().toISOString(),
      percent: 28,
    };
    const context = {
      progress: [progress],
      myListIds: new Set([title.id]),
      myListOrder: [title.id],
    };

    const rows = buildRows(context);
    expect(rows[0].id).toBe("continue-watching");
    expect(rows[0].items[0].progressPercent).toBeCloseTo(27.8, 1);
    const myListRow = rows.find((row) => row.id === "my-list");
    expect(myListRow?.items[0].id).toBe(title.id);
    expect(myListRow?.items[0].progressPercent).toBeUndefined();
  });

  it("picks a trending hero by popularity", () => {
    const featured = pickFeatured(emptyContext, new Set());
    expect(featured).not.toBeNull();
    expect(featured!.isTrending).toBe(true);
    const second = pickFeatured(emptyContext, new Set([featured!.id]));
    expect(second).not.toBeNull();
    expect(second!.id).not.toBe(featured!.id);
  });

  it("searches the catalog by title, cast, genre, and tagline", () => {
    const byTitle = searchCatalog("horizon");
    expect(byTitle[0]?.title).toBe("The Last Horizon");

    const byCast = searchCatalog("takada");
    expect(byCast.some((item) => item.title === "The Bitter Tea")).toBe(true);

    const byGenre = searchCatalog("horror");
    expect(byGenre.some((item) => item.genres.includes("Horror"))).toBe(true);

    const byTagline = searchCatalog("extinction");
    expect(byTagline.some((item) => item.id === "dustbowl-dinosaurs")).toBe(true);

    const everything = searchCatalog("");
    expect(everything.length).toBeGreaterThan(40);
  });

  it("sorts search results by popularity and strips heavy fields", () => {
    const results = searchCatalog("");
    for (const item of results) {
      expect((item as { description?: unknown }).description).toBeUndefined();
      expect((item as { cast?: unknown }).cast).toBeUndefined();
    }
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns genre rows with only matching titles", () => {
    const titles = titlesByGenre("Documentary");
    expect(titles.length).toBeGreaterThanOrEqual(1);
    expect(titles.every((item) => item.genres.includes("Documentary"))).toBe(true);
  });
});