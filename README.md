<div align="center">

<h1>Jini Document Intelligence</h1>

**Local-first document intelligence with retrieval, chunking, and grounded answers — no API key required.**

[Live app](https://jini-document-intelligence.vercel.app)

<p>
<a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" /></a>
<a href="https://github.com/0xMudit/jini-document-intelligence"><img src="https://img.shields.io/badge/repo-0xMudit%2Fjini--document--intelligence-blue.svg" alt="Repo" /></a>
<img src="https://img.shields.io/badge/node-%E2%89%A522-brightgreen.svg" alt="Node 22 or newer" />
<img src="https://img.shields.io/badge/typescript-5-blue.svg" alt="TypeScript" />
<img src="https://img.shields.io/badge/platforms-web%20%7C%20docker-lightgrey.svg" alt="Web | Docker" />
</p>

</div>

---

## Why Jini Document Intelligence

- **Local-first by default.** Runs with zero API key for core retrieval and indexing; LLM inference is optional (Groq) if you choose to enable it.
- **Ranked retrieval that works.** Implements chunking + TF-IDF-like/vector-lite retrieval to surface relevant passages from your documents.
- **Full-stack TypeScript.** React frontend with Vite, Express API server, and SQLite persistence in a single cohesive codebase.
- **Production-ready Docker image.** Containerized build with volume persistence for data and uploads.
- **Deterministic and testable.** Unit tests cover core logic; lint and typecheck pass cleanly.
- **Simple to run.** Start with `npm run dev` and it just works locally.

## Features

| Area | What you get |
| --- | --- |
| **Document ingestion** | Upload and process documents with chunking for retrieval. |
| **Ranked retrieval** | Find relevant passages using built-in retrieval without requiring external embedding APIs. |
| **Grounded answers** | Context-aware answers based on retrieved document chunks. |
| **Local storage** | SQLite for metadata, documents, and retrieval artifacts (WAL mode). |
| **Optional LLM** | Groq integration available as an optional provider; core features work without it. |
| **React UI** | Clean interface for uploading, searching, and querying documents. |
| **Express API** | RESTful endpoints for document and query operations with proper validation. |
| **Docker support** | Multi-stage Dockerfile and docker-compose for deployment. |
| **TypeScript everywhere** | Shared types between client and server. |
| **Test coverage** | Vitest unit tests for catalog/logic paths. |

## Requirements

- **Node.js 22+** with npm
- **(Optional) Groq API key** — only needed if you want to use Groq for answer generation; retrieval works without it.
- **Docker** (optional) — for containerized deployment.

## Quick start

```bash
# 1. Clone
git clone https://github.com/0xMudit/jini-document-intelligence.git
cd jini-document-intelligence

# 2. Install dependencies
npm install

# 3. Run in development (API + web concurrently)
npm run dev

# 4. Open the app
# http://localhost:5173
# API runs at http://localhost:8788 (proxied by Vite)
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Purpose |
| --- | --- |
| `PORT` | API server port (default 8788) |
| `NODE_ENV` | Environment mode (development/production) |
| `DATABASE_PATH` | SQLite database file path |
| `UPLOAD_DIR` | Directory for uploaded documents |
| `GROQ_API_KEY` | Groq API key (optional; leave unset to run without LLM) |
| `GROQ_MODEL` | Groq model name (optional) |
| `CORS_ORIGIN` | Allowed CORS origin(s) |

## How it works

```
+-------------------------------------------------------------+
¦ Jini Document Intelligence                                   ¦
+-------------------------------------------------------------¦
¦ Vite + React (SPA)  --HTTP--?  Express API + SQLite         ¦
+-------------------------------------------------------------+
                ¦                ¦                ¦
                ?                ?                ?
            Document         Chunking        Ranked retrieval
            ingestion        & indexing       (no API key)
                             ¦
                             ?
                        (Optional) Groq LLM
                         for grounded answers
```

1. Upload documents via the UI; the API ingests, chunks, and indexes them into SQLite.
2. Query retrieves the most relevant chunks using built-in retrieval logic.
3. If a Groq key is configured, the system generates a grounded answer using retrieved context; otherwise, it returns retrieved chunks as-is.
4. Results stream back to the React UI for display.

## Project layout

```text
server/           # Express API, routes, services, storage
src/              # React frontend (Vite)
shared/           # Shared TypeScript types/utilities
scripts/          # Utility scripts
public/           # Static assets
__tests__/        # Vitest unit tests
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Run API and web in parallel (concurrently) |
| `npm run dev:web` | Run Vite dev server only |
| `npm run dev:api` | Run API with tsx watch |
| `npm run api` / `npm start` | Run API in production mode (tsx) |
| `npm run build` | Type-check and build frontend (tsc -b && vite build) |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run preview` | Preview built frontend |
| `npm run encode` / `npm run encode:all` | HLS encoding utilities (optional) |

## Docker

### Build and run

```bash
docker build -t jini-document-intelligence .
docker run -d \
  -p 8788:8788 \
  -v jini-data:/app/data \
  jini-document-intelligence
```

### docker-compose

```bash
docker compose up --build
```

Data and uploads persist in the configured volume (`jini-data`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) if present in the repository.

## Security

See [SECURITY.md](SECURITY.md) if present in the repository.

## License

[MIT](LICENSE)

© 2025 [0xMudit](https://github.com/0xMudit)
