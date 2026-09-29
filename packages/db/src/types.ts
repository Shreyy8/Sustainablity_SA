import type { CheckResult } from "@pluribus/core";

export type OrgType = "CORPORATE" | "NGO" | "ASSESSOR";
export type UserRole = "FIELD" | "NGO_ADMIN" | "CORP_ADMIN" | "CORP_VIEWER" | "ASSESSOR" | "SUPER";
export type AssetStatus = "pending" | "assigned" | "review" | "rejected";
export type TrustBand = "verified" | "review" | "flagged";
export type ConsentType = "none" | "verbal" | "written";

export interface Organization {
  id: string;
  type: OrgType;
  name: string;
  slug: string;
  logoPublicId?: string;
  createdAt: string;
  // Statutory and Compliance fields
  cin?: string;
  darpanId?: string;
  csr1Number?: string;
  pan?: string;
  gstin?: string;
  section12A?: string;
  section80G?: string;
  fcraStatus?: string;
  sectors?: string[];
  states?: string[];
  annualBudgetInr?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  complianceStatus?: "verified" | "pending_review" | "needs_clarification";
}

export interface AppUser {
  id: string;
  orgId: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  language: string;
  password?: string;
}

export interface Grant {
  id: string;
  corporateId: string;
  ngoId: string;
  title: string;
  amountInr: number;
  scheduleVii: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  id: string;
  grantId: string;
  name: string;
  description?: string;
  activities: string[];
  state: string;
  district: string;
  cldFolder?: string;
  budgetInr?: number;
  createdAt?: string;
}

export interface Site {
  id: string;
  projectId: string;
  name: string;
  geofence: [number, number][]; // [[lat, lon], ...]
  centroid: [number, number]; // [lat, lon]
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  expectedDate?: string;
  targetDate?: string;
  expectedSignals?: string[];
  questions?: string[];
  description?: string;
}

export interface AssetLocation {
  latitude: number;
  longitude: number;
}

export interface Asset {
  id: string;
  shortId: string;
  cldPublicId: string;
  cldVersion: number;
  cldAssetId: string;
  resourceType: "image" | "video" | "raw";
  format: string;
  bytes: number;
  width: number;
  height: number;
  duration?: number;
  secureUrl: string;
  sha256?: string;
  phash?: string;
  uploaderId?: string;
  capturedAt: string;
  uploadedAt: string;
  exifTakenAt?: string;
  exif?: Record<string, unknown>;
  location?: AssetLocation;
  gpsAccuracyM?: number;
  orgCorporateId?: string;
  orgNgoId?: string;
  projectId?: string;
  siteId?: string;
  milestoneId?: string;
  assignConfidence?: number;
  status: AssetStatus;
  trustScore: number;
  trustBand: TrustBand;
  trustChecks: CheckResult[];
  qualityScore?: number;
  consent: ConsentType;
  caption?: string;
  flaggedReason?: string;
  activities?: string[];
  tags?: string[];
  ocrText?: string;
  transcript?: string;
  embedding?: number[];
  deletedAt?: string;
}

export interface Derivative {
  id: string;
  assetId: string;
  assetVersion: number;
  transformation: string;
  url: string;
  purpose: "thumb" | "report" | "public" | "composite" | "reel_frame" | "stamp";
  createdBy?: string;
  createdAt: string;
}

export interface BeforeAfterPair {
  id: string;
  siteId: string;
  milestoneId?: string;
  beforeAssetId: string;
  afterAssetId: string;
  compositeDerivativeId?: string;
  compositeUrl?: string;
  change: {
    changes: Array<{ type: string; object: string; evidence: string }>;
    counts?: Record<string, { before: number; after: number }>;
    summary: string;
    confidence: number;
  };
  score: number;
  source: "auto" | "manual";
}

export interface DuplicateLink {
  assetId: string;
  matchAssetId: string;
  hamming: number;
  resolution: "open" | "legit" | "fraud";
}

export interface Report {
  id: string;
  template: string;
  templateVersion: string;
  scope: Record<string, unknown>;
  status: "draft" | "published";
  pdfPublicId?: string;
  pdfUrl?: string;
  promptHash?: string;
  model?: string;
  createdBy?: string;
  createdAt: string;
  publishedAt?: string;
  title: string;
  period: string;
  corporateName: string;
  summaryNarrative?: string;
  assetIds: string[];
}

export interface ReportItem {
  id: string;
  reportId: string;
  derivativeId: string;
  section: string;
  caption: string;
  position: number;
}

export interface Story {
  id: string;
  projectId: string;
  format: "reel_9_16" | "carousel_1_1" | "highlight_16_9";
  script: Record<string, unknown>;
  videoPublicId?: string;
  url?: string;
  status: "draft" | "rendered";
  createdAt: string;
}

export interface StoryItem {
  id: string;
  storyId: string;
  derivativeId: string;
  beat: number;
}

export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  at: string;
}
