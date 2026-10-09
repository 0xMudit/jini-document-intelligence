import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NavBar } from "./components/NavBar";
import { Spinner } from "./components/Spinner";
import { getErrorMessage, request } from "./lib/api";
import { useRouter } from "./lib/router";
import type { AuthUser, BrowseResponse, Genre, Notice, PlaybackInfo, Route, Title, TitleLite } from "./types";
import { AuthScreen } from "./views/AuthScreen";
import { BrowseView } from "./views/BrowseView";
import { DetailsView } from "./views/DetailsView";
import { GenreView } from "./views/GenreView";
import { MyListView } from "./views/MyListView";
import { InsightsView } from "./views/InsightsView";
import { LibraryView } from "./views/LibraryView";
import { PlayerView } from "./views/PlayerView";
import { SearchView } from "./views/SearchView";

const TEST_EMAIL = "test@jini.local";
const TEST_PASSWORD = "JiniTest123!";

export function Jini() {
  const { route, navigate } = useRouter();
  const [authState, setAuthState] = useState<"loading" | "signedout" | "signedin">("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [browse, setBrowse] = useState<BrowseResponse | null>(null);
  const [list, setList] = useState<TitleLite[] | null>(null);
  const [listIds, setListIds] = useState<Set<string>>(() => new Set());

  const [details, setDetails] = useState<Title | null>(null);
  const [detailsError, setDetailsError] = useState("");
  const [playback, setPlayback] = useState<PlaybackInfo | null>(null);
  const [playbackError, setPlaybackError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  const previousRouteRef = useRef<Route | null>(null);

  const postJson = useCallback((url: string, body: unknown) =>
    request<{ user: AuthUser }>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }), []);

  const refreshBrowse = useCallback(async () => {
    try {
      const data = await request<BrowseResponse>("/api/browse");
      setBrowse(data);
    } catch {
      // Browse failures are surfaced via the shared notice elsewhere.
    }
  }, []);

  const refreshList = useCallback(async () => {
    try {
      const items = await request<TitleLite[]>("/api/me/list");
      setList(items);
      setListIds(new Set(items.map((item) => item.id)));
    } catch {
      // The list page will show an empty state if this fails.
    }
  }, []);

  // Restore the session on first paint.
  useEffect(() => {
    let active = true;
    request<{ user: AuthUser }>("/api/auth/me")
      .then(({ user: me }) => {
        if (active) {
          setUser(me);
          setAuthState("signedin");
        }
      })
      .catch(() => {
        if (active) setAuthState("signedout");
      });
    return () => {
      active = false;
    };
  }, []);

  // Prime genres, browse rows and the My List once signed in.
  useEffect(() => {
    if (authState !== "signedin") return;
    let active = true;
    void request<Genre[]>("/api/genres")
      .then((result) => {
        if (active) setGenres(result);
      })
      .catch(() => undefined);
    void refreshBrowse();
    void refreshList();
    return () => {
      active = false;
    };
  }, [authState, refreshBrowse, refreshList]);

  // Load details whenever the user lands on a title page.
  useEffect(() => {
    if (authState !== "signedin" || (route.name !== "details" && route.name !== "player")) return;
    let active = true;
    setDetails(null);
    setDetailsError("");
    void request<Title>(`/api/titles/${encodeURIComponent(route.id)}`)
      .then((title) => {
        if (active) setDetails(title);
      })
      .catch((error) => {
        if (active) setDetailsError(getErrorMessage(error, "Could not load this title."));
      });
    return () => {
      active = false;
    };
  }, [authState, route]);

  // Load playback once a player route is active.
  useEffect(() => {
    if (authState !== "signedin" || route.name !== "player") return;
    let active = true;
    setPlayback(null);
    setPlaybackError("");
    const query = route.episodeId ? `?episode=${encodeURIComponent(route.episodeId)}` : "";
    void request<PlaybackInfo>(`/api/titles/${encodeURIComponent(route.id)}/play${query}`)
      .then((info) => {
        if (active) setPlayback(info);
      })
      .catch((error) => {
        if (active) setPlaybackError(getErrorMessage(error, "Unable to start playback."));
      });
    return () => {
      active = false;
    };
  }, [authState, route]);

  // Refresh browse rows (Continue Watching) when returning home.
  useEffect(() => {
    const previous = previousRouteRef.current;
    previousRouteRef.current = route;
    if (previous && previous.name !== "browse" && route.name === "browse") {
      void refreshBrowse();
    }
  }, [route, refreshBrowse]);

  // Scroll to the top on navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const inList = useCallback((id: string) => listIds.has(id), [listIds]);

  const goOpen = useCallback((id: string) => navigate({ name: "details", id }), [navigate]);
  const goPlay = useCallback((id: string, episodeId?: string) => navigate({ name: "player", id, episodeId }), [navigate]);

  const toggleList = useCallback(async (id: string) => {
    const previous = new Set(listIds);
    const adding = !previous.has(id);
    setListIds((current) => {
      const next = new Set(current);
      if (adding) next.add(id);
      else next.delete(id);
      return next;
    });
    try {
      await request(`/api/me/list/${encodeURIComponent(id)}`, { method: adding ? "PUT" : "DELETE" });
      await refreshList();
      setNotice({ tone: "success", message: adding ? "Added to My List" : "Removed from My List" });
    } catch (error) {
      setListIds(previous);
      setNotice({ tone: "error", message: getErrorMessage(error, "Could not update My List.") });
    }
  }, [listIds, refreshList]);

  const savePosition = useCallback(async (titleId: string, episodeId: string | null, positionSeconds: number, durationSeconds: number) => {
    try {
      await request("/api/me/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId, episodeId, positionSeconds, durationSeconds }),
      });
    } catch {
      // Best-effort; progress restores next time a play screen loads.
    }
  }, []);

  const playerEpisodes = useMemo(() => {
    if (!details?.series) return [];
    return details.series
      .flatMap((season) => season.episodes)
      .sort((a, b) => a.season - b.season || a.episode - b.episode);
  }, [details]);

  const handlePosition = useCallback((positionSeconds: number, durationSeconds: number) => {
    if (!playback) return;
    void savePosition(playback.titleId, playback.episode?.id ?? null, positionSeconds, durationSeconds);
  }, [playback, savePosition]);

  const handleEnded = useCallback((_positionSeconds: number, _durationSeconds: number) => {
    if (!playback) return;
    void savePosition(playback.titleId, playback.episode?.id ?? null, 0, playback.durationSeconds);
    if (playback.kind === "series" && playback.episode) {
      const index = playerEpisodes.findIndex((episode) => episode.id === playback.episode?.id);
      const next = playerEpisodes[index + 1];
      if (next) {
        navigate({ name: "player", id: playback.titleId, episodeId: next.id });
        return;
      }
    }
    navigate({ name: "browse" });
  }, [playback, playerEpisodes, savePosition, navigate]);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const { user: signedIn } = await postJson("/api/auth/login", { email, password });
      setUser(signedIn);
      setAuthState("signedin");
    } catch (error) {
      setAuthError(getErrorMessage(error, "Could not sign in."));
    } finally {
      setAuthBusy(false);
    }
  }, [postJson]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const { user: created } = await postJson("/api/auth/signup", { name, email, password });
      setUser(created);
      setAuthState("signedin");
    } catch (error) {
      setAuthError(getErrorMessage(error, "Could not create the account."));
    } finally {
      setAuthBusy(false);
    }
  }, [postJson]);

  const handleGuest = useCallback(async () => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const { user: guest } = await postJson("/api/auth/guest", {});
      setUser(guest);
      setAuthState("signedin");
    } catch (error) {
      setAuthError(getErrorMessage(error, "Guest preview is unavailable."));
    } finally {
      setAuthBusy(false);
    }
  }, [postJson]);

  const handleSignOut = useCallback(async () => {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed to the sign-out screen regardless.
    }
    setUser(null);
    setAuthState("signedout");
    setBrowse(null);
    setList(null);
    setListIds(new Set());
    setDetails(null);
    setPlayback(null);
    navigate({ name: "browse" });
  }, [navigate]);

  const activeGenre = route.name === "genre" ? genres.find((genre) => genre.id === route.id) ?? null : null;

  const goBack = useCallback(() => navigate({ name: "browse" }), [navigate]);

  if (authState === "loading") {
    return (
      <div className="splash">
        <div className="splash-brand"><span>Ji</span>ni</div>
        <Spinner label="Warming up the projector" />
      </div>
    );
  }

  if (authState === "signedout") {
    return (
      <ErrorBoundary>
        <AuthScreen busy={authBusy} error={authError} onGuest={handleGuest} onTestUser={() => handleSignIn(TEST_EMAIL, TEST_PASSWORD)} onSignIn={handleSignIn} onSignUp={handleSignUp} />
      </ErrorBoundary>
    );
  }

  if (route.name === "player") {
    return (
      <ErrorBoundary>
        {playbackError ? (
          <div className="player player-error">
            <button className="back-button" onClick={goBack} type="button" aria-label="Go back">←</button>
            <p>{playbackError}</p>
            <button className="btn btn-play" onClick={goBack} type="button">Back to browsing</button>
          </div>
        ) : (
          <PlayerView
            episodes={playerEpisodes}
            key={`${route.id}:${route.episodeId ?? ""}`}
            onBack={goBack}
            onEnded={handleEnded}
            onPosition={handlePosition}
            onSwitchEpisode={(episodeId) => navigate({ name: "player", id: route.id, episodeId })}
            playback={playback}
          />
        )}
      </ErrorBoundary>
    );
  }

  if (route.name === "genre" && !activeGenre) {
    return <Spinner label="Loading genres" />;
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <NavBar
          activeGenre={activeGenre ?? undefined}
          genres={genres}
          onNavigate={navigate}
          onSignOut={() => void handleSignOut()}
          route={route}
          user={user!}
        />
        <main className="content">
          {route.name === "browse" ? (
            <BrowseView browse={browse} inList={inList} onOpen={goOpen} onPlay={goPlay} onToggleList={(id) => void toggleList(id)} />
          ) : null}
          {route.name === "genre" && activeGenre ? (
            <GenreView genre={activeGenre} inList={inList} onOpen={goOpen} onPlay={goPlay} onToggleList={(id) => void toggleList(id)} title={activeGenre.name} />
          ) : null}
          {route.name === "search" ? (
            <SearchView inList={inList} onOpen={goOpen} onPlay={goPlay} onToggleList={(id) => void toggleList(id)} />
          ) : null}
          {route.name === "mylist" ? (
            <MyListView inList={inList} items={list} loading={list === null} onOpen={goOpen} onPlay={goPlay} onToggleList={(id) => void toggleList(id)} />
          ) : null}
          {route.name === "insights" ? <InsightsView onNavigate={navigate} /> : null}
          {route.name === "library" ? <LibraryView onNavigate={navigate} /> : null}
          {route.name === "details" ? (
            <DetailsView error={detailsError} inList={inList(route.id)} onBack={goBack} onPlay={goPlay} onToggleList={(id) => void toggleList(id)} title={details} />
          ) : null}
        </main>
        <footer className="footer">
          <p>Jini Stream — a self-hosted demo streaming service. Playback uses local files or public sample media.</p>
        </footer>
        {notice ? <div className={`toast toast-${notice.tone}`} role="status">{notice.message}</div> : null}
      </div>
    </ErrorBoundary>
  );
}