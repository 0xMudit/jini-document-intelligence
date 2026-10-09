import type { Title } from "./types";

/**
 * Procedural poster and banner art for the catalog. Every title gets a
 * deterministic SVG derived from its palette, title, and a seeded hash, so the
 * platform needs no image assets and works fully offline.
 */

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mix(rgb: { r: number; g: number; b: number }, target: number, amount: number) {
  const mixChannel = (channel: number) => Math.round(channel + (target - channel) * amount);
  return { r: mixChannel(rgb.r), g: mixChannel(rgb.g), b: mixChannel(rgb.b) };
}

function toHex(rgb: { r: number; g: number; b: number }) {
  const channel = (value: number) => value.toString(16).padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function glowString(value: string) {
  return value.replace(/\s+/g, "_") || value;
}

function randoms(seed: string) {
  let state = hashString(seed);
  return () => {
    state = Math.imul(state ^ (state >>> 15), 2246822507);
    state = Math.imul(state ^ (state >>> 13), 3266489909);
    state ^= state >>> 16;
    return (state >>> 0) / 4294967296;
  };
}

/** A single brand gradient derived from the title palette. */
function gradients(palette: string) {
  const base = hexToRgb(palette);
  const dark = toHex(mix(base, 10, 0.82));
  const deep = toHex(mix(base, 6, 0.95));
  const light = toHex(mix(base, 240, 0.28));
  return { dark, deep, light };
}

function motif(seed: string, width: number, height: number, light: string, count = 7) {
  const random = randoms(seed);
  const circles: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const x = Math.round(random() * width);
    const y = Math.round(random() * height * 0.72);
    const radius = Math.round(20 + random() * 130);
    circles.push(
      `<circle cx="${x}" cy="${y}" r="${radius}" fill="${light}" fill-opacity="${(0.05 + random() * 0.1).toFixed(2)}" />`,
    );
  }
  return circles.join("\n    ");
}

function posterGradientId(id: string) {
  return `poster-grad-${id}`;
}

export function posterSvg(title: Title): string {
  const gradient = gradients(title.palette);
  const random = randoms(title.id);
  const width = 600;
  const height = 900;
  const titleLines = wrapTitle(title.title, 10);
  const chip = title.isOriginal ? "JINI ORIGINAL" : `${title.kind.toUpperCase()} · ${title.maturity}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="${posterGradientId(title.id)}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${gradient.dark}" />
      <stop offset="55%" stop-color="${gradient.deep}" />
      <stop offset="100%" stop-color="#0a0a0a" />
    </linearGradient>
    <radialGradient id="poster-vignette-${title.id}" cx="50%" cy="32%" r="75%">
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="100%" stop-color="#050505" stop-opacity="0.85" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${posterGradientId(title.id)})" />
  ${motif(title.id, width, height, gradient.light, 8)}
  <path d="M0 ${height * 0.52} C 120 ${height * 0.5}, 200 ${height * 0.62}, 600 ${height * 0.56} L ${width} ${height} L 0 ${height} Z" fill-opacity="0.14" fill="${gradient.light}" />
  <rect width="${width}" height="${height}" fill="url(#poster-vignette-${title.id})" />
  <g transform="translate(30 28)">
    <rect x="0" y="0" width="${12 + random() * 6}" height="14" rx="2" fill="${gradient.light}" />
    <text x="${26}" y="13" font-family="Verdana, Arial, sans-serif" font-size="11" font-weight="bold" letter-spacing="2" fill="#f5f5f0">${escapeXml(chip)}</text>
  </g>
  <g transform="translate(0 ${height - titleLines.length * 78 - 70})">
    ${titleLines
      .map(
        (line, index) => `
      <text x="32" y="${index * 76 + 8}" font-family="Verdana, Arial, sans-serif" font-size="${index === 0 ? 58 : 49}" font-weight="900" letter-spacing="1" fill="#fafafa">
        ${escapeXml(line)}
      </text>`,
      )
      .join("\n    ")}
    <rect x="34" y="${titleLines.length * 76 + 8}" width="120" height="3" rx="1.5" fill="${gradient.light}" />
    <text x="34" y="${titleLines.length * 76 + 38}" font-family="Verdana, Arial, sans-serif" font-size="17" fill="#d6d6ce">${escapeXml(`${title.genres.slice(0, 2).join(" · ")}  ·  ${title.year}`)}</text>
  </g>
</svg>
`;
}

export function bannerSvg(title: Title): string {
  const gradient = gradients(title.palette);
  const random = randoms(`${title.id}-banner`);
  const width = 1600;
  const height = 900;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="banner-grad-${title.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${gradient.light}" />
      <stop offset="45%" stop-color="${gradient.dark}" />
      <stop offset="100%" stop-color="#060606" />
    </linearGradient>
    <linearGradient id="banner-fade-${title.id}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#0a0a0a" stop-opacity="0.92" />
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#banner-grad-${title.id})" />
  ${motif(`${title.id}-banner`, width, height, gradient.light, 10)}
  <path d="M0 ${height * 0.62} Q ${width * 0.3} ${height * 0.5}, ${width} ${height * 0.64} L ${width} ${height} L 0 ${height} Z" fill="#050505" fill-opacity="0.3" />
  <rect x="0" y="52" width="980" height="400" rx="6" fill="url(#banner-fade-${title.id})" opacity="0.03" />
  <text x="70" y="${height * 0.5 - 20}" font-family="Verdana, Arial, sans-serif" font-size="15" font-weight="bold" letter-spacing="4" fill="${gradient.light}">
    ${escapeXml(title.isOriginal ? "JINI ORIGINAL" : `${title.kind.toUpperCase()} · ${title.maturity}`)}
  </text>
  <g transform="translate(10 ${height * 0.5 - 6})">
    ${wrapTitle(title.title, 12)
      .slice(0, 2)
      .map(
        (line, index) => `
    <text x="60" y="${index * 110 + 92}" font-family="Verdana, Arial, sans-serif" font-size="96" font-weight="900" letter-spacing="1" fill="#fafafa">${escapeXml(line)}</text>`,
      )
      .join("\n    ")}
  </g>
  ${random() > 0.5 ? "" : `<circle cx="${850 + random() * 420}" cy="${110 + random() * 150}" r="${40 + random() * 60}" fill="${gradient.light}" fill-opacity="0.18" />`}
  <g transform="translate(62 ${height - 210})">
    <rect width="168" height="46" rx="23" fill="#e6e6e0" />
    <polygon points="66,15 66,31 84,23" fill="#111111" />
    <text x="100" y="29" font-family="Verdana, Arial, sans-serif" font-size="18" font-weight="bold" fill="#111111">Play</text>
    <text x="186" y="29" font-family="Verdana, Arial, sans-serif" font-size="16" fill="#d9d9d2">${escapeXml(glowString(title.tagline))}</text>
  </g>
  <rect width="${width}" height="${height}" fill="url(#banner-fade-${title.id})" />
</svg>
`;
}

function wrapTitle(value: string, maxLength: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxLength && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.length ? lines : [value];
}