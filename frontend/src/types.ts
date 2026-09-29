export type Role = 'Corporate Admin' | 'NGO Manager' | 'Field Worker' | 'Statutory Auditor';

export type Tenant = 
  | 'TATA SUSTAINABILITY TRUST :: FY 2025-26'
  | 'PRATHAM RURAL FOUNDATION'
  | 'RELIANCE FOUNDATION :: GUJARAT'
  | 'ADANI ACT FOUNDATION';

export type NavRoute = 
  | 'overview' 
  | 'grants' 
  | 'capture' 
  | 'triage' 
  | 'search' 
  | 'comparisons' 
  | 'reports' 
  | 'evidence'
  | 'stories'
  | 'setup';

export interface MilestoneProgress {
  id: string;
  code: string;
  name: string;
  plannedPct: number;
  evidencedPct: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FLAGGED';
  assetCount: number;
  avgTrust: number;
  targetDate: string;
}

export interface ProjectSite {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  sanctionedAmount: number;
  disbursedAmount: number;
  coveragePct: number;
  trustScore: number;
  status: 'verified' | 'flagged' | 'pending';
  lastCaptureTime: string;
  implementingEntity: string;
  scheduleVIIHead: string;
  coordinates: {
    lat: number;
    lng: number;
    cep: number;
  };
  centroid: {
    lat: number;
    lng: number;
  };
  geofencePolygon: [number, number][];
  milestones: MilestoneProgress[];
}

export interface HeuristicCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  penalty: number;
}

export interface EvidenceAsset {
  id: string;
  shortId: string;
  siteId: string;
  siteName: string;
  district: string;
  timestamp: string;
  imageUrl: string;
  canonicalHash: string;
  hardwareKeyId: string;
  blockchainTx: string;
  blockNumber: number;
  opticalSensor: string;
  resolution: string;
  aperture: string;
  iso: number;
  shutter: string;
  trustScore: number;
  auditGrade: string;
  heuristics: HeuristicCheck[];
  scheduleVIIHead: string;
  sanctionedAmount: number;
  disbursedAmount: number;
  milestoneId: string;
  milestoneName: string;
  coordinates: {
    lat: number;
    lng: number;
    cep: number;
  };
  flaggedReason?: string;
  isDerivativePublic?: boolean;
}

export interface TriageItem {
  id: string;
  submissionId: string;
  siteName: string;
  captureTimestamp: string;
  submittingAgent: string;
  hardware: string;
  coordinates: string;
  geofenceStatus: string;
  cryptoChip: string;
  operatorCredential: string;
  submissionImage: string;
  trustScore: number;
  penaltyPoints: number;
  historicalAssetId: string;
  historicalSite: string;
  historicalTimestamp: string;
  historicalGrant: string;
  historicalDisbursement: string;
  historicalImage: string;
  historicalCaId: string;
  pHashDistance: number;
  pixelCorrelationPct: number;
  ssimIndex: number;
  histogramShiftPct: number;
  sensorPrnu: number;
  forensicAnomalyLog: string;
  diffHash: string;
  statusCategory: 'unassigned' | 'low_trust' | 'duplicates' | 'moderation';
  adjudicationState?: 'PENDING' | 'FRAUD_REJECTED' | 'LEGITIMATE_DUPLICATE' | 'REASSIGNED';
}

export interface BeforeAfterPair {
  id: string;
  siteId: string;
  siteName: string;
  milestone: string;
  district: string;
  baselineDate: string;
  currentDate: string;
  baselineImageUrl: string;
  currentImageUrl: string;
  structuralDelta: string;
  changeChips: string[];
  reportAdded: boolean;
}

export interface StoryReel {
  id: string;
  title: string;
  district: string;
  program: string;
  aspectRatio: '9:16';
  durationSec: number;
  currentChapter: number;
  beats: {
    id: string;
    label: string;
    timestamp: string;
    caption: string;
    imageUrl: string;
  }[];
  socialCopy: {
    linkedin: string;
    sebiBrsr: string;
    instagram: string;
  };
}
