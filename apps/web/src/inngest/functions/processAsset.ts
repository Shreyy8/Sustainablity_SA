import { inngest } from "../client";
import { runAssetPipeline, type PipelineAssetInput } from "@pluribus/core";
import { store } from "@pluribus/db";
import { buildThumbnailUrl, buildReportUrl, buildPublicUrl, updateAssetMetadata } from "@pluribus/media";

export const processAssetFunction = inngest.createFunction(
  {
    id: "process-asset-pipeline",
    name: "Process Ingested Media Asset",
    concurrency: { limit: 10 },
    retries: 3,
    triggers: [{ event: "asset/uploaded" }]
  },
  async ({ event, step }) => {
    const assetInput = event.data.asset as PipelineAssetInput;

    // Step 1: Execute complete pipeline analysis (Enrichment, Vision, Assignment, Trust & Verification)
    const pipelineResult = await step.run("pipeline-analysis", async () => {
      const sites = store.getSites();
      const projects = store.getProjects();
      const milestones = store.getMilestones();
      const existingAssets = store.getAssets();

      return await runAssetPipeline(assetInput, {
        sites,
        projects,
        milestones,
        existingAssets
      });
    });

    // Step 2: Persist processed asset to database
    const savedAsset = await step.run("persist-asset", async () => {
      return store.insertAsset(pipelineResult.asset as any);
    });

    // Step 3: Record Cloudinary named transformation derivatives
    await step.run("record-derivatives", async () => {
      const thumbUrl = buildThumbnailUrl({ publicId: savedAsset.cldPublicId, version: savedAsset.cldVersion });
      const reportUrl = buildReportUrl({ publicId: savedAsset.cldPublicId, version: savedAsset.cldVersion });
      const pubUrl = buildPublicUrl({ publicId: savedAsset.cldPublicId, version: savedAsset.cldVersion });

      store.recordDerivative({
        id: `der-${Date.now()}-thumb`,
        assetId: savedAsset.id,
        assetVersion: savedAsset.cldVersion,
        transformation: "t_sk_thumb",
        url: thumbUrl,
        purpose: "thumb",
        createdAt: new Date().toISOString()
      });

      store.recordDerivative({
        id: `der-${Date.now()}-report`,
        assetId: savedAsset.id,
        assetVersion: savedAsset.cldVersion,
        transformation: "t_sk_report",
        url: reportUrl,
        purpose: "report",
        createdAt: new Date().toISOString()
      });

      store.recordDerivative({
        id: `der-${Date.now()}-pub`,
        assetId: savedAsset.id,
        assetVersion: savedAsset.cldVersion,
        transformation: "t_sk_public",
        url: pubUrl,
        purpose: "public",
        createdAt: new Date().toISOString()
      });

      return { thumbUrl, reportUrl, pubUrl };
    });

    // Step 4: Write back structured metadata & tags to Cloudinary DAM
    await step.run("writeback-cloudinary-metadata", async () => {
      try {
        await updateAssetMetadata({
          publicId: savedAsset.cldPublicId,
          metadata: {
            sk_project: savedAsset.projectId || "",
            sk_site: savedAsset.siteId || "",
            sk_milestone: savedAsset.milestoneId || "",
            sk_trust: savedAsset.trustScore,
            sk_trust_band: savedAsset.trustBand,
            sk_status: savedAsset.status
          },
          tagsToAdd: [
            ...(savedAsset.tags || []),
            ...(savedAsset.activities?.map((a: string) => `sk:activity:${a}`) || [])
          ],
          tagsToRemove: ["sk:pending"]
        });
        return { success: true };
      } catch (err: any) {
        console.warn("Could not write back to live Cloudinary (mock environment):", err.message);
        return { success: false, reason: err.message };
      }
    });

    // Step 5: Before / After candidate pairing
    if (pipelineResult.pairCandidate) {
      await step.run("create-before-after-pair", async () => {
        const pair = store.insertPair({
          id: `pair-${Date.now()}`,
          siteId: pipelineResult.pairCandidate!.afterAsset.siteId || "",
          milestoneId: pipelineResult.pairCandidate!.afterAsset.milestoneId,
          beforeAssetId: pipelineResult.pairCandidate!.beforeAsset.id,
          afterAssetId: pipelineResult.pairCandidate!.afterAsset.id,
          score: pipelineResult.pairCandidate!.score,
          source: "auto",
          compositeUrl: savedAsset.secureUrl,
          change: {
            changes: [
              {
                type: "improved",
                object: "milestone progress",
                evidence: "Automated candidate pairing detected significant visual advancement between baseline and completion."
              }
            ],
            summary: "Automated before/after candidate pairing based on temporal gap and visual similarity.",
            confidence: 0.9
          }
        });
        return pair;
      });
    }

    return {
      success: true,
      assetId: savedAsset.id,
      shortId: savedAsset.shortId,
      status: savedAsset.status,
      trustScore: savedAsset.trustScore
    };
  }
);
