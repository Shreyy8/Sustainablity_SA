import { NextResponse } from "next/server";
import { store } from "@saakshi/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queue = (searchParams.get("queue") as any) || "all";

  const assets = store.getReviewQueue(queue);
  const projects = store.getProjects();
  const sites = store.getSites();

  const enriched = assets.map((asset) => {
    const proj = projects.find((p) => p.id === asset.projectId);
    const site = sites.find((s) => s.id === asset.siteId);

    // Find duplicate match details if asset has duplicate penalty
    const dupCheck = asset.trustChecks.find((c) => c.id === "duplicate" && c.penalty > 0);
    let matchedAsset = null;
    if (dupCheck?.evidence?.matchAssetId) {
      matchedAsset = store.getAssetById(dupCheck.evidence.matchAssetId as string);
    }

    return {
      asset,
      project: proj,
      site,
      duplicateMatch: matchedAsset
    };
  });

  const counts = {
    all: store.getReviewQueue("all").length,
    unassigned: store.getReviewQueue("unassigned").length,
    low_trust: store.getReviewQueue("low_trust").length,
    duplicate: store.getReviewQueue("duplicate").length
  };

  return NextResponse.json({
    queue,
    counts,
    items: enriched
  });
}
