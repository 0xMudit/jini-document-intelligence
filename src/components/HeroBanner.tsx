import { Check, Info, Play, Plus, Star } from "lucide-react";
import type { Title } from "../types";
import { formatRuntime } from "../lib/api";
import { ArtImage } from "./ArtImage";

export function HeroBanner({
  title,
  inList,
  onPlay,
  onOpen,
  onToggleList,
}: {
  title: Title;
  inList: boolean;
  onPlay: (id: string) => void;
  onOpen: (id: string) => void;
  onToggleList: (id: string) => void;
}) {
  return (
    <section className="hero">
      <div className="hero-art">
        <ArtImage titleId={title.id} palette={title.palette} name={title.title} variant="banner" />
      </div>
      <div className="hero-fade-bottom" />
      <div className="hero-fade-left" />
      <div className="hero-content">
        {title.isOriginal ? <span className="hero-badge">JINI ORIGINAL</span> : null}
        <h1 className="hero-title">{title.title}</h1>
        <div className="hero-meta">
          {title.isNew ? <span className="hero-new">New</span> : null}
          <span className="hero-rating"><Star size={13} fill="currentColor" /> {title.rating.toFixed(1)}</span>
          <span className="hero-year">{title.year}</span>
          <span className="hero-runtime">{formatRuntime(title.runtimeMinutes)}</span>
          <span className="hero-maturity">{title.maturity}</span>
        </div>
        <p className="hero-tagline">{title.tagline}</p>
        <p className="hero-description">{title.description}</p>
        <div className="hero-actions">
          <button className="btn btn-play" onClick={() => onPlay(title.id)} type="button">
            <Play size={20} fill="currentColor" /> Play
          </button>
          <button className="btn btn-ghost" onClick={() => onOpen(title.id)} type="button">
            <Info size={20} /> More Info
          </button>
          <button
            aria-label={inList ? "Remove from My List" : "Add to My List"}
            className={inList ? "btn btn-add active" : "btn btn-add"}
            onClick={() => onToggleList(title.id)}
            type="button"
            title={inList ? "Remove from My List" : "Add to My List"}
          >
            {inList ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </section>
  );
}