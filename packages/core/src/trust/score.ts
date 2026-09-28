import { duplicateCheck, type CheckResult, type PhashMatch, type DuplicateCheckAsset } from "./checks/duplicate.js";
import { geofenceCheck, type GeofenceCheckSite, type GeofenceCheckLocation } from "./checks/geofence.js";
import { timeCheck, type TimeCheckAsset, type TimeCheckGrant } from "./checks/time.js";
import { exifCheck } from "./checks/exif.js";
import { syntheticCheck, type SyntheticCheckInput } from "./checks/synthetic.js";

export type TrustBand = "verified" | "review" | "flagged";

export interface TrustScoreInput {
  asset: DuplicateCheckAsset & TimeCheckAsset & {
    exif?: Record<string, unknown>;
    location?: GeofenceCheckLocation;
  };
  site?: GeofenceCheckSite | null;
  grant?: TimeCheckGrant | null;
  phashMatches?: PhashMatch[];
  synthetic?: SyntheticCheckInput | null;
}

export interface TrustScoreOutput {
  score: number;
  band: TrustBand;
  checks: CheckResult[];
  passed: boolean;
}

export function computeTrustScore(input: TrustScoreInput): TrustScoreOutput {
  const checks: CheckResult[] = [];

  // 1. Duplicate check
  const dup = duplicateCheck(input.phashMatches, input.asset);
  if (dup) checks.push(dup);

  // 2. Geofence check
  const geo = geofenceCheck(input.site, input.asset.location);
  if (geo) checks.push(geo);

  // 3. Time check
  const time = timeCheck(input.asset, input.grant);
  if (time) checks.push(time);

  // 4. EXIF check
  const exif = exifCheck(input.asset.exif);
  if (exif) checks.push(exif);

  // 5. Synthetic check
  const synth = syntheticCheck(input.synthetic);
  if (synth) checks.push(synth);

  // Sum total penalties
  const totalPenalty = checks.reduce((sum, c) => sum + c.penalty, 0);
  const score = Math.max(0, Math.min(100, 100 - totalPenalty));

  let band: TrustBand = "verified";
  if (score < 50) {
    band = "flagged";
  } else if (score < 75) {
    band = "review";
  }

  return {
    score,
    band,
    checks,
    passed: score >= 75
  };
}
