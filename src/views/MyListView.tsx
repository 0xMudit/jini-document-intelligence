import { ListVideo } from "lucide-react";
import { TitleCard } from "../components/TitleCard";
import { Spinner } from "../components/Spinner";
import type { TitleLite } from "../types";

export function MyListView({
  items,
  loading,
  inList,
  onOpen,
  onPlay,
  onToggleList,
}: {
  items: TitleLite[] | null;
  loading: boolean;
  inList: (id: string) => boolean;
  onOpen: (id: string) => void;
  onPlay: (id: string) => void;
  onToggleList: (id: string) => void;
}) {
  if (loading) return <Spinner label="Loading My List" />;

  if (!items?.length) {
    return (
      <section className="collection">
        <header className="collection-head"><h1>My List</h1></header>
        <div className="empty-state">
          <ListVideo size={36} />
          <h2>Nothing here yet</h2>
          <p>Add movies and series to My List and they&apos;ll show up here, ready when you are.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="collection">
      <header className="collection-head">
        <h1>My List</h1>
        <p>{items.length} {items.length === 1 ? "title" : "titles"}</p>
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