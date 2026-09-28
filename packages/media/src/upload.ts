import { cld } from "./client.js";

export interface UploadContext {
  lat?: number;
  lng?: number;
  gpsAccuracy?: number;
  capturedAt?: string;
  uploaderId?: string;
}

export interface BuildUploadParamsInput {
  corporateSlug: string;
  ngoSlug: string;
  projectSlug: string;
  siteSlug?: string;
  projectId: string;
  siteId?: string;
  milestoneId?: string;
  geo?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  uploaderId?: string;
  isVideo?: boolean;
}

export const PRESET_IMAGE = "pluribus_field_signed";
export const PRESET_VIDEO = "pluribus_video_signed";

export function buildAssetFolder(input: {
  corporateSlug: string;
  ngoSlug: string;
  projectSlug: string;
  siteSlug?: string;
}): string {
  const parts = ["pluribus", input.corporateSlug, input.ngoSlug, input.projectSlug];
  if (input.siteSlug) parts.push(input.siteSlug);
  return parts.join("/");
}

export function buildUploadParams(input: BuildUploadParamsInput) {
  const folder = buildAssetFolder(input);
  const tags = [`sk:project:${input.projectId}`, "sk:pending"];

  if (input.siteId) {
    tags.push(`sk:site:${input.siteId}`);
  }
  if (input.milestoneId) {
    tags.push(`sk:milestone:${input.milestoneId}`);
  }

  const context: Record<string, string> = {
    captured_at: new Date().toISOString()
  };

  if (input.geo) {
    context.lat = input.geo.latitude.toString();
    context.lng = input.geo.longitude.toString();
    if (input.geo.accuracy !== undefined) {
      context.gps_accuracy = input.geo.accuracy.toString();
    }
  }

  if (input.uploaderId) {
    context.uploader_id = input.uploaderId;
  }

  const metadata: Record<string, string | number> = {
    sk_project: input.projectId
  };

  if (input.siteId) metadata.sk_site = input.siteId;
  if (input.milestoneId) metadata.sk_milestone = input.milestoneId;
  if (input.geo) {
    metadata.sk_lat = input.geo.latitude;
    metadata.sk_lng = input.geo.longitude;
  }

  return {
    uploadPreset: input.isVideo ? PRESET_VIDEO : PRESET_IMAGE,
    folder,
    tags,
    context,
    metadata
  };
}

export function signUploadRequest(
  paramsToSign: Record<string, any>,
  apiSecret?: string
): string {
  const secret = apiSecret || process.env.CLOUDINARY_API_SECRET || "mock-api-secret";
  return cld.utils.api_sign_request(paramsToSign, secret);
}
