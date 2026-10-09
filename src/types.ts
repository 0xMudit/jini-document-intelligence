export type MediaKind = "movie" | "series";

export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  description: string;
  runtimeMinutes: number;
  videoKey: string;
  released: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Title {
  id: string;
  kind: MediaKind;
  title: string;
  tagline: string;
  description: string;
  year: number;
  maturity: string;
  runtimeMinutes: number;
  genres: string[];
  cast: string[];
  directors: string[];
  rating: number;
  popularity: number;
  isNew: boolean;
  isTrending: boolean;
  isOriginal: boolean;
  releaseDate: string;
  videoKey: string | null;
  series: Season[] | null;
  palette: string;
  inList?: boolean;
}

export interface TitleLite {
  id: string;
  kind: MediaKind;
  title: string;
  year: number;
  maturity: string;
  genres: string[];
  rating: number;
  runtimeMinutes: number;
  isNew: boolean;
  isOriginal: boolean;
  palette: string;
  progressPercent?: number;
}

export interface BrowseRow {
  id: string;
  label: string;
  items: TitleLite[];
}

export interface BrowseResponse {
  featured: Title | null;
  rows: BrowseRow[];
}

export interface PlaybackInfo {
  titleId: string;
  title: string;
  kind: MediaKind;
  episode: Episode | null;
  streamUrl: string;
  /** When "hls", the player should use the ABR master playlist instead of streamUrl. */
  streamMode?: "direct" | "hls";
  hlsMasterUrl?: string;
  abrLadderUrl?: string;
  durationSeconds: number;
  positionSeconds: number;
}

export interface Genre {
  id: string;
  name: string;
  count: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "hr" | "guest" | "member";
}

export type Route =
  | { name: "browse" }
  | { name: "genre"; id: string }
  | { name: "search" }
  | { name: "mylist" }
  | { name: "insights" }
  | { name: "library" }
  | { name: "details"; id: string }
  | { name: "player"; id: string; episodeId?: string };

export interface Notice {
  tone: "success" | "error" | "neutral";
  message: string;
}