import { describe, expect, it } from "vitest";
import { catalog, findEpisode, findTitle, SAMPLE_VIDEOS, toTitleLite } from "./catalog";

describe("catalog", () => {
  it("contains a healthy library of movies and series", () => {
    expect(catalog.length).toBeGreaterThanOrEqual(40);
    const movies = catalog.filter((title) => title.kind === "movie");
    const series = catalog.filter((title) => title.kind === "series");
    expect(movies.length).toBeGreaterThan(10);
    expect(series.length).toBeGreaterThan(5);
  });

  it("gives every title a unique id", () => {
    const ids = catalog.map((title) => title.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps playable items and series episodes on valid keys", () => {
    for (const title of catalog) {
      expect(title.palette).toMatch(/^#[0-9a-f]{6}$/i);
      if (title.kind === "movie") {
        expect(title.videoKey).toBeTruthy();
      } else {
        const episodes = title.series?.flatMap((season) => season.episodes) ?? [];
        expect(episodes.length).toBeGreaterThanOrEqual(1);
        for (const episode of episodes) {
          expect(episode.videoKey).toBeTruthy();
          expect(episode.id).toMatch(/^s\d+e\d+$/);
        }
      }
    }
  });

  it("seeds the four locally-provided films with matching video keys", () => {
    for (const id of ["blood-red-sky", "fall", "lights-out", "the-monkey"]) {
      const title = findTitle(id);
      expect(title, id).toBeTruthy();
      expect(title?.videoKey, id).toBe(id);
    }
  });

  it("resolves titles and episodes by id", () => {
    const series = catalog.find((title) => title.series) ?? null;
    expect(series, "expected at least one series").not.toBeNull();
    expect(findTitle(series!.id)?.title).toBe(series!.title);
    expect(findTitle("does-not-exist")).toBeNull();

    const firstEpisode = series!.series![0].episodes[0];
    expect(findEpisode(series!.id, firstEpisode.id)?.title).toBe(firstEpisode.title);
    expect(findEpisode(series!.id, "s99e99")).toBeNull();
    expect(findEpisode("the-last-horizon", "s1e1")).toBeNull();
  });

  it("strips heavy fields for row cards", () => {
    const full = findTitle("the-quarter-life")!;
    const lite = toTitleLite(full);
    expect(lite.id).toBe(full.id);
    expect(lite.title).toBe(full.title);
    expect((lite as { description?: unknown }).description).toBeUndefined();
    expect((lite as { series?: unknown }).series).toBeUndefined();
    expect((lite as { cast?: unknown }).cast).toBeUndefined();
    expect(lite.genres.length).toBeLessThanOrEqual(3);
  });

  it("resolves every video key to a known source", () => {
    const localKeys = ["blood-red-sky", "fall", "lights-out", "the-monkey"];
    const keys = catalog.map((title) => title.videoKey).filter((key): key is string => Boolean(key));
    const episodeKeys = catalog.flatMap((title) => title.series?.flatMap((s) => s.episodes) ?? []).map((e) => e.videoKey);
    for (const key of [...keys, ...episodeKeys]) {
      expect(SAMPLE_VIDEOS.includes(key) || localKeys.includes(key), key).toBe(true);
    }
  });
});