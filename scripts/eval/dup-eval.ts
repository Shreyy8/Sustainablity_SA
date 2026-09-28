/**
 * Duplicate Detection Recall and Precision Evaluation Script
 * Tests duplicate detection algorithm against planted duplicates, cropped variants,
 * and verifies burst-shot false positive protection.
 */
import { duplicateCheck, computeTrustScore } from "@saakshi/core";

interface TestCase {
  name: string;
  isDuplicate: boolean;
  isBurst: boolean;
  asset: any;
  matches: any[];
  expectedPenalty: number;
}

const TEST_CASES: TestCase[] = [
  // 1. Planted Exact Duplicate in different project
  {
    name: "Planted Exact Duplicate (Baytu vs Chohtan)",
    isDuplicate: true,
    isBurst: false,
    asset: {
      id: "ast-008",
      projectId: "proj-1",
      siteId: "site-2",
      capturedAt: "2026-03-01T10:00:00Z"
    },
    matches: [
      {
        matchAssetId: "ast-001",
        hamming: 0,
        projectId: "proj-1",
        siteId: "site-1", // different site!
        capturedAt: "2025-08-25T11:20:00Z"
      }
    ],
    expectedPenalty: 60
  },
  // 2. Near Duplicate (Hamming = 3, cropped/color shifted)
  {
    name: "Planted Near Duplicate (Hamming 3, recompressed)",
    isDuplicate: true,
    isBurst: false,
    asset: {
      id: "ast-dup-2",
      projectId: "proj-2",
      siteId: "site-3",
      capturedAt: "2026-01-15T12:00:00Z"
    },
    matches: [
      {
        matchAssetId: "ast-006",
        hamming: 3,
        projectId: "proj-2",
        siteId: "site-4",
        capturedAt: "2025-06-15T10:00:00Z"
      }
    ],
    expectedPenalty: 60
  },
  // 3. Near Duplicate (Hamming = 8)
  {
    name: "Near Duplicate (Hamming 8)",
    isDuplicate: true,
    isBurst: false,
    asset: {
      id: "ast-dup-3",
      capturedAt: "2026-02-01T10:00:00Z"
    },
    matches: [
      {
        matchAssetId: "ast-prev",
        hamming: 8,
        capturedAt: "2025-10-01T10:00:00Z"
      }
    ],
    expectedPenalty: 30
  },
  // 4. Burst Sequence Shot: Same site, same milestone, 15 seconds apart -> Must NOT be penalized!
  {
    name: "Burst Sequence Shot (Same site, same milestone, 15s apart)",
    isDuplicate: false,
    isBurst: true,
    asset: {
      id: "ast-002",
      projectId: "proj-1",
      siteId: "site-1",
      milestoneId: "m-101",
      capturedAt: "2025-08-25T11:20:15Z"
    },
    matches: [
      {
        matchAssetId: "ast-001",
        hamming: 1,
        projectId: "proj-1",
        siteId: "site-1",
        milestoneId: "m-101",
        capturedAt: "2025-08-25T11:20:00Z"
      }
    ],
    expectedPenalty: 0
  },
  // 5. Clean Unique Photo
  {
    name: "Clean Unique Photo (No matches)",
    isDuplicate: false,
    isBurst: false,
    asset: {
      id: "ast-unique",
      projectId: "proj-3",
      siteId: "site-5",
      capturedAt: "2025-11-28T10:30:00Z"
    },
    matches: [],
    expectedPenalty: 0
  }
];

function runDuplicateEvaluation() {
  console.log("==================================================");
  console.log("   SAAKSHI DUPLICATE DETECTION EVALUATION HARNESS ");
  console.log("==================================================\n");

  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  for (const tc of TEST_CASES) {
    const result = duplicateCheck(tc.matches, tc.asset);
    const penalty = result ? result.penalty : 0;
    const isFlaggedAsDuplicate = penalty > 0;

    let passed = false;
    if (tc.isDuplicate) {
      if (isFlaggedAsDuplicate && penalty === tc.expectedPenalty) {
        truePositives++;
        passed = true;
      } else {
        falseNegatives++;
      }
    } else {
      if (!isFlaggedAsDuplicate && penalty === 0) {
        trueNegatives++;
        passed = true;
      } else {
        falsePositives++;
      }
    }

    const mark = passed ? "✓" : "✗";
    console.log(`${mark} [${tc.name}]`);
    console.log(`  Expected Penalty: -${tc.expectedPenalty} | Actual Penalty: -${penalty}`);
    if (result) {
      console.log(`  Reason: ${result.reason}`);
    }
    console.log("");
  }

  const totalDuplicates = truePositives + falseNegatives;
  const recall = totalDuplicates > 0 ? (truePositives / totalDuplicates) * 100 : 100;
  const precision =
    truePositives + falsePositives > 0
      ? (truePositives / (truePositives + falsePositives)) * 100
      : 100;

  console.log("--------------------------------------------------");
  console.log(`Duplicate Recall:    ${recall.toFixed(1)}% (Target: >=95%)`);
  console.log(`Duplicate Precision: ${precision.toFixed(1)}% (Target: >=90%)`);
  console.log(`Burst False Alarms:  ${falsePositives} (Target: 0)`);
  console.log("--------------------------------------------------");

  if (recall >= 95 && precision >= 90 && falsePositives === 0) {
    console.log("🎉 SUCCESS: Duplicate evaluation metrics achieved!\n");
  } else {
    console.warn("⚠️ Evaluation targets not met.\n");
  }
}

runDuplicateEvaluation();
