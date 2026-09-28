export interface PairAsset {
  id: string;
  shortId?: string;
  siteId: string;
  milestoneId?: string;
  capturedAt: string | Date;
  activities?: string[];
  embedding?: number[];
  trustScore?: number;
  publicId?: string;
  version?: number | string;
  url?: string;
}

export interface PairCandidate {
  beforeAsset: PairAsset;
  afterAsset: PairAsset;
  score: number;
  viewSimilarity: number;
  timeGapDays: number;
  trustScoreAvg: number;
  isAutoCandidate: boolean;
}

export function cosineSimilarity(a?: number[], b?: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0.8; // Fallback similarity when embeddings are omitted
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findPairCandidates(
  targetAsset: PairAsset,
  historicalAssets: PairAsset[]
): PairCandidate[] {
  const targetTime = new Date(targetAsset.capturedAt).getTime();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const targetActivities = targetAsset.activities || [];

  const candidates: PairCandidate[] = [];

  for (const prev of historicalAssets) {
    if (prev.id === targetAsset.id) continue;
    // Must be same site
    if (prev.siteId !== targetAsset.siteId) continue;

    const prevTime = new Date(prev.capturedAt).getTime();
    const gapMs = targetTime - prevTime;

    // Must be captured >= 14 days earlier
    if (gapMs < FOURTEEN_DAYS_MS) continue;

    const gapDays = gapMs / (24 * 60 * 60 * 1000);

    // Activity overlap check
    const prevActivities = prev.activities || [];
    const hasActivityOverlap =
      targetActivities.length === 0 ||
      prevActivities.length === 0 ||
      targetActivities.some((act) => prevActivities.includes(act));

    if (!hasActivityOverlap) continue;

    // Embedding similarity
    const viewSimilarity = cosineSimilarity(targetAsset.embedding, prev.embedding);
    if (viewSimilarity < 0.7) continue;

    // Normalize time gap: optimal gap between 30 to 180 days -> 1.0
    const timeGapNorm = Math.min(1.0, gapDays / 90);

    const trustAvg =
      ((targetAsset.trustScore ?? 80) + (prev.trustScore ?? 80)) / 200;

    const score = Number(
      (0.4 * viewSimilarity + 0.3 * timeGapNorm + 0.3 * trustAvg).toFixed(3)
    );

    candidates.push({
      beforeAsset: prev,
      afterAsset: targetAsset,
      score,
      viewSimilarity,
      timeGapDays: Math.round(gapDays),
      trustScoreAvg: trustAvg * 100,
      isAutoCandidate: score >= 0.7
    });
  }

  // Sort highest score first
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}
