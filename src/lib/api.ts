const apiBase = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

function resolveRequestPath(path: string) {
  if (apiBase && path.startsWith("/api")) return `${apiBase}${path.slice(4)}`;
  return path;
}

export class RequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RequestError";
    this.status = status;
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveRequestPath(path), { ...init, credentials: "include" });
  if (!response.ok) {
    const body = await response.text();
    let message = body || `Request failed: ${response.status}`;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      message = parsed.error || message;
    } catch {
      // Keep the plain-text response as the error message.
    }
    throw new RequestError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/** 128 -> "2h 8m", 32 -> "32m", 45 -> "45m" */
export function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function formatSeconds(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${pad(minutes)}:${pad(secs)}`;
}

export function starsFor(rating: number) {
  return {
    full: Math.floor(rating),
    half: rating - Math.floor(rating) >= 0.25 && rating - Math.floor(rating) < 0.75,
    empty: 5 - Math.ceil(rating),
  };
}

export function posterUrl(titleId: string) {
  return resolveArtPath(`/api/art/poster/${titleId}.svg`);
}

export function bannerUrl(titleId: string) {
  return resolveArtPath(`/api/art/banner/${titleId}.svg`);
}

export function videoSrc(path: string) {
  if (apiBase && path.startsWith("/api/")) return `${apiBase}${path.slice(4)}`;
  return path;
}

function resolveArtPath(path: string) {
  if (apiBase && path.startsWith("/api/art")) return `${apiBase}${path.slice(8)}`;
  return path;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}