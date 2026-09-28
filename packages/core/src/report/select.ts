import { cosineSimilarity } from "../pairs/candidates.js";

export interface ReportAssetCandidate {
  id: string;
  shortId: string;
  projectId: string;
  siteId: string;
  milestoneId?: string;
  trustScore: number;
  qualityScore?: number;
  status: string;
  embedding?: number[];
  caption?: string;
  url?: string;
  capturedAt: string | Date;
}

export interface EvidenceSelectionOptions {
  maxAssetsPerProject?: number;
  minTrustScore?: number;
  lambdaMMR?: number; // 0.7 balances quality vs diversity
}

/**
 * Greedy MMR (Maximal Marginal Relevance) evidence selection
 * Ensures high trust, high quality, and diverse coverage across sites and milestones.
 */
export function selectEvidenceForReport(
  assets: ReportAssetCandidate[],
  options: EvidenceSelectionOptions = {}
): ReportAssetCandidate[] {
  const minTrust = options.minTrustScore ?? 75;
  const maxAssets = options.maxAssetsPerProject ?? 8;
  const lambda = options.lambdaMMR ?? 0.7;

  // Filter verified / high trust assets that are not rejected
  const eligible = assets.filter(
    (a) => a.trustScore >= minTrust && a.status !== "rejected"
  );

  if (eligible.length <= maxAssets) {
    return eligible;
  }

  // Base relevance score
  const baseScores = new Map<string, number>();
  for (const a of eligible) {
    const quality = a.qualityScore ?? 0.8;
    const trustNorm = a.trustScore / 100;
    baseScores.set(a.id, quality * 0.4 + trustNorm * 0.6);
  }

  const selected: ReportAssetCandidate[] = [];
  const coveredMilestones = new Set<string>();
  const coveredSites = new Set<string>();
  const remaining = [...eligible];

  while (selected.length < maxAssets && remaining.length > 0) {
    let bestIndex = -1;
    let bestMMRScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const relScore = baseScores.get(candidate.id) ?? 0.5;

      // Coverage bonus if milestone or site isn't covered yet
      let coverageBonus = 0;
      if (candidate.milestoneId && !coveredMilestones.has(candidate.milestoneId)) {
        coverageBonus += 0.25;
      }
      if (candidate.siteId && !coveredSites.has(candidate.siteId)) {
        coverageBonus += 0.2;
      }

      // Max similarity to already selected items
      let maxSim = 0;
      for (const s of selected) {
        const sim = cosineSimilarity(candidate.embedding, s.embedding);
        if (sim > maxSim) maxSim = sim;
      }

      const mmrScore =
        lambda * (relScore + coverageBonus) - (1 - lambda) * maxSim;

      if (mmrScore > bestMMRScore) {
        bestMMRScore = mmrScore;
        bestIndex = i;
      }
    }

    if (bestIndex >= 0) {
      const chosen = remaining.splice(bestIndex, 1)[0];
      selected.push(chosen);
      if (chosen.milestoneId) coveredMilestones.add(chosen.milestoneId);
      if (chosen.siteId) coveredSites.add(chosen.siteId);
    } else {
      break;
    }
  }

  return selected;
}
