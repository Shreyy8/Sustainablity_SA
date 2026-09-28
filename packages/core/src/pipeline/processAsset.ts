import { computeTrustScore, type TrustScoreOutput } from "../trust/score.js";
import { type PhashMatch } from "../trust/checks/duplicate.js";
import { scoreAssignment, rankAssignments, type AssignmentSuggestion, type CandidateSite, type CandidateProject, type CandidateMilestone } from "../assign/score.js";
import { findPairCandidates, type PairAsset, type PairCandidate } from "../pairs/candidates.js";
import { getAllActivities } from "../taxonomy/taxonomy.js";

export interface PipelineAssetInput {
  id: string;
  shortId: string;
  publicId: string;
  version: number;
  secureUrl: string;
  resourceType?: "image" | "video";
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  capturedAt?: string | Date;
  uploadedAt?: string | Date;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
  exif?: Record<string, unknown>;
  phash?: string;
  tags?: string[];
  activities?: string[];
  ocrText?: string;
  qualityScore?: number;
  uploaderId?: string;
  projectIdHint?: string;
  siteIdHint?: string;
  milestoneIdHint?: string;
}

export interface PipelineContext {
  sites: CandidateSite[];
  projects: CandidateProject[];
  milestones: CandidateMilestone[];
  existingAssets: (PairAsset & { phash?: string; trustScore?: number })[];
  grant?: {
    startDate?: string;
    endDate?: string;
  };
}

export interface PipelineResult {
  asset: {
    id: string;
    shortId: string;
    publicId: string;
    version: number;
    secureUrl: string;
    resourceType: "image" | "video";
    format: string;
    bytes: number;
    width: number;
    height: number;
    capturedAt: string;
    uploadedAt: string;
    location?: { latitude: number; longitude: number };
    exif?: Record<string, unknown>;
    phash?: string;
    tags: string[];
    activities: string[];
    caption: string;
    ocrText?: string;
    qualityScore: number;
    projectId?: string;
    siteId?: string;
    milestoneId?: string;
    assignConfidence: number;
    status: "assigned" | "review" | "flagged";
    trustScore: number;
    trustBand: "verified" | "review" | "flagged";
    trustChecks: any[];
  };
  assignment: AssignmentSuggestion | null;
  suggestions: AssignmentSuggestion[];
  trust: TrustScoreOutput;
  pairCandidate: PairCandidate | null;
}

/**
 * Executes the complete Saakshi processing pipeline:
 * enrich -> vision -> caption -> assign -> verify -> pair
 */
export async function runAssetPipeline(
  input: PipelineAssetInput,
  context: PipelineContext
): Promise<PipelineResult> {
  const capturedAt = input.capturedAt ? new Date(input.capturedAt).toISOString() : new Date().toISOString();
  const uploadedAt = input.uploadedAt ? new Date(input.uploadedAt).toISOString() : new Date().toISOString();

  // 1. Enrich & Tagging
  const tags = input.tags || [];
  const taxonomy = getAllActivities();
  const activities: string[] = [...(input.activities || [])];

  // Match activities from tags, OCR, or publicId
  const combinedWords = `${tags.join(" ")} ${input.ocrText || ""} ${input.publicId}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const act of taxonomy) {
    if (activities.includes(act.key)) continue;

    const keyParts = act.key.split("_");
    const labelParts = act.label.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter((w) => w.length > 3);

    const matchesKey = keyParts.some((p) => combinedWords.includes(p));
    const matchesLabel = labelParts.some((p) => combinedWords.includes(p));

    if (matchesKey || matchesLabel) {
      activities.push(act.key);
    }
  }

  // 2. Assignment Engine
  const candidatesList = context.sites.map((site) => {
    const proj = context.projects.find((p) => p.id === site.projectId) || {
      id: site.projectId,
      name: "Associated Project",
      activities: []
    };
    const mls = context.milestones.filter((m) => m.projectId === site.projectId);
    return { site, project: proj, milestones: mls };
  });

  const rankedAssignments = rankAssignments(
    {
      location: input.location,
      capturedAt,
      activities,
      tags
    },
    candidatesList
  );

  const topAssignment = rankedAssignments[0] || null;
  const isAutoAssigned = topAssignment ? topAssignment.autoAssign : false;

  const assignedSiteId = isAutoAssigned ? topAssignment.siteId : input.siteIdHint;
  const assignedProjectId = isAutoAssigned ? topAssignment.projectId : input.projectIdHint;
  const assignedMilestoneId = isAutoAssigned ? topAssignment.milestoneId : input.milestoneIdHint;
  const assignConfidence = topAssignment ? topAssignment.score : 0.5;

  // 3. Phash matches calculation for Duplicate detection
  const phashMatches: PhashMatch[] = [];
  if (input.phash) {
    for (const prev of context.existingAssets) {
      if (prev.id === input.id) continue;
      if (prev.phash) {
        // Calculate Hamming distance between binary phash strings
        let hamming = 0;
        const len = Math.min(input.phash.length, prev.phash.length);
        for (let i = 0; i < len; i++) {
          if (input.phash[i] !== prev.phash[i]) hamming++;
        }
        if (hamming <= 10) {
          phashMatches.push({
            matchAssetId: prev.id,
            hamming,
            projectId: (prev as any).projectId,
            siteId: prev.siteId,
            milestoneId: prev.milestoneId,
            capturedAt: prev.capturedAt,
            shortId: prev.shortId
          });
        }
      }
    }
  }

  // 4. Trust Engine Verification
  const matchedSite = context.sites.find((s) => s.id === (assignedSiteId || input.siteIdHint));
  const trustOutput = computeTrustScore({
    asset: {
      id: input.id,
      shortId: input.shortId,
      projectId: assignedProjectId,
      siteId: assignedSiteId,
      milestoneId: assignedMilestoneId,
      capturedAt,
      exifTakenAt: input.exif?.DateTimeOriginal ? String(input.exif.DateTimeOriginal) : capturedAt,
      exif: input.exif,
      location: input.location
    },
    site: matchedSite,
    grant: context.grant,
    phashMatches
  });

  // 5. Determine final asset status
  let finalStatus: "assigned" | "review" | "flagged" = "assigned";
  if (trustOutput.band === "flagged") {
    finalStatus = "flagged";
  } else if (!isAutoAssigned || trustOutput.band === "review") {
    finalStatus = "review";
  }

  // 6. Before/After Pair Detection
  let bestPair: PairCandidate | null = null;
  if (assignedSiteId) {
    const historicalAtSite: PairAsset[] = context.existingAssets.filter(
      (a) => a.siteId === assignedSiteId && a.id !== input.id
    );

    const targetForPair: PairAsset = {
      id: input.id,
      shortId: input.shortId,
      siteId: assignedSiteId,
      milestoneId: assignedMilestoneId,
      capturedAt,
      activities,
      trustScore: trustOutput.score
    };

    const pairs = findPairCandidates(targetForPair, historicalAtSite);
    if (pairs.length > 0) {
      bestPair = pairs[0];
    }
  }

  // Construct final caption
  const mainActivityName = activities[0] ? activities[0].replace(/_/g, " ") : "community milestone";
  const defaultCaption = `${mainActivityName.toUpperCase()} documented at ${matchedSite?.name || "field site"}. Trust verified: ${trustOutput.score}/100.`;

  return {
    asset: {
      id: input.id,
      shortId: input.shortId,
      publicId: input.publicId,
      version: input.version,
      secureUrl: input.secureUrl,
      resourceType: input.resourceType || "image",
      format: input.format || "jpg",
      bytes: input.bytes || 2048000,
      width: input.width || 2048,
      height: input.height || 1536,
      capturedAt,
      uploadedAt,
      location: input.location?.latitude && input.location?.longitude
        ? { latitude: input.location.latitude, longitude: input.location.longitude }
        : undefined,
      exif: input.exif,
      phash: input.phash,
      tags,
      activities,
      caption: defaultCaption,
      ocrText: input.ocrText,
      qualityScore: input.qualityScore ?? 0.9,
      projectId: assignedProjectId,
      siteId: assignedSiteId,
      milestoneId: assignedMilestoneId,
      assignConfidence,
      status: finalStatus,
      trustScore: trustOutput.score,
      trustBand: trustOutput.band,
      trustChecks: trustOutput.checks
    },
    assignment: topAssignment,
    suggestions: rankedAssignments.slice(0, 3),
    trust: trustOutput,
    pairCandidate: bestPair
  };
}
