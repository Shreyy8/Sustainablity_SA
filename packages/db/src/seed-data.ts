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
  Story
} from "./types.js";

export const SEED_ORGS: Organization[] = [
  {
    id: "org-corp-1",
    type: "CORPORATE",
    name: "Tata Sustainability Trust",
    slug: "tata-trust",
    logoPublicId: "saakshi/logos/tata_trust",
    createdAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "org-ngo-1",
    type: "NGO",
    name: "Gramin Vikas Sansthan",
    slug: "gramin-vikas",
    logoPublicId: "saakshi/logos/gramin_vikas",
    createdAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "org-ngo-2",
    type: "NGO",
    name: "Yuva Parivartan Foundation",
    slug: "yuva-parivartan",
    logoPublicId: "saakshi/logos/yuva_parivartan",
    createdAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "org-assessor-1",
    type: "ASSESSOR",
    name: "Social Impact Audit Services LLP",
    slug: "sias-audit",
    createdAt: "2025-01-01T00:00:00Z"
  }
];

export const SEED_USERS: AppUser[] = [
  {
    id: "user-corp-1",
    orgId: "org-corp-1",
    role: "CORP_ADMIN",
    name: "Arjun Mehta (CSR Head)",
    email: "arjun.mehta@tatatrust.org",
    language: "en"
  },
  {
    id: "user-ngo-1",
    orgId: "org-ngo-1",
    role: "NGO_ADMIN",
    name: "Meena Sharma (Program Director)",
    email: "meena@graminvikas.org",
    language: "hi"
  },
  {
    id: "user-field-1",
    orgId: "org-ngo-1",
    role: "FIELD",
    name: "Ravi Kumar (Field Officer)",
    phone: "+91 98765 43210",
    language: "hi"
  },
  {
    id: "user-assessor-1",
    orgId: "org-assessor-1",
    role: "ASSESSOR",
    name: "Priya Nair (Lead Impact Auditor)",
    email: "priya.nair@sias-audit.com",
    language: "en"
  }
];

export const SEED_GRANTS: Grant[] = [
  {
    id: "grant-1",
    corporateId: "org-corp-1",
    ngoId: "org-ngo-1",
    title: "Rajasthan Rural WASH & Sanitation Mission",
    amountInr: 35000000, // ₹3.5 Crore
    scheduleVii: "Item (i) - Eradicating hunger, poverty and malnutrition, promoting health care and sanitation",
    startDate: "2025-04-01",
    endDate: "2026-03-31"
  },
  {
    id: "grant-2",
    corporateId: "org-corp-1",
    ngoId: "org-ngo-2",
    title: "Maharashtra BALA Model Classrooms & Early Learning",
    amountInr: 28000000, // ₹2.8 Crore
    scheduleVii: "Item (ii) - Promoting education, special education and employment enhancing vocational skills",
    startDate: "2025-04-01",
    endDate: "2026-03-31"
  },
  {
    id: "grant-3",
    corporateId: "org-corp-1",
    ngoId: "org-ngo-1",
    title: "Bihar Community Afforestation & Water Harvesting",
    amountInr: 18000000, // ₹1.8 Crore
    scheduleVii: "Item (iv) - Ensuring environmental sustainability, ecological balance, conservation of natural resources",
    startDate: "2025-06-01",
    endDate: "2026-05-31"
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    grantId: "grant-1",
    name: "Barmer Clean Water & School Sanitation",
    description: "Installation of community hand pumps, school toilet blocks, and multi-tap child handwashing stations across 12 arid desert villages in Barmer district.",
    activities: ["borewell_handpump", "toilet_block", "handwashing_station"],
    state: "Rajasthan",
    district: "Barmer",
    cldFolder: "saakshi/tata-trust/gramin-vikas/barmer-wash"
  },
  {
    id: "proj-2",
    grantId: "grant-2",
    name: "Nashik Smart Classrooms & Anganwadi Renovation",
    description: "Structural modernization of 8 village schools and Anganwadis with durable tin roofing, BALA learning wall murals, student study benches, and digital learning displays.",
    activities: ["classroom_construction", "smart_class", "anganwadi_renovation"],
    state: "Maharashtra",
    district: "Nashik",
    cldFolder: "saakshi/tata-trust/yuva-parivartan/nashik-edu"
  },
  {
    id: "proj-3",
    grantId: "grant-3",
    name: "Gaya Community Plantation & Pond Rejuvenation",
    description: "Desilting communal earthen village ponds to replenish groundwater tables, combined with 2,500 tree saplings protected by metal tree guards and micro-irrigation lines.",
    activities: ["plantation", "pond_rejuvenation", "solar_install"],
    state: "Bihar",
    district: "Gaya",
    cldFolder: "saakshi/tata-trust/gramin-vikas/gaya-environment"
  }
];

export const SEED_SITES: Site[] = [
  {
    id: "site-1",
    projectId: "proj-1",
    name: "Chohtan Primary School Site",
    centroid: [25.7512, 71.3985],
    geofence: [
      [25.7485, 71.394],
      [25.7545, 71.394],
      [25.7545, 71.403],
      [25.7485, 71.403]
    ]
  },
  {
    id: "site-2",
    projectId: "proj-1",
    name: "Baytu Gram Panchayat Kiosk",
    centroid: [25.882, 71.771],
    geofence: [
      [25.878, 71.765],
      [25.886, 71.765],
      [25.886, 71.777],
      [25.878, 71.777]
    ]
  },
  {
    id: "site-3",
    projectId: "proj-2",
    name: "Trimbak Zilla Parishad School",
    centroid: [19.9385, 73.535],
    geofence: [
      [19.934, 73.53],
      [19.943, 73.53],
      [19.943, 73.541],
      [19.934, 73.541]
    ]
  },
  {
    id: "site-4",
    projectId: "proj-2",
    name: "Dindori Anganwadi Center",
    centroid: [20.201, 73.834],
    geofence: [
      [20.196, 73.829],
      [20.206, 73.829],
      [20.206, 73.839],
      [20.196, 73.839]
    ]
  },
  {
    id: "site-5",
    projectId: "proj-3",
    name: "Bodh Gaya Bio-Diversity Grove",
    centroid: [24.698, 84.991],
    geofence: [
      [24.692, 84.985],
      [24.704, 84.985],
      [24.704, 84.997],
      [24.692, 84.997]
    ]
  },
  {
    id: "site-6",
    projectId: "proj-3",
    name: "Manpur Village Recharge Sump",
    centroid: [24.811, 85.035],
    geofence: [
      [24.805, 85.029],
      [24.817, 85.029],
      [24.817, 85.041],
      [24.805, 85.041]
    ]
  }
];

export const SEED_MILESTONES: Milestone[] = [
  // Project 1
  {
    id: "m-101",
    projectId: "proj-1",
    name: "Hand Pump Borewell & Concrete Apron",
    expectedDate: "2025-08-30",
    expectedSignals: ["handpump", "borewell", "concrete platform", "water tap"],
    questions: ["Is the concrete apron around the pump crack-free?", "Is clean drinking water actively flowing?"]
  },
  {
    id: "m-102",
    projectId: "proj-1",
    name: "Child-Friendly Handwashing Station",
    expectedDate: "2025-11-15",
    expectedSignals: ["multi-tap", "soap dispenser", "children", "tiled basin"],
    questions: ["Are multiple taps operational?", "Is there an active soap dispenser present?"]
  },
  {
    id: "m-103",
    projectId: "proj-1",
    name: "School Sanitation Block Completion",
    expectedDate: "2026-02-28",
    expectedSignals: ["toilet block", "doors", "water pipe", "vent pipe"],
    questions: ["Are privacy doors installed and lockable?", "Is running water plumbed to the block?"]
  },

  // Project 2
  {
    id: "m-201",
    projectId: "proj-2",
    name: "Roofing & Weatherproofing Overhaul",
    expectedDate: "2025-07-20",
    expectedSignals: ["roof", "tin sheets", "steel rafters", "classroom"],
    questions: ["Is the roof sealed against rain?", "Are steel rafters securely anchored?"]
  },
  {
    id: "m-202",
    projectId: "proj-2",
    name: "Dual Desk Delivery & Room Furnishing",
    expectedDate: "2025-10-10",
    expectedSignals: ["desks", "benches", "students", "blackboard"],
    questions: ["Are dual study desks arranged in rows?", "Are children seated at the desks?"]
  },
  {
    id: "m-203",
    projectId: "proj-2",
    name: "Smart Board & Audio-Visual Kit",
    expectedDate: "2026-01-25",
    expectedSignals: ["smart board", "digital display", "projector", "computer"],
    questions: ["Is the smart screen turned on and displaying educational content?"]
  },

  // Project 3
  {
    id: "m-301",
    projectId: "proj-3",
    name: "Pond Excavation & Desilting",
    expectedDate: "2025-09-15",
    expectedSignals: ["excavator", "earthen pond", "embankment", "water catchment"],
    questions: ["Is the pond bed deepened and free of excess silt?"]
  },
  {
    id: "m-302",
    projectId: "proj-3",
    name: "Afforestation Sapling Planting",
    expectedDate: "2025-11-30",
    expectedSignals: ["saplings", "tree guards", "plantation pits", "greenery"],
    questions: ["Are saplings protected by metal guards?", "Are trees planted in regular grid rows?"]
  },
  {
    id: "m-303",
    projectId: "proj-3",
    name: "Solar Pump & Micro-Irrigation Line",
    expectedDate: "2026-02-15",
    expectedSignals: ["solar panels", "drip irrigation", "water pump"],
    questions: ["Are solar photovoltaic panels mounted facing the sun?", "Are drip lines delivering water?"]
  }
];

export const SEED_ASSETS: Asset[] = [
  // Asset 1 - Barmer Hand Pump (Verified)
  {
    id: "ast-001",
    shortId: "WASH-01",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/barmer-wash/borewell_verified",
    cldVersion: 1711200001,
    cldAssetId: "cld-ast-001",
    resourceType: "image",
    format: "jpg",
    bytes: 2450120,
    width: 2048,
    height: 1536,
    secureUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    phash: "1011001101010101011100010101010100110011010101010111000101010101",
    uploaderId: "user-field-1",
    capturedAt: "2025-08-25T11:20:00Z",
    uploadedAt: "2025-08-25T11:22:30Z",
    exifTakenAt: "2025-08-25T11:20:00Z",
    exif: { Make: "Xiaomi", Model: "Redmi Note 12", Software: "MIUI Camera v4.2" },
    location: { latitude: 25.7513, longitude: 71.3986 },
    gpsAccuracyM: 4.2,
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-1",
    siteId: "site-1",
    milestoneId: "m-101",
    assignConfidence: 0.96,
    status: "assigned",
    trustScore: 100,
    trustBand: "verified",
    trustChecks: [],
    qualityScore: 0.92,
    consent: "written",
    caption: "Deep borewell hand pump operational with finished concrete apron in Chohtan village school.",
    activities: ["borewell_handpump"],
    tags: ["borewell", "handpump", "water", "concrete platform", "rajasthan"]
  },

  // Asset 2 - Barmer Hand Pump Burst Shot (Same site, 18 seconds apart -> 0 penalty burst check)
  {
    id: "ast-002",
    shortId: "WASH-02",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/barmer-wash/borewell_burst_angle2",
    cldVersion: 1711200002,
    cldAssetId: "cld-ast-002",
    resourceType: "image",
    format: "jpg",
    bytes: 2390400,
    width: 2048,
    height: 1536,
    secureUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
    phash: "1011001101010101011100010101010100110011010101010111000101010110", // Hamming distance 1
    uploaderId: "user-field-1",
    capturedAt: "2025-08-25T11:20:18Z",
    uploadedAt: "2025-08-25T11:22:31Z",
    exifTakenAt: "2025-08-25T11:20:18Z",
    location: { latitude: 25.7513, longitude: 71.3986 },
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-1",
    siteId: "site-1",
    milestoneId: "m-101",
    assignConfidence: 0.96,
    status: "assigned",
    trustScore: 100,
    trustBand: "verified",
    trustChecks: [
      {
        id: "duplicate",
        penalty: 0,
        severity: "info",
        reason: "Burst sequence shot: rapid capture taken within 24h at the same site as #WASH-01",
        evidence: { matchAssetId: "ast-001", isBurst: true }
      }
    ],
    qualityScore: 0.89,
    consent: "written",
    caption: "Side angle view of newly commissioned borewell pump showing wastewater soakaway pit drainage.",
    activities: ["borewell_handpump"]
  },

  // Asset 3 - Handwashing Station (Verified)
  {
    id: "ast-003",
    shortId: "WASH-03",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/barmer-wash/handwash_children",
    cldVersion: 1711200003,
    cldAssetId: "cld-ast-003",
    resourceType: "image",
    format: "jpg",
    bytes: 3105400,
    width: 2400,
    height: 1600,
    secureUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=1200&q=80",
    phash: "0101010111110000110011001010101001010101111100001100110010101010",
    uploaderId: "user-field-1",
    capturedAt: "2025-11-12T14:15:00Z",
    uploadedAt: "2025-11-12T14:18:00Z",
    exifTakenAt: "2025-11-12T14:15:00Z",
    location: { latitude: 25.7511, longitude: 71.3983 },
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-1",
    siteId: "site-1",
    milestoneId: "m-102",
    assignConfidence: 0.95,
    status: "assigned",
    trustScore: 100,
    trustBand: "verified",
    trustChecks: [],
    qualityScore: 0.95,
    consent: "verbal",
    caption: "School children using newly installed 6-tap handwashing station with active soap dispenser.",
    activities: ["handwashing_station"],
    tags: ["handwashing", "children", "hygiene", "soap", "school"]
  },

  // Asset 4 - School Sanitation Block Before (Baseline)
  {
    id: "ast-004",
    shortId: "WASH-04-B",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/barmer-wash/toilet_before",
    cldVersion: 1711200004,
    cldAssetId: "cld-ast-004",
    resourceType: "image",
    format: "jpg",
    bytes: 2650000,
    width: 2048,
    height: 1536,
    secureUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
    phash: "1111000011110000101010101010101011110000111100001010101010101010",
    uploaderId: "user-field-1",
    capturedAt: "2025-09-01T09:30:00Z",
    uploadedAt: "2025-09-01T09:35:00Z",
    exifTakenAt: "2025-09-01T09:30:00Z",
    location: { latitude: 25.7514, longitude: 71.3988 },
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-1",
    siteId: "site-1",
    milestoneId: "m-103",
    status: "assigned",
    trustScore: 95,
    trustBand: "verified",
    trustChecks: [],
    qualityScore: 0.88,
    consent: "none",
    caption: "Baseline status: dilapidated unplastered latrine pit with broken entry and zero running water.",
    activities: ["toilet_block"]
  },

  // Asset 5 - School Sanitation Block After (Completed) -> PAIR WITH AST-004
  {
    id: "ast-005",
    shortId: "WASH-05-A",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/barmer-wash/toilet_after",
    cldVersion: 1711200005,
    cldAssetId: "cld-ast-005",
    resourceType: "image",
    format: "jpg",
    bytes: 2890000,
    width: 2048,
    height: 1536,
    secureUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    phash: "1111000011110000101010101010101111110000111100001010101010101011",
    uploaderId: "user-field-1",
    capturedAt: "2026-02-24T16:00:00Z", // 176 days after baseline
    uploadedAt: "2026-02-24T16:05:00Z",
    exifTakenAt: "2026-02-24T16:00:00Z",
    location: { latitude: 25.7514, longitude: 71.3988 },
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-1",
    siteId: "site-1",
    milestoneId: "m-103",
    status: "assigned",
    trustScore: 100,
    trustBand: "verified",
    trustChecks: [],
    qualityScore: 0.94,
    consent: "written",
    caption: "Completed school sanitation block with running piped water, ceramic tiles, and private lockable doors.",
    activities: ["toilet_block"]
  },

  // Asset 6 - Nashik School Classroom Before (Baseline)
  {
    id: "ast-006",
    shortId: "EDU-01-B",
    cldPublicId: "saakshi/tata-trust/yuva-parivartan/nashik-edu/classroom_before",
    cldVersion: 1711200006,
    cldAssetId: "cld-ast-006",
    resourceType: "image",
    format: "jpg",
    bytes: 3200000,
    width: 2400,
    height: 1600,
    secureUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    phash: "1100110011001100001100110011001111001100110011000011001100110011",
    uploaderId: "user-field-1",
    capturedAt: "2025-06-15T10:00:00Z",
    uploadedAt: "2025-06-15T10:10:00Z",
    exifTakenAt: "2025-06-15T10:00:00Z",
    location: { latitude: 19.9386, longitude: 73.5352 },
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-2",
    projectId: "proj-2",
    siteId: "site-3",
    milestoneId: "m-201",
    status: "assigned",
    trustScore: 95,
    trustBand: "verified",
    trustChecks: [],
    qualityScore: 0.9,
    consent: "verbal",
    caption: "Baseline classroom view showing exposed rafters, broken tin sheets leaking rainwater, and no desks.",
    activities: ["classroom_construction"]
  },

  // Asset 7 - Nashik School Classroom After (Completed) -> PAIR WITH AST-006
  {
    id: "ast-007",
    shortId: "EDU-02-A",
    cldPublicId: "saakshi/tata-trust/yuva-parivartan/nashik-edu/classroom_after",
    cldVersion: 1711200007,
    cldAssetId: "cld-ast-007",
    resourceType: "image",
    format: "jpg",
    bytes: 3450000,
    width: 2400,
    height: 1600,
    secureUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    phash: "1100110011001100001100110011001111001100110011000011001100110001",
    uploaderId: "user-field-1",
    capturedAt: "2025-10-18T14:30:00Z", // 125 days after baseline
    uploadedAt: "2025-10-18T14:40:00Z",
    exifTakenAt: "2025-10-18T14:30:00Z",
    location: { latitude: 19.9386, longitude: 73.5352 },
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-2",
    projectId: "proj-2",
    siteId: "site-3",
    milestoneId: "m-202",
    status: "assigned",
    trustScore: 100,
    trustBand: "verified",
    trustChecks: [],
    qualityScore: 0.96,
    consent: "written",
    caption: "Refurbished weatherproof classroom with fresh whitewash, BALA wall art, and 20 dual student desks.",
    activities: ["classroom_construction", "school_desks"]
  },

  // Asset 8 - Planted Duplicate (Flagged - Reused photo from 2024 claimed in 2026!)
  {
    id: "ast-008",
    shortId: "DUP-FLAG",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/barmer-wash/reused_signboard_fraud",
    cldVersion: 1711200008,
    cldAssetId: "cld-ast-008",
    resourceType: "image",
    format: "jpg",
    bytes: 1890000,
    width: 1920,
    height: 1080,
    secureUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
    phash: "1011001101010101011100010101010100110011010101010111000101010101", // Exact match with ast-001!
    uploaderId: "user-field-1",
    capturedAt: "2026-03-01T10:00:00Z",
    uploadedAt: "2026-03-01T10:05:00Z",
    exifTakenAt: "2024-03-10T12:00:00Z", // EXIF date is from 2 years earlier!
    location: { latitude: 25.882, longitude: 71.771 }, // Different site (Baytu)
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-1",
    siteId: "site-2",
    milestoneId: "m-101",
    status: "review",
    trustScore: 20, // Severely penalized: 100 - 60 (dup) - 20 (time outside grant) = 20!
    trustBand: "flagged",
    trustChecks: [
      {
        id: "duplicate",
        penalty: 60,
        severity: "critical",
        reason: "Reused photo detected: exact visual match (Hamming distance 0) to asset #WASH-01 from Chohtan Site",
        evidence: { matchAssetId: "ast-001", hamming: 0 }
      },
      {
        id: "time",
        penalty: 20,
        severity: "critical",
        reason: "Out-of-period capture: image EXIF was taken in 2024, prior to active grant start",
        evidence: { exifTakenAt: "2024-03-10T12:00:00Z" }
      }
    ],
    qualityScore: 0.85,
    consent: "none",
    caption: "FLAGGED: Borewell claiming completion in Baytu is a duplicate of Chohtan school hand pump from previous year.",
    activities: ["borewell_handpump"]
  },

  // Asset 9 - Planted Out-Of-Geofence (Major breach >4km away)
  {
    id: "ast-009",
    shortId: "GEO-BREACH",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/gaya-environment/tree_far_away",
    cldVersion: 1711200009,
    cldAssetId: "cld-ast-009",
    resourceType: "image",
    format: "jpg",
    bytes: 2750000,
    width: 2048,
    height: 1536,
    secureUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    uploaderId: "user-field-1",
    capturedAt: "2025-11-20T12:00:00Z",
    uploadedAt: "2025-11-20T12:10:00Z",
    exifTakenAt: "2025-11-20T12:00:00Z",
    location: { latitude: 24.755, longitude: 85.085 }, // ~9km away from Bodh Gaya grove!
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-3",
    siteId: "site-5",
    milestoneId: "m-302",
    status: "review",
    trustScore: 75,
    trustBand: "review",
    trustChecks: [
      {
        id: "geofence",
        penalty: 25,
        severity: "critical",
        reason: "Major geofence breach: capture point is 9.2km outside designated site boundary 'Bodh Gaya Bio-Diversity Grove'",
        evidence: { distanceMeters: 9200, siteName: "Bodh Gaya Bio-Diversity Grove" }
      }
    ],
    qualityScore: 0.82,
    consent: "none",
    caption: "Tree plantation evidence uploaded with GPS coordinates outside the approved site boundary.",
    activities: ["plantation"]
  },

  // Asset 10 - Gaya Afforestation (Verified)
  {
    id: "ast-010",
    shortId: "ENV-01",
    cldPublicId: "saakshi/tata-trust/gramin-vikas/gaya-environment/sapling_plantation",
    cldVersion: 1711200010,
    cldAssetId: "cld-ast-010",
    resourceType: "image",
    format: "jpg",
    bytes: 3100000,
    width: 2400,
    height: 1600,
    secureUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    phash: "0000111100001111101010101010101000001111000011111010101010101010",
    uploaderId: "user-field-1",
    capturedAt: "2025-11-28T10:30:00Z",
    uploadedAt: "2025-11-28T10:35:00Z",
    exifTakenAt: "2025-11-28T10:30:00Z",
    location: { latitude: 24.6982, longitude: 84.9912 },
    orgCorporateId: "org-corp-1",
    orgNgoId: "org-ngo-1",
    projectId: "proj-3",
    siteId: "site-5",
    milestoneId: "m-302",
    status: "assigned",
    trustScore: 100,
    trustBand: "verified",
    trustChecks: [],
    qualityScore: 0.94,
    consent: "written",
    caption: "Neem and Peepal saplings planted with protective galvanized wire tree guards at Bodh Gaya site.",
    activities: ["plantation"]
  }
];

export const SEED_PAIRS: BeforeAfterPair[] = [
  {
    id: "pair-1",
    siteId: "site-1",
    milestoneId: "m-103",
    beforeAssetId: "ast-004",
    afterAssetId: "ast-005",
    compositeUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    score: 0.93,
    source: "auto",
    change: {
      changes: [
        { type: "added", object: "pucca toilet superstructure", evidence: "Left shows broken pit foundation; right shows completed 2-door sanitation unit" },
        { type: "added", object: "overhead water connection", evidence: "PVC pipe inlet connected to overhead 500L storage tank" },
        { type: "improved", object: "tiled floor & privacy doors", evidence: "Finished ceramic floor and lockable privacy doors" }
      ],
      counts: {
        units: { before: 0, after: 2 }
      },
      summary: "Sanitation block completed from foundation to finish; functional running water and privacy doors providing dignity to school students.",
      confidence: 0.95
    }
  },
  {
    id: "pair-2",
    siteId: "site-3",
    milestoneId: "m-202",
    beforeAssetId: "ast-006",
    afterAssetId: "ast-007",
    compositeUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    score: 0.95,
    source: "auto",
    change: {
      changes: [
        { type: "added", object: "weatherproof tin roof & steel trusses", evidence: "Left shows exposed open sky; right shows brand new watertight tin roof" },
        { type: "improved", object: "interior whitewash & BALA art", evidence: "Bright learning wall murals painted across classroom" },
        { type: "added", object: "dual student study desks", evidence: "20 dual study desks installed and in active daily use" }
      ],
      counts: {
        students: { before: 0, after: 38 },
        desks: { before: 0, after: 20 }
      },
      summary: "Roofing successfully completed and walls painted; modern classroom in active use with ~38 students attending classes.",
      confidence: 0.96
    }
  }
];

export const SEED_DERIVATIVES: Derivative[] = [
  {
    id: "der-001",
    assetId: "ast-001",
    assetVersion: 1711200001,
    transformation: "t_sk_thumb",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=400&h=300&q=80",
    purpose: "thumb",
    createdAt: "2025-08-25T11:23:00Z"
  },
  {
    id: "der-002",
    assetId: "ast-001",
    assetVersion: 1711200001,
    transformation: "t_sk_report",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&q=80",
    purpose: "report",
    createdAt: "2025-08-25T11:23:00Z"
  },
  {
    id: "der-003",
    assetId: "ast-001",
    assetVersion: 1711200001,
    transformation: "t_sk_public",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&q=80",
    purpose: "public",
    createdAt: "2025-08-25T11:23:00Z"
  }
];

export const SEED_REPORTS: Report[] = [
  {
    id: "rep-001",
    title: "Quarterly Funder Update — Q3 FY25-26",
    period: "Q3 FY 2025-26 (Oct – Dec 2025)",
    corporateName: "Tata Sustainability Trust",
    template: "Quarterly Funder Update",
    templateVersion: "v1.2",
    scope: { grantIds: ["grant-1", "grant-2"] },
    status: "published",
    pdfPublicId: "saakshi/reports/tata-trust/rep-001_q3_update",
    pdfUrl: "https://res.cloudinary.com/saakshi-demo/image/upload/v1/saakshi/reports/q3_funder_update.pdf",
    summaryNarrative:
      "Tata Sustainability Trust achieved 94% verified milestone coverage across Rajasthan and Maharashtra CSR programs in Q3. Handwashing stations and classroom weatherproofing reached full operational status [asset:WASH-03]. Over 450 school children benefit from restored water and dignified sanitation facilities [asset:WASH-05-A].",
    assetIds: ["ast-001", "ast-003", "ast-005", "ast-007"],
    createdAt: "2026-01-15T12:00:00Z",
    publishedAt: "2026-01-15T14:30:00Z"
  }
];

export const SEED_STORIES: Story[] = [
  {
    id: "sty-001",
    projectId: "proj-1",
    format: "reel_9_16",
    status: "rendered",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoPublicId: "saakshi/stories/barmer_wash_reel_9_16",
    script: {
      title: "Barmer Clean Water & Sanitation Impact Reel",
      beats: [
        { beat: 1, text: "In arid Barmer, clean water was a daily struggle." },
        { beat: 2, text: "Gramin Vikas Sansthan mapped 12 desert villages." },
        { beat: 3, text: "Together with Tata Trust, 15 new borewells were installed." },
        { beat: 4, text: "100% verified with GPS & immutable photographic proof." },
        { beat: 5, text: "Every Rupee Witnessed. Saakshi Evidence Vault." }
      ]
    },
    createdAt: "2026-02-10T16:00:00Z"
  }
];
