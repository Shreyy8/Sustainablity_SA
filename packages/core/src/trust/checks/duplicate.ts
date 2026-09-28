export interface PhashMatch {
  matchAssetId: string;
  hamming: number;
  projectId?: string;
  siteId?: string;
  milestoneId?: string;
  capturedAt?: string | Date;
  shortId?: string;
}

export interface DuplicateCheckAsset {
  id: string;
  projectId?: string;
  siteId?: string;
  milestoneId?: string;
  capturedAt?: string | Date;
}

export interface CheckResult {
  id: string;
  penalty: number;
  severity: "info" | "warning" | "critical";
  reason: string;
  evidence?: Record<string, unknown>;
}

export function duplicateCheck(
  matches: PhashMatch[] | undefined,
  currentAsset: DuplicateCheckAsset
): CheckResult | null {
  if (!matches || matches.length === 0) return null;

  // Filter out any self-match
  const filtered = matches.filter((m) => m.matchAssetId !== currentAsset.id);
  if (filtered.length === 0) return null;

  // Sort by closest match (lowest hamming distance)
  filtered.sort((a, b) => a.hamming - b.hamming);
  const bestMatch = filtered[0];

  const currentCapture = currentAsset.capturedAt
    ? new Date(currentAsset.capturedAt).getTime()
    : Date.now();
  const matchCapture = bestMatch.capturedAt
    ? new Date(bestMatch.capturedAt).getTime()
    : 0;
  const timeDifferenceHours = Math.abs(currentCapture - matchCapture) / (1000 * 60 * 60);

  // Burst rule check: Same site, same milestone, < 24 hours apart
  const isSameSite = currentAsset.siteId && bestMatch.siteId && currentAsset.siteId === bestMatch.siteId;
  const isSameMilestone = currentAsset.milestoneId && bestMatch.milestoneId && currentAsset.milestoneId === bestMatch.milestoneId;

  if (isSameSite && isSameMilestone && timeDifferenceHours <= 24) {
    return {
      id: "duplicate",
      penalty: 0,
      severity: "info",
      reason: `Burst sequence shot: rapid capture taken within 24h at the same site as #${bestMatch.shortId || bestMatch.matchAssetId.slice(0, 8)}`,
      evidence: {
        matchAssetId: bestMatch.matchAssetId,
        hamming: bestMatch.hamming,
        timeDiffHours: timeDifferenceHours,
        isBurst: true
      }
    };
  }

  // Exact or near duplicate check
  if (bestMatch.hamming <= 4) {
    const isDifferentContext =
      (currentAsset.projectId && bestMatch.projectId && currentAsset.projectId !== bestMatch.projectId) ||
      (currentAsset.siteId && bestMatch.siteId && currentAsset.siteId !== bestMatch.siteId) ||
      timeDifferenceHours > 24 * 30;

    if (isDifferentContext) {
      return {
        id: "duplicate",
        penalty: 60,
        severity: "critical",
        reason: `Reused photo detected: exact visual match (Hamming distance ${bestMatch.hamming}) to asset #${bestMatch.shortId || bestMatch.matchAssetId.slice(0, 8)} from another project/site or older date`,
        evidence: {
          matchAssetId: bestMatch.matchAssetId,
          hamming: bestMatch.hamming,
          matchProjectId: bestMatch.projectId,
          matchSiteId: bestMatch.siteId
        }
      };
    }
  }

  if (bestMatch.hamming <= 10) {
    return {
      id: "duplicate",
      penalty: 30,
      severity: "warning",
      reason: `Near-duplicate photo detected: strong visual similarity (Hamming distance ${bestMatch.hamming}) to asset #${bestMatch.shortId || bestMatch.matchAssetId.slice(0, 8)}`,
      evidence: {
        matchAssetId: bestMatch.matchAssetId,
        hamming: bestMatch.hamming
      }
    };
  }

  return null;
}
