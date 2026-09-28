import { cld } from "./client.js";

export interface AssetRef {
  publicId: string;
  version?: number | string;
  format?: string;
  secureUrl?: string;
}

export function buildThumbnailUrl(asset: AssetRef): string {
  if (asset.secureUrl && !asset.publicId) return asset.secureUrl;
  return cld.url(asset.publicId, {
    version: asset.version,
    transformation: [{ transformation: "sk_thumb" }],
    secure: true
  });
}

export function buildReportUrl(asset: AssetRef): string {
  if (asset.secureUrl && !asset.publicId) return asset.secureUrl;
  return cld.url(asset.publicId, {
    version: asset.version,
    transformation: [{ transformation: "sk_report" }],
    format: "jpg",
    secure: true
  });
}

export function buildPublicUrl(asset: AssetRef): string {
  if (asset.secureUrl && !asset.publicId) return asset.secureUrl;
  return cld.url(asset.publicId, {
    version: asset.version,
    transformation: [{ transformation: "sk_public" }],
    secure: true
  });
}

export function buildStampedReportUrl(
  asset: AssetRef,
  stamp: { projectName: string; date: string; shortId: string }
): string {
  const stampText = `${stamp.projectName} · ${stamp.date} · #${stamp.shortId}`;
  return cld.url(asset.publicId, {
    version: asset.version,
    transformation: [
      { transformation: "sk_report" },
      {
        overlay: {
          font_family: "Arial",
          font_size: 22,
          font_weight: "bold",
          text: stampText
        },
        color: "white",
        background: "rgb:00000080"
      },
      {
        flags: "layer_apply",
        gravity: "south_east",
        x: 16,
        y: 16
      }
    ],
    format: "jpg",
    secure: true,
    sign_url: true
  });
}

export interface CompositeOptions {
  width?: number;
  height?: number;
  beforeDate: string;
  afterDate: string;
  blurFaces?: boolean;
}

export function buildCompositeUrl(
  before: AssetRef,
  after: AssetRef,
  options: CompositeOptions
): string {
  const w = options.width ?? 800;
  const h = options.height ?? 600;
  const afterOverlayId = after.publicId.replaceAll("/", ":");

  const transformations: any[] = [
    { crop: "fill", gravity: "auto", width: w, height: h },
    { crop: "pad", width: w * 2, height: h, gravity: "west", background: "black" },
    { overlay: afterOverlayId, crop: "fill", gravity: "auto", width: w, height: h },
    { flags: "layer_apply", gravity: "east" },
    {
      overlay: {
        font_family: "Arial",
        font_size: 32,
        font_weight: "bold",
        text: `BEFORE · ${options.beforeDate}`
      },
      color: "white",
      background: "rgb:00000099"
    },
    { flags: "layer_apply", gravity: "north_west", x: 16, y: 16 },
    {
      overlay: {
        font_family: "Arial",
        font_size: 32,
        font_weight: "bold",
        text: `AFTER · ${options.afterDate}`
      },
      color: "white",
      background: "rgb:00000099"
    },
    { flags: "layer_apply", gravity: "north_east", x: 16, y: 16 }
  ];

  if (options.blurFaces !== false) {
    transformations.push({ effect: "blur_faces" });
  }

  transformations.push({ quality: "auto" });

  return cld.url(before.publicId, {
    version: before.version,
    sign_url: true,
    secure: true,
    format: "jpg",
    transformation: transformations
  });
}

export interface ReelBeat {
  publicId: string;
  durationSeconds: number;
  headline?: string;
  resourceType?: "video" | "image";
}

export function buildReelVideoUrl(
  beats: ReelBeat[],
  brand?: { logoPublicId?: string; headline?: string }
): string {
  if (beats.length === 0) return "";
  const firstBeat = beats[0];

  const transformations: any[] = [
    { crop: "fill", gravity: "auto", aspect_ratio: "9:16", width: 1080, duration: firstBeat.durationSeconds }
  ];

  for (let i = 1; i < beats.length; i++) {
    const beat = beats[i];
    const layerId = beat.publicId.replaceAll("/", ":");
    const isVid = beat.resourceType === "video";

    transformations.push({
      overlay: isVid ? `video:${layerId}` : layerId,
      crop: "fill",
      gravity: "auto",
      aspect_ratio: "9:16",
      width: 1080,
      duration: beat.durationSeconds
    });
    transformations.push({ flags: "splice" });
    transformations.push({ flags: "layer_apply" });
  }

  if (brand?.headline) {
    transformations.push({
      overlay: {
        font_family: "Montserrat",
        font_size: 48,
        font_weight: "bold",
        text: brand.headline
      },
      color: "white"
    });
    transformations.push({ flags: "layer_apply", gravity: "south", y: 180 });
  }

  transformations.push({ effect: "blur_faces" });
  transformations.push({ quality: "auto" });

  return cld.url(firstBeat.publicId, {
    resource_type: "video",
    format: "mp4",
    secure: true,
    transformation: transformations
  });
}
