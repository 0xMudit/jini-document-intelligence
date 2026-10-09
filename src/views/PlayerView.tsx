import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowLeft, ChevronRight, ListVideo, Play, X } from "lucide-react";
import { isUsableLadder, toAbrLadder, useAbrInstrumentation, useHlsEngine } from "../lib/abr";
import type { AbrAlgorithmName, AbrLadderConfig, PublishedLadder, StreamKind } from "../lib/abr";
import { request, videoSrc } from "../lib/api";
import { useQoeReporter } from "../lib/qoe";
import type { Episode, PlaybackInfo } from "../types";

const PROGRESS_INTERVAL_MS = 5000;

const DELIVERY_LABELS: Record<StreamKind, string> = {
  "hls-mse": "HLS adaptive",
  "hls-native": "HLS native",
  progressive: "Progressive",
};

export function PlayerView({
  playback,
  episodes,
  onBack,
  onPosition,
  onEnded,
  onSwitchEpisode,
}: {
  playback: PlaybackInfo | null;
  episodes: Episode[];
  onBack: () => void;
  onPosition: (positionSeconds: number, durationSeconds: number) => void;
  onEnded: (positionSeconds: number, durationSeconds: number) => void;
  onSwitchEpisode: (episodeId: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resumeSeeked, setResumeSeeked] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [abrOpen, setAbrOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const lastSentRef = useRef(0);
  const durationRef = useRef(0);

  // The published ladder is what the controllers must optimise over; without it
  // they would be steering a ladder the player does not have.
  const [ladder, setLadder] = useState<AbrLadderConfig | null>(null);
  const masterUrl = playback?.streamMode === "hls" && playback.hlsMasterUrl ? videoSrc(playback.hlsMasterUrl) : null;
  const progressiveUrl = playback ? videoSrc(playback.streamUrl) : "";

  const { state: engine, applyLevel, levelCount } = useHlsEngine({
    videoRef,
    masterUrl,
    progressiveUrl,
  });

  useEffect(() => {
    if (!playback?.abrLadderUrl) {
      setLadder(null);
      return;
    }
    let active = true;
    void request<PublishedLadder>(playback.abrLadderUrl)
      .then((published) => {
        const mapped = toAbrLadder(published);
        if (active && isUsableLadder(mapped)) setLadder(mapped);
      })
      .catch(() => {
        if (active) setLadder(null);
      });
    return () => {
      active = false;
    };
  }, [playback?.abrLadderUrl, playback?.titleId]);

  // Adaptive switching is only meaningful when there is more than one rendition.
  const abrActive = levelCount > 1;

  const { snapshot, setAlgorithm } = useAbrInstrumentation(videoRef, {
    ladder,
    enabled: abrActive,
    getThroughputKbps: () => (engine.throughputKbps > 0 ? engine.throughputKbps : null),
    getAppliedIndex: () => (engine.currentIndex >= 0 ? engine.currentIndex : null),
    applyLevel,
  });

  // QoE reads the same readings, so it is wired to the live engine state.
  const qoeStateRef = useRef({ engine, ladder, snapshot, completed: false });
  qoeStateRef.current = { engine, ladder, snapshot, completed: qoeStateRef.current.completed };

  const qoe = useQoeReporter(videoRef, {
    getSnapshot: () => ({
      appliedIndex: engine.currentIndex >= 0 ? engine.currentIndex : null,
      bufferSeconds: snapshot.bufferSeconds,
      throughputKbps: engine.throughputKbps,
      startupMs: engine.startupMs,
    }),
    getAppliedBitrateKbps: () => {
      const level = engine.currentIndex;
      if (level < 0 || !ladder) return 0;
      return ladder.levels[level]?.bitrateKbps ?? 0;
    },
    getSegmentsLoaded: () => engine.segmentsLoaded,
    getBytesLoaded: () => engine.bytesLoaded,
    isCompleted: () => qoeStateRef.current.completed,
  });

  const startedTopicRef = useRef<string>("");

  useEffect(() => {
    if (!playback) return;
    const topic = `${playback.titleId}:${playback.episode?.id ?? ""}`;
    if (startedTopicRef.current === topic) return;
    startedTopicRef.current = topic;
    qoeStateRef.current.completed = false;
    qoe.start({
      titleId: playback.titleId,
      episodeId: playback.episode?.id ?? null,
      streamMode: playback.streamMode === "hls" ? "hls" : "direct",
      algorithm: snapshot.algorithm,
    });
  }, [playback, qoe, snapshot.algorithm]);

  const algorithmButtons: Array<{ name: AbrAlgorithmName; label: string }> = [
    { name: "bola", label: "BOLA" },
    { name: "bba0", label: "BBA-0" },
    { name: "dynamic", label: "DYNAMIC" },
  ];

  const currentEpisodeId = playback?.episode?.id ?? null;
  const currentEpisodes = useMemo(
    () => (playback?.kind === "series" ? episodes.map((episode) => ({ episode, playing: episode.id === currentEpisodeId })) : []),
    [episodes, playback?.kind, currentEpisodeId],
  );

  const report = useCallback(
    (position: number, duration: number) => {
      if (!playback) return;
      const now = Date.now();
      if (now - lastSentRef.current >= PROGRESS_INTERVAL_MS && position > 0) {
        lastSentRef.current = now;
        durationRef.current = duration || durationRef.current;
        onPosition(position, duration || durationRef.current);
      }
    },
    [playback, onPosition],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playback) return;

    const onTime = () => report(video.currentTime, video.duration || durationRef.current);
    const onPause = () => {
      if (video.currentTime > 0 && video.duration) onPosition(video.currentTime, video.duration);
    };
    const onCanPlay = () => {
      if (playback.positionSeconds > 0 && !resumeSeeked) {
        video.currentTime = Math.min(playback.positionSeconds, (video.duration || playback.durationSeconds) - 2);
        setResumeSeeked(true);
      }
    };
    const onEndedEvent = () => {
      qoeStateRef.current.completed = true;
      onEnded(video.currentTime, video.duration || durationRef.current);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEndedEvent);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", () => setFailed(true));
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEndedEvent);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [playback, resumeSeeked, report, onPosition, onEnded]);

  // Save progress when leaving the player (unmount or episode switch).
  useEffect(() => () => {
    const video = videoRef.current;
    if (video && video.currentTime > 0 && video.duration) {
      onPosition(video.currentTime, video.duration);
    }
  }, [onPosition]);

  if (!playback) {
    return (
      <div className="player player-error">
        <button className="back-button" onClick={onBack} type="button" aria-label="Go back"><ArrowLeft size={20} /></button>
        <p>The preview could not be loaded. It may not be available yet.</p>
        <button className="btn btn-play" onClick={onBack} type="button"><Play size={18} fill="currentColor" /> Back to browsing</button>
      </div>
    );
  }

  return (
    <div className="player">
      <button className="player-back" onClick={onBack} type="button" aria-label="Back to browsing">
        <ArrowLeft size={22} />
        <span>Browse</span>
      </button>

      {failed ? (
        <div className="player-error-overlay">
          <p>Playback could not start. The file may be unavailable or unsupported by this browser.</p>
          <button className="btn btn-play" onClick={onBack} type="button">Back to browsing</button>
        </div>
      ) : null}

      {/*
        No `src` here on purpose: useHlsEngine owns the media element so it can
        hand it to hls.js. Setting a src attribute as well makes the two fight
        over the same resource.
      */}
      <video
        autoPlay
        controls
        onError={() => setFailed(true)}
        playsInline
        ref={videoRef}
      />

      {playback.kind === "series" && currentEpisodes.length ? (
        <button className="player-episodes-toggle" onClick={() => setPanelOpen((open) => !open)} type="button">
          <ListVideo size={18} /> Episodes <ChevronRight size={14} />
        </button>
      ) : null}

      <button
        className="player-abr-toggle"
        onClick={() => setAbrOpen((open) => !open)}
        type="button"
        aria-label="Adaptive bitrate panel"
      >
        <Activity size={18} /> ABR
      </button>

      {abrOpen ? (
        <div className="abr-panel">
          <div className="abr-panel-head">
            <strong>Adaptive Bitrate</strong>
            <button aria-label="Close ABR panel" onClick={() => setAbrOpen(false)} type="button"><X size={18} /></button>
          </div>
          <div className="abr-algorithm-row">
            {algorithmButtons.map(({ name, label }) => (
              <button
                className={snapshot.algorithm === name ? "abr-algorithm active" : "abr-algorithm"}
                key={name}
                onClick={() => setAlgorithm(name)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          {!abrActive ? (
            <p className="abr-note">
              {levelCount === 0
                ? "Playing a progressive file — this title has no packaged ABR ladder."
                : "This ladder has a single rendition, so there is nothing to switch between."}
            </p>
          ) : null}
          <div className="abr-stats">
            <div className="abr-stat">
              <small>Delivery</small>
              <strong>{DELIVERY_LABELS[engine.kind]}</strong>
            </div>
            <div className="abr-stat">
              <small>Buffer</small>
              <strong>{snapshot.bufferSeconds.toFixed(1)}s</strong>
            </div>
            <div className="abr-stat">
              <small>Throughput</small>
              <strong>{Math.round(snapshot.throughputKbps)} kbps</strong>
            </div>
            <div className="abr-stat">
              <small>Playing</small>
              <strong>
                {snapshot.appliedIndex === null
                  ? "—"
                  : `${snapshot.appliedIndex + 1}/${levelCount} · ${Math.round(ladder?.levels[snapshot.appliedIndex]?.bitrateKbps ?? 0)}k`}
              </strong>
            </div>
            <div className="abr-stat">
              <small>Requested</small>
              <strong>{snapshot.suggestedIndex + 1} · {snapshot.suggestedBitrateKbps}k</strong>
            </div>
            <div className="abr-stat">
              <small>Avg bitrate</small>
              <strong>{Math.round(snapshot.metrics.averageBitrateKbps)} kbps</strong>
            </div>
            <div className="abr-stat">
              <small>Switches</small>
              <strong>{snapshot.metrics.switches}</strong>
            </div>
            <div className="abr-stat">
              <small>Startup</small>
              <strong>{engine.startupMs === null ? "—" : `${(engine.startupMs / 1000).toFixed(2)}s`}</strong>
            </div>
            <div className="abr-stat">
              <small>Loaded</small>
              <strong>{(engine.bytesLoaded / 1024 / 1024).toFixed(1)} MB</strong>
            </div>
          </div>
          <div className="abr-history">
            <small>Requested level ({snapshot.history.length} samples)</small>
            <div className="abr-history-bars">
              {snapshot.history.map((entry, index) => (
                <span
                  className="abr-history-bar"
                  key={index}
                  style={{ height: `${((entry.index + 1) / Math.max(1, levelCount)) * 100}%` }}
                  title={`${entry.bitrateKbps} kbps`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {panelOpen ? (
        <div className="episode-panel">
          <div className="episode-panel-head">
            <strong>Episodes</strong>
            <button aria-label="Close episodes" onClick={() => setPanelOpen(false)} type="button"><X size={18} /></button>
          </div>
          <div className="episode-panel-list">
            {currentEpisodes.map(({ episode, playing }) => (
              <button
                className={playing ? "episode-panel-item playing" : "episode-panel-item"}
                key={episode.id}
                onClick={() => {
                  setPanelOpen(false);
                  onSwitchEpisode(episode.id);
                }}
                type="button"
              >
                <span className="episode-panel-num">{episode.episode}</span>
                <span className="episode-panel-copy">
                  <strong>{playing ? "Now playing · " : ""}{episode.title}</strong>
                  <small>{episode.runtimeMinutes}m</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}