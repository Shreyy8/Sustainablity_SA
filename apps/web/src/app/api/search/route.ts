import { NextResponse } from "next/server";
import { parseSearchQuery, generateEmbedding } from "@pluribus/ai";
import { cosineSimilarity, rateLimit } from "@pluribus/core";
import { store } from "@pluribus/db";

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "client";
    const limiter = await rateLimit(`search:${ip}`, { maxRequests: 60, windowSeconds: 60 });
    if (!limiter.success) {
      return NextResponse.json({ error: "Too many search requests. Please throttle." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const filterActivity = searchParams.get("activity") || undefined;
    const filterTrustMin = searchParams.get("trustMin") ? parseInt(searchParams.get("trustMin")!) : undefined;
    const filterDistrict = searchParams.get("district") || undefined;
    const filterState = searchParams.get("state") || undefined;

    const allAssets = store.getAssets();
    const projects = store.getProjects();
    const sites = store.getSites();

    // 1. Natural Language Query Parsing
    const parsed = query ? await parseSearchQuery(query) : { text: "", filters: {} };

    // Combine URL filters with parsed filters
    const activeFilters = {
      activity: filterActivity || parsed.filters.activity,
      district: filterDistrict || parsed.filters.district,
      state: filterState || parsed.filters.state,
      trustMin: filterTrustMin ?? parsed.filters.trustMin
    };

    // 2. Generate embedding for query text if query provided
    const queryEmb = query ? await generateEmbedding(parsed.text || query) : null;

    // 3. Score and Rank Assets
    const scoredAssets = await Promise.all(
      allAssets.map(async (asset) => {
        const proj = projects.find((p) => p.id === asset.projectId);
        const site = sites.find((s) => s.id === asset.siteId);

        let semanticSim = 0.5;
        if (queryEmb) {
          const assetEmb = await generateEmbedding(`${asset.caption || ""} ${(asset.activities || []).join(" ")}`);
          semanticSim = cosineSimilarity(queryEmb, assetEmb);
        }

        // Filter Match Bonus & Strict Gating
        let filterScore = 0;
        const whyMatched: string[] = [];

        if (activeFilters.activity) {
          if (asset.activities?.includes(activeFilters.activity)) {
            filterScore += 0.35;
            whyMatched.push(`Activity: ${activeFilters.activity.replace(/_/g, " ")}`);
          }
        }

        if (activeFilters.district) {
          if (proj?.district.toLowerCase() === activeFilters.district.toLowerCase()) {
            filterScore += 0.25;
            whyMatched.push(`District: ${proj?.district}`);
          }
        }

        if (activeFilters.state) {
          if (proj?.state.toLowerCase() === activeFilters.state.toLowerCase()) {
            filterScore += 0.2;
            whyMatched.push(`State: ${proj?.state}`);
          }
        }

        if (activeFilters.trustMin !== undefined) {
          if (asset.trustScore >= activeFilters.trustMin) {
            whyMatched.push(`Trust ≥ ${activeFilters.trustMin}`);
          }
        }

        // Keyword matching in caption/tags
        const qTerms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
        for (const term of qTerms) {
          if (asset.caption?.toLowerCase().includes(term)) {
            whyMatched.push(`Caption: "${term}"`);
          } else if (asset.tags?.some((t) => t.toLowerCase().includes(term))) {
            whyMatched.push(`Tag: "${term}"`);
          }
        }

        // Hybrid formula: 0.5*sim + 0.2*trust + 0.1*quality + filterScore
        const trustNorm = (asset.trustScore || 80) / 100;
        const qualityNorm = asset.qualityScore ?? 0.85;

        const totalScore = Number((0.5 * semanticSim + 0.2 * trustNorm + 0.1 * qualityNorm + filterScore).toFixed(3));

        return {
          asset,
          project: proj,
          site,
          score: totalScore,
          whyMatched: Array.from(new Set(whyMatched))
        };
      })
    );

    // Sort by relevance score
    scoredAssets.sort((a, b) => b.score - a.score);

    // 4. Facet Aggregations
    const facetActivities: Record<string, number> = {};
    const facetDistricts: Record<string, number> = {};
    const facetTrustBands: Record<string, number> = { verified: 0, review: 0, flagged: 0 };

    for (const item of scoredAssets) {
      if (item.asset.activities) {
        for (const act of item.asset.activities) {
          facetActivities[act] = (facetActivities[act] || 0) + 1;
        }
      }
      if (item.project?.district) {
        facetDistricts[item.project.district] = (facetDistricts[item.project.district] || 0) + 1;
      }
      if (item.asset.trustBand) {
        facetTrustBands[item.asset.trustBand] = (facetTrustBands[item.asset.trustBand] || 0) + 1;
      }
    }

    return NextResponse.json({
      query,
      parsedQuery: parsed,
      activeFilters,
      totalResults: scoredAssets.length,
      results: scoredAssets,
      facets: {
        activities: facetActivities,
        districts: facetDistricts,
        trustBands: facetTrustBands
      }
    });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 500 });
  }
}
