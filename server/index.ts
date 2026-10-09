import "dotenv/config";
import compression from "compression";
import cors from "cors";
import express from "express";
import { nanoid } from "nanoid";
import path from "node:path";
import { pino } from "pino";
import { z } from "zod";
import { bannerSvg, posterSvg } from "./art";
import {
  authenticateCredentials,
  createUser,
  endSession,
  getAuthenticatedUser,
  getGuestUser,
  initializeAuthDatabase,
  startSession,
  type PublicUser,
} from "./auth";
import { buildBrowse, searchCatalog, titlesByGenre, type UserContext } from "./browse";
import { prewarmPopularContent } from "./cache";
import { catalog, findTitle, GENRES, toTitleLite } from "./catalog";
import { buildPlaybackInfo } from "./playback";
import { encodeLog, listLibrary, startEncode } from "./library";
import {
  aggregateQoe,
  finishQoeSession,
  listQoeSamples,
  listQoeSessions,
  qoeByTitle,
  startQoeSession,
} from "./qoe";
import {
  applyPersonalization,
  ecs,
  ImplicitMF,
  similarTitles,
  takeRate,
  type RankVariant,
  type RecommendationEngine,
  type TitleFacts,
} from "./recommend";
import { createRateLimiter, securityHeaders } from "./security";
import {
  addToList,
  allInteractions,
  getImpressionCounts,
  getInteractionSummary,
  getPlayCounts,
  isInList,
  listMyListIds,
  listProgress,
  recordImpressions,
  recordPlay,
  removeFromList,
  saveProgress,
  projectRoot,
} from "./storage";
import { createVideoStreamHandler, findLocalVideo, videoCache } from "./stream";
import {
  findHlsPackage,
  ladderToJson,
  masterPlaylist,
  packageArtifact,
  packageRung,
  sanitizeKey,
} from "./media";
import { decideAbr } from "../shared/abr";
import type { BrowseResponse, Title, TitleLite } from "./types";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

/** Running as a Vercel serverless function (exported, not listening on a port). */
const IS_VERCEL = process.env.VERCEL === "1";

initializeAuthDatabase();

const app = express();
const port = Number(process.env.PORT ?? 8788);

/** Ranking facts drawn once from the static catalog (used by the recommender). */
const FACTS: readonly TitleFacts[] = catalog.map((title) => ({
  id: title.id,
  popularity: title.popularity,
  rating: title.rating,
  genres: title.genres,
}));

let cachedEngine: { key: string; engine: RecommendationEngine } | null = null;

/**
 * The latent-factor model is retrained lazily whenever the interaction volume
 * changes. A brand-new catalog (48 titles, handful of users) trains in a few
 * milliseconds, so keeping it on-demand beats pre-warming and schema tracking.
 */
function getEngine(): RecommendationEngine {
  const summary = getInteractionSummary();
  const key = `${summary.interactions}:${summary.plays}`;
  if (cachedEngine?.key === key) return cachedEngine.engine;

  const interactions = allInteractions().map((row) => ({
    userId: row.user_id,
    titleId: row.title_id,
    playCount: row.play_count,
    watchFraction: row.watch_fraction,
  }));
  const recommender = interactions.length ? new ImplicitMF().train(interactions, FACTS) : null;
  const engine: RecommendationEngine = {
    recommender,
    facts: FACTS,
    interactions,
    playCounts: getPlayCounts(),
    impressionCounts: getImpressionCounts(),
  };
  cachedEngine = { key, engine };
  return engine;
}

function titlesToLite(ids: string[]): TitleLite[] {
  return ids
    .map((id) => findTitle(id))
    .filter((title): title is Title => Boolean(title))
    .map((title) => toTitleLite(title));
}

function collectRowIds(browse: BrowseResponse) {
  const ids: string[] = [];
  for (const row of browse.rows) {
    for (const item of row.items) ids.push(item.id);
  }
  return ids;
}

app.use(securityHeaders);

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(compression());
app.use((request, response, next) => {
  const requestId = request.header("x-request-id") || nanoid(10);
  response.locals.requestId = requestId;
  response.setHeader("X-Request-Id", requestId);
  const start = Date.now();
  response.on("finish", () => {
    logger.info(
      {
        method: request.method,
        path: request.path,
        status: response.statusCode,
        duration: Date.now() - start,
        requestId,
      },
      "Request completed",
    );
  });
  next();
});
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const isLocalOrigin =
        !origin ||
        /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(origin) ||
        allowedOrigins.includes(origin);
      callback(null, isLocalOrigin);
    },
  }),
);
app.use("/api/auth", createRateLimiter({ name: "auth", windowMs: 15 * 60 * 1000, max: 60 }));
app.use("/api/browse", createRateLimiter({ name: "browse", windowMs: 60 * 1000, max: 300 }));
app.use("/api/titles", createRateLimiter({ name: "titles", windowMs: 60 * 1000, max: 300 }));
app.use("/api/me", createRateLimiter({ name: "me", windowMs: 60 * 1000, max: 300 }));
app.use("/api/art", createRateLimiter({ name: "art", windowMs: 60 * 1000, max: 600 }));
app.use("/api/insights", createRateLimiter({ name: "insights", windowMs: 60 * 1000, max: 120 }));
app.use("/api/cache", createRateLimiter({ name: "cache", windowMs: 60 * 1000, max: 120 }));
app.use("/api/qoe", createRateLimiter({ name: "qoe", windowMs: 60 * 1000, max: 600 }));
app.use("/api/video", createRateLimiter({ name: "video", windowMs: 60 * 1000, max: 2400 }));
app.use("/api/media", createRateLimiter({ name: "media", windowMs: 60 * 1000, max: 2400 }));
app.use("/api/abr", createRateLimiter({ name: "abr", windowMs: 60 * 1000, max: 1200 }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "Jini Stream",
    version: "1.0.0",
    uptime: process.uptime(),
    catalog: catalog.length,
    mode: "streaming",
  });
});

app.post("/api/auth/signup", (request, response, next) => {
  try {
    const body = z
      .object({
        name: z.string().trim().min(2, "Enter your name").max(80),
        email: z.email("Enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters").max(128),
      })
      .parse(request.body);
    const user = createUser(body.name, body.email, body.password);
    startSession(user.id, response);
    response.status(201).json({ user });
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      response.status(409).json({ error: "An account with this email already exists" });
      return;
    }
    next(error);
  }
});

app.post("/api/auth/login", (request, response, next) => {
  try {
    const body = z
      .object({ email: z.email("Enter a valid email address"), password: z.string().min(1) })
      .parse(request.body);
    const user = authenticateCredentials(body.email, body.password);
    if (!user) {
      response.status(401).json({ error: "Incorrect email or password" });
      return;
    }
    startSession(user.id, response);
    response.json({ user });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/guest", (_request, response) => {
  const user = getGuestUser();
  startSession(user.id, response);
  response.json({ user });
});

app.get("/api/auth/me", (request, response) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }
  response.json({ user });
});

app.post("/api/auth/logout", (request, response) => {
  endSession(request, response);
  response.status(204).end();
});

app.use("/api", (request, response, next) => {
  if (request.path === "/auth" || request.path.startsWith("/auth/")) {
    next();
    return;
  }
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }
  response.locals.user = user;
  next();
});

/** Public procedural artwork for catalog posters and banners. */
app.get(/^\/api\/art\/(poster|banner)\/(.+)\.svg$/, (request, response) => {
  const kind = request.params[0] as "poster" | "banner";
  const id = request.params[1];
  const title = findTitle(id);
  if (!title) {
    response.status(404).json({ error: "Title not found" });
    return;
  }
  const svg = kind === "poster" ? posterSvg(title) : bannerSvg(title);
  response.setHeader("Cache-Control", "public, max-age=86400");
  response.type("image/svg+xml");
  response.send(svg);
});

/** Streaming endpoint: local ranges when a file exists, else remote redirect. */
app.get("/api/video/:key", createVideoStreamHandler());

const M3U8_CONTENT_TYPE = "application/vnd.apple.mpegurl";
const IMMUTABLE = "public, max-age=2592000";
const VARIANT = "public, max-age=30";

function missingPackage(response: express.Response) {
  response.status(404).json({ error: "No ABR rendition is packaged for this title yet." });
}

/** ABR master playlist for a title with a data/media/<key> package. */
app.get("/api/media/:key/master.m3u8", (request, response) => {
  const pkg = findHlsPackage(request.params.key);
  if (!pkg) {
    missingPackage(response);
    return;
  }
  response.type(M3U8_CONTENT_TYPE);
  response.set("Cache-Control", VARIANT);
  response.send(masterPlaylist(pkg));
});

/** Ladder metadata the player needs to make ABR decisions. */
app.get("/api/media/:key/ladder.json", (request, response) => {
  const pkg = findHlsPackage(request.params.key);
  if (!pkg) {
    missingPackage(response);
    return;
  }
  response.set("Cache-Control", VARIANT);
  response.type("application/json");
  response.send(ladderToJson(pkg));
});

/** Per-rung media playlist (relative segment URLs => /api/media/:key/:rung/seg-*.ts). */
app.get("/api/media/:key/:rung/index.m3u8", (request, response) => {
  const pkg = findHlsPackage(request.params.key);
  const rung = pkg && packageRung(pkg, request.params.rung);
  const file = pkg && rung ? packageArtifact(pkg, path.join(rung.dir, "index.m3u8")) : null;
  if (!file) {
    response.status(404).json({ error: "Unknown rendition." });
    return;
  }
  response.type(M3U8_CONTENT_TYPE);
  response.set("Cache-Control", VARIANT);
  response.sendFile(file);
});

/** VOD media segments — immutable. */
app.get("/api/media/:key/:rung/:segment", (request, response) => {
  const segment = request.params.segment;
  if (!/^seg-\d{6}\.ts$/.test(segment)) {
    response.status(404).json({ error: "Unknown segment." });
    return;
  }
  const pkg = findHlsPackage(request.params.key);
  const rung = pkg && packageRung(pkg, request.params.rung);
  const file = pkg && rung ? packageArtifact(pkg, path.join(rung.dir, segment)) : null;
  if (!file) {
    response.status(404).json({ error: "Unknown segment." });
    return;
  }
  response.type("video/mp2t");
  response.set("Cache-Control", IMMUTABLE);
  response.sendFile(file);
});

/**
 * ABR decision service — BOLA by default, BBA on request. The browser player
 * runs the same shared controller locally; this endpoint exposes it for
 * instrumentation, tests and scheduled-manager style consumers.
 */
app.post("/api/abr/decide", (request, response, next) => {
  try {
    const body = z
      .object({
        videoKey: z.string().min(1),
        bufferSeconds: z.number().min(0),
        currentRung: z.number().int().min(0).optional(),
        throughputKbps: z.number().min(0).optional(),
        segmentSeconds: z.number().min(1).optional(),
        algorithm: z.enum(["bola", "bba"]).optional(),
      })
      .parse(request.body);
    const key = sanitizeKey(body.videoKey);
    const pkg = key ? findHlsPackage(key) : null;
    if (!pkg) {
      missingPackage(response);
      return;
    }
    const decision = decideAbr(
      {
        bufferSeconds: body.bufferSeconds,
        currentRung: body.currentRung,
        throughputKbps: body.throughputKbps,
        segmentSeconds: body.segmentSeconds ?? pkg.segmentSeconds,
      },
      pkg.rungs.map((rung) => ({ rung: rung.index, height: rung.height, width: rung.width, bitrateKbps: rung.bitrateKbps })),
      body.algorithm,
    );
    response.json({
      videoKey: key,
      segmentSeconds: pkg.segmentSeconds,
      ladder: ladderToJson(pkg).rungs,
      ...decision,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/browse", (request, response) => {
  const userId = currentUser(response).id;
  const myListIds = listMyListIds(userId);
  const context: UserContext = {
    progress: listProgress(userId),
    myListIds: new Set(myListIds),
    myListOrder: myListIds,
  };
  const base = buildBrowse(context);
  const variant: RankVariant = request.query.variant === "pop" ? "pop" : "pvr";
  recordImpressions(userId, collectRowIds(base));
  response.json(applyPersonalization(base, getEngine(), userId, variant, titlesToLite));
});

app.get("/api/genres", (_request, response) => {
  const genres = GENRES.map((genre) => ({
    id: genre.toLowerCase(),
    name: genre,
    count: catalog.filter((title) => title.genres.includes(genre)).length,
  })).filter((genre) => genre.count > 0);
  response.json(genres);
});

app.get("/api/titles", (request, response) => {
  const query = String(request.query.q ?? "").trim();
  const genre = String(request.query.genre ?? "All");
  if (query) {
    response.json(searchCatalog(query, genre));
    return;
  }
  if (genre && genre !== "All") {
    response.json(titlesByGenre(genre));
    return;
  }
  const userId = currentUser(response).id;
  response.json(
    catalog
      .map((title) => toTitleLite(title))
      .sort((a, b) => b.year - a.year)
      .map((title) => ({ ...title, inList: isInList(userId, title.id) })),
  );
});

app.get("/api/titles/:id", (request, response) => {
  const userId = currentUser(response).id;
  const title = findTitle(request.params.id);
  if (!title) {
    response.status(404).json({ error: "Title not found" });
    return;
  }
  response.json({
    ...title,
    inList: isInList(userId, title.id),
  });
});

app.get("/api/titles/:id/play", (request, response) => {
  const userId = currentUser(response).id;
  const titleId = request.params.id;
  const episodeId = String(request.query.episode ?? "").trim() || undefined;
  const playback = buildPlaybackInfo(userId, titleId, episodeId);
  if (!playback) {
    response.status(404).json({ error: "No preview is available for this title yet." });
    return;
  }
  response.json(playback);
});

/** "Because You Watched X": item-item matches from the latent factors. */
app.get("/api/titles/:id/similar", (request, response) => {
  const title = findTitle(request.params.id);
  if (!title) {
    response.status(404).json({ error: "Title not found" });
    return;
  }
  const requested = Number(request.query.k ?? 12);
  const k = Number.isFinite(requested) ? Math.max(1, Math.min(24, Math.round(requested))) : 12;
  const engine = getEngine();
  const ids = similarTitles(title.id, FACTS, engine.recommender, k);
  response.json({ id: title.id, title: title.title, items: titlesToLite(ids) });
});

/** Recommender engagement metrics (ECS, take-rate) + model state. */
app.get("/api/insights", (_request, response) => {
  const engine = getEngine();
  const plays = [...engine.playCounts.values()].reduce((sum, count) => sum + count, 0);
  const impressions = [...engine.impressionCounts.values()].reduce((sum, count) => sum + count, 0);
  const activeUsers = new Set(engine.interactions.map((item) => item.userId)).size;
  response.json({
    ecs: ecs([...engine.playCounts.values()]),
    takeRate: takeRate(plays, impressions),
    plays,
    impressions,
    activeUsers,
    interactions: engine.interactions.length,
    catalogSize: FACTS.length,
    model: engine.recommender ? engine.recommender.metrics() : null,
    ranking: "pvr" as RankVariant,
  });
});

/** Edge-cache telemetry (hits/misses/hit-rate). */
app.get("/api/cache", (_request, response) => {
  response.json(videoCache.stats());
});

const qoeSample = z.object({
  atMs: z.number().min(0),
  level: z.number().min(0),
  bitrateKbps: z.number().min(0),
  bufferSeconds: z.number().min(0),
  throughputKbps: z.number().min(0),
});

/** Opens a QoE session when playback begins. */
app.post("/api/qoe/sessions", (request, response, next) => {
  try {
    const body = z
      .object({
        titleId: z.string().min(1),
        episodeId: z.string().optional().nullable(),
        streamMode: z.enum(["direct", "hls"]),
        algorithm: z.string().max(32).optional(),
        startupMs: z.number().min(0).optional(),
      })
      .parse(request.body);
    const sessionId = startQoeSession(currentUser(response).id, {
      ...body,
      episodeId: body.episodeId ?? null,
    });
    response.status(201).json({ sessionId });
  } catch (error) {
    next(error);
  }
});

/** Reports a session's final measurements when playback ends or the page unloads. */
app.post("/api/qoe/sessions/:sessionId", (request, response, next) => {
  try {
    const body = z
      .object({
        startupMs: z.number().min(0).optional(),
        watchMs: z.number().min(0).optional(),
        rebufferCount: z.number().min(0).optional(),
        rebufferMs: z.number().min(0).optional(),
        switches: z.number().min(0).optional(),
        bytesLoaded: z.number().min(0).optional(),
        segmentsLoaded: z.number().min(0).optional(),
        avgBitrateKbps: z.number().min(0).optional(),
        peakBitrateKbps: z.number().min(0).optional(),
        avgBufferSeconds: z.number().min(0).optional(),
        completed: z.boolean().optional(),
        samples: z.array(qoeSample).max(600).optional(),
      })
      .parse(request.body);
    const saved = finishQoeSession(currentUser(response).id, {
      ...body,
      sessionId: request.params.sessionId,
    });
    if (!saved) {
      response.status(404).json({ error: "Unknown playback session" });
      return;
    }
    response.json({ saved: true });
  } catch (error) {
    next(error);
  }
});

/** Aggregated QoE plus the most recent sessions, for the analytics view. */
app.get("/api/qoe", (request, response) => {
  const limit = Number(request.query.limit ?? 50);
  const sessions = listQoeSessions(Number.isFinite(limit) ? limit : 50);
  response.json({
    totals: aggregateQoe(sessions),
    titles: qoeByTitle(),
    recent: sessions.slice(0, 25),
  });
});

/** Per-sample bitrate/buffer trace for one session, for the detail chart. */
app.get("/api/qoe/sessions/:sessionId/samples", (request, response) => {
  const rows = listQoeSamples(request.params.sessionId);
  if (!rows.length) {
    response.status(404).json({ error: "No samples for this session" });
    return;
  }
  response.json({ sessionId: request.params.sessionId, samples: rows });
});

app.get("/api/library", (_request, response) => {
  response.json(listLibrary());
});

app.get("/api/library/log", (_request, response) => {
  response.json({ busy: listLibrary().busy, log: encodeLog() });
});

app.post("/api/library/encode", (request, response, next) => {
  try {
    const body = z
      .object({
        key: z.string().min(1).max(64),
        force: z.boolean().optional(),
        clipSeconds: z.number().int().min(1).max(86_400).nullish(),
      })
      .parse(request.body);
    const handle = startEncode({ key: body.key, force: body.force, clipSeconds: body.clipSeconds ?? null });
    if (!handle) {
      response.status(409).json({ error: "An encode is already running" });
      return;
    }
    response.status(202).json(handle);
  } catch (error) {
    next(error);
  }
});

app.post("/api/me/progress", (request, response, next) => {
  try {
    const body = z
      .object({
        titleId: z.string().min(1),
        episodeId: z.string().optional().nullable(),
        positionSeconds: z.number().min(0),
        durationSeconds: z.number().min(0),
        completed: z.boolean().optional(),
      })
      .parse(request.body);
    const progress = saveProgress(
      currentUser(response).id,
      body.titleId,
      body.episodeId ?? null,
      body.positionSeconds,
      body.durationSeconds,
    );

    const watchFraction = body.completed
      ? 1
      : body.durationSeconds > 0
        ? Math.min(1, body.positionSeconds / body.durationSeconds)
        : 0;
    if (watchFraction > 0) {
      recordPlay(currentUser(response).id, body.titleId, watchFraction);
    }

    response.json(progress ?? { cleared: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/me/list", (_request, response) => {
  const userId = currentUser(response).id;
  const myListIds = listMyListIds(userId);
  response.json(myListIds.map((id) => findTitle(id)).filter((title) => title !== null).map(toTitleLite));
});

app.put("/api/me/list/:id", (request, response) => {
  const userId = currentUser(response).id;
  const title = findTitle(request.params.id);
  if (!title) {
    response.status(404).json({ error: "Title not found" });
    return;
  }
  addToList(userId, title.id);
  response.status(204).end();
});

app.delete("/api/me/list/:id", (request, response) => {
  removeFromList(currentUser(response).id, request.params.id);
  response.status(204).end();
});

app.use(express.static(pathToDist()));
// Vite builds with base "/jini/", so the SPA (and its asset URLs) must also be
// reachable under that prefix. The root mount keeps root-relative /api calls working.
app.use("/jini", express.static(pathToDist()));

app.get(/^(?!\/api).*/, (_request, response) => {
  response.sendFile(pathToIndex());
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const requestId = String(response.locals.requestId || nanoid(8));

  if (error instanceof z.ZodError) {
    response.status(400).json({
      error: error.issues[0]?.message ?? "Invalid request",
      requestId,
    });
    return;
  }

  logger.error({ err: error, requestId }, "Unhandled server error");
  response.status(500).json({ error: "Unexpected server error", requestId });
});

export default app;

if (!IS_VERCEL) {
  const server = app.listen(port, () => {
    logger.info({ port, titles: catalog.length }, "Jini Stream started");
    const engine = getEngine();
    if (engine.interactions.length) {
      logger.info(
        { interactions: engine.interactions.length, plays: summaryPlays(engine) },
        "Recommender model ready",
      );
    }
    void prewarmPopularContent(videoCache, findLocalVideo, engine.playCounts, 512 * 1024)
      .then((result) => {
        if (result) logger.info({ videoKey: result.videoKey, bytes: result.bytes }, "Edge cache pre-warmed with the most-played title");
      })
      .catch((error) => {
        logger.warn({ err: error }, "Edge cache pre-warm skipped");
      });
  });

  function summaryPlays(engine: RecommendationEngine) {
    return [...engine.playCounts.values()].reduce((sum, count) => sum + count, 0);
  }

  function shutdown(signal: string) {
    logger.info({ signal }, "Shutdown signal received");
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ err: reason }, "Unhandled promise rejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error({ err: error }, "Uncaught exception");
    shutdown("uncaughtException");
  });
}

function currentUser(response: express.Response) {
  return response.locals.user as PublicUser;
}

function pathToDist() {
  return path.join(projectRoot, "dist");
}
function pathToIndex() {
  return path.join(projectRoot, "dist", "index.html");
}