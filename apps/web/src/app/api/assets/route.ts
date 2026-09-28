import { NextResponse } from "next/server";
import { store } from "@saakshi/db";
import { runAssetPipeline } from "@saakshi/core";
import { buildThumbnailUrl, buildReportUrl, buildPublicUrl } from "@saakshi/media";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const siteId = searchParams.get("siteId") || undefined;
  const milestoneId = searchParams.get("milestoneId") || undefined;
  const status = searchParams.get("status") || undefined;
  const trustBand = searchParams.get("trustBand") || undefined;
  const activity = searchParams.get("activity") || undefined;

  const assets = store.getAssets({
    projectId,
    siteId,
    milestoneId,
    status,
    trustBand,
    activity
  });

  return NextResponse.json({ assets, count: assets.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const assetId = `ast-${Date.now().toString(36)}`;
    const shortId = `AST-${Math.floor(1000 + Math.random() * 9000)}`;

    const pipelineResult = await runAssetPipeline(
      {
        id: assetId,
        shortId,
        publicId: body.publicId || `saakshi/uploads/${shortId}`,
        version: body.version || Math.floor(Date.now() / 1000),
        secureUrl: body.secureUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
        resourceType: body.resourceType || "image",
        format: body.format || "jpg",
        bytes: body.bytes || 2400000,
        width: body.width || 2048,
        height: body.height || 1536,
        capturedAt: body.capturedAt || new Date().toISOString(),
        location: body.location,
        exif: body.exif,
        phash: body.phash,
        tags: body.tags || [],
        ocrText: body.ocrText,
        qualityScore: body.qualityScore ?? 0.9,
        uploaderId: body.uploaderId,
        projectIdHint: body.projectId,
        siteIdHint: body.siteId,
        milestoneIdHint: body.milestoneId
      },
      {
        sites: store.getSites(),
        projects: store.getProjects(),
        milestones: store.getMilestones(),
        existingAssets: store.getAssets()
      }
    );

    const saved = store.insertAsset(pipelineResult.asset as any);

    // Record derivatives
    store.recordDerivative({
      id: `der-${Date.now()}-thumb`,
      assetId: saved.id,
      assetVersion: saved.cldVersion,
      transformation: "t_sk_thumb",
      url: buildThumbnailUrl({ publicId: saved.cldPublicId, version: saved.cldVersion, secureUrl: saved.secureUrl }),
      purpose: "thumb",
      createdAt: new Date().toISOString()
    });

    store.recordDerivative({
      id: `der-${Date.now()}-report`,
      assetId: saved.id,
      assetVersion: saved.cldVersion,
      transformation: "t_sk_report",
      url: buildReportUrl({ publicId: saved.cldPublicId, version: saved.cldVersion, secureUrl: saved.secureUrl }),
      purpose: "report",
      createdAt: new Date().toISOString()
    });

    store.recordDerivative({
      id: `der-${Date.now()}-pub`,
      assetId: saved.id,
      assetVersion: saved.cldVersion,
      transformation: "t_sk_public",
      url: buildPublicUrl({ publicId: saved.cldPublicId, version: saved.cldVersion, secureUrl: saved.secureUrl }),
      purpose: "public",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      asset: saved,
      assignment: pipelineResult.assignment,
      trust: pipelineResult.trust,
      pairCandidate: pipelineResult.pairCandidate
    });
  } catch (err: any) {
    console.error("Asset creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create asset" }, { status: 500 });
  }
}
