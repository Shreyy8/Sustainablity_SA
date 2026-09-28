export interface StoryAsset {
  id: string;
  shortId: string;
  url?: string;
  caption?: string;
  activities?: string[];
  trustScore?: number;
  qualityScore?: number;
  capturedAt?: string | Date;
  resourceType?: "image" | "video";
}

export interface StoryBeat {
  beatNumber: number;
  stage: "hook" | "problem" | "action" | "change" | "cta";
  assetId: string;
  assetShortId: string;
  durationSeconds: number;
  headline: string;
  voiceoverText: string;
  captionOverlay: string;
}

export interface StoryScript {
  id: string;
  title: string;
  format: "reel_9_16" | "carousel_1_1" | "highlight_16_9";
  totalDurationSeconds: number;
  beats: StoryBeat[];
  suggestedCopy: {
    linkedin: string;
    instagram: string;
  };
}

export function generateStoryScript(params: {
  projectName: string;
  partnerNgo: string;
  corporateFunder: string;
  assets: StoryAsset[];
  beforeAsset?: StoryAsset;
  afterAsset?: StoryAsset;
}): StoryScript {
  const { projectName, partnerNgo, corporateFunder, assets, beforeAsset, afterAsset } = params;

  // Filter and sort high-quality evidence
  const validAssets = [...assets].sort(
    (a, b) => ((b.qualityScore ?? 0.8) * (b.trustScore ?? 80)) - ((a.qualityScore ?? 0.8) * (a.trustScore ?? 80))
  );

  const fallbackAsset = validAssets[0] || {
    id: "sample-asset",
    shortId: "demo-01",
    caption: "Community impact activity",
    activities: ["community"]
  };

  const hookAsset = beforeAsset || validAssets[0] || fallbackAsset;
  const actionAsset = validAssets.find(a => a.id !== hookAsset.id) || validAssets[1] || fallbackAsset;
  const changeAsset = afterAsset || validAssets.find(a => a.id !== hookAsset.id && a.id !== actionAsset.id) || fallbackAsset;
  const ctaAsset = validAssets[validAssets.length - 1] || fallbackAsset;

  const beats: StoryBeat[] = [
    {
      beatNumber: 1,
      stage: "hook",
      assetId: hookAsset.id,
      assetShortId: hookAsset.shortId,
      durationSeconds: 5,
      headline: `Empowering Communities in ${projectName}`,
      voiceoverText: `In rural India, verified sustainable impact is changing lives every day.`,
      captionOverlay: `Witnessing Change in ${projectName}`
    },
    {
      beatNumber: 2,
      stage: "problem",
      assetId: (beforeAsset || hookAsset).id,
      assetShortId: (beforeAsset || hookAsset).shortId,
      durationSeconds: 6,
      headline: "The Challenge on the Ground",
      voiceoverText: `Before this intervention, communities faced persistent barriers to basic infrastructure and dignity.`,
      captionOverlay: "Baseline Status Before CSR Intervention"
    },
    {
      beatNumber: 3,
      stage: "action",
      assetId: actionAsset.id,
      assetShortId: actionAsset.shortId,
      durationSeconds: 7,
      headline: "Action in the Field",
      voiceoverText: `Supported by ${corporateFunder} and implemented with dedication by ${partnerNgo}, real change was mobilized.`,
      captionOverlay: `Field Implementation by ${partnerNgo}`
    },
    {
      beatNumber: 4,
      stage: "change",
      assetId: (afterAsset || changeAsset).id,
      assetShortId: (afterAsset || changeAsset).shortId,
      durationSeconds: 7,
      headline: "Measurable, Verified Impact",
      voiceoverText: `Completed, documented, and GPS-verified. Every milestone backed by tamper-evident photographic evidence.`,
      captionOverlay: "Verified Outcome: 100% Milestone Completion"
    },
    {
      beatNumber: 5,
      stage: "cta",
      assetId: ctaAsset.id,
      assetShortId: ctaAsset.shortId,
      durationSeconds: 5,
      headline: "Every Rupee Witnessed",
      voiceoverText: `Saakshi Evidence Vault: Building transparent CSR trust for India.`,
      captionOverlay: `Supported by ${corporateFunder} · Saakshi Verified`
    }
  ];

  const totalDurationSeconds = beats.reduce((sum, b) => sum + b.durationSeconds, 0);

  const linkedinCopy = `Proud to share verified ground impact from "${projectName}". In partnership with ${partnerNgo} and supported by ${corporateFunder}, every milestone is backed by real-time GPS and tamper-evident evidence in the Saakshi Evidence Vault.\n\n#CSRIndia #SustainableImpact #CompaniesAct135 #SocialImpact #ESG #Transparency`;
  const instagramCopy = `Real change, witnessed on the ground 🌿✨\n\nTake a look inside "${projectName}" where community impact meets tamper-evident transparency. Supported by ${corporateFunder} & ${partnerNgo}.\n\n#SaakshiVault #CSRIndia #RealImpact #RuralDevelopment`;

  return {
    id: `story-${Date.now()}`,
    title: `${projectName} — Impact Story Reel`,
    format: "reel_9_16",
    totalDurationSeconds,
    beats,
    suggestedCopy: {
      linkedin: linkedinCopy,
      instagram: instagramCopy
    }
  };
}
