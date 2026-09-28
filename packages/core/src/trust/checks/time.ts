import type { CheckResult } from "./duplicate.js";

export interface TimeCheckAsset {
  capturedAt?: string | Date;
  exifTakenAt?: string | Date;
}

export interface TimeCheckGrant {
  startDate?: string | Date;
  endDate?: string | Date;
  title?: string;
}

export function timeCheck(
  asset: TimeCheckAsset,
  grant?: TimeCheckGrant | null
): CheckResult | null {
  const now = Date.now();

  // 1. Future date check
  if (asset.exifTakenAt) {
    const exifTime = new Date(asset.exifTakenAt).getTime();
    if (exifTime > now + 3600 * 1000) {
      // 1 hour buffer for timezone skew
      return {
        id: "time",
        penalty: 20,
        severity: "critical",
        reason: "Anachronistic timestamp: EXIF recording date is in the future",
        evidence: { exifTakenAt: asset.exifTakenAt }
      };
    }
  }

  // 2. EXIF vs device submission time discrepancy (>48 hours)
  if (asset.exifTakenAt && asset.capturedAt) {
    const exifTime = new Date(asset.exifTakenAt).getTime();
    const deviceTime = new Date(asset.capturedAt).getTime();
    const diffHours = Math.abs(exifTime - deviceTime) / (1000 * 60 * 60);

    if (diffHours > 48) {
      const daysDiff = (diffHours / 24).toFixed(1);
      return {
        id: "time",
        penalty: 10,
        severity: "warning",
        reason: `Timestamp mismatch: camera EXIF date differs from device submission timestamp by ${daysDiff} days`,
        evidence: {
          exifTakenAt: asset.exifTakenAt,
          capturedAt: asset.capturedAt,
          differenceHours: diffHours
        }
      };
    }
  }

  // 3. Capture outside active grant period
  if (grant && (grant.startDate || grant.endDate)) {
    const checkDate = asset.exifTakenAt || asset.capturedAt;
    if (checkDate) {
      const timeMs = new Date(checkDate).getTime();
      const startMs = grant.startDate ? new Date(grant.startDate).getTime() : 0;
      const endMs = grant.endDate ? new Date(grant.endDate).getTime() : Infinity;

      if (timeMs < startMs || timeMs > endMs) {
        return {
          id: "time",
          penalty: 20,
          severity: "warning",
          reason: `Out-of-period capture: photo was captured outside active grant timeframe (${grant.startDate || "start"} to ${grant.endDate || "ongoing"})`,
          evidence: {
            photoDate: checkDate,
            grantStart: grant.startDate,
            grantEnd: grant.endDate
          }
        };
      }
    }
  }

  return null;
}
