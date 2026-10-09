import { Check, Play, Plus } from "lucide-react";
import type { TitleLite } from "../types";
import { ArtImage } from "./ArtImage";

export function TitleCard({
  item,
  inList,
  onOpen,
  onPlay,
  onToggleList,
}: {
  item: TitleLite;
  inList: boolean;
  onOpen: (id: string) => void;
  onPlay: (id: string) => void;
  onToggleList: (id: string) => void;
}) {
  return (
    <div className="card">
      <button aria-label={`Open ${item.title}`} className="card-poster" onClick={() => onOpen(item.id)} type="button">
        <ArtImage titleId={item.id} palette={item.palette} name={item.title} />
        <div className="card-hover">
          <div className="card-actions">
            <button
              aria-label={`Play ${item.title}`}
              className="card-action play"
              onClick={(event) => {
                event.stopPropagation();
                onPlay(item.id);
              }}
              type="button"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <button
              aria-label={inList ? "Remove from My List" : "Add to My List"}
              className={inList ? "card-action active" : "card-action"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleList(item.id);
              }}
              type="button"
            >
              {inList ? <Check size={15} /> : <Plus size={15} />}
            </button>
          </div>
          {item.isOriginal ? <span className="card-original">Jini Original</span> : null}
          <span className="card-title">{item.title}</span>
          <span className="card-meta">
            {item.year} · {item.maturity}
          </span>
        </div>
      </button>
      <div className="card-caption">
        <span>{item.title}</span>
        <small>
          {item.genres.slice(0, 2).join(" · ")}
        </small>
      </div>
      {typeof item.progressPercent === "number" ? (
        <div className="card-progress" aria-label={`${Math.round(item.progressPercent)}% watched`}>
          <span style={{ width: `${item.progressPercent}%` }} />
        </div>
      ) : null}
    </div>
  );
}