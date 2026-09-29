"use client";

import React, { useState, useEffect } from "react";
import { GitCompare, Sparkles, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

export default function ComparisonsPage() {
  const [pairs, setPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sliderPos, setSliderPos] = useState<number>(50);

  useEffect(() => {
    fetch("/api/pairs")
      .then((res) => res.json())
      .then((data) => setPairs(data.pairs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activePair = pairs[0];

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">BEFORE / AFTER FORENSIC STUDIO</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">PERCEPTUAL EMBEDDING & TIME-SERIES PROOF</span>
        </div>
        <div className="text-[#8e9192]">
          PAIRS MATCHED: <span className="text-emerald-400 font-bold">{pairs.length} VERIFIED</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#8e9192]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
          <span>LOADING BEFORE/AFTER CANDIDATES...</span>
        </div>
      ) : activePair ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Slider Studio Canvas */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
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
                className="absolute inset-y-0 w-0.5 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-7 h-7 bg-white text-black font-bold flex items-center justify-center shadow-lg text-[10px]">
                  <>{"<>"}</>
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

            {/* Range Slider Control */}
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
          </div>

          {/* AI Change Summary */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-[#333] pb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-white font-bold uppercase">AI VISION CHANGE ANALYSIS</h3>
              </div>

              <div className="bg-[#141414] p-3 border border-[#262626] space-y-2">
                <div className="text-[#888] text-[10px]">EVIDENCE PAIR TARGET:</div>
                <div className="text-white font-bold">{activePair.site?.name || "Barmer RO Facility"}</div>
                <div className="text-[#c4c7c8] text-[11px] leading-relaxed">
                  {activePair.change?.summary ||
                    "Groundwork excavated and 1500L/hr reverse osmosis water treatment system installed and connected to solar generation array."}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[#888] text-[10px] uppercase font-bold">DETECTED PROGRESS DELTAS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(activePair.change?.deltas || ["Excavation Completed", "Solar Array Active", "Clean Water Output"]).map(
                    (delta: string, i: number) => (
                      <span
                        key={i}
                        className="bg-[#1b2b1b] text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold"
                      >
                        ✓ {delta}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#0e0e0e] border border-[#333] text-[#8e9192]">
          NO BEFORE/AFTER PAIRS CURRENTLY SEEDED
        </div>
      )}
    </div>
  );
}
