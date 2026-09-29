import { NextResponse } from "next/server";
import { store } from "@pluribus/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const assets = store.getAssets();
    const pairs = store.getPairs();
    const reports = store.getReports();
    const stories = store.getStories();
    const grants = store.getGrants();
    const projects = store.getProjects();
    const sites = store.getSites();
    const milestones = store.getMilestones();
    const auditLogs = store.getAuditLogs();

    const isSampleData = store.isSampleDataLoaded();

    return NextResponse.json({
      status: "online",
      ledgerMode: isSampleData ? "sample_mock" : "original_authentic",
      isSampleData,
      counts: {
        assets: assets.length,
        verifiedAssets: assets.filter((a) => a.trustBand === "verified").length,
        flaggedAssets: assets.filter((a) => a.trustBand === "flagged").length,
        reviewAssets: assets.filter((a) => a.trustBand === "review").length,
        pairs: pairs.length,
        reports: reports.length,
        stories: stories.length,
        grants: grants.length,
        projects: projects.length,
        sites: sites.length,
        milestones: milestones.length,
        auditLogs: auditLogs.length
      },
      activeSession: session
        ? {
            userId: session.userId,
            name: session.name,
            role: session.role,
            orgName: session.orgName,
            reusableData: session.reusableData
          }
        : null
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to inspect ledger" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "clear" || action === "reset_clean") {
      store.clearSampleData();
      return NextResponse.json({
        success: true,
        message: "Ledger cleared successfully. All evidence records reset to clean slate.",
        ledgerMode: "original_authentic",
        counts: {
          assets: store.getAssets().length,
          pairs: store.getPairs().length,
          reports: store.getReports().length,
          stories: store.getStories().length
        }
      });
    }

    if (action === "seed_sample") {
      store.loadSampleData();
      return NextResponse.json({
        success: true,
        message: "Sample evaluation records loaded into ledger.",
        ledgerMode: "sample_mock",
        counts: {
          assets: store.getAssets().length,
          pairs: store.getPairs().length,
          reports: store.getReports().length,
          stories: store.getStories().length
        }
      });
    }

    return NextResponse.json(
      { error: "Unknown action. Valid actions are 'clear' or 'seed_sample'." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Ledger operation failed" },
      { status: 500 }
    );
  }
}
