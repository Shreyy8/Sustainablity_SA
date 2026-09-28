export interface FactsBundleMilestone {
  id: string;
  name: string;
  expectedDate: string;
  evidenced: boolean;
  evidenceAssetCount: number;
}

export interface FactsBundleProject {
  id: string;
  name: string;
  description?: string;
  state?: string;
  district?: string;
  grantTitle?: string;
  amountInr?: number;
  scheduleVii?: string;
  milestones: FactsBundleMilestone[];
  evidencedAssetCount: number;
  avgTrustScore: number;
}

export interface FactsBundleAsset {
  id: string;
  shortId: string;
  caption: string;
  capturedAt: string;
  siteName: string;
  milestoneName?: string;
  trustScore: number;
  activities: string[];
}

export interface FactsBundleBeforeAfter {
  id: string;
  siteName: string;
  summary: string;
  beforeShortId: string;
  afterShortId: string;
  changes: Array<{ type: string; object: string; evidence: string }>;
}

export interface FactsBundle {
  generatedAt: string;
  scope: {
    corporateName: string;
    ngoName?: string;
    period: string;
  };
  portfolioSummary: {
    totalProjects: number;
    totalEvidenceAssets: number;
    avgTrustScore: number;
    verifiedPercentage: number;
  };
  projects: FactsBundleProject[];
  assets: FactsBundleAsset[];
  beforeAfterPairs: FactsBundleBeforeAfter[];
}

export function buildFactsBundle(params: {
  corporateName: string;
  ngoName?: string;
  period: string;
  projects: FactsBundleProject[];
  assets: FactsBundleAsset[];
  beforeAfterPairs?: FactsBundleBeforeAfter[];
}): FactsBundle {
  const totalAssets = params.assets.length;
  const verifiedAssets = params.assets.filter((a) => a.trustScore >= 75).length;
  const avgTrust =
    totalAssets > 0
      ? Math.round(
          params.assets.reduce((sum, a) => sum + a.trustScore, 0) / totalAssets
        )
      : 100;

  return {
    generatedAt: new Date().toISOString(),
    scope: {
      corporateName: params.corporateName,
      ngoName: params.ngoName,
      period: params.period
    },
    portfolioSummary: {
      totalProjects: params.projects.length,
      totalEvidenceAssets: totalAssets,
      avgTrustScore: avgTrust,
      verifiedPercentage:
        totalAssets > 0 ? Math.round((verifiedAssets / totalAssets) * 100) : 100
    },
    projects: params.projects,
    assets: params.assets,
    beforeAfterPairs: params.beforeAfterPairs || []
  };
}
