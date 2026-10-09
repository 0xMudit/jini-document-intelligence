/**
 * Adaptive bitrate logic from the papers in docs/papers/:
 *
 *  - "A Buffer-Based Approach to Rate Adaptation", Huang et al. (SIGCOMM'14):
 *    the BBA rate map f(B) — a piecewise-linear mapping from buffer occupancy
 *    to the playout rate the buffer can sustain — with "sticky" switching:
 *    a rung only changes once f(B) crosses an adjacent rung's bitrate barrier.
 *
 *  - "BOLA: Near-Optimal Bitrate Adaptation for Online Videos" (Spiteri et al.):
 *    pick the rung m that maximises (V·υ_m + V·γ_p − Q)/S_m, where S_m is the
 *    segment size, υ_m its utility, γ_p the rebuffer-event penalty, Q the buffer
 *    occupancy, and V a constant scaled off the buffer capacity.
 *
 *  - Per-Title Encode Optimization + VMAF: the encode ladder is derived from the
 *    source (resolution + bitrate) rather than fixed, capping the top rung near
 *    the source bitrate so bandwidth is never spent on an encode that matches the
 *    source exactly.
 *
 * The module is dependency-free so the same controllers drive both the backend
 * (/api/abr/decide) and the browser player's HLS.js wiring.
 */

export interface LadderVariant {
  /** 0-based position in the ladder (matches the HLS variant playlist order). */
  rung: number;
  height: number;
  width: number;
  /** Constrained-VBR ceiling in kilobits per second. */
  bitrateKbps: number;
}

export type AbrAlgorithm = "bola" | "bba";

export interface AbrState {
  /** Media buffer ahead of the playhead, in seconds. */
  bufferSeconds: number;
  /** Rung currently playing (BBA switches relative to this). */
  currentRung?: number;
  /** Estimated achievable throughput in kilobits per second (BOLA ignores it; BBA never needs it). */
  throughputKbps?: number;
  /** Media segment duration in seconds (per chunk). */
  segmentSeconds?: number;
  /** BBA lower reservoir. */
  reservoirSeconds?: number;
  /** BBA cushion between reservoir and the high end of the rate map. */
  cushionSeconds?: number;
  /** Buffer target that caps BOLA's V and BBA's upper rate. */
  maxBufferSeconds?: number;
  /** BOLA γ_p: penalty incurred by one rebuffer event. */
  rebufferPenalty?: number;
}

export interface AbrDecision {
  rung: number;
  bitrateKbps: number;
  algorithm: AbrAlgorithm;
  /** Human-readable reason for logging / the demo UI. */
  reason: string;
}

export interface AbrSource {
  width: number;
  height: number;
  /** Encoder-measured video bitrate ceiling of the master file. */
  bitrateKbps: number;
}

const DEFAULT_SEGMENT_SECONDS = 6;
const DEFAULT_MAX_BUFFER_SECONDS = 30;
const DEFAULT_REBUFFER_PENALTY = 1;
const DEFAULT_RESERVOIR_SECONDS = 6;
const DEFAULT_CUSHION_SECONDS = 20;

export function sortLadder(rungs: LadderVariant[]) {
  return [...rungs].sort((a, b) => a.bitrateKbps - b.bitrateKbps).map((rung, rungIndex) => ({ ...rung, rung: rungIndex }));
}

/**
 * Per-title encode ladder (normalised to ascending bitrate). Rung heights are
 * fractions of the source height and target bitrates scale roughly with the
 * 1.35 power of the height ratio, so each rung lands at a similar quality and
 * the top rung asymptotes to the source bitrate (Per-Title Encode Optimization,
 * VMAF). Output rungs are re-indexed ascending so rung == playlist order.
 */
export function buildLadder(source: AbrSource, heightFractions = [0.4, 0.6, 0.8, 1]) {
  const aspect = source.width / source.height;
  const heights = [...new Set(heightFractions.map((fraction) => Math.round((source.height * fraction) / 2) * 2))].filter(
    (height) => height >= 160 && height <= source.height,
  );
  if (!heights.length) heights.push(Math.round(source.height / 2) * 2 || 480);

  const rungs: LadderVariant[] = heights.map((height) => {
    const ratio = height / source.height;
    const width = Math.max(2, Math.round((height * aspect) / 2) * 2);
    const bitrateKbps = Math.max(220, Math.round((source.bitrateKbps * ratio ** 1.35) / 50) * 50);
    return { rung: 0, height, width, bitrateKbps };
  });
  return sortLadder(rungs);
}

function clampRung(rung: number | undefined, ladderLength: number) {
  if (rung === undefined || !Number.isFinite(rung)) return 0;
  return Math.max(0, Math.min(ladderLength - 1, Math.round(rung)));
}

/** Size of one segment at a rung, in bits (a chunk in BOLA is one segment). */
function segmentBits(variant: LadderVariant, segmentSeconds: number) {
  return variant.bitrateKbps * 1000 * segmentSeconds;
}

/**
 * BOLA. Utility per rung is the logarithmic utility from the paper,
 * υ_m = ln(S_m/S_1) over segment sizes, V is derived so the highest rung is
 * reached at the top of the buffer range, and rung m is chosen to maximise
 * (V·υ_m + V·γ_p − Q)/S_m. When the buffer is already past capacity the paper
 * says don't download — for a next-level chooser that means stay put.
 */
export function bolaDecide(state: AbrState, ladder: readonly LadderVariant[]): AbrDecision {
  const sorted = sortLadder(ladder as LadderVariant[]);
  if (sorted.length === 0) return { rung: 0, bitrateKbps: 0, algorithm: "bola", reason: "empty-ladder" };
  if (sorted.length === 1) {
    return { rung: sorted[0].rung, bitrateKbps: sorted[0].bitrateKbps, algorithm: "bola", reason: "single-rung" };
  }

  const segmentSeconds = state.segmentSeconds ?? DEFAULT_SEGMENT_SECONDS;
  const maxBufferSeconds = state.maxBufferSeconds ?? DEFAULT_MAX_BUFFER_SECONDS;
  const rebufferPenalty = state.rebufferPenalty ?? DEFAULT_REBUFFER_PENALTY;
  const buffer = Math.max(0, state.bufferSeconds);
  const currentRung = clampRung(state.currentRung, sorted.length);

  const sizes = sorted.map((variant) => segmentBits(variant, segmentSeconds));
  const minSize = sizes[0];
  const utilities = sorted.map((variant) => Math.log(segmentBits(variant, segmentSeconds) / minSize));
  const maxUtility = utilities[sorted.length - 1];
  const v = maxUtility + rebufferPenalty > 0 ? (maxBufferSeconds - 1) / (maxUtility + rebufferPenalty) : 1;

  if (buffer >= maxBufferSeconds) {
    return {
      rung: currentRung,
      bitrateKbps: sorted[currentRung].bitrateKbps,
      algorithm: "bola",
      reason: "buffer-full",
    };
  }

  let bestRung = sorted[0].rung;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < sorted.length; index += 1) {
    const score = (v * utilities[index] + v * rebufferPenalty - buffer) / sizes[index];
    if (score > bestScore || (score === bestScore && index < bestRung)) {
      bestRung = sorted[index].rung;
      bestScore = score;
    }
  }

  return {
    rung: bestRung,
    bitrateKbps: sorted.find((variant) => variant.rung === bestRung)!.bitrateKbps,
    algorithm: "bola",
    reason: "max-utility",
  };
}

function bestRungAtOrBelow(ladder: readonly LadderVariant[], bitrateKbps: number) {
  let best = ladder[0].rung;
  for (const variant of ladder) {
    if (variant.bitrateKbps <= bitrateKbps) best = variant.rung;
    else break;
  }
  return best;
}

function bestRungAtOrAbove(ladder: readonly LadderVariant[], bitrateKbps: number) {
  let best = ladder[ladder.length - 1].rung;
  for (let index = ladder.length - 1; index >= 0; index -= 1) {
    if (ladder[index].bitrateKbps >= bitrateKbps) best = ladder[index].rung;
    else break;
  }
  return best;
}

/**
 * BBA (Algorithm 1, Huang et al. SIGCOMM'14). The rate map f(B) is piecewise
 * linear over the reservoir [0, r] and cushion (r, r+cu) span of the buffer
 * axis. Switching is sticky: a rung only changes once f(B) crosses an adjacent
 * rung's bitrate, exactly as the discrete barriers prevent oscillation in the
 * paper. Below the reservoir everything drops to the floor rung.
 */
export function bbaDecide(state: AbrState, ladder: readonly LadderVariant[]): AbrDecision {
  const sorted = sortLadder(ladder as LadderVariant[]);
  if (sorted.length === 0) return { rung: 0, bitrateKbps: 0, algorithm: "bba", reason: "empty-ladder" };
  if (sorted.length === 1) {
    return { rung: sorted[0].rung, bitrateKbps: sorted[0].bitrateKbps, algorithm: "bba", reason: "single-rung" };
  }

  const reservoir = state.reservoirSeconds ?? DEFAULT_RESERVOIR_SECONDS;
  const cushion = state.cushionSeconds ?? DEFAULT_CUSHION_SECONDS;
  const maxBuffer = state.maxBufferSeconds ?? reservoir + cushion;
  const buffer = Math.max(0, state.bufferSeconds);
  const currentRung = clampRung(state.currentRung, sorted.length);
  const current = sorted[currentRung];

  if (buffer < reservoir) {
    return { rung: sorted[0].rung, bitrateKbps: sorted[0].bitrateKbps, algorithm: "bba", reason: "reservoir" };
  }

  const minRate = sorted[0].bitrateKbps;
  const maxRate = sorted[sorted.length - 1].bitrateKbps;
  const rateSpan = Math.max(1, maxRate - minRate);
  const reach = Math.min(maxBuffer, reservoir + cushion);
  const progress = Math.min(1, (buffer - reservoir) / Math.max(1, reach - reservoir));
  const rateMap = minRate + progress * rateSpan;

  const upBarrier = sorted[currentRung + 1]?.bitrateKbps ?? Number.POSITIVE_INFINITY;
  const downBarrier = sorted[currentRung - 1]?.bitrateKbps ?? Number.NEGATIVE_INFINITY;

  if (rateMap >= upBarrier) {
    const rung = bestRungAtOrBelow(sorted, rateMap);
    return {
      rung,
      bitrateKbps: sorted.find((variant) => variant.rung === rung)!.bitrateKbps,
      algorithm: "bba",
      reason: "rate-map-up",
    };
  }
  if (rateMap <= downBarrier) {
    const rung = bestRungAtOrAbove(sorted, rateMap);
    return {
      rung,
      bitrateKbps: sorted.find((variant) => variant.rung === rung)!.bitrateKbps,
      algorithm: "bba",
      reason: "rate-map-down",
    };
  }
  return { rung: current.rung, bitrateKbps: current.bitrateKbps, algorithm: "bba", reason: "rate-map-sticky" };
}

/**
 * One decision point. BOLA is the default (no throughput estimate needed —
 * it is purely buffer-driven); BBA is available as the buffer-mapping variant.
 */
export function decideAbr(
  state: AbrState,
  ladder: readonly LadderVariant[],
  algorithm: AbrAlgorithm = "bola",
): AbrDecision {
  return algorithm === "bba" ? bbaDecide(state, ladder) : bolaDecide(state, ladder);
}