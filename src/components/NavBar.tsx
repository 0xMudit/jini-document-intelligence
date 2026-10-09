import { useEffect, useRef, useState } from "react";
import { Activity, ChevronDown, Compass, Home, Library, ListVideo, LogOut, Search } from "lucide-react";
import type { AuthUser, Genre, Route } from "../types";

export function NavBar({
  route,
  activeGenre,
  genres,
  user,
  onNavigate,
  onSignOut,
}: {
  route: Route;
  activeGenre?: Genre;
  genres: Genre[];
  user: AuthUser;
  onNavigate: (route: Route) => void;
  onSignOut: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setGenresOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const browse = route.name === "browse";
  const myList = route.name === "mylist";
  const browsingGenre = route.name === "genre";

  return (
    <header className={scrolled ? "nav nav-scrolled" : "nav"}>
      <button className="nav-brand" onClick={() => onNavigate({ name: "browse" })} type="button" aria-label="Jini home">
        <span className="nav-brand-mark">Ji</span>ni
      </button>

      <nav className="nav-links" aria-label="Primary">
        <button className={myList ? "nav-link active" : "nav-link"} onClick={() => onNavigate({ name: "mylist" })} type="button">
          <Home size={15} />
          <span>My List</span>
        </button>
        <button
          className={route.name === "insights" ? "nav-link active" : "nav-link"}
          onClick={() => onNavigate({ name: "insights" })}
          type="button"
        >
          <Activity size={15} />
          <span>Quality</span>
        </button>
        <button
          className={route.name === "library" ? "nav-link active" : "nav-link"}
          onClick={() => onNavigate({ name: "library" })}
          type="button"
        >
          <Library size={15} />
          <span>Library</span>
        </button>
        <div className="nav-link nav-dropdown" ref={dropdownRef}>
          <button
            className={browsingGenre ? "nav-trigger active" : "nav-trigger"}
            onClick={() => setGenresOpen((open) => !open)}
            type="button"
          >
            <Compass size={15} />
            <span>{browse && activeGenre ? activeGenre.name : "Browse"}</span>
            <ChevronDown size={13} />
          </button>
          {genresOpen ? (
            <div className="nav-genres">
              <button onClick={() => { setGenresOpen(false); onNavigate({ name: "browse" }); }} type="button">
                Home
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    setGenresOpen(false);
                    onNavigate({ name: "genre", id: genre.id });
                  }}
                  type="button"
                >
                  {genre.name}
                  <small>{genre.count}</small>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <div className="nav-actions">
        <button className={route.name === "search" ? "nav-icon active" : "nav-icon"} onClick={() => onNavigate({ name: "search" })} type="button" aria-label="Search">
          <Search size={19} />
        </button>
        <div className="nav-profile">
          <button className="nav-avatar" onClick={() => setMenuOpen((open) => !open)} type="button" aria-label="Account menu">
            {user.name.charAt(0).toUpperCase()}
            <ChevronDown size={13} />
          </button>
          {menuOpen ? (
            <div className="nav-menu">
              <div className="nav-menu-user">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button onClick={() => { setMenuOpen(false); onNavigate({ name: "mylist" }); }} type="button" className="with-icon">
                <ListVideo size={15} /> My List
              </button>
              <button onClick={() => { setMenuOpen(false); onSignOut(); }} type="button" className="with-icon">
                <LogOut size={15} /> Sign out of Jini
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}