import {
  SEED_ORGS,
  SEED_USERS,
  SEED_GRANTS,
  SEED_PROJECTS,
  SEED_SITES,
  SEED_MILESTONES,
  SEED_ASSETS,
  SEED_PAIRS,
  SEED_DERIVATIVES,
  SEED_REPORTS,
  SEED_STORIES
} from "./seed-data.js";
import type {
  Organization,
  AppUser,
  Grant,
  Project,
  Site,
  Milestone,
  Asset,
  Derivative,
  BeforeAfterPair,
  Report,
  Story,
  AuditLog
} from "./types.js";

class PluribusStore {
  private orgs: Organization[] = [...SEED_ORGS];
  private users: AppUser[] = [...SEED_USERS];
  private grants: Grant[] = [...SEED_GRANTS];
  private projects: Project[] = [...SEED_PROJECTS];
  private sites: Site[] = [...SEED_SITES];
  private milestones: Milestone[] = [...SEED_MILESTONES];
  private assets: Asset[] = [];
  private pairs: BeforeAfterPair[] = [];
  private derivatives: Derivative[] = [];
  private reports: Report[] = [];
  private stories: Story[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    const isTest =
      typeof process !== "undefined" &&
      (process.env.NODE_ENV === "test" || Boolean(process.env.VITEST));

    if (isTest || (typeof process !== "undefined" && process.env.LOAD_SAMPLE_DATA === "true")) {
      this.loadSampleData();
    }
  }

  loadSampleData() {
    this.assets = [...SEED_ASSETS];
    this.pairs = [...SEED_PAIRS];
    this.derivatives = [...SEED_DERIVATIVES];
    this.reports = [...SEED_REPORTS];
    this.stories = [...SEED_STORIES];
  }

  clearSampleData() {
    this.assets = [];
    this.pairs = [];
    this.derivatives = [];
    this.reports = [];
    this.stories = [];
  }

  isSampleDataLoaded(): boolean {
    return this.assets.some((a) => a.id.startsWith("ast-00") || a.id === "ast-010");
  }

  // Organizations
  getOrgs(): Organization[] {
    return this.orgs;
  }
  getOrgById(id: string): Organization | undefined {
    return this.orgs.find((o) => o.id === id || o.slug === id);
  }
  insertOrg(org: Organization): Organization {
    this.orgs.push(org);
    return org;
  }

  // Users
  getUsers(): AppUser[] {
    return this.users;
  }
  getUserById(id: string): AppUser | undefined {
    return this.users.find((u) => u.id === id);
  }
  getUserByEmail(email: string): AppUser | undefined {
    return this.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  }
  insertUser(user: AppUser): AppUser {
    this.users.push(user);
    return user;
  }

  // Grants
  getGrants(): Grant[] {
    return this.grants;
  }
  getGrantById(id: string): Grant | undefined {
    return this.grants.find((g) => g.id === id);
  }
  insertGrant(grant: Grant): Grant {
    this.grants.unshift(grant);
    return grant;
  }

  // Projects
  getProjects(): Project[] {
    return this.projects;
  }
  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }
  insertProject(project: Project): Project {
    this.projects.unshift(project);
    return project;
  }

  // Sites
  getSites(projectId?: string): Site[] {
    if (projectId) return this.sites.filter((s) => s.projectId === projectId);
    return this.sites;
  }
  getSiteById(id: string): Site | undefined {
    return this.sites.find((s) => s.id === id);
  }
  insertSite(site: Site): Site {
    this.sites.push(site);
    return site;
  }

  // Milestones
  getMilestones(projectId?: string): Milestone[] {
    if (projectId) return this.milestones.filter((m) => m.projectId === projectId);
    return this.milestones;
  }
  getMilestoneById(id: string): Milestone | undefined {
    return this.milestones.find((m) => m.id === id);
  }
  insertMilestone(milestone: Milestone): Milestone {
    this.milestones.push(milestone);
    return milestone;
  }

  // Assets
  getAssets(filter?: {
    projectId?: string;
    siteId?: string;
    milestoneId?: string;
    status?: string;
    trustBand?: string;
    activity?: string;
  }): Asset[] {
    return this.assets.filter((a) => {
      if (a.deletedAt) return false;
      if (filter?.projectId && a.projectId !== filter.projectId) return false;
      if (filter?.siteId && a.siteId !== filter.siteId) return false;
      if (filter?.milestoneId && a.milestoneId !== filter.milestoneId) return false;
      if (filter?.status && a.status !== filter.status) return false;
      if (filter?.trustBand && a.trustBand !== filter.trustBand) return false;
      if (filter?.activity && !a.activities?.includes(filter.activity)) return false;
      return true;
    });
  }

  getAssetById(idOrShortId: string): Asset | undefined {
    return this.assets.find(
      (a) => (a.id === idOrShortId || a.shortId === idOrShortId) && !a.deletedAt
    );
  }

  insertAsset(asset: Asset): Asset {
    this.assets.unshift(asset);
    this.logAudit({
      actor: asset.uploaderId || "system",
      action: "asset.insert",
      entity: "asset",
      entityId: asset.id,
      after: { shortId: asset.shortId, trustScore: asset.trustScore }
    });
    return asset;
  }

  updateAsset(id: string, patch: Partial<Asset>): Asset | undefined {
    const idx = this.assets.findIndex((a) => a.id === id || a.shortId === id);
    if (idx === -1) return undefined;

    const before = { ...this.assets[idx] };
    this.assets[idx] = { ...this.assets[idx], ...patch };

    this.logAudit({
      actor: "user-admin",
      action: "asset.update",
      entity: "asset",
      entityId: this.assets[idx].id,
      before,
      after: patch
    });

    return this.assets[idx];
  }

  // Pairs
  getPairs(siteId?: string): BeforeAfterPair[] {
    if (siteId) return this.pairs.filter((p) => p.siteId === siteId);
    return this.pairs;
  }
  getPairById(id: string): BeforeAfterPair | undefined {
    return this.pairs.find((p) => p.id === id);
  }
  insertPair(pair: BeforeAfterPair): BeforeAfterPair {
    this.pairs.push(pair);
    return pair;
  }

  // Derivatives
  getDerivatives(assetId?: string): Derivative[] {
    if (assetId) return this.derivatives.filter((d) => d.assetId === assetId);
    return this.derivatives;
  }
  recordDerivative(derivative: Derivative): Derivative {
    this.derivatives.push(derivative);
    return derivative;
  }

  // Reports
  getReports(): Report[] {
    return this.reports;
  }
  getReportById(id: string): Report | undefined {
    return this.reports.find((r) => r.id === id);
  }
  insertReport(report: Report): Report {
    this.reports.unshift(report);
    return report;
  }
  publishReport(id: string): Report | undefined {
    const report = this.reports.find((r) => r.id === id);
    if (report) {
      report.status = "published";
      report.publishedAt = new Date().toISOString();
    }
    return report;
  }

  // Stories
  getStories(projectId?: string): Story[] {
    if (projectId) return this.stories.filter((s) => s.projectId === projectId);
    return this.stories;
  }
  getStoryById(id: string): Story | undefined {
    return this.stories.find((s) => s.id === id);
  }
  insertStory(story: Story): Story {
    this.stories.unshift(story);
    return story;
  }

  // Lineage Graph
  getLineage(assetId: string) {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const derivatives = this.getDerivatives(asset.id);
    const pairs = this.pairs.filter(
      (p) => p.beforeAssetId === asset.id || p.afterAssetId === asset.id
    );
    const reports = this.reports.filter((r) => r.assetIds.includes(asset.id));
    const stories = this.stories.filter((s) =>
      JSON.stringify(s.script).includes(asset.id) ||
      JSON.stringify(s.script).includes(asset.shortId)
    );

    return {
      asset,
      derivatives,
      pairs,
      reports,
      stories
    };
  }

  // Review Queue
  getReviewQueue(queueType: "unassigned" | "low_trust" | "duplicate" | "all" = "all") {
    return this.assets.filter((a) => {
      if (a.deletedAt || a.status === "rejected") return false;

      if (queueType === "unassigned") {
        return !a.projectId || !a.siteId || a.status === "review";
      }
      if (queueType === "low_trust") {
        return a.trustScore < 75;
      }
      if (queueType === "duplicate") {
        return a.trustChecks.some((c) => c.id === "duplicate" && c.penalty > 0);
      }
      return a.status === "review" || a.trustScore < 75;
    });
  }

  adjudicateAsset(
    assetId: string,
    action: "FRAUD_REJECTED" | "LEGITIMATE_DUPLICATE" | "REASSIGNED",
    notes?: string,
    reassignSiteId?: string
  ): Asset | undefined {
    const asset = this.getAssetById(assetId);
    if (!asset) return undefined;

    if (action === "FRAUD_REJECTED") {
      asset.status = "rejected";
      asset.trustBand = "flagged";
      asset.trustScore = Math.min(asset.trustScore, 15);
      asset.flaggedReason = notes || "Adjudicated as statutory fraud by auditor.";
    } else if (action === "LEGITIMATE_DUPLICATE") {
      asset.status = "assigned";
      asset.trustBand = "verified";
      asset.trustScore = Math.max(asset.trustScore, 85);
      asset.flaggedReason = undefined;
      // Mark duplicate check as resolved
      const dupCheck = asset.trustChecks.find((c) => c.id === "duplicate");
      if (dupCheck) {
        dupCheck.penalty = 0;
        dupCheck.severity = "info";
        dupCheck.reason = `Adjudicated legitimate field photo: ${notes || "Confirmed distinct angle/activity"}`;
      }
    } else if (action === "REASSIGNED" && reassignSiteId) {
      const newSite = this.getSiteById(reassignSiteId);
      if (newSite) {
        asset.siteId = newSite.id;
        asset.projectId = newSite.projectId;
        asset.status = "assigned";
        asset.trustBand = "verified";
      }
    }

    this.logAudit({
      actor: "auditor-admin",
      action: `triage.${action.toLowerCase()}`,
      entity: "asset",
      entityId: asset.id,
      after: { status: asset.status, trustBand: asset.trustBand, notes }
    });

    return asset;
  }

  // Portfolio Dashboard KPIs
  getPortfolioKpis(corporateId?: string) {
    const totalGrants = this.grants.length;
    const totalProjects = this.projects.length;
    const totalSites = this.sites.length;
    const totalMilestones = this.milestones.length;

    const allAssets = this.assets.filter((a) => !a.deletedAt);
    const verifiedAssets = allAssets.filter((a) => a.trustBand === "verified");
    const flaggedAssets = allAssets.filter((a) => a.trustBand === "flagged");
    const reviewAssets = allAssets.filter((a) => a.trustBand === "review");

    const avgTrust =
      allAssets.length > 0
        ? Math.round(
            allAssets.reduce((sum, a) => sum + a.trustScore, 0) / allAssets.length
          )
        : 100;

    // Milestone coverage: count milestones that have at least 1 verified asset
    const evidencedMilestoneIds = new Set(
      verifiedAssets.map((a) => a.milestoneId).filter(Boolean)
    );
    const milestoneCoveragePercent =
      totalMilestones > 0
        ? Math.round((evidencedMilestoneIds.size / totalMilestones) * 100)
        : 0;

    return {
      totalGrants,
      totalProjects,
      totalSites,
      totalMilestones,
      totalAssets: allAssets.length,
      verifiedCount: verifiedAssets.length,
      reviewCount: reviewAssets.length,
      flaggedCount: flaggedAssets.length,
      avgTrustScore: avgTrust,
      milestoneCoveragePercent,
      totalSpendInr: this.grants.reduce((sum, g) => sum + g.amountInr, 0)
    };
  }

  // Audit Log
  logAudit(entry: Omit<AuditLog, "id" | "at">) {
    this.auditLogs.unshift({
      id: this.auditLogs.length + 1,
      ...entry,
      at: new Date().toISOString()
    });
  }
  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
}

// Global singleton instance
export const store = new PluribusStore();
