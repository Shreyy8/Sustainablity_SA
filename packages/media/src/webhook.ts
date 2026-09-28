import { cld } from "./client.js";

export interface CldNotification {
  notification_type: "upload" | "eager" | "info" | "moderation";
  asset_id: string;
  public_id: string;
  version: number;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resource_type?: string;
  created_at?: string;
  tags?: string[];
  phash?: string;
  secure_url?: string;
  url?: string;
  image_metadata?: Record<string, unknown>;
  info?: {
    detection?: {
      coco_v2?: {
        data?: Array<{
          label: string;
          confidence: number;
          box: number[];
        }>;
      };
    };
    ocr?: {
      adv_ocr?: {
        data?: Array<{
          textAnnotations?: Array<{ description: string }>;
        }>;
      };
    };
  };
  quality_analysis?: {
    focus?: number;
    noise?: number;
    exposure?: number;
    color?: number;
  };
  context?: {
    custom?: Record<string, string>;
  };
  metadata?: Record<string, unknown>;
  info_kind?: string;
}

export function verifyWebhookSignature(
  rawBody: string,
  headers: {
    timestamp?: string | number | null;
    signature?: string | null;
  },
  apiSecret?: string
): boolean {
  const secret = apiSecret || process.env.CLOUDINARY_API_SECRET;
  if (!secret || secret === "mock-api-secret") {
    // In local / test mode without real secrets configured, allow verified simulation
    return true;
  }

  const ts = Number(headers.timestamp);
  const sig = headers.signature || "";

  if (!ts || !sig) return false;

  try {
    return cld.utils.verifyNotificationSignature(rawBody, ts, sig, 600);
  } catch (err) {
    return false;
  }
}
