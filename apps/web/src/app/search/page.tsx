"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, ShieldCheck, Tag, MapPin, RefreshCw, ExternalLink, History } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function HybridSearchPage() {
  const { session, updateReusableData } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [facets, setFacets] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string>("");

  const executeSearch = async (searchTerm = query) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (selectedActivity) params.set("activity", selectedActivity);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.results || []);
      setFacets(data.facets || null);

      if (searchTerm.trim()) {
        const history = session?.reusableData?.recentSearches || [];
        const nextHistory = Array.from(new Set([searchTerm.trim(), ...history])).slice(0, 6);
        updateReusableData({ recentSearches: nextHistory });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [selectedActivity]);

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      {/* Top Console */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">HYBRID VECTOR + KEYWORD SEARCH</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">1536-DIM COGNITIVE RETRIEVAL</span>
        </div>
        <div className="text-[#8e9192]">
          TOTAL MATCHES: <span className="text-white font-bold">{results.length}</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#8e9192]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeSearch()}
            placeholder="Search with natural language (e.g. 'water purification in Barmer with high trust')..."
            className="w-full bg-[#0e0e0e] text-white border border-[#444748] pl-9 pr-4 py-2.5 font-code text-xs focus:outline-none focus:border-white"
          />
        </div>
        <button
          onClick={() => executeSearch()}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 font-bold uppercase cursor-pointer transition-colors"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "SEARCH"}
        </button>
      </div>

      {/* Filter Badges & Recent Searches */}
      <div className="flex items-center gap-2 flex-wrap mb-4 pb-3 border-b border-[#333]">
        {session?.reusableData?.recentSearches && session.reusableData.recentSearches.length > 0 && (
          <div className="flex items-center gap-1.5 mr-2">
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">RECENT:</span>
            {session.reusableData.recentSearches.map((rec) => (
              <button
                key={rec}
                onClick={() => {
                  setQuery(rec);
                  executeSearch(rec);
                }}
                className="bg-[#18261e] hover:bg-[#20362b] text-emerald-300 border border-emerald-700/60 px-2 py-0.5 text-[11px] cursor-pointer"
              >
                "{rec}"
              </button>
            ))}
          </div>
        )}
        <span className="text-[#8e9192]">SUGGESTED:</span>
        {[
          "water purification barmer",
          "solar pump installation",
          "school digital classroom",
          "afforestation plantation"
        ].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag);
              executeSearch(tag);
            }}
            className="bg-[#1b1b1b] hover:bg-[#333] text-[#c4c7c8] hover:text-white border border-[#444] px-2 py-0.5 text-[11px] cursor-pointer"
          >
            "{tag}"
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#8e9192]">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          <span>RUNNING HYBRID VECTOR RETRIEVAL & RERANKING...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="p-8 text-center bg-[#0e0e0e] border border-[#333] text-[#8e9192]">
          NO ASSETS MATCHING SEARCH QUERY
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((item, idx) => {
            const asset = item.asset;
            return (
              <div
                key={asset.id || idx}
                className="bg-[#0e0e0e] border border-[#333] hover:border-[#666] transition-colors flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="aspect-video bg-black relative">
                    <img
                      src={asset.secureUrl}
                      alt={asset.shortId}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 border border-[#444] px-1.5 py-0.5 text-[10px] text-emerald-400 font-bold">
                      SCORE: {(item.score * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/assets/${asset.shortId || asset.id}`}
                        className="text-white font-bold hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{asset.shortId}</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </Link>
                      <span
                        className={`px-1 text-[10px] font-bold border ${
                          asset.trustBand === "verified"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                            : "bg-red-500/20 text-red-300 border-red-500"
                        }`}
                      >
                        TRUST {asset.trustScore}%
                      </span>
                    </div>

                    <p className="text-[#c4c7c8] text-[11px] line-clamp-2">
                      {asset.caption || "Verified CSR on-site milestone evidence."}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-[#888]">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{item.site?.name || "Site"}</span>
                      <span>·</span>
                      <span>{item.project?.district || "District"}</span>
                    </div>

                    {item.whyMatched && item.whyMatched.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.whyMatched.map((w: string, i: number) => (
                          <span
                            key={i}
                            className="bg-[#1b1b1b] text-[9px] text-[#aaa] px-1 py-0.2 border border-[#333]"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 pt-0 border-t border-[#222] flex items-center justify-between">
                  <div className="text-[9px] text-[#666] truncate pt-2">
                    SHA-256: {asset.sha256 || "5f4dcc3b5aa765d61d8327deb882cf99"}
                  </div>
                  <Link
                    href={`/assets/${asset.shortId || asset.id}`}
                    className="text-[10px] text-emerald-400 hover:underline pt-2 font-bold cursor-pointer"
                  >
                    DOSSIER &gt;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
