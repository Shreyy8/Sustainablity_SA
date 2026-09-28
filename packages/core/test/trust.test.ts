import { describe, it, expect } from "vitest";
import {
  computeTrustScore,
  duplicateCheck,
  geofenceCheck,
  timeCheck,
  exifCheck,
  scoreAssignment,
  findPairCandidates,
  validateCitations,
  stripUncitedClaims
} from "../src/index.js";

describe("Trust Score Engine", () => {
  const baseAsset = {
    id: "asset-1",
    shortId: "A1",
    projectId: "proj-1",
    siteId: "site-1",
    milestoneId: "m-1",
    capturedAt: new Date("2026-03-15T10:00:00Z"),
    exifTakenAt: new Date("2026-03-15T10:00:00Z"),
    exif: { Make: "Samsung", Model: "Galaxy M32" },
    location: { latitude: 25.751, longitude: 71.398 }
  };

  const sampleSite = {
    id: "site-1",
    name: "Barmer Primary School Site",
    // Polygon around 25.750, 71.395
    geofence: [
      [25.748, 71.393] as [number, number],
      [25.755, 71.393] as [number, number],
      [25.755, 71.402] as [number, number],
      [25.748, 71.402] as [number, number]
    ]
  };

  const sampleGrant = {
    title: "Rajasthan WASH Initiative",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  };

  it("should award score 100 and 'verified' band for clean field evidence", () => {
    const result = computeTrustScore({
      asset: baseAsset,
      site: sampleSite,
      grant: sampleGrant,
      phashMatches: []
    });

    expect(result.score).toBe(100);
    expect(result.band).toBe("verified");
    expect(result.passed).toBe(true);
    expect(result.checks.length).toBe(0);
  });

  it("should NOT penalize same-site rapid burst shots within 24 hours", () => {
    const burstMatch = {
      matchAssetId: "asset-burst",
      hamming: 2, // very low distance = nearly identical image
      projectId: "proj-1",
      siteId: "site-1",
      milestoneId: "m-1",
      capturedAt: new Date("2026-03-15T10:00:15Z"), // 15 seconds apart
      shortId: "ABURST"
    };

    const result = duplicateCheck([burstMatch], baseAsset);
    expect(result).not.toBeNull();
    expect(result?.penalty).toBe(0);
    expect(result?.severity).toBe("info");
    expect(result?.reason).toContain("Burst sequence shot");
  });

  it("should penalize 60 and flag exact duplicate from another project/site", () => {
    const reusedMatch = {
      matchAssetId: "asset-old",
      hamming: 2,
      projectId: "different-proj",
      siteId: "different-site",
      capturedAt: new Date("2025-01-10T10:00:00Z"),
      shortId: "AOLD"
    };

    const result = computeTrustScore({
      asset: baseAsset,
      site: sampleSite,
      grant: sampleGrant,
      phashMatches: [reusedMatch]
    });

    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.band).toBe("flagged");
    expect(result.passed).toBe(false);
    expect(result.checks.some((c) => c.id === "duplicate" && c.penalty === 60)).toBe(true);
  });

  it("should penalize 25 for major geofence violation (>1km outside site)", () => {
    const farAsset = {
      ...baseAsset,
      location: { latitude: 25.85, longitude: 71.55 } // ~15km away
    };

    const result = computeTrustScore({
      asset: farAsset,
      site: sampleSite,
      grant: sampleGrant
    });

    expect(result.score).toBe(75);
    expect(result.checks.some((c) => c.id === "geofence" && c.penalty === 25)).toBe(true);
  });

  it("should penalize 10 for edited image with Photoshop EXIF Software tag", () => {
    const editedAsset = {
      ...baseAsset,
      exif: { Software: "Adobe Photoshop Lightroom 2024" }
    };

    const result = computeTrustScore({
      asset: editedAsset,
      site: sampleSite,
      grant: sampleGrant
    });

    expect(result.score).toBe(90);
    expect(result.checks.some((c) => c.id === "exif" && c.penalty === 10)).toBe(true);
  });

  it("should penalize 20 when capture date is outside grant timeframe", () => {
    const outOfPeriodAsset = {
      ...baseAsset,
      capturedAt: new Date("2024-05-10T10:00:00Z"),
      exifTakenAt: new Date("2024-05-10T10:00:00Z")
    };

    const result = computeTrustScore({
      asset: outOfPeriodAsset,
      site: sampleSite,
      grant: sampleGrant
    });

    expect(result.score).toBe(80);
    expect(result.checks.some((c) => c.id === "time" && c.penalty === 20)).toBe(true);
  });
});

describe("Auto-assignment Engine", () => {
  const site = {
    id: "site-1",
    projectId: "proj-1",
    name: "Barmer Primary School",
    geofence: [
      [25.748, 71.393] as [number, number],
      [25.755, 71.393] as [number, number],
      [25.755, 71.402] as [number, number],
      [25.748, 71.402] as [number, number]
    ]
  };

  const project = {
    id: "proj-1",
    name: "Barmer Clean Water & Sanitation",
    activities: ["borewell_handpump", "handwashing_station"]
  };

  const milestones = [
    {
      id: "m-1",
      projectId: "proj-1",
      name: "Hand Pump Commissioning",
      expectedDate: "2026-03-20",
      expectedSignals: ["handpump", "borewell", "platform"]
    }
  ];

  it("should auto-assign when geofence matches and activity matches (score >= 0.75)", () => {
    const asset = {
      location: { latitude: 25.751, longitude: 71.398 }, // inside geofence
      capturedAt: "2026-03-18",
      activities: ["borewell_handpump"],
      tags: ["handpump", "water", "concrete"]
    };

    const assignment = scoreAssignment(asset, site, project, milestones);
    expect(assignment.score).toBeGreaterThanOrEqual(0.75);
    expect(assignment.autoAssign).toBe(true);
    expect(assignment.siteId).toBe("site-1");
    expect(assignment.milestoneId).toBe("m-1");
  });

  it("should reject auto-assignment when outside geofence buffer", () => {
    const asset = {
      location: { latitude: 26.5, longitude: 72.5 }, // far away
      capturedAt: "2026-03-18",
      activities: ["borewell_handpump"]
    };

    const assignment = scoreAssignment(asset, site, project, milestones);
    expect(assignment.score).toBeLessThan(0.75);
    expect(assignment.autoAssign).toBe(false);
  });
});

describe("Before/After Pairing Engine", () => {
  it("should pair assets >= 14 days apart with overlapping activities at the same site", () => {
    const beforeAsset = {
      id: "asset-before",
      shortId: "BEF1",
      siteId: "site-1",
      capturedAt: "2026-01-10",
      activities: ["toilet_block"],
      trustScore: 90
    };

    const afterAsset = {
      id: "asset-after",
      shortId: "AFT1",
      siteId: "site-1",
      capturedAt: "2026-03-25", // ~74 days later
      activities: ["toilet_block"],
      trustScore: 95
    };

    const pairs = findPairCandidates(afterAsset, [beforeAsset]);
    expect(pairs.length).toBe(1);
    expect(pairs[0].beforeAsset.id).toBe("asset-before");
    expect(pairs[0].afterAsset.id).toBe("asset-after");
    expect(pairs[0].timeGapDays).toBeGreaterThanOrEqual(14);
    expect(pairs[0].isAutoCandidate).toBe(true);
  });
});

describe("Report Citation Validator", () => {
  const validIds = new Set(["AST-101", "AST-102", "AST-103"]);

  it("should pass text where every claim is properly cited", () => {
    const narrative =
      "In Q1 2026, the team completed 2 new handwashing stations in Barmer [asset:AST-101]. " +
      "Over 450 school children now have clean access to drinking water and soap dispensers [asset:AST-102]. " +
      "Community participation was high throughout.";

    const result = validateCitations(narrative, validIds);
    expect(result.ok).toBe(true);
    expect(result.invalidSentences.length).toBe(0);
    expect(result.referencedAssetIds).toContain("AST-101");
    expect(result.referencedAssetIds).toContain("AST-102");
  });

  it("should catch and flag sentences containing unsupported numbers or claims", () => {
    const hallucinatedNarrative =
      "In Q1 2026, the team completed 2 new handwashing stations [asset:AST-101]. " +
      "We also constructed 15 new borewells across 8 villages without delay."; // No citation!

    const result = validateCitations(hallucinatedNarrative, validIds);
    expect(result.ok).toBe(false);
    expect(result.invalidSentences.length).toBe(1);
    expect(result.invalidSentences[0]).toContain("15 new borewells");
  });

  it("should strip uncited claims cleanly", () => {
    const mixed =
      "Clean water was made available. " +
      "We built 10 classrooms across the district. " + // uncited claim
      "The sanitation block was renovated with running water [asset:AST-103].";

    const cleaned = stripUncitedClaims(mixed, validIds);
    expect(cleaned).toContain("Clean water was made available.");
    expect(cleaned).toContain("[asset:AST-103]");
    expect(cleaned).not.toContain("built 10 classrooms");
  });
});
