import { useMemo, useState } from "react";
import { ArrowLeft, Check, Play, Plus, Star } from "lucide-react";
import { formatRuntime } from "../lib/api";
import { ArtImage } from "../components/ArtImage";
import { Spinner } from "../components/Spinner";
import type { Episode, Title } from "../types";

export function DetailsView({
  title,
  inList,
  error,
  onBack,
  onPlay,
  onToggleList,
}: {
  title: Title | null;
  inList: boolean;
  error: string;
  onBack: () => void;
  onPlay: (titleId: string, episodeId?: string) => void;
  onToggleList: (id: string) => void;
}) {
  const [seasonNumber, setSeasonNumber] = useState<number | null>(null);
  const activeSeason = useMemo(() => {
    if (!title?.series?.length) return null;
    const number = seasonNumber ?? title.series[title.series.length - 1].number;
    return title.series.find((season) => season.number === number) ?? title.series[0];
  }, [title, seasonNumber]);

  if (error) {
    return <div className="empty-state details-error"><p>{error}</p><button className="btn btn-ghost" onClick={onBack} type="button">Go back</button></div>;
  }

  if (!title) return <Spinner label="Loading title" />;

  const totalEpisodes = title.series?.reduce((sum, season) => sum + season.episodes.length, 0) ?? 0;

  return (
    <article className="details">
      <div className="details-hero">
        <ArtImage titleId={title.id} palette={title.palette} name={title.title} variant="banner" />
        <div className="hero-fade-bottom" />
        <div className="details-fade-side" />
        <button className="back-button" onClick={onBack} type="button" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div className="details-content">
          {title.isOriginal ? <span className="hero-badge">JINI ORIGINAL</span> : null}
          <h1>{title.title}</h1>
          <div className="hero-meta">
            <span className="hero-rating"><Star size={13} fill="currentColor" /> {title.rating.toFixed(1)}</span>
            <span>{title.year}</span>
            <span>{title.kind === "movie" ? formatRuntime(title.runtimeMinutes) : `${totalEpisodes} Episodes`}</span>
            <span className="hero-maturity">{title.maturity}</span>
            {title.isNew ? <span className="hero-new">New</span> : null}
          </div>
          <p className="details-tagline">{title.tagline}</p>
          <div className="hero-actions">
            <button className="btn btn-play" onClick={() => onPlay(title.id)} type="button">
              <Play size={20} fill="currentColor" /> {title.kind === "series" ? "Play Episode" : "Play"}
            </button>
            <button
              aria-label={inList ? "Remove from My List" : "Add to My List"}
              className={inList ? "btn btn-add active" : "btn btn-add"}
              onClick={() => onToggleList(title.id)}
              type="button"
            >
              {inList ? <Check size={18} /> : <Plus size={18} />}
              <span>{inList ? "In My List" : "My List"}</span>
            </button>
          </div>
          <div className="details-facts">
            <p><strong>Genres:</strong> {title.genres.join(", ")}</p>
            {title.directors.length ? <p><strong>Directed by:</strong> {title.directors.join(", ")}</p> : null}
            {title.cast.length ? <p><strong>Starring:</strong> {title.cast.join(", ")}</p> : null}
          </div>
          <p className="details-description">{title.description}</p>
        </div>
      </div>

      {activeSeason ? (
        <section className="episodes">
          <div className="episodes-head">
            <h2>Episodes</h2>
            <label className="season-select">
              <span>Season</span>
              <select onChange={(event) => setSeasonNumber(Number(event.target.value))} value={activeSeason.number}>
                {title.series!.map((season) => (
                  <option key={season.number} value={season.number}>Season {season.number}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="episode-list">
            {activeSeason.episodes.map((episode: Episode) => (
              <EpisodeRow
                episode={episode}
                key={episode.id}
                onPlay={(id) => onPlay(title.id, id)}
                palette={title.palette}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function EpisodeRow({ episode, palette, onPlay }: { episode: Episode; palette: string; onPlay: (id: string) => void }) {
  return (
    <div className="episode-row">
      <span className="episode-number">{episode.episode}</span>
      <button className="episode-play" onClick={() => onPlay(episode.id)} type="button" aria-label={`Play ${episode.title}`}>
        <Play size={16} fill="currentColor" />
      </button>
      <div className="episode-copy">
        <div className="episode-title">
          <strong>{episode.title}</strong>
          <span>{formatRuntime(episode.runtimeMinutes)}</span>
        </div>
        <p>{episode.description}</p>
        <small>Released {episode.released}</small>
      </div>
      <span className="episode-palette" style={{ background: palette }} aria-hidden="true" />
    </div>
  );
}