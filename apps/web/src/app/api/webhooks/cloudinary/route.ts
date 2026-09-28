import { NextResponse } from "next/server";
import { verifyWebhookSignature, type CldNotification, buildThumbnailUrl, buildReportUrl, buildPublicUrl } from "@pluribus/media";
import { runAssetPipeline } from "@pluribus/core";
import { store } from "@pluribus/db";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-cld-timestamp");
    const signature = req.headers.get("x-cld-signature");

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, { timestamp, signature });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as CldNotification;

    if (payload.notification_type === "upload") {
      const publicId = payload.public_id;
      const assetId = `ast-${Date.now().toString(36)}`;
      const shortId = `AST-${Math.floor(1000 + Math.random() * 9000)}`;

      // Parse context from client upload
      const context = payload.context?.custom || {};
      const lat = context.lat ? parseFloat(context.lat) : undefined;
      const lng = context.lng ? parseFloat(context.lng) : undefined;
      const gpsAccuracy = context.gps_accuracy ? parseFloat(context.gps_accuracy) : undefined;
      const capturedAt = context.captured_at || payload.created_at || new Date().toISOString();

      // Run asset pipeline
      const pipelineResult = await runAssetPipeline(
        {
          id: assetId,
          shortId,
          publicId,
          version: payload.version,
          secureUrl: payload.secure_url || payload.url || "",
          resourceType: (payload.resource_type as any) || "image",
          format: payload.format,
          bytes: payload.bytes,
          width: payload.width,
          height: payload.height,
          capturedAt,
          uploadedAt: new Date().toISOString(),
          location: lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng, accuracy: gpsAccuracy } : undefined,
          exif: payload.image_metadata,
          phash: payload.phash,
          tags: payload.tags || [],
          qualityScore: payload.quality_analysis?.focus ?? 0.9,
          uploaderId: context.uploader_id
        },
        {
          sites: store.getSites(),
          projects: store.getProjects(),
          milestones: store.getMilestones(),
          existingAssets: store.getAssets()
        }
      );

      // Save processed asset to store
      const saved = store.insertAsset(pipelineResult.asset as any);

      // Record derivative URLs
      store.recordDerivative({
        id: `der-${Date.now()}-thumb`,
        assetId: saved.id,
        assetVersion: saved.cldVersion,
        transformation: "t_sk_thumb",
        url: buildThumbnailUrl({ publicId: saved.cldPublicId, version: saved.cldVersion }),
        purpose: "thumb",
        createdAt: new Date().toISOString()
      });

      store.recordDerivative({
        id: `der-${Date.now()}-report`,
        assetId: saved.id,
        assetVersion: saved.cldVersion,
        transformation: "t_sk_report",
        url: buildReportUrl({ publicId: saved.cldPublicId, version: saved.cldVersion }),
        purpose: "report",
        createdAt: new Date().toISOString()
      });

      store.recordDerivative({
        id: `der-${Date.now()}-pub`,
        assetId: saved.id,
        assetVersion: saved.cldVersion,
        transformation: "t_sk_public",
        url: buildPublicUrl({ publicId: saved.cldPublicId, version: saved.cldVersion }),
        purpose: "public",
        createdAt: new Date().toISOString()
      });

      // If before/after candidate found, record pair
      if (pipelineResult.pairCandidate) {
        store.insertPair({
          id: `pair-${Date.now()}`,
          siteId: pipelineResult.pairCandidate.afterAsset.siteId,
          milestoneId: pipelineResult.pairCandidate.afterAsset.milestoneId,
          beforeAssetId: pipelineResult.pairCandidate.beforeAsset.id,
          afterAssetId: pipelineResult.pairCandidate.afterAsset.id,
          score: pipelineResult.pairCandidate.score,
          source: "auto",
          compositeUrl: saved.secureUrl,
          change: {
            changes: [
              { type: "improved", object: "milestone progress", evidence: "Significant visual change detected between captures." }
            ],
            summary: "Automated candidate pairing detected based on temporal gap and visual similarity.",
            confidence: 0.9
          }
        });
      }

      return NextResponse.json({
        ok: true,
        assetId: saved.id,
        shortId: saved.shortId,
        status: saved.status,
        trustScore: saved.trustScore
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Cloudinary webhook error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 500 });
  }
}
