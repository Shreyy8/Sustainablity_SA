import type { CheckResult } from "./duplicate.js";

const KNOWN_EDITORS = [
  "photoshop",
  "snapseed",
  "canva",
  "lightroom",
  "gimp",
  "pixlr",
  "vsco",
  "facetune",
  "picsart",
  "adobe",
  "afterlight"
];

export function exifCheck(
  exif: Record<string, unknown> | null | undefined
): CheckResult | null {
  if (!exif || Object.keys(exif).length === 0) {
    return {
      id: "exif",
      penalty: 5,
      severity: "info",
      reason: "Missing EXIF metadata: camera sensor and hardware shooting parameters unavailable",
      evidence: { hasExif: false }
    };
  }

  // Check software field
  const software = String(
    exif.Software || exif.software || exif["Software"] || ""
  ).toLowerCase();

  for (const editor of KNOWN_EDITORS) {
    if (software.includes(editor)) {
      return {
        id: "exif",
        penalty: 10,
        severity: "warning",
        reason: `Tamper / editing signature: image EXIF metadata indicates software modification via ${software}`,
        evidence: { software }
      };
    }
  }

  return null;
}
