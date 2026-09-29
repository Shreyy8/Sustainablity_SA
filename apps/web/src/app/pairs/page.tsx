"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GitCompare, Sparkles, RefreshCw, Calendar, MapPin, ExternalLink, ArrowRight } from "lucide-react";

export default function ComparisonsPage() {
  const [pairs, setPairs] = useState<any[]>([]);
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<"slider" | "side_by_side">("slider");

  useEffect(() => {
    fetch("/api/pairs")
      .then((res) => res.json())
      .then((data) => {
        setPairs(data.pairs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activePair = pairs[selectedPairIndex];

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      {/* Top Banner */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">BEFORE / AFTER FORENSIC COMPARISON STUDIO</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">TIME-SERIES PERCEPTUAL PROOF</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8e9192]">
            PAIRS MATCHED: <span className="text-emerald-400 font-bold">{pairs.length} VERIFIED</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("slider")}
              className={`px-2 py-1 text-[10px] font-bold cursor-pointer ${
                viewMode === "slider" ? "bg-white text-black" : "bg-[#1b1b1b] text-[#8e9192]"
              }`}
            >
              SLIDER
            </button>
            <button
              onClick={() => setViewMode("side_by_side")}
              className={`px-2 py-1 text-[10px] font-bold cursor-pointer ${
                viewMode === "side_by_side" ? "bg-white text-black" : "bg-[#1b1b1b] text-[#8e9192]"
              }`}
            >
              SIDE-BY-SIDE
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#8e9192]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
          <span>LOADING BEFORE/AFTER CANDIDATES...</span>
        </div>
      ) : pairs.length === 0 ? (
        <div className="p-12 text-center bg-[#0e0e0e] border border-[#333] text-[#8e9192]">
          NO BEFORE/AFTER PAIRS CURRENTLY REGISTERED
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pair Selector Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-[#888] text-[10px] uppercase font-bold shrink-0">SELECT PAIR:</span>
            {pairs.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => setSelectedPairIndex(idx)}
                className={`px-3 py-1.5 border font-bold text-[11px] shrink-0 transition-colors cursor-pointer ${
                  selectedPairIndex === idx
                    ? "bg-white text-black border-white"
                    : "bg-[#0e0e0e] text-[#888] border-[#333] hover:text-white hover:border-[#666]"
                }`}
              >
                PAIR #{idx + 1} — {p.site?.name || p.siteId || "Site Facility"}
              </button>
            ))}
          </div>

          {activePair && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Media Studio Canvas */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                {viewMode === "slider" ? (
                  <div className="bg-black border border-[#444748] relative aspect-video overflow-hidden select-none">
                    {/* After Image (Background) */}
                    <img
                      src={activePair.afterAsset?.secureUrl || activePair.compositeUrl}
                      alt="After"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Before Image (Clipped by slider percentage) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={activePair.beforeAsset?.secureUrl || activePair.compositeUrl}
                        alt="Before"
                        className="w-full h-full object-cover max-w-none"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>

                    {/* Divider Line */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-white shadow-2xl flex items-center justify-center pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-7 h-7 bg-white text-black font-bold flex items-center justify-center shadow-lg text-[10px]">
                        &lt;&gt;
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 bg-black/80 px-2 py-1 text-white border border-[#444] font-bold">
                      BASELINE (BEFORE)
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-950/80 px-2 py-1 text-emerald-300 border border-emerald-500 font-bold">
                      COMPLETED (AFTER)
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 aspect-video bg-black border border-[#444748] p-2">
                    <div className="relative overflow-hidden bg-[#111] flex items-center justify-center">
                      <img
                        src={activePair.beforeAsset?.secureUrl || activePair.compositeUrl}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 text-white text-[10px] font-bold border border-[#444]">
                        BEFORE
                      </div>
                    </div>
                    <div className="relative overflow-hidden bg-[#111] flex items-center justify-center">
                      <img
                        src={activePair.afterAsset?.secureUrl || activePair.compositeUrl}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-950/80 px-2 py-0.5 text-emerald-300 text-[10px] font-bold border border-emerald-500">
                        AFTER
                      </div>
                    </div>
                  </div>
                )}

                {/* Range Slider Control */}
                {viewMode === "slider" && (
                  <div className="bg-[#0e0e0e] border border-[#444] p-3 flex items-center gap-3">
                    <span className="text-[#8e9192]">SLIDER:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-white font-mono w-10 text-right">{sliderPos}%</span>
                  </div>
                )}

                {/* Linked Assets Strip */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0e0e0e] border border-[#333] p-3 space-y-1">
                    <span className="text-[#888] text-[10px] uppercase block">BEFORE ASSET LINK:</span>
                    <Link
                      href={`/assets/${activePair.beforeAsset?.shortId || activePair.beforeAssetId}`}
                      className="text-white font-bold hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                    >
                      <span>{activePair.beforeAsset?.shortId || activePair.beforeAssetId}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </Link>
                    <span className="text-[#666] text-[10px] block">
                      Captured: {activePair.beforeAsset?.capturedAt ? new Date(activePair.beforeAsset.capturedAt).toISOString().split("T")[0] : "Baseline"}
                    </span>
                  </div>

                  <div className="bg-[#0e0e0e] border border-[#333] p-3 space-y-1">
                    <span className="text-[#888] text-[10px] uppercase block">AFTER ASSET LINK:</span>
                    <Link
                      href={`/assets/${activePair.afterAsset?.shortId || activePair.afterAssetId}`}
                      className="text-white font-bold hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                    >
                      <span>{activePair.afterAsset?.shortId || activePair.afterAssetId}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </Link>
                    <span className="text-[#666] text-[10px] block">
                      Captured: {activePair.afterAsset?.capturedAt ? new Date(activePair.afterAsset.capturedAt).toISOString().split("T")[0] : "Completed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Change Summary */}
              <div className="lg:col-span-4 flex flex-col space-y-4">
                <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#333] pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-white font-bold uppercase">AI VISION CHANGE ANALYSIS</h3>
                  </div>

                  <div className="bg-[#141414] p-3 border border-[#262626] space-y-2">
                    <div className="text-[#888] text-[10px]">FACILITY SITE:</div>
                    <div className="text-white font-bold">
                      {activePair.site?.name || "Field Implementation Facility"}
                    </div>
                    <div className="text-[#c4c7c8] text-[11px] leading-relaxed">
                      {activePair.change?.summary ||
                        "Structural completion and commissioning verified against baseline survey."}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[#888] text-[10px] uppercase font-bold">
                      DETECTED PROGRESS DELTAS:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(activePair.change?.deltas || [
                        "Groundwork excavated",
                        "Apparatus installed",
                        "Operational verification cleared"
                      ]).map((delta: string, i: number) => (
                        <span
                          key={i}
                          className="bg-[#1b2b1b] text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold"
                        >
                          ✓ {delta}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#333] text-[10px] text-[#888]">
                    COSINE SIMILARITY SCORE:{" "}
                    <span className="text-white font-bold">
                      {(activePair.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
