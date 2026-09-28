import { NextResponse } from "next/server";
import { store } from "@saakshi/db";
import { selectEvidenceForReport, buildFactsBundle, validateCitations } from "@saakshi/core";
import { generateReportNarrative } from "@saakshi/ai";

export async function GET() {
  const reports = store.getReports();
  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const template = body.template || "Quarterly Funder Update";
    const period = body.period || "Q4 FY 2025-26";
    const corporateName = body.corporateName || "Tata Sustainability Trust";
    const projectIds: string[] = body.projectIds || store.getProjects().map((p) => p.id);

    // 1. Select High-Trust Evidence with Greedy MMR Diversity
    const allAssets = store.getAssets();
    const projectAssets = allAssets.filter((a) => !a.projectId || projectIds.includes(a.projectId));

    const selectedAssets = selectEvidenceForReport(
      projectAssets.map((a) => ({
        id: a.id,
        shortId: a.shortId,
        projectId: a.projectId || "proj-1",
        siteId: a.siteId || "site-1",
        milestoneId: a.milestoneId,
        trustScore: a.trustScore,
        qualityScore: a.qualityScore,
        status: a.status,
        url: a.secureUrl,
        capturedAt: a.capturedAt,
        caption: a.caption
      })),
      { minTrustScore: 75, maxAssetsPerProject: 6 }
    );

    // 2. Assemble Structured Facts Bundle
    const projects = store.getProjects().filter((p) => projectIds.includes(p.id));
    const factsProjects = projects.map((p) => {
      const pMilestones = store.getMilestones(p.id);
      const pAssets = selectedAssets.filter((a) => a.projectId === p.id);

      return {
        id: p.id,
        name: p.name,
        state: p.state,
        district: p.district,
        evidencedAssetCount: pAssets.length,
        avgTrustScore: pAssets.length > 0 ? Math.round(pAssets.reduce((s, a) => s + a.trustScore, 0) / pAssets.length) : 95,
        milestones: pMilestones.map((m) => ({
          id: m.id,
          name: m.name,
          expectedDate: m.expectedDate,
          evidenced: pAssets.some((a) => a.milestoneId === m.id),
          evidenceAssetCount: pAssets.filter((a) => a.milestoneId === m.id).length
        }))
      };
    });

    const factsAssets = selectedAssets.map((a) => {
      const site = store.getSiteById(a.siteId);
      const milestone = a.milestoneId ? store.getMilestoneById(a.milestoneId) : undefined;
      return {
        id: a.id,
        shortId: a.shortId,
        caption: a.caption || "Verified photographic evidence",
        capturedAt: String(a.capturedAt),
        siteName: site?.name || "Field site",
        milestoneName: milestone?.name,
        trustScore: a.trustScore,
        activities: []
      };
    });

    const factsBundle = buildFactsBundle({
      corporateName,
      period,
      projects: factsProjects,
      assets: factsAssets
    });

    // 3. Grounded Narrative Generation
    const narrativeResult = await generateReportNarrative(factsBundle);

    // 4. Citation Validation
    const validAssetIds = new Set(selectedAssets.map((a) => a.shortId).concat(selectedAssets.map((a) => a.id)));
    const fullText = `${narrativeResult.executiveSummary} ${Object.values(narrativeResult.projectNarratives).join(" ")}`;
    const validation = validateCitations(fullText, validAssetIds);

    // 5. Create Report Record
    const reportId = `rep-${Date.now()}`;
    const newReport = store.insertReport({
      id: reportId,
      title: `${template} — ${period}`,
      period,
      corporateName,
      template,
      templateVersion: "v1.0",
      scope: { projectIds },
      status: "draft",
      summaryNarrative: narrativeResult.executiveSummary,
      assetIds: selectedAssets.map((a) => a.id),
      pdfPublicId: `saakshi/reports/${reportId}`,
      pdfUrl: `https://res.cloudinary.com/saakshi-demo/image/upload/v1/saakshi/reports/${reportId}.pdf`,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      report: newReport,
      narrative: narrativeResult,
      citationValidation: validation,
      factsBundle,
      selectedAssets
    });
  } catch (err: any) {
    console.error("Report generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate report" }, { status: 500 });
  }
}
