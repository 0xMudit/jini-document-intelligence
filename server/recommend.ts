import type { BrowseResponse, TitleLite } from "./types";

/**
 * Personalisation for Jini, modelled on the Netflix recommender system papers
 * ("Matrix Factorization Techniques for Recommender Systems", Koren 2009 and
 * "Netflix Recommendations: Beyond the 5 stars"). The catalog is small, so the
 * latent-factor model is trained on demand in memory from the implicit watch
 * data stored in the interactions table.
 *
 * Blended in:
 *  - ImplicitMF: SGD on confidence-weighted implicit ratings (r=1 for watched,
 *    confidence c = 1 + alpha * watchFraction), with global/user/item biases.
 *  - PVR "Top Picks": per-title action probability = predicted rating, ranked
 *    for each user (Netflix call this Personalized Video Ranking).
 *  - "Because You Watched X": item-item similarity from the latent item factors
 *    (cosine), blended with a content fallback for cold-start titles.
 *  - ECS (effective catalog size) + take-rate: the engagement metrics Netflix
 *    uses to measure recommender quality.
 */

export interface Interaction {
  userId: string;
  titleId: string;
  playCount: number;
  watchFraction: number;
}

export interface TitleFacts {
  id: string;
  popularity: number;
  rating: number;
  genres: string[];
}

export interface RecommenderConfig {
  factors?: number;
  /** Confidence multiplier alpha: c_ui = 1 + alpha * watchFraction. */
  alpha?: number;
  /** ALS regularization (the paper scales lambda with the confidence range). */
  regularization?: number;
  /** Alternating least-squares rounds. */
  iterations?: number;
  /** Injectable RNG so training is reproducible in tests. */
  rng?: () => number;
}

export type RankVariant = "pop" | "pvr";

export const DEFAULT_RECOMMENDER_CONFIG: Required<Omit<RecommenderConfig, "rng">> = {
  factors: 8,
  alpha: 40,
  regularization: 20,
  iterations: 12,
};

export class ImplicitMF {
  private readonly config: Required<Omit<RecommenderConfig, "rng">>;
  private readonly rng: () => number;

  private readonly userIndex = new Map<string, number>();
  private readonly itemIndex = new Map<string, number>();
  private readonly items: string[] = [];
  private readonly itemPopularity = new Map<string, number>();
  private userFactors: number[][] = [];
  private itemFactors: number[][] = [];
  private totalLoss = 0;
  private completedIterations = 0;
  private readonly interactedUsers = new Set<string>();

  constructor(config: RecommenderConfig = {}) {
    this.config = { ...DEFAULT_RECOMMENDER_CONFIG, ...config };
    this.rng = config.rng ?? Math.random;
  }

  /**
   * Confidence-weighted implicit MF via alternating least squares (Hu, Koren &
   * Volinsky, "Collaborative Filtering for Implicit Feedback Datasets"). Each
   * row of C is an L2 penalty on the item factors; solving (QᵀCQ + λI) p = QᵀCr
   * is exact and — unlike SGD — cannot diverge on large confidence weights.
   */
  train(interactions: Interaction[], facts: readonly TitleFacts[]) {
    for (const fact of facts) this.ensureItem(fact.id, fact.popularity);
    for (const interaction of interactions) this.ensureUser(interaction.userId);

    if (!interactions.length) return this;

    const { factors, alpha, regularization, iterations } = this.config;

    const itemIds = this.items;
    const itemCount = itemIds.length;
    const watchMatrix = new Map<number, Map<number, number>>();
    for (const interaction of interactions) {
      this.interactedUsers.add(interaction.userId);
      const user = this.userIndex.get(interaction.userId);
      const item = this.itemIndex.get(interaction.titleId);
      if (user === undefined || item === undefined) continue;
      let row = watchMatrix.get(user);
      if (!row) {
        row = new Map();
        watchMatrix.set(user, row);
      }
      row.set(item, Math.min(1, Math.max(0, interaction.watchFraction)));
    }

    for (let round = 0; round < iterations; round += 1) {
      this.completedIterations = round + 1;
      // User update: p_u = (Qᵀ C_u Q + λI)⁻¹ Qᵀ C_u r_u
      for (const [userIndex, watched] of watchMatrix) {
        const matrix = Array.from({ length: factors }, (_, col) =>
          Array.from({ length: factors }, (_, row) => {
            let sum = 0;
            for (let item = 0; item < itemCount; item += 1) {
              const weight = watched.has(item) ? 1 + alpha * watched.get(item)! : 1;
              sum += weight * this.itemFactors[item][row] * this.itemFactors[item][col];
            }
            return sum;
          }),
        );
        for (let f = 0; f < factors; f += 1) matrix[f][f] += regularization;

        const right = new Array<number>(factors).fill(0);
        for (const [item, fraction] of watched) {
          const confidence = 1 + alpha * fraction;
          for (let f = 0; f < factors; f += 1) {
            right[f] += confidence * this.itemFactors[item][f];
          }
        }

        this.userFactors[userIndex] = solveLinear(matrix, right);
      }

      // Item update: q_i = (Pᵀ Cᵢ P + λI)⁻¹ Pᵀ Cᵢ r_i
      for (let item = 0; item < itemCount; item += 1) {
        const matrix = Array.from({ length: factors }, (_, col) =>
          Array.from({ length: factors }, (_, row) => {
            let sum = 0;
            for (const [userIndex, watched] of watchMatrix) {
              const weight = watched.has(item) ? 1 + alpha * watched.get(item)! : 1;
              sum += weight * this.userFactors[userIndex][row] * this.userFactors[userIndex][col];
            }
            return sum;
          }),
        );
        for (let f = 0; f < factors; f += 1) matrix[f][f] += regularization;

        const right = new Array<number>(factors).fill(0);
        for (const [userIndex, watched] of watchMatrix) {
          const fraction = watched.get(item);
          if (fraction === undefined) continue;
          const confidence = 1 + alpha * fraction;
          for (let f = 0; f < factors; f += 1) {
            right[f] += confidence * this.userFactors[userIndex][f];
          }
        }

        this.itemFactors[item] = solveLinear(matrix, right);
      }
    }

    for (const [userIndex, watched] of watchMatrix) {
      for (const [item, fraction] of watched) {
        const residual = 1 - this.predictRaw(userIndex, item);
        this.totalLoss += (1 + alpha * fraction) * residual ** 2;
      }
    }

    return this;
  }

  private ensureItem(itemId: string, popularity = 0) {
    if (!this.itemIndex.has(itemId)) {
      this.itemIndex.set(itemId, this.items.length);
      this.items.push(itemId);
      this.itemPopularity.set(itemId, popularity);
      this.itemFactors.push(Array.from({ length: this.config.factors }, () => (this.rng() - 0.5) * 0.1));
    }
  }

  private ensureUser(userId: string) {
    if (!this.userIndex.has(userId)) {
      this.userIndex.set(userId, this.userIndex.size);
      this.userFactors.push(Array.from({ length: this.config.factors }, () => (this.rng() - 0.5) * 0.1));
    }
  }

  private predictRaw(user: number, item: number) {
    const userVector = this.userFactors[user];
    const itemVector = this.itemFactors[item];
    let dot = 0;
    for (let f = 0; f < userVector.length; f += 1) dot += userVector[f] * itemVector[f];
    return dot;
  }

  /** Predicted action score for a (user, title) pair: a latent dot product. */
  predict(userId: string, titleId: string) {
    const user = this.userIndex.get(userId);
    const item = this.itemIndex.get(titleId);
    if (user === undefined || item === undefined) return 0;
    return this.predictRaw(user, item);
  }

  /** Item vector rendered in this model's latent space, or null when unseen. */
  factorForItem(titleId: string) {
    const item = this.itemIndex.get(titleId);
    return item === undefined ? null : this.itemFactors[item];
  }

  /** Ordered candidate ids for a user under a ranking variant. */
  rank(userId: string, candidates: readonly TitleFacts[], variant: RankVariant) {
    const ids = candidates.slice();
    const knownUser = this.userIndex.has(userId) && this.hasInteracted(userId);
    if (variant === "pop" || !knownUser) {
      return ids.sort((a, b) => b.popularity - a.popularity).map((title) => title.id);
    }
    return ids
      .sort((a, b) => {
        const scoreA = this.predict(userId, a.id);
        const scoreB = this.predict(userId, b.id);
        return scoreB - scoreA || b.popularity - a.popularity;
      })
      .map((title) => title.id);
  }

private hasInteracted(userId: string) {
    return this.interactedUsers.has(userId);
  }

  metrics() {
    return {
      users: this.userIndex.size,
      items: this.items.length,
      factors: this.config.factors,
      iterations: this.completedIterations,
      loss: this.totalLoss,
    };
  }
}

/** Solve the square linear system A·x = b via Gaussian elimination (no deps). */
function solveLinear(matrix: number[][], right: number[]) {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [...row, right[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    }
    if (Math.abs(augmented[pivot][column]) < 1e-12) continue;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column] / augmented[column][column];
      for (let col = column; col <= size; col += 1) {
        augmented[row][col] -= factor * augmented[column][col];
      }
    }
  }

  return Array.from({ length: size }, (_, f) => augmented[f][size] / augmented[f][f]);
}

function vectorCosine(left: number[], right: number[]) {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let f = 0; f < left.length; f += 1) {
    dot += left[f] * right[f];
    leftNorm += left[f] ** 2;
    rightNorm += right[f] ** 2;
  }
  const denominator = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  return denominator > 0 ? dot / denominator : 0;
}

function contentSimilarity(left: TitleFacts, right: TitleFacts) {
  const shared = left.genres.filter((genre) => right.genres.includes(genre)).length;
  const total = new Set([...left.genres, ...right.genres]).size || 1;
  const genreOverlap = shared / total;
  const ratingCloseness = 1 - Math.min(1, Math.abs(left.rating - right.rating) / 5);
  return genreOverlap * 0.75 + ratingCloseness * 0.25;
}

/** Best matches for a title: latent item cosine plus a content fallback. */
export function similarTitles(
  titleId: string,
  facts: readonly TitleFacts[],
  recommender: ImplicitMF | null,
  k = 12,
): string[] {
  const target = facts.find((fact) => fact.id === titleId);
  if (!target) return [];

  const targetFactors = recommender?.factorForItem(titleId) ?? null;

const matches: Array<{ id: string; score: number }> = [];
    for (const candidate of facts) {
      if (candidate.id === titleId) continue;
      const candidateFactors = targetFactors && recommender ? recommender.factorForItem(candidate.id) : null;
      const latentScore = targetFactors && candidateFactors ? vectorCosine(targetFactors, candidateFactors) : 0;
      const latent = latentScore > 0 ? latentScore : 0;
      const content = contentSimilarity(target, candidate);
      const score = recommender && latent > 0 ? latent * 0.6 + content * 0.4 : content;
      matches.push({ id: candidate.id, score });
    }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((match) => match.id);
}

/** Entropy-based effective catalog size (Netflix): exp(H) over the play distribution. */
export function ecs(playsByTitle: readonly number[]) {
  const total = playsByTitle.reduce((sum, plays) => sum + plays, 0);
  if (total <= 0) return 0;
  let entropy = 0;
  for (const plays of playsByTitle) {
    if (plays <= 0) continue;
    const proportion = plays / total;
    entropy -= proportion * Math.log(proportion);
  }
  return Math.exp(entropy);
}

/** What fraction of surfacings become plays. */
export function takeRate(plays: number, impressions: number) {
  return impressions > 0 ? plays / impressions : 0;
}

export interface RecommendationEngine {
  recommender: ImplicitMF | null;
  facts: readonly TitleFacts[];
  interactions: readonly Interaction[];
  playCounts: ReadonlyMap<string, number>;
  impressionCounts: ReadonlyMap<string, number>;
}

/**
 * Inserts a "Top Picks for You" row and reorders "Trending Now" by predicted
 * action probability when the PVR variant is active and the user has real watch
 * history. The pop variant returns the editorial page untouched (the control in
 * an A/B comparison).
 */
export function applyPersonalization(
  browse: BrowseResponse,
  engine: RecommendationEngine | null,
  userId: string,
  variant: RankVariant,
  titleIdsToLite: (ids: string[]) => TitleLite[],
) {
  if (variant === "pop" || !engine?.recommender) return browse;

  const { recommender, facts } = engine;

  const exclude = new Set([browse.featured?.id ?? ""]);
  if (browse.rows[0]?.id === "continue-watching") {
    for (const item of browse.rows[0].items) exclude.add(item.id);
  }

  const topPicks = recommender.rank(
    userId,
    facts.filter((fact) => !exclude.has(fact.id)),
    "pvr",
  ).slice(0, 18);

  const rankedIds = recommender.rank(userId, facts, "pvr");
  const rankOf = new Map(rankedIds.map((id, position) => [id, position]));

  const rows = browse.rows.map((row) => {
    if (row.id !== "trending-now") return row;
    const items = row.items.slice().sort((a, b) => (rankOf.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rankOf.get(b.id) ?? Number.MAX_SAFE_INTEGER));
    return { ...row, items };
  });

  let insertAt = 0;
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index].id === "continue-watching" || rows[index].id === "my-list") insertAt = index + 1;
  }
  rows.splice(insertAt, 0, {
    id: "top-picks",
    label: "Top Picks for You",
    items: titleIdsToLite(topPicks),
  });

  return { ...browse, rows };
}