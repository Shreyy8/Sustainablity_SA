/**
 * Auto-Assignment Accuracy Evaluation Script
 * Tests candidate ranking and auto-assignment thresholds across seed locations and activities.
 */
import { scoreAssignment, rankAssignments } from "@saakshi/core";
import { SEED_SITES, SEED_PROJECTS, SEED_MILESTONES } from "@saakshi/db";

interface AssignmentTestCase {
  name: string;
  asset: {
    location: { latitude: number; longitude: number };
    activities: string[];
    tags: string[];
    capturedAt: string;
  };
  expectedSiteId: string;
  expectedProjectId: string;
  shouldAutoAssign: boolean;
}

const TEST_CASES: AssignmentTestCase[] = [
  // 1. Chohtan School - inside geofence with WASH activities
  {
    name: "Chohtan Borewell - Inside Geofence with WASH tags",
    asset: {
      location: { latitude: 25.7512, longitude: 71.3985 },
      activities: ["borewell_handpump"],
      tags: ["handpump", "concrete platform", "water"],
      capturedAt: "2025-08-25T11:20:00Z"
    },
    expectedSiteId: "site-1",
    expectedProjectId: "proj-1",
    shouldAutoAssign: true
  },
  // 2. Trimbak School - inside geofence with classroom activities
  {
    name: "Trimbak Classroom - Inside Geofence with Education tags",
    asset: {
      location: { latitude: 19.9385, longitude: 73.535 },
      activities: ["classroom_construction", "school_desks"],
      tags: ["desks", "roof", "classroom"],
      capturedAt: "2025-10-18T14:30:00Z"
    },
    expectedSiteId: "site-3",
    expectedProjectId: "proj-2",
    shouldAutoAssign: true
  },
  // 3. Bodh Gaya Plantation - inside geofence with plantation activities
  {
    name: "Bodh Gaya Plantation - Inside Geofence with Environment tags",
    asset: {
      location: { latitude: 24.698, longitude: 84.991 },
      activities: ["plantation"],
      tags: ["saplings", "tree guards", "greenery"],
      capturedAt: "2025-11-28T10:30:00Z"
    },
    expectedSiteId: "site-5",
    expectedProjectId: "proj-3",
    shouldAutoAssign: true
  },
  // 4. Chohtan School - 120m buffer distance outside boundary (still within buffer)
  {
    name: "Chohtan Handwash - 120m outside polygon (Buffer hit)",
    asset: {
      location: { latitude: 25.7555, longitude: 71.394 }, // ~110m outside
      activities: ["handwashing_station"],
      tags: ["handwashing", "soap", "tap"],
      capturedAt: "2025-11-12T14:15:00Z"
    },
    expectedSiteId: "site-1",
    expectedProjectId: "proj-1",
    shouldAutoAssign: true
  },
  // 5. Far out location (12km away) -> Must NOT auto-assign, route to Review queue
  {
    name: "Distant Photo (12km from boundary) -> Send to Review",
    asset: {
      location: { latitude: 25.65, longitude: 71.28 },
      activities: ["borewell_handpump"],
      tags: ["handpump"],
      capturedAt: "2025-08-25T11:20:00Z"
    },
    expectedSiteId: "site-1",
    expectedProjectId: "proj-1",
    shouldAutoAssign: false
  }
];

function runAssignmentEvaluation() {
  console.log("==================================================");
  console.log("   SAAKSHI AUTO-ASSIGNMENT EVALUATION HARNESS    ");
  console.log("==================================================\n");

  const candidatesList = SEED_SITES.map((site) => {
    const proj = SEED_PROJECTS.find((p) => p.id === site.projectId)!;
    const mls = SEED_MILESTONES.filter((m) => m.projectId === site.projectId);
    return { site, project: proj, milestones: mls };
  });

  let correctAssignments = 0;
  let correctAutoAssignDecisions = 0;

  for (const tc of TEST_CASES) {
    const ranked = rankAssignments(tc.asset, candidatesList);
    const top = ranked[0];

    const isSiteCorrect = top.siteId === tc.expectedSiteId;
    const isAutoAssignDecisionCorrect = top.autoAssign === tc.shouldAutoAssign;

    if (isSiteCorrect) correctAssignments++;
    if (isAutoAssignDecisionCorrect) correctAutoAssignDecisions++;

    const mark = isSiteCorrect && isAutoAssignDecisionCorrect ? "✓" : "✗";
    console.log(`${mark} [${tc.name}]`);
    console.log(`  Top Candidate: ${top.siteName} (Score: ${top.score})`);
    console.log(`  Auto-assign Decision: ${top.autoAssign ? "YES" : "NO"} (Expected: ${tc.shouldAutoAssign ? "YES" : "NO"})`);
    console.log(`  Components: Geo=${top.components.geoScore.toFixed(2)}, Activity=${top.components.activityScore.toFixed(2)}, Date=${top.components.dateScore.toFixed(2)}\n`);
  }

  const accuracy = (correctAssignments / TEST_CASES.length) * 100;
  const decisionAccuracy = (correctAutoAssignDecisions / TEST_CASES.length) * 100;

  console.log("--------------------------------------------------");
  console.log(`Site Assignment Accuracy:   ${accuracy.toFixed(1)}% (Target: >=80%)`);
  console.log(`Auto-Assign Gating Accuracy: ${decisionAccuracy.toFixed(1)}% (Target: >=80%)`);
  console.log("--------------------------------------------------");

  if (accuracy >= 80 && decisionAccuracy >= 80) {
    console.log("🎉 SUCCESS: Auto-assignment accuracy targets achieved!\n");
  } else {
    console.warn("⚠️ Evaluation targets not met.\n");
  }
}

runAssignmentEvaluation();
