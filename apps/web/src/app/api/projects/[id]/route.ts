import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = store.getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const grant = store.getGrantById(project.grantId);
    const sites = store.getSites(project.id);
    const milestones = store.getMilestones(project.id);
    const assets = store.getAssets({ projectId: project.id });
    const pairs = store.getPairs().filter((p) => {
      const b = store.getAssetById(p.beforeAssetId);
      const a = store.getAssetById(p.afterAssetId);
      return b?.projectId === project.id || a?.projectId === project.id;
    });

    const verifiedAssets = assets.filter((a) => a.trustBand === "verified");
    const evidencedCount = milestones.filter((m) =>
      assets.some((a) => a.milestoneId === m.id && a.trustBand === "verified")
    ).length;

    const coverage =
      milestones.length > 0 ? Math.round((evidencedCount / milestones.length) * 100) : 0;
    const avgTrust =
      assets.length > 0
        ? Math.round(assets.reduce((s, a) => s + a.trustScore, 0) / assets.length)
        : 100;

    return NextResponse.json({
      project,
      grant,
      sites,
      milestones,
      assets,
      pairs,
      stats: {
        totalMilestones: milestones.length,
        evidencedMilestones: evidencedCount,
        coveragePercent: coverage,
        totalAssets: assets.length,
        verifiedAssets: verifiedAssets.length,
        avgTrustScore: avgTrust
      }
    });
  } catch (err: any) {
    console.error("GET /api/projects/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch project" }, { status: 500 });
  }
}
