import { useEffect, useState } from "react";
import { request } from "../lib/api";
import { TitleCard } from "../components/TitleCard";
import { Spinner } from "../components/Spinner";
import type { Genre, TitleLite } from "../types";

export function GenreView({
  genre,
  inList,
  onOpen,
  onPlay,
  onToggleList,
  title,
}: {
  genre: Genre;
  inList: (id: string) => boolean;
  onOpen: (id: string) => void;
  onPlay: (id: string) => void;
  onToggleList: (id: string) => void;
  title: string;
}) {
  const [items, setItems] = useState<TitleLite[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setItems(null);
    setError("");
    request<TitleLite[]>(`/api/titles?genre=${encodeURIComponent(genre.name)}`)
      .then((result) => {
        if (active) setItems(result);
      })
      .catch(() => {
        if (active) setError("Unable to load this genre.");
      });
    return () => {
      active = false;
    };
  }, [genre.name]);

  if (error) {
    return <div className="empty-state"><p>{error}</p></div>;
  }

  if (!items) return <Spinner label={`Loading ${genre.name}`} />;

  return (
    <section className="collection">
      <header className="collection-head">
        <h1>{title}</h1>
        <p>{items.length} titles</p>
      </header>
      <div className="collection-grid">
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