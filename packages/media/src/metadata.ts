import { cld } from "./client.js";

export interface PluribusStructuredMetadata {
  sk_org_corp?: string;
  sk_org_ngo?: string;
  sk_project?: string;
  sk_site?: string;
  sk_milestone?: string;
  sk_activity?: string[];
  sk_captured_at?: string;
  sk_lat?: number;
  sk_lng?: number;
  sk_trust?: number;
  sk_trust_band?: "verified" | "review" | "flagged";
  sk_consent?: "none" | "verbal" | "written";
  sk_status?: "pending" | "assigned" | "rejected";
}

export async function writeBackMetadata(
  publicId: string,
  metadata: PluribusStructuredMetadata,
  options?: { activityTag?: string }
): Promise<boolean> {
  try {
    if (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== "mock-api-secret") {
      await cld.uploader.update_metadata(metadata as any, [publicId]);

      if (options?.activityTag) {
        await cld.uploader.add_tag(`sk:activity:${options.activityTag}`, [publicId]);
      }
      await cld.uploader.remove_tag("sk:pending", [publicId]);
    }
    return true;
  } catch (err) {
    console.warn(`[Cloudinary Metadata Writeback] Failed for ${publicId}:`, err);
    return false;
  }
}
