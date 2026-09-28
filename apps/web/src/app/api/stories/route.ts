import { NextResponse } from "next/server";
import { store } from "@saakshi/db";
import { generateStoryScript } from "@saakshi/core";
import { buildReelVideoUrl } from "@saakshi/media";

export async function GET() {
  const stories = store.getStories();
  return NextResponse.json({ stories });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const projectId = body.projectId || "proj-1";
    const project = store.getProjectById(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const grant = store.getGrantById(project.grantId);
    const corporate = grant ? store.getOrgById(grant.corporateId) : undefined;
    const ngo = grant ? store.getOrgById(grant.ngoId) : undefined;

    const assets = store.getAssets({ projectId });
    const pairs = store.getPairs();
    const bestPair = pairs.find((p) => {
      const b = store.getAssetById(p.beforeAssetId);
      return b?.projectId === projectId;
    });

    const beforeAsset = bestPair ? store.getAssetById(bestPair.beforeAssetId) : undefined;
    const afterAsset = bestPair ? store.getAssetById(bestPair.afterAssetId) : undefined;

    // Generate story script
    const script = generateStoryScript({
      projectName: project.name,
      partnerNgo: ngo?.name || "Implementing NGO",
      corporateFunder: corporate?.name || "Corporate Funder",
      assets: assets.map((a) => ({
        id: a.id,
        shortId: a.shortId,
        url: a.secureUrl,
        caption: a.caption,
        activities: a.activities,
        trustScore: a.trustScore,
        qualityScore: a.qualityScore
      })),
      beforeAsset: beforeAsset
        ? {
            id: beforeAsset.id,
            shortId: beforeAsset.shortId,
            url: beforeAsset.secureUrl,
            caption: beforeAsset.caption
          }
        : undefined,
      afterAsset: afterAsset
        ? {
            id: afterAsset.id,
            shortId: afterAsset.shortId,
            url: afterAsset.secureUrl,
            caption: afterAsset.caption
          }
        : undefined
    });

    // Build Cloudinary reel URL
    const reelBeats = script.beats.map((b) => {
      const a = store.getAssetById(b.assetId);
      return {
        publicId: a?.cldPublicId || "saakshi/demo/sample",
        durationSeconds: b.durationSeconds,
        headline: b.headline,
        resourceType: a?.resourceType || "image"
      };
    });

    const videoUrl = buildReelVideoUrl(reelBeats, {
      headline: project.name
    });

    const storyId = `sty-${Date.now()}`;
    const newStory = store.insertStory({
      id: storyId,
      projectId,
      format: script.format,
      script: script as any,
      videoPublicId: `saakshi/stories/${storyId}`,
      url: videoUrl,
      status: "rendered",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      story: newStory,
      script,
      videoUrl
    });
  } catch (err: any) {
    console.error("Story generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate story" }, { status: 500 });
  }
}
