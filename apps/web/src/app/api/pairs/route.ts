import { NextResponse } from "next/server";
import { store } from "@saakshi/db";
import { buildCompositeUrl } from "@saakshi/media";
import { generateChangeSummary } from "@saakshi/ai";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId") || undefined;

  const pairs = store.getPairs(siteId);

  const enriched = pairs.map((pair) => {
    const beforeAsset = store.getAssetById(pair.beforeAssetId);
    const afterAsset = store.getAssetById(pair.afterAssetId);
    const site = store.getSiteById(pair.siteId);

    return {
      ...pair,
      beforeAsset,
      afterAsset,
      site
    };
  });

  return NextResponse.json({ pairs: enriched });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { siteId, beforeAssetId, afterAssetId, milestoneId } = body;

    const beforeAsset = store.getAssetById(beforeAssetId);
    const afterAsset = store.getAssetById(afterAssetId);

    if (!beforeAsset || !afterAsset) {
      return NextResponse.json({ error: "Both before and after assets must exist" }, { status: 400 });
    }

    // Build signed composite URL with before & after date stamps
    const beforeDate = beforeAsset.capturedAt ? new Date(beforeAsset.capturedAt).toISOString().split("T")[0] : "BASELINE";
    const afterDate = afterAsset.capturedAt ? new Date(afterAsset.capturedAt).toISOString().split("T")[0] : "COMPLETED";

    const compositeUrl = buildCompositeUrl(
      { publicId: beforeAsset.cldPublicId, version: beforeAsset.cldVersion },
      { publicId: afterAsset.cldPublicId, version: afterAsset.cldVersion },
      { beforeDate, afterDate, blurFaces: true }
    );

    // Generate structured change summary via AI
    const changeSummary = await generateChangeSummary({
      beforeLabel: beforeDate,
      afterLabel: afterDate,
      activity: afterAsset.activities?.[0],
      compositeUrl
    });

    const newPair = store.insertPair({
      id: `pair-${Date.now()}`,
      siteId: siteId || afterAsset.siteId || "site-1",
      milestoneId: milestoneId || afterAsset.milestoneId,
      beforeAssetId,
      afterAssetId,
      compositeUrl,
      score: 0.95,
      source: "manual",
      change: changeSummary
    });

    return NextResponse.json({
      success: true,
      pair: newPair
    });
  } catch (err: any) {
    console.error("Pair creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create pair" }, { status: 500 });
  }
}
