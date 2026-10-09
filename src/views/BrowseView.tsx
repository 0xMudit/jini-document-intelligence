import { HeroBanner } from "../components/HeroBanner";
import { TitleRow } from "../components/TitleRow";
import { Spinner } from "../components/Spinner";
import type { BrowseResponse } from "../types";

export function BrowseView({
  browse,
  inList,
  onOpen,
  onPlay,
  onToggleList,
}: {
  browse: BrowseResponse | null;
  inList: (id: string) => boolean;
  onOpen: (id: string) => void;
  onPlay: (id: string) => void;
  onToggleList: (id: string) => void;
}) {
  if (!browse) return <Spinner label="Loading titles" />;

  return (
    <>
      {browse.featured ? (
        <HeroBanner
          inList={inList(browse.featured.id)}
          onOpen={onOpen}
          onPlay={onPlay}
          onToggleList={onToggleList}
          title={browse.featured}
        />
      ) : null}
      <div className="browse-rows">
        {browse.rows.map((row) => (
          <TitleRow
            inList={inList}
            items={row.items}
            key={row.id}
            label={row.label}
            onOpen={onOpen}
            onPlay={onPlay}
            onToggleList={onToggleList}
          />
        ))}
      </div>
    </>
  );
}