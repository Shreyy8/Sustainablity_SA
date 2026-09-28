import { distanceToPolygon, pointInPolygon } from "../geo/distance.js";

export interface CandidateSite {
  id: string;
  projectId: string;
  name: string;
  geofence?: [number, number][]; // [[lat, lon], ...]
}

export interface CandidateProject {
  id: string;
  name: string;
  activities?: string[];
}

export interface CandidateMilestone {
  id: string;
  projectId: string;
  name: string;
  expectedDate?: string | Date;
  expectedSignals?: string[];
}

export interface AssetAssignmentInput {
  location?: {
    latitude?: number;
    longitude?: number;
  };
  capturedAt?: string | Date;
  activities?: string[];
  tags?: string[];
}

export interface AssignmentSuggestion {
  siteId: string;
  siteName: string;
  projectId: string;
  projectName: string;
  milestoneId?: string;
  milestoneName?: string;
  score: number;
  components: {
    geoScore: number;
    activityScore: number;
    dateScore: number;
  };
  autoAssign: boolean;
}

export function scoreAssignment(
  asset: AssetAssignmentInput,
  site: CandidateSite,
  project: CandidateProject,
  milestones: CandidateMilestone[] = []
): AssignmentSuggestion {
  // 1. Geo score (weight 0.5)
  let geoScore = 0;
  if (asset.location?.latitude !== undefined && asset.location?.longitude !== undefined) {
    if (site.geofence && site.geofence.length >= 3) {
      const pt: [number, number] = [asset.location.latitude, asset.location.longitude];
      if (pointInPolygon(pt, site.geofence)) {
        geoScore = 1.0;
      } else {
        const dist = distanceToPolygon(pt, site.geofence);
        if (dist <= 500) {
          geoScore = Math.max(0, 1.0 - dist / 500);
        }
      }
    }
  }

  // 2. Activity score (weight 0.3)
  let activityScore = 0;
  const projectActivities = project.activities || [];
  const assetActivities = asset.activities || [];

  if (projectActivities.length > 0 && assetActivities.length > 0) {
    const intersection = assetActivities.filter((a) => projectActivities.includes(a));
    // If at least one asset activity is in the project's activities, it is an exact match
    activityScore = intersection.length > 0 ? 1.0 : 0.0;
  } else if (projectActivities.length === 0) {
    activityScore = 0.5;
  }

  // 3. Milestone & Date score (weight 0.2)
  let dateScore = 0.5; // default moderate score
  let bestMilestone: CandidateMilestone | undefined = undefined;
  let bestMilestoneScore = -1;

  const assetTime = asset.capturedAt ? new Date(asset.capturedAt).getTime() : Date.now();
  const assetTags = [...(asset.tags || []), ...(asset.activities || [])].map((t) => t.toLowerCase());

  for (const m of milestones) {
    let mScore = 0;
    // Expected signals overlap
    if (m.expectedSignals && m.expectedSignals.length > 0) {
      const matches = m.expectedSignals.filter((sig) =>
        assetTags.some((t) => t.includes(sig.toLowerCase()) || sig.toLowerCase().includes(t))
      );
      mScore += (matches.length / m.expectedSignals.length) * 0.6;
    }

    // Date proximity
    if (m.expectedDate) {
      const mTime = new Date(m.expectedDate).getTime();
      const diffDays = Math.abs(assetTime - mTime) / (1000 * 60 * 60 * 24);
      if (diffDays <= 14) mScore += 0.4;
      else if (diffDays <= 45) mScore += 0.25;
      else if (diffDays <= 90) mScore += 0.1;
    }

    if (mScore > bestMilestoneScore) {
      bestMilestoneScore = mScore;
      bestMilestone = m;
    }
  }

  if (bestMilestone && bestMilestoneScore > 0) {
    dateScore = Math.min(1.0, bestMilestoneScore);
  }

  // Total weighted score
  const totalScore = Number((0.5 * geoScore + 0.3 * activityScore + 0.2 * dateScore).toFixed(3));

  return {
    siteId: site.id,
    siteName: site.name,
    projectId: project.id,
    projectName: project.name,
    milestoneId: bestMilestone?.id,
    milestoneName: bestMilestone?.name,
    score: totalScore,
    components: {
      geoScore,
      activityScore,
      dateScore
    },
    autoAssign: totalScore >= 0.75
  };
}

export function rankAssignments(
  asset: AssetAssignmentInput,
  candidates: {
    site: CandidateSite;
    project: CandidateProject;
    milestones: CandidateMilestone[];
  }[]
): AssignmentSuggestion[] {
  const scored = candidates.map((c) =>
    scoreAssignment(asset, c.site, c.project, c.milestones)
  );

  scored.sort((a, b) => b.score - a.score);
  return scored;
}
