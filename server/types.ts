export type MediaKind = "movie" | "series";

export type Maturity = "ALL" | "U" | "G" | "U/A 7+" | "U/A 13+" | "U/A 16+" | "A";

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
  maturity: Maturity;
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
}

/** A title with the heavy fields (series, full synopses) stripped for rows. */
export interface TitleLite {
  id: string;
  kind: MediaKind;
  title: string;
  year: number;
  maturity: Maturity;
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

export interface WatchProgress {
  titleId: string;
  episodeId: string | null;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
  percent: number;
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

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "hr" | "guest" | "member";
}