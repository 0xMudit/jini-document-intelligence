import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TitleLite } from "../types";
import { TitleCard } from "./TitleCard";

export function TitleRow({
  label,
  items,
  inList,
  onOpen,
  onPlay,
  onToggleList,
}: {
  label: string;
  items: TitleLite[];
  inList: (id: string) => boolean;
  onOpen: (id: string) => void;
  onPlay: (id: string) => void;
  onToggleList: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = 260;
    const page = Math.max(1, Math.floor(track.clientWidth / cardWidth));
    track.scrollBy({ left: direction * page * cardWidth, behavior: "smooth" });
  };

  return (
    <section className="row">
      <div className="row-head">
        <h2>{label}</h2>
        <div className="row-arrows">
          <button aria-label="Scroll left" onClick={() => scrollBy(-1)} type="button">
            <ChevronLeft size={18} />
          </button>
          <button aria-label="Scroll right" onClick={() => scrollBy(1)} type="button">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="row-track" ref={trackRef}>
        {items.map((item) => (
          <TitleCard
            inList={inList(item.id)}
            item={item}
            key={item.id}
            onOpen={onOpen}
            onPlay={onPlay}
            onToggleList={onToggleList}
          />
        ))}
      </div>
    </section>
  );
}