import { useCallback, useEffect, useState } from "react";
import { request } from "../lib/api";
import type { Route } from "../types";

/**
 * Streaming quality dashboard.
 *
 * The player reports what the browser actually experienced; this turns that into
 * the numbers an operator acts on — startup time, rebuffering, and bitrate
 * delivery per title. Everything is derived from `qoe_sessions`, so it reflects
 * real playback rather than configuration.
 */

interface QoeAggregate {
  sessions: number;
  watchMs: number;
  rebufferCount: number;
  rebufferMs: number;
  switches: number;
  bytesLoaded: number;
  segmentsLoaded: number;
  startupMs: number;
  avgBitrateKbps: number;
  peakBitrateKbps: number;
  avgBufferSeconds: number;
  completed: number;
}

export interface QoeTitleRow {
  titleId: string;
  titleName: string;
  sessions: number;
  watchMs: number;
  rebufferCount: number;
  rebufferMs: number;
  startupMs: number;
  avgBitrateKbps: number;
  peakBitrateKbps: number;
  bytesLoaded: number;
  completed: number;
}

export interface QoeSessionRow {
  sessionId: string;
  titleId: string;
  titleName: string;
  streamMode: string;
  algorithm: string;
  startedAt: string;
  watchMs: number;
  rebufferCount: number;
  rebufferMs: number;
  switches: number;
  bytesLoaded: number;
  startupMs: number;
  avgBitrateKbps: number;
  completed: number;
}

const EMPTY: QoeAggregate = {
  sessions: 0,
  watchMs: 0,
  rebufferCount: 0,
  rebufferMs: 0,
  switches: 0,
  bytesLoaded: 0,
  segmentsLoaded: 0,
  startupMs: 0,
  avgBitrateKbps: 0,
  peakBitrateKbps: 0,
  avgBufferSeconds: 0,
  completed: 0,
};

function seconds(ms: number) {
  return Math.round(ms / 1000);
}

function mib(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function duration(ms: number) {
  const total = seconds(ms);
  if (total < 60) return `${total}s`;
  const mins = Math.floor(total / 60);
  return `${mins}m ${total % 60}s`;
}

interface Props {
  onNavigate: (route: Route) => void;
}

export function InsightsView({ onNavigate }: Props) {
  const [aggregate, setAggregate] = useState<QoeAggregate>(EMPTY);
  const [titles, setTitles] = useState<QoeTitleRow[]>([]);
  const [sessions, setSessions] = useState<QoeSessionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, byTitle, recent] = await Promise.all([
        request<QoeAggregate>("/api/qoe/summary"),
        request<QoeTitleRow[]>("/api/qoe/titles?limit=10"),
        request<QoeSessionRow[]>("/api/qoe/sessions?limit=25"),
      ]);
      setAggregate(summary);
      setTitles(byTitle);
      setSessions(recent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load quality data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="page-state">Loading quality data…</div>;
  }

  if (error) {
    return (
      <div className="page-state">
        <p className="error-text">{error}</p>
        <button className="btn" onClick={() => void load()} type="button">
          Retry
        </button>
      </div>
    );
  }

  const rebufferRatio = aggregate.watchMs > 0 ? aggregate.rebufferMs / (aggregate.watchMs + aggregate.rebufferMs) : 0;
  const hasData = aggregate.sessions > 0;

  return (
    <main className="insights">
      <header className="insights-head">
        <div>
          <h1>Streaming quality</h1>
          <p className="muted">
            Measured in your browser during playback — startup delay, stalls and delivered bitrate.
          </p>
        </div>
        <button className="btn" onClick={() => void load()} type="button">
          Refresh
        </button>
      </header>

      {!hasData ? (
        <div className="empty-state">
          <h2>No sessions yet</h2>
          <p className="muted">Play something and quality data will appear here.</p>
          <button className="btn primary" onClick={() => onNavigate({ name: "browse" })} type="button">
            Browse titles
          </button>
        </div>
      ) : (
        <>
          <section className="metric-grid" aria-label="Overall quality">
            <article className="metric">
              <span className="metric-label">Sessions</span>
              <strong className="metric-value">{aggregate.sessions}</strong>
              <span className="metric-note">
                {aggregate.completed} watched to the end
              </span>
            </article>
            <article className="metric">
              <span className="metric-label">Startup</span>
              <strong className="metric-value">
                {(aggregate.startupMs / 1000).toFixed(2)}
                <small>s</small>
              </strong>
              <span className="metric-note">first frame</span>
            </article>
            <article className={'metric' + (aggregate.rebufferCount > 0 ? ' warn' : '')}>
              <span className="metric-label">Rebuffers</span>
              <strong className="metric-value">{aggregate.rebufferCount}</strong>
              <span className="metric-note">
                {duration(aggregate.rebufferMs)} total · {(rebufferRatio * 100).toFixed(2)}% of time
              </span>
            </article>
            <article className="metric">
              <span className="metric-label">Avg bitrate</span>
              <strong className="metric-value">
                {Math.round(aggregate.avgBitrateKbps / 1000)}
                <small>Mbps</small>
              </strong>
              <span className="metric-note">peak {Math.round(aggregate.peakBitrateKbps / 1000)} Mbps</span>
            </article>
            <article className="metric">
              <span className="metric-label">Switches</span>
              <strong className="metric-value">{aggregate.switches}</strong>
              <span className="metric-note">ABR level changes</span>
            </article>
            <article className="metric">
              <span className="metric-label">Delivered</span>
              <strong className="metric-value">
                {mib(aggregate.bytesLoaded)}
                <small>MiB</small>
              </strong>
              <span className="metric-note">
                {aggregate.segmentsLoaded} segments · {duration(aggregate.watchMs)} watched
              </span>
            </article>
          </section>

          <section className="panel">
            <h2>By title</h2>
            {titles.length === 0 ? (
              <p className="muted">No per-title data yet.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Sessions</th>
                      <th>Startup</th>
                      <th>Rebuffers</th>
                      <th>Avg bitrate</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {titles.map((row) => (
                      <tr key={row.titleId}>
                        <td>
                          <button
                            className="link-button"
                            onClick={() => onNavigate({ name: "details", id: row.titleId })}
                            type="button"
                          >
                            {row.titleName}
                          </button>
                        </td>
                        <td>{row.sessions}</td>
                        <td>{(row.startupMs / 1000).toFixed(2)}s</td>
                        <td className={row.rebufferCount > 0 ? "warn-text" : undefined}>
                          {row.rebufferCount} · {duration(row.rebufferMs)}
                        </td>
                        <td>{Math.round(row.avgBitrateKbps / 1000)} Mbps</td>
                        <td>{mib(row.bytesLoaded)} MiB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Recent sessions</h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Mode</th>
                    <th>ABR</th>
                    <th>Watched</th>
                    <th>Stalls</th>
                    <th>Switches</th>
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((row) => (
                    <tr key={row.sessionId}>
                      <td>{row.titleName}</td>
                      <td>{row.streamMode}</td>
                      <td>{row.algorithm}</td>
                      <td>{duration(row.watchMs)}</td>
                      <td className={row.rebufferCount > 0 ? "warn-text" : undefined}>{row.rebufferCount}</td>
                      <td>{row.switches}</td>
                      <td>{new Date(row.startedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
