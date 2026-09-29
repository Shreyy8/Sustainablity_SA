import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET() {
  try {
    const orgs = store.getOrgs();
    const grants = store.getGrants();
    const projects = store.getProjects();
    const sites = store.getSites();
    const assets = store.getAssets();
    const pairs = store.getPairs();

    // Aggregates
    const totalGrantsInr = grants.reduce((sum, g) => sum + (Number(g.amountInr) || 0), 0);
    const verifiedAssetsCount = assets.filter((a) => a.trustBand === "verified").length;
    const reviewAssetsCount = assets.filter((a) => a.trustBand === "review").length;
    const flaggedAssetsCount = assets.filter((a) => a.trustBand === "flagged").length;

    // Sector breakdown
    const sectorMap: Record<string, { count: number; budgetInr: number }> = {};
    for (const g of grants) {
      const sector = g.scheduleVii || "Other";
      if (!sectorMap[sector]) {
        sectorMap[sector] = { count: 0, budgetInr: 0 };
      }
      sectorMap[sector].count += 1;
      sectorMap[sector].budgetInr += Number(g.amountInr) || 0;
    }

    // State distribution
    const stateMap: Record<string, number> = {};
    for (const p of projects) {
      const st = p.state || "National";
      stateMap[st] = (stateMap[st] || 0) + 1;
    }

    // Public projects list with sanitized info
    const publicProjects = projects.map((p) => {
      const grant = grants.find((g) => g.id === p.grantId);
      const corporate = orgs.find((o) => o.id === grant?.corporateId);
      const ngo = orgs.find((o) => o.id === grant?.ngoId);
      const projectSites = sites.filter((s) => s.projectId === p.id);
      const projectAssets = assets.filter((a) => a.projectId === p.id);

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        activities: p.activities,
        state: p.state,
        district: p.district,
        funderName: corporate?.name || "Corporate Funder",
        implementerName: ngo?.name || "Implementing Partner",
        sector: grant?.scheduleVii || "Schedule VII",
        sitesCount: projectSites.length,
        verifiedEvidenceCount: projectAssets.filter((a) => a.trustBand === "verified").length,
        trustScore: 98
      };
    });

    return NextResponse.json({
      summary: {
        totalGrantsInr,
        totalProjects: projects.length,
        totalSites: sites.length,
        totalAssets: assets.length,
        verifiedAssetsCount,
        reviewAssetsCount,
        flaggedAssetsCount,
        totalPairs: pairs.length,
        participatingOrgsCount: orgs.length
      },
      sectors: Object.entries(sectorMap).map(([name, data]) => ({
        name,
        count: data.count,
        budgetInr: data.budgetInr
      })),
      states: Object.entries(stateMap).map(([state, projectCount]) => ({
        state,
        projectCount
      })),
      projects: publicProjects
    });
  } catch (err: any) {
    console.error("Community stats error:", err);
    return NextResponse.json({ error: err.message || "Failed to load community statistics" }, { status: 500 });
  }
}
