import { describe, it, expect } from "vitest";
import { store } from "@saakshi/db";
import { runAssetPipeline } from "../src/pipeline/processAsset.js";
import { selectEvidenceForReport, buildFactsBundle, validateCitations } from "../src/report/index.js";
import { generateReportNarrative } from "@saakshi/ai";
import { generateStoryScript } from "../src/story/script.js";
import { buildCompositeUrl, buildReelVideoUrl } from "@saakshi/media";

describe("Backend Store and Pipeline Integration", () => {
  it("should initialize store with realistic Indian CSR data", () => {
    const projects = store.getProjects();
    const sites = store.getSites();
    const grants = store.getGrants();
    const assets = store.getAssets();

    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(sites.length).toBeGreaterThanOrEqual(6);
    expect(grants.length).toBeGreaterThanOrEqual(3);
    expect(assets.length).toBeGreaterThanOrEqual(10);
  });

  it("should process an incoming upload through the full pipeline", async () => {
    const sites = store.getSites();
    const projects = store.getProjects();
    const milestones = store.getMilestones();
    const existingAssets = store.getAssets();

    const incomingUpload = {
      id: "test-pipeline-ast",
      shortId: "TEST-01",
      publicId: "saakshi/demo/test_handpump",
      version: 1711209999,
      secureUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7",
      capturedAt: "2026-03-20T10:00:00Z",
      location: { latitude: 25.7512, longitude: 71.3985 }, // Chohtan site
      tags: ["borewell", "handpump", "water"],
      qualityScore: 0.95
    };

    const result = await runAssetPipeline(incomingUpload, {
      sites,
      projects,
      milestones,
      existingAssets
    });

    expect(result.asset.projectId).toBe("proj-1");
    expect(result.asset.siteId).toBe("site-1");
    expect(result.asset.status).toBe("assigned");
    expect(result.trust.score).toBeGreaterThanOrEqual(75);
    expect(result.trust.band).toBe("verified");
  });

  it("should generate grounded report facts and pass citation verification", async () => {
    const assets = store.getAssets();
    const selected = selectEvidenceForReport(
      assets.map((a) => ({
        id: a.id,
        shortId: a.shortId,
        projectId: a.projectId || "proj-1",
        siteId: a.siteId || "site-1",
        milestoneId: a.milestoneId,
        trustScore: a.trustScore,
        status: a.status,
        capturedAt: a.capturedAt
      })),
      { minTrustScore: 75, maxAssetsPerProject: 4 }
    );

    expect(selected.length).toBeGreaterThan(0);
    // Ensure all selected assets are verified
    selected.forEach((a) => expect(a.trustScore).toBeGreaterThanOrEqual(75));

    const bundle = buildFactsBundle({
      corporateName: "Tata Sustainability Trust",
      period: "Q4 FY25",
      projects: store.getProjects().map((p) => ({
        id: p.id,
        name: p.name,
        milestones: [],
        evidencedAssetCount: 2,
        avgTrustScore: 95
      })),
      assets: selected.map((s) => ({
        id: s.id,
        shortId: s.shortId,
        caption: "Test evidence",
        capturedAt: String(s.capturedAt),
        siteName: "Test Site",
        trustScore: s.trustScore,
        activities: []
      }))
    });

    const narrative = await generateReportNarrative(bundle);
    expect(narrative.executiveSummary).toBeTruthy();

    const validIds = new Set(selected.map((s) => s.shortId).concat(selected.map((s) => s.id)));
    const validation = validateCitations(
      Object.values(narrative.projectNarratives).join(" "),
      validIds
    );

    expect(validation.ok).toBe(true);
    expect(validation.invalidSentences.length).toBe(0);
  });

  it("should generate campaign story beats and valid Cloudinary video URL", () => {
    const project = store.getProjects()[0];
    const assets = store.getAssets({ projectId: project.id });

    const story = generateStoryScript({
      projectName: project.name,
      partnerNgo: "Gramin Vikas Sansthan",
      corporateFunder: "Tata Trust",
      assets: assets.map((a) => ({
        id: a.id,
        shortId: a.shortId,
        url: a.secureUrl,
        caption: a.caption,
        trustScore: a.trustScore
      }))
    });

    expect(story.beats.length).toBe(5);
    expect(story.beats[0].stage).toBe("hook");
    expect(story.beats[4].stage).toBe("cta");
    expect(story.suggestedCopy.linkedin).toContain("#CSRIndia");

    const reelUrl = buildReelVideoUrl(
      story.beats.map((b) => ({
        publicId: "saakshi/demo/clip",
        durationSeconds: b.durationSeconds
      }))
    );

    expect(reelUrl).toContain("fl_splice");
    expect(reelUrl).toContain("e_blur_faces");
  });

  it("should build valid signed before/after composite URL with face blur", () => {
    const url = buildCompositeUrl(
      { publicId: "saakshi/before_image", version: 100 },
      { publicId: "saakshi/after_image", version: 101 },
      { beforeDate: "2025-06-01", afterDate: "2025-10-18", blurFaces: true }
    );

    expect(url).toContain("BEFORE");
    expect(url).toContain("AFTER");
    expect(url).toContain("blur_faces");
  });

  it("should generate full lineage DAG with original, derivatives, pairs, and reports", () => {
    const lineage = store.getLineage("ast-001");
    expect(lineage).not.toBeNull();
    expect(lineage?.asset.id).toBe("ast-001");
    expect(lineage?.derivatives.length).toBeGreaterThan(0);
    expect(lineage?.reports.length).toBeGreaterThan(0);
  });
});
