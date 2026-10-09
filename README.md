# Jini Stream

**A self-hosted Netflix-style streaming demo.** Browse a rich mock catalog of movies and series, play titles instantly with resume support, and curate your own list — all on your own machine, no API keys required.

## Why this project matters

Jini Stream shows a complete streaming product — catalog, artwork, browsing, search, watch history, and a real HTTP range-serving video pipeline — built in one TypeScript codebase. It pairs a Netflix-style dark UI with an Express + SQLite backend that streams local video files with byte-range requests and falls back to public sample clips for the rest of the catalog.

### Engineering highlights

- **Real streaming, not a stub.** `/api/video/:key` serves local MP4s with `Range` support (206 responses, seekable) and `302`-redirects to a public sample CDN for titles without local files.
- **Self-contained catalog.** 51 hand-written titles (movies + multi-season series) with deterministic SVG posters/banners generated at runtime — no image assets to host.
- **Persistence in SQLite.** Watch progress (Continue Watching + resume position) and My List are stored per account via `node:sqlite`, WAL mode.
- **Auth + security built in.** scrypt password hashing, signed cookie sessions, guest/test accounts, rate limiting, strict CSP, and origin controls.
- **Tested.** 19 unit tests cover catalog parsing, browsing/search composition, and playback/resume logic; lint and typecheck are clean; the frontend builds to a single bundle under `/jini/`.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173/jini/`. The API runs at `http://localhost:8788`; Vite proxies `/api` to it.

### Test accounts
- **Test user**: `test@jini.local` / `JiniTest123!`
- **Guest**: click **Guest preview** on the sign-in screen for one-click access.

---

## Adding your own films

The catalog marks four titles as backed by local files. Drop an MP4 named exactly after the key into `data/videos/` (already gitignored) and those titles stream from your disk:

| Key                 | Title         |
|---------------------|---------------|
| `blood-red-sky.mp4` | Blood Red Sky |
| `fall.mp4`          | Fall          |
| `lights-out.mp4`    | Lights Out    |
| `the-monkey.mp4`    | The Monkey    |

MKV users: remux with `ffmpeg -i input.mkv -c copy -sn -map 0 -movflags +faststart data/videos/<key>.mp4`. Everything else in the catalog plays a public Blender Foundation sample clip (`BigBuckBunny`, `Sintel`, `ForBiggerEscapes`, …).

---

## Production Deployment

### Docker (recommended)

```bash
docker build -t jini-stream .
docker run -d \
  -p 8788:8788 \
  -v jini-data:/app/data \
  jini-stream
```

Or with the included `docker-compose.yml` (persists the database and video library in a named volume):

```bash
docker compose up --build
```

### Node directly

Requires Node.js 22+.

```bash
npm install
cp .env.example .env
npm run build
npm start
```

Visit `http://localhost:8788` (or `http://<host>:8788/jini/` for the subpath build). For a persistent process:

```bash
pm2 start npm --name jini -- start
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8788` | HTTP server port |
| `VITE_API_BASE` | same origin | Optional browser API origin; leave empty when frontend and API share an origin |
| `NODE_ENV` | `production` | Set `development` for pretty logging |
| `LOG_LEVEL` | `info` | Pino log level (debug, info, warn, error) |
| `COOKIE_SECURE` | `false` | Set `true` behind HTTPS |
| `TRUST_PROXY` | `false` | Set `true` behind a reverse proxy |
| `ALLOWED_ORIGINS` | — | Comma-separated CORS origins |
| `DATA_DIR` | `data` | Runtime folder (SQLite DB + `videos/`) |
| `TEST_USER_PASSWORD` | `JiniTest123!` | Seeded test account password |

---

## Features

- **Browse** — hero spotlight, themed rows (Trending, New, Jini Originals, Continue Watching…), genre browsing
- **Search** — debounced lookup across titles, descriptions, and credits
- **My List** — add/remove from any card or details page, persisted per account
- **Details** — synopsis, ratings, cast/directors, plus episodes & season picker for series
- **Player** — full-screen playback, resume from where you left off, throttled progress saves, episode swapper, auto-next
- **Everything works offline** — catalog, artwork, and accounts are fully local

---

## Testing

```bash
npm test              # run once
npm run lint          # eslint
npm run build         # tsc + vite production build
```

19 unit tests covering catalog integrity, browse row composition, search, and playback/resume behavior.

---

## Project Structure

```
server/
  index.ts          Express app, routes, middleware, SPA serving
  auth.ts           SQLite users, scrypt hashing, cookie sessions
  catalog.ts        Seed catalog + lookup helpers, sample-video keys
  browse.ts         Row building, hero pick, catalog search
  playback.ts       Playback info + resume position for titles/episodes
  stream.ts         Range serving for local files, remote redirect fallback
  art.ts            Deterministic SVG poster/banner generators
  storage.ts        SQLite media_progress / media_list persistence
  security.ts       CSP headers, rate limiting, CORS, request IDs
  *.test.ts         Vitest suites
src/
  Jini.tsx          App shell: auth, routing, data orchestration
  types.ts          Shared TypeScript types
  lib/api.ts        API client, error handling, formatters
  lib/router.ts     Hash router (#/, #/search, #/title/:id, #/watch/:id)
  components/       NavBar, HeroBanner, TitleRow, TitleCard, ArtImage…
  views/            Browse, Details, Player, Search, My List, Auth
data/
  videos/           Local MP4 library keyed by catalog id (gitignored)
  jini.sqlite       SQLite database (gitignored)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Lucide icons |
| Backend | Express 5, TypeScript, tsx |
| Database | SQLite (Node `node:sqlite`, WAL mode) |
| Streaming | HTTP Range requests; remote 302 fallback to public sample clips |
| Logging | Pino with pino-pretty (dev) |
| Testing | Vitest |
| CI | GitHub Actions |
| Container | Docker (multi-stage, Alpine) |