import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const grantId = searchParams.get("grantId") || undefined;

    let projects = store.getProjects();
    if (grantId) {
      projects = projects.filter((p) => p.grantId === grantId);
    }

    const assets = store.getAssets();

    const enriched = projects.map((p) => {
      const pMilestones = store.getMilestones(p.id);
      const pSites = store.getSites(p.id);
      const pAssets = assets.filter((a) => a.projectId === p.id);
      const grant = store.getGrantById(p.grantId);

      const evidencedCount = pMilestones.filter((m) =>
        pAssets.some((a) => a.milestoneId === m.id && a.trustBand === "verified")
      ).length;

      const coverage =
        pMilestones.length > 0 ? Math.round((evidencedCount / pMilestones.length) * 100) : 0;
      const avgTrust =
        pAssets.length > 0
          ? Math.round(pAssets.reduce((s, a) => s + a.trustScore, 0) / pAssets.length)
          : 100;

      return {
        ...p,
        grant,
        sites: pSites,
        milestones: pMilestones,
        stats: {
          totalMilestones: pMilestones.length,
          evidencedMilestones: evidencedCount,
          coveragePercent: coverage,
          totalAssets: pAssets.length,
          avgTrustScore: avgTrust
        }
      };
    });

    return NextResponse.json({ projects: enriched, count: enriched.length });
  } catch (err: any) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      grantId,
      district,
      state,
      activities,
      budgetInr,
      siteName,
      centroid,
      milestones: customMilestones
    } = body;

    if (!name || !district || !state) {
      return NextResponse.json(
        { error: "Missing required fields: name, district, state" },
        { status: 400 }
      );
    }

    const projectId = `proj-${Date.now().toString(36)}`;
    const effectiveGrantId = grantId || store.getGrants()[0]?.id || "grant-tata-01";

    // 1. Insert Project
    const newProject = store.insertProject({
      id: projectId,
      grantId: effectiveGrantId,
      name,
      description: body.description || `${name} Section 135 CSR project`,
      activities: activities && activities.length > 0 ? activities : ["rural_infrastructure"],
      state,
      district,
      cldFolder: `pluribus/projects/${projectId}`,
      budgetInr: budgetInr ? Number(budgetInr) : 5000000,
      createdAt: new Date().toISOString()
    });

    // 2. Insert Default / Specified Site
    const lat = centroid && centroid[0] ? Number(centroid[0]) : 25.75;
    const lng = centroid && centroid[1] ? Number(centroid[1]) : 71.39;
    const delta = 0.005; // ~500m geofence polygon

    const newSite = store.insertSite({
      id: `site-${Date.now().toString(36)}`,
      projectId,
      name: siteName || `${name} Primary Facility`,
      centroid: [lat, lng],
      geofence: [
        [lat - delta, lng - delta],
        [lat - delta, lng + delta],
        [lat + delta, lng + delta],
        [lat + delta, lng - delta]
      ]
    });

    // 3. Insert Milestones
    const milestoneDefs =
      customMilestones && customMilestones.length > 0
        ? customMilestones
        : [
            { name: "Baseline Land & Ground Survey", targetOffsetDays: 30 },
            { name: "Civil Infrastructure & Construction", targetOffsetDays: 90 },
            { name: "Commissioning & Community Handover", targetOffsetDays: 180 }
          ];

    const insertedMilestones = milestoneDefs.map((m: any, idx: number) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (m.targetOffsetDays || 30 * (idx + 1)));
      const dateStr = targetDate.toISOString().split("T")[0];
      return store.insertMilestone({
        id: `ms-${projectId}-${idx + 1}`,
        projectId,
        name: m.name,
        expectedDate: dateStr,
        targetDate: dateStr,
        expectedSignals: ["photographic_survey"],
        questions: ["Is construction verified?"],
        description: m.description || `Deliverable verification for ${m.name}`
      });
    });

    return NextResponse.json({
      success: true,
      project: newProject,
      site: newSite,
      milestones: insertedMilestones
    });
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}
