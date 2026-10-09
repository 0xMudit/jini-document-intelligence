import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../lib/api";
import type { Route } from "../types";

/**
 * Library console: shows which local source files already have a playable HLS
 * package and lets the user start an encode. Encoding is CPU-heavy, so the
 * server runs one at a time and this view reflects that by disabling the rest.
 */

interface LibrarySource {
  key: string;
  file: string;
  bytes: number;
  modifiedAt: string;
}

interface LibraryPackage {
  key: string;
  rungs: string[];
  segmentSeconds: number;
  sourceDurationSeconds: number;
  clipLengthSeconds: number | null;
  complete: boolean;
  problems: string[];
  bytes: number;
  encodedAt: string;
}

interface LibraryState {
  dataDir: string;
  encoderAvailable: boolean;
  busy: boolean;
  activeKey: string | null;
  sources: LibrarySource[];
  packages: LibraryPackage[];
}

function mib(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function mins(seconds: number) {
  if (seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${Math.round(seconds % 60)}s`;
}

interface Props {
  onNavigate: (route: Route) => void;
}

export function LibraryView({ onNavigate }: Props) {
  const [state, setState] = useState<LibraryState | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [clip, setClip] = useState(90);
  const [useClip, setUseClip] = useState(true);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const next = await request<LibraryState>("/api/library");
      setState(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the library.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // While an encode runs, poll so progress and completion show up without a reload.
  useEffect(() => {
    if (!state?.busy) {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = window.setInterval(async () => {
      const next = await request<LibraryState>("/api/library");
      setState(next);
      const detail = await request<{ busy: boolean; log: string[] }>("/api/library/log");
      setLog(detail.log);
    }, 2000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [state?.busy]);

  const start = useCallback(
    async (key: string, force: boolean) => {
      setPendingKey(key);
      setError(null);
      setNotice(null);
      setLog([]);
      try {
        await request("/api/library/encode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, force, clipSeconds: useClip ? clip : null }),
        });
        setNotice(`Encoding ${key}. This can take a few minutes.`);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not start the encode.");
      } finally {
        setPendingKey(null);
      }
    },
    [clip, load, useClip],
  );

  if (error && !state) {
    return (
      <div className="page-state">
        <p className="error-text">{error}</p>
        <button className="btn" onClick={() => void load()} type="button">
          Retry
        </button>
      </div>
    );
  }
  if (!state) return <div className="page-state">Loading library…</div>;

  const packagesByKey = new Map(state.packages.map((pkg) => [pkg.key, pkg]));

  return (
    <main className="library">
      <header className="library-head">
        <div>
          <h1>Library</h1>
          <p className="muted">
            {state.sources.length} source file{state.sources.length === 1 ? "" : "s"} · {state.packages.length} HLS
            package{state.packages.length === 1 ? "" : "s"}
          </p>
          <p className="muted small">{state.dataDir}</p>
        </div>
        <button className="btn" onClick={() => void load()} type="button">
          Refresh
        </button>
      </header>

      {notice ? <p className="notice success">{notice}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}
      {!state.encoderAvailable ? <p className="notice error">Encoder script not found — cannot encode.</p> : null}

      <section className="panel">
        <h2>Sources</h2>
        <div className="encode-options">
          <label>
            <input type="checkbox" checked={useClip} onChange={(e) => setUseClip(e.target.checked)} />
            Encode only the first
          </label>
          <input
            className="number-input"
            type="number"
            min={5}
            max={86_400}
            value={clip}
            disabled={!useClip}
            onChange={(e) => setClip(Number(e.target.value) || 90)}
          />
          <span className="muted">seconds</span>
        </div>

        {state.sources.length === 0 ? (
          <p className="muted">No video files found. Drop MP4 or MKV files into the videos folder.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Size</th>
                  <th>Package</th>
                  <th>Rungs</th>
                  <th>Output</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.sources.map((source) => {
                  const pkg = packagesByKey.get(source.key);
                  const busy = state.busy && state.activeKey === source.key;
                  return (
                    <tr key={source.key}>
                      <td>
                        <strong>{source.key}</strong>
                        <div className="muted small">{source.file}</div>
                      </td>
                      <td>{mib(source.bytes)} MiB</td>
                      <td>
                        {!pkg ? (
                          <span className="badge">none</span>
                        ) : pkg.complete ? (
                          <span className="badge ok">ready</span>
                        ) : (
                          <span className="badge bad" title={pkg.problems.join("\n")}>
                            broken
                          </span>
                        )}
                        {pkg?.clipLengthSeconds ? (
                          <div className="muted small">{mins(pkg.clipLengthSeconds)} clip</div>
                        ) : null}
                      </td>
                      <td>{pkg ? pkg.rungs.join(", ") : "—"}</td>
                      <td>{pkg ? `${mib(pkg.bytes)} MiB` : "—"}</td>
                      <td className="row-actions">
                        <button
                          className="btn small"
                          disabled={!state.encoderAvailable || state.busy || pendingKey === source.key}
                          onClick={() => void start(source.key, Boolean(pkg))}
                          type="button"
                        >
                          {busy ? "Encoding…" : pkg ? "Re-encode" : "Encode"}
                        </button>
                        {pkg ? (
                          <button
                            className="btn small ghost"
                            onClick={() => onNavigate({ name: "details", id: source.key })}
                            type="button"
                          >
                            View
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {log.length > 0 ? (
        <section className="panel">
          <h2>Encode log</h2>
          <pre className="log-view">{log.join("\n")}</pre>
        </section>
      ) : null}

      {state.packages.some((pkg) => !pkg.complete) ? (
        <section className="panel">
          <h2>Broken packages</h2>
          <ul className="problem-list">
            {state.packages
              .filter((pkg) => !pkg.complete)
              .map((pkg) => (
                <li key={pkg.key}>
                  <strong>{pkg.key}</strong>
                  <ul>
                    {pkg.problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
