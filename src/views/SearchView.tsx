import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { request } from "../lib/api";
import { TitleCard } from "../components/TitleCard";
import { Spinner } from "../components/Spinner";
import type { TitleLite } from "../types";

export function SearchView({
  inList,
  onOpen,
  onPlay,
  onToggleList,
}: {
  inList: (id: string) => boolean;
  onOpen: (id: string) => void;
  onPlay: (id: string) => void;
  onToggleList: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TitleLite[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setSearched(false);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = window.setTimeout(() => {
      request<TitleLite[]>(`/api/titles?q=${encodeURIComponent(trimmed)}`)
        .then((result) => {
          if (active) {
            setResults(result);
            setSearched(true);
          }
        })
        .catch(() => {
          if (active) {
            setResults([]);
            setSearched(true);
          }
        })
        .finally(() => {
          if (active) setSearching(false);
        });
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <section className="search">
      <div className="search-box">
        <SearchIcon size={20} />
        <input
          aria-label="Search titles"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Titles, people, genres"
          ref={inputRef}
          type="search"
          value={query}
        />
        {query ? (
          <button aria-label="Clear search" onClick={() => setQuery("")} type="button">
            <X size={18} />
          </button>
        ) : null}
      </div>

      {searching ? <Spinner label="Searching" /> : null}

      {!searching && !searched ? (
        <div className="search-hint">
          <h2>Search the catalog</h2>
          <p>Look up films and series from Jini&apos;s library — try &quot;space&quot;, &quot;heist&quot; or a key character.</p>
        </div>
      ) : null}

      {!searching && searched && !results?.length ? (
        <div className="empty-state">
          <p>No matches for “{query.trim()}”. Try another search.</p>
        </div>
      ) : null}

      {!searching && results?.length ? (
        <div className="collection-grid search-grid">
          {results.map((item) => (
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
      ) : null}
    </section>
  );
}