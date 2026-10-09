import { useCallback, useEffect, useState } from "react";
import type { Route } from "../types";

/**
 * Minimal hash router so the app works behind any static host under /jini/ and
 * the browser back button drives navigation.
 *   ""            -> browse
 *   #/search      -> search
 *   #/my-list     -> my list
 *   #/insights    -> streaming quality dashboard
 *   #/library     -> ingest / encode console
 *   #/title/:id   -> details
 *   #/watch/:id   -> player (episode option: #/watch/:id/:episodeId)
 */

function parseHash(): Route {
  const path = window.location.hash.replace(/^#/, "") || "/";
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "search") return { name: "search" };
  if (segments[0] === "genre" && segments[1]) return { name: "genre", id: decodeURIComponent(segments[1]) };
  if (segments[0] === "my-list") return { name: "mylist" };
  if (segments[0] === "insights") return { name: "insights" };
  if (segments[0] === "library") return { name: "library" };
  if (segments[0] === "title" && segments[1]) return { name: "details", id: decodeURIComponent(segments[1]) };
  if (segments[0] === "watch" && segments[1]) {
    return { name: "player", id: decodeURIComponent(segments[1]), episodeId: segments[2] ? decodeURIComponent(segments[2]) : undefined };
  }
  return { name: "browse" };
}

function routeToHash(route: Route) {
  switch (route.name) {
    case "search":
      return "#/search";
    case "genre":
      return `#/genre/${encodeURIComponent(route.id)}`;
    case "mylist":
      return "#/my-list";
    case "insights":
      return "#/insights";
    case "library":
      return "#/library";
    case "details":
      return `#/title/${encodeURIComponent(route.id)}`;
    case "player":
      return `#/watch/${encodeURIComponent(route.id)}${route.episodeId ? `/${encodeURIComponent(route.episodeId)}` : ""}`;
    default:
      return "#/";
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
    setRoute(next);
  }, []);

  return { route, navigate };
}