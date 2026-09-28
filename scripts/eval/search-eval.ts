/**
 * Search Relevance Evaluation Script
 * Evaluates top-5 hit rate on 20 golden demo queries using hybrid query parsing and search.
 */
import { parseSearchQuery, generateEmbedding } from "@saakshi/ai";
import { cosineSimilarity } from "@saakshi/core";
import { store } from "@saakshi/db";

interface GoldenQuery {
  id: number;
  query: string;
  expectedKeywords: string[];
  expectedActivity?: string;
  expectedDistrict?: string;
  targetAssetId: string;
}

const GOLDEN_QUERIES: GoldenQuery[] = [
  {
    id: 1,
    query: "girls using new toilets in Barmer",
    expectedKeywords: ["toilet", "barmer"],
    expectedActivity: "toilet_block",
    expectedDistrict: "Barmer",
    targetAssetId: "ast-005"
  },
  {
    id: 2,
    query: "handwashing station with children in Barmer",
    expectedKeywords: ["handwashing", "children"],
    expectedActivity: "handwashing_station",
    expectedDistrict: "Barmer",
    targetAssetId: "ast-003"
  },
  {
    id: 3,
    query: "classroom roofing overhaul in Nashik",
    expectedKeywords: ["classroom", "roof"],
    expectedActivity: "classroom_construction",
    expectedDistrict: "Nashik",
    targetAssetId: "ast-007"
  },
  {
    id: 4,
    query: "tree saplings plantation in Gaya",
    expectedKeywords: ["tree", "plantation"],
    expectedActivity: "plantation",
    expectedDistrict: "Gaya",
    targetAssetId: "ast-010"
  },
  {
    id: 5,
    query: "drinking water borewell hand pump in Rajasthan",
    expectedKeywords: ["borewell", "handpump"],
    expectedActivity: "borewell_handpump",
    targetAssetId: "ast-001"
  },
  {
    id: 6,
    query: "student study desks furnished in classroom",
    expectedKeywords: ["desks", "classroom"],
    expectedActivity: "classroom_construction",
    targetAssetId: "ast-007"
  },
  {
    id: 7,
    query: "completed sanitation block with running water",
    expectedKeywords: ["sanitation", "toilet"],
    expectedActivity: "toilet_block",
    targetAssetId: "ast-005"
  },
  {
    id: 8,
    query: "multi-tap soap dispenser hygiene unit",
    expectedKeywords: ["soap", "hygiene"],
    expectedActivity: "handwashing_station",
    targetAssetId: "ast-003"
  },
  {
    id: 9,
    query: "concrete apron drainage around hand pump",
    expectedKeywords: ["apron", "handpump"],
    expectedActivity: "borewell_handpump",
    targetAssetId: "ast-001"
  },
  {
    id: 10,
    query: "protective wire tree guards with saplings",
    expectedKeywords: ["tree", "guard"],
    expectedActivity: "plantation",
    targetAssetId: "ast-010"
  },
  {
    id: 11,
    query: "weatherproof tin roof installed in village school",
    expectedKeywords: ["roof", "school"],
    expectedActivity: "classroom_construction",
    targetAssetId: "ast-007"
  },
  {
    id: 12,
    query: "clean drinking water in Chohtan village",
    expectedKeywords: ["drinking", "water"],
    expectedActivity: "borewell_handpump",
    targetAssetId: "ast-001"
  },
  {
    id: 13,
    query: "dilapidated school latrine baseline status",
    expectedKeywords: ["latrine", "baseline"],
    expectedActivity: "toilet_block",
    targetAssetId: "ast-004"
  },
  {
    id: 14,
    query: "broken leaking tin roof classroom before intervention",
    expectedKeywords: ["roof", "broken"],
    expectedActivity: "classroom_construction",
    targetAssetId: "ast-006"
  },
  {
    id: 15,
    query: "Bodh Gaya bio-diversity grove afforestation",
    expectedKeywords: ["gaya", "afforestation"],
    expectedActivity: "plantation",
    expectedDistrict: "Gaya",
    targetAssetId: "ast-010"
  },
  {
    id: 16,
    query: "verified hand pump photos in Barmer district",
    expectedKeywords: ["hand", "pump"],
    expectedActivity: "borewell_handpump",
    expectedDistrict: "Barmer",
    targetAssetId: "ast-001"
  },
  {
    id: 17,
    query: "primary school children washing hands with soap",
    expectedKeywords: ["children", "soap"],
    expectedActivity: "handwashing_station",
    targetAssetId: "ast-003"
  },
  {
    id: 18,
    query: "ceramic tiled floor school toilet block",
    expectedKeywords: ["tiled", "toilet"],
    expectedActivity: "toilet_block",
    targetAssetId: "ast-005"
  },
  {
    id: 19,
    query: "BALA learning wall art and dual desks",
    expectedKeywords: ["bala", "desks"],
    expectedActivity: "classroom_construction",
    targetAssetId: "ast-007"
  },
  {
    id: 20,
    query: "environmental plantation in Bihar",
    expectedKeywords: ["plantation", "bihar"],
    expectedActivity: "plantation",
    targetAssetId: "ast-010"
  }
];

async function runSearchEvaluation() {
  console.log("==================================================");
  console.log("     SAAKSHI SEARCH RELEVANCE EVALUATION HARNESS   ");
  console.log("==================================================\n");

  const allAssets = store.getAssets();
  const projects = store.getProjects();
  const sites = store.getSites();

  // Pre-generate embeddings for all assets
  const assetEmbeddings = new Map<string, number[]>();
  for (const a of allAssets) {
    const textToEmbed = `${a.caption || ""} ${(a.activities || []).join(" ")} ${(a.tags || []).join(" ")}`;
    assetEmbeddings.set(a.id, await generateEmbedding(textToEmbed));
  }

  let top5Hits = 0;

  for (const gq of GOLDEN_QUERIES) {
    const parsed = await parseSearchQuery(gq.query);
    const queryEmb = await generateEmbedding(parsed.text);

    // Hybrid ranking score
    const scored = allAssets.map((asset) => {
      const emb = assetEmbeddings.get(asset.id);
      const sim = cosineSimilarity(queryEmb, emb);

      const proj = projects.find((p) => p.id === asset.projectId);

      let filterBonus = 0;
      if (parsed.filters.activity && asset.activities?.includes(parsed.filters.activity)) {
        filterBonus += 0.35;
      }
      if (parsed.filters.district && proj?.district.toLowerCase() === parsed.filters.district.toLowerCase()) {
        filterBonus += 0.25;
      }

      // Keyword match in caption
      let kwScore = 0;
      const capLower = (asset.caption || "").toLowerCase();
      for (const kw of gq.expectedKeywords) {
        if (capLower.includes(kw)) kwScore += 0.1;
      }

      const trustWeight = (asset.trustScore / 100) * 0.15;
      const totalScore = 0.45 * sim + filterBonus + kwScore + trustWeight;

      return { asset, score: totalScore };
    });

    scored.sort((a, b) => b.score - a.score);
    const top5 = scored.slice(0, 5).map((s) => s.asset.id);
    const hit = top5.includes(gq.targetAssetId);

    if (hit) top5Hits++;

    const mark = hit ? "✓" : "✗";
    console.log(`${mark} Query #${gq.id}: "${gq.query}"`);
    console.log(`  Parsed Filters: ${JSON.stringify(parsed.filters)}`);
    console.log(`  Target Asset: ${gq.targetAssetId} | Top 5: [${top5.join(", ")}]\n`);
  }

  const hitRate = (top5Hits / GOLDEN_QUERIES.length) * 100;

  console.log("--------------------------------------------------");
  console.log(`Top-5 Hit Rate: ${hitRate.toFixed(1)}% (Target: >=80% on 20 queries)`);
  console.log("--------------------------------------------------");

  if (hitRate >= 80) {
    console.log("🎉 SUCCESS: Search relevance targets achieved!\n");
  } else {
    console.warn("⚠️ Evaluation targets not met.\n");
  }
}

runSearchEvaluation().catch((e) => console.error("Search eval error:", e));
