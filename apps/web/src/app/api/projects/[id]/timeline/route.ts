import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = store.getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const milestones = store.getMilestones(id);
  const assets = store.getAssets({ projectId: id });

  // Group assets by milestone
  const milestonesWithAssets = milestones.map((m) => {
    const mAssets = assets
      .filter((a) => a.milestoneId === m.id)
      .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());

    const verifiedCount = mAssets.filter((a) => a.trustBand === "verified").length;

    return {
      milestone: m,
      assets: mAssets,
      totalAssets: mAssets.length,
      verifiedCount,
      evidenced: verifiedCount > 0
    };
  });

  const totalMilestones = milestones.length;
  const evidencedMilestones = milestonesWithAssets.filter((m) => m.evidenced).length;
  const coveragePercent = totalMilestones > 0 ? Math.round((evidencedMilestones / totalMilestones) * 100) : 0;

  return NextResponse.json({
    project,
    timeline: milestonesWithAssets,
    stats: {
      totalMilestones,
      evidencedMilestones,
      coveragePercent,
      totalAssets: assets.length
    }
  });
}
