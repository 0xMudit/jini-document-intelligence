import { catalog, findTitle, toTitleLite, GENRES } from "./catalog";
import type { BrowseResponse, BrowseRow, Title, TitleLite, WatchProgress } from "./types";

export interface UserContext {
  progress: WatchProgress[];
  myListIds: Set<string>;
  myListOrder: string[];
}

export function pickFeatured(context: UserContext, excludedIds: Set<string>): Title | null {
  const withProgress = context.progress.map((item) => findTitle(item.titleId)).filter(Boolean) as Title[];
  if (withProgress.length) {
    const top = withProgress.sort((a, b) => b.popularity - a.popularity)[0];
    if (top) return top;
  }
  const candidates = catalog.filter((title) => !excludedIds.has(title.id) && title.isTrending);
  candidates.sort((a, b) => b.popularity - a.popularity);
  return candidates[0] ?? null;
}

function lite(title: Title, progressPercent?: number): TitleLite {
  return {
    ...toTitleLite(title),
    ...(progressPercent === undefined ? {} : { progressPercent }),
  };
}

export function buildRows(context: UserContext, featuredId?: string): BrowseRow[] {
  const rows: BrowseRow[] = [];

  const continued = context.progress
    .map((item) => findTitle(item.titleId))
    .filter((title): title is Title => Boolean(title))
    .map((title) => {
      const progress = context.progress.find((item) => item.titleId === title.id);
      return { title, percent: progress && progress.durationSeconds > 0 ? (progress.positionSeconds / progress.durationSeconds) * 100 : 0 };
    });

  if (continued.length) {
    rows.push({ id: "continue-watching", label: "Continue Watching", items: continued.map(({ title, percent }) => lite(title, percent)) });
  }

  if (context.myListIds.size) {
    const listed = context.myListOrder
      .map((id) => findTitle(id))
      .filter((title): title is Title => Boolean(title))
      .map((title) => title);
    if (listed.length) {
      rows.push({ id: "my-list", label: "My List", items: listed.map((title) => lite(title)) });
    }
  }

  const withoutFeatured = (titles: Title[]) => titles.filter((title) => title.id !== featuredId);

  rows.push({
    id: "trending-now",
    label: "Trending Now",
    items: withoutFeatured(catalog.filter((title) => title.isTrending).sort((a, b) => b.popularity - a.popularity))
      .slice(0, 22)
      .map((title) => lite(title)),
  });

  rows.push({
    id: "new-releases",
    label: "New Releases",
    items: withoutFeatured(
      catalog.filter((title) => title.isNew || new Date(title.releaseDate).getFullYear() >= 2025),
    )
      .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
      .slice(0, 22)
      .map((title) => lite(title)),
  });

  rows.push({
    id: "critically-acclaimed",
    label: "Critically Acclaimed",
    items: withoutFeatured(catalog.filter((title) => title.rating >= 4.5))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 22)
      .map((title) => lite(title)),
  });

  rows.push({
    id: "jini-originals",
    label: "Jini Originals",
    items: withoutFeatured(catalog.filter((title) => title.isOriginal))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 22)
      .map((title) => lite(title)),
  });

  for (const genre of GENRES) {
    const items = withoutFeatured(catalog.filter((title) => title.genres.includes(genre)))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 22);
    if (items.length >= 3 && !rows.some((row) => row.id === `genre-${genre}`)) {
      rows.push({ id: `genre-${genre}`, label: `${genre} & Beyond`, items: items.map((title) => lite(title)) });
    }
  }

  return rows;
}

export function buildBrowse(context: UserContext): BrowseResponse {
  const featured = pickFeatured(context, new Set());
  return {
    featured,
    rows: buildRows(context, featured?.id),
  };
}

export function searchCatalog(query: string, genre?: string) {
  const needle = query.trim().toLowerCase();
  return catalog
    .filter((title) => {
      const matchesQuery =
        !needle ||
        title.title.toLowerCase().includes(needle) ||
        title.genres.some((item) => item.toLowerCase().includes(needle)) ||
        title.cast.some((person) => person.toLowerCase().includes(needle)) ||
        title.tagline.toLowerCase().includes(needle);
      const matchesGenre = !genre || genre === "All" || title.genres.includes(genre);
      return matchesQuery && matchesGenre;
    })
    .sort((a, b) => b.popularity - a.popularity)
    .map((title) => lite(title));
}

export function titlesByGenre(genre: string) {
  return catalog
    .filter((title) => title.genres.includes(genre))
    .sort((a, b) => b.popularity - a.popularity)
    .map((title) => lite(title));
}