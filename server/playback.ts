import { findEpisode, findTitle } from "./catalog";
import { findHlsPackage, mediaLadderUrl, mediaMasterUrl } from "./media";
import { getProgress } from "./storage";
import type { PlaybackInfo } from "./types";

/**
 * Resolves what an authenticated user is about to watch: for a movie the
 * title's master file; for a series the requested episode (or the pilot). Any
 * saved position is returned so the player can resume.
 */
export function buildPlaybackInfo(userId: string, titleId: string, requestedEpisodeId?: string): PlaybackInfo | null {
  const title = findTitle(titleId);
  if (!title) return null;

  let videoKey: string | null = null;
  let episode = null;
  let episodeId = "";
  let durationSeconds = 0;

  if (title.kind === "movie") {
    videoKey = title.videoKey;
    durationSeconds = title.runtimeMinutes * 60;
  } else {
    const firstEpisode = title.series?.flatMap((season) => season.episodes)[0] ?? null;
    episode =
      (requestedEpisodeId ? findEpisode(titleId, requestedEpisodeId) : null) ?? firstEpisode;
    if (episode) {
      videoKey = episode.videoKey;
      durationSeconds = episode.runtimeMinutes * 60;
      episodeId = episode.id;
    }
  }

  if (!videoKey) return null;

  const progress = getProgress(userId, titleId, episodeId || null);
  const hlsPackage = findHlsPackage(videoKey);
  // A packaged title may only cover a slice of the master (a demo clip), so the
  // package duration wins over the catalog runtime — otherwise the player seeks
  // into media that does not exist.
  const playableSeconds = hlsPackage?.durationSeconds ?? 0;
  return {
    titleId: title.id,
    title: title.title,
    kind: title.kind,
    episode,
    streamUrl: `/api/video/${encodeURIComponent(videoKey)}`,
    ...(hlsPackage
      ? {
          streamMode: "hls" as const,
          hlsMasterUrl: mediaMasterUrl(videoKey),
          abrLadderUrl: mediaLadderUrl(videoKey),
        }
      : {}),
    durationSeconds: playableSeconds > 0 ? playableSeconds : durationSeconds,
    positionSeconds: progress?.positionSeconds ?? 0,
  };
}