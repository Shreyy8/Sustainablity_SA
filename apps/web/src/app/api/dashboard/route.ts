import { NextResponse } from "next/server";
import { store } from "@saakshi/db";

export async function GET() {
  const kpis = store.getPortfolioKpis();
  const projects = store.getProjects();
  const sites = store.getSites();
  const grants = store.getGrants();
  const assets = store.getAssets();

  // Flagged and review assets
  const flaggedAssets = assets.filter((a) => a.trustBand === "flagged");
  const reviewAssets = assets.filter((a) => a.trustBand === "review");

  // Project cards with milestone coverage
  const projectStats = projects.map((p) => {
    const pMilestones = store.getMilestones(p.id);
    const pAssets = assets.filter((a) => a.projectId === p.id);
    const evidencedCount = pMilestones.filter((m) =>
      pAssets.some((a) => a.milestoneId === m.id && a.trustBand === "verified")
    ).length;

    const coverage = pMilestones.length > 0 ? Math.round((evidencedCount / pMilestones.length) * 100) : 0;
    const avgTrust = pAssets.length > 0 ? Math.round(pAssets.reduce((s, a) => s + a.trustScore, 0) / pAssets.length) : 100;

    return {
      project: p,
      totalMilestones: pMilestones.length,
      evidencedMilestones: evidencedCount,
      coveragePercent: coverage,
      totalAssets: pAssets.length,
      avgTrustScore: avgTrust
    };
  });

  return NextResponse.json({
    kpis,
    projects: projectStats,
    sites,
    grants,
    flaggedAssets,
    reviewAssets
  });
}
