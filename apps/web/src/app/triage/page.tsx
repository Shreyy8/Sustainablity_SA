"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye
} from "lucide-react";

export default function TriageInboxPage() {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<{ all: number; unassigned: number; low_trust: number; duplicate: number }>({
    all: 0,
    unassigned: 0,
    low_trust: 0,
    duplicate: 0
  });
  const [selectedQueue, setSelectedQueue] = useState<"all" | "duplicate" | "low_trust" | "unassigned">("all");
  const [loading, setLoading] = useState(true);
  const [adjudications, setAdjudications] = useState<Record<string, string>>({});

  const fetchQueue = async (queue: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/review?queue=${queue}`);
      if (!res.ok) throw new Error("HTTP error");
      const data = await res.json();
      setItems(data.items || []);
      if (data.counts) setCounts(data.counts);
    } catch (e) {
      console.error("Queue load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(selectedQueue);
  }, [selectedQueue]);

  const handleAdjudicate = (id: string, action: string) => {
    setAdjudications((prev) => ({ ...prev, [id]: action }));
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6">
      {/* Header Bar */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between font-code text-xs gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
          <span className="text-white font-bold">TRIAGE & ADJUDICATION INBOX</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">HUMAN-IN-THE-LOOP QUALITY GATE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8e9192]">QUEUE COUNT:</span>
          <span className="text-red-400 font-bold">{counts.all} PENDING</span>
        </div>
      </div>

      {/* Queue Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#444748] pb-3 mb-4 font-code text-xs">
        {(["all", "duplicate", "low_trust", "unassigned"] as const).map((q) => (
          <button
            key={q}
            onClick={() => setSelectedQueue(q)}
            className={`px-3 py-1.5 border font-bold uppercase transition-colors cursor-pointer ${
              selectedQueue === q
                ? "bg-white text-black border-white"
                : "bg-[#1b1b1b] text-[#8e9192] border-[#444] hover:text-white"
            }`}
          >
            {q.replace("_", " ")} [{counts[q] ?? 0}]
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#8e9192] font-code text-xs">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          <span>LOADING AUDIT QUEUE...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#444] bg-[#0e0e0e] font-code text-xs text-[#8e9192]">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-white font-bold">ALL QUEUES CLEAR</p>
          <p className="mt-1">No anomalous or low-trust evidence assets currently awaiting adjudication.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => {
            const asset = item.asset;
            const status = adjudications[asset.id];

            return (
              <div
                key={asset.id || idx}
                className={`bg-[#0e0e0e] border p-4 font-code text-xs transition-colors ${
                  status ? "border-emerald-500 opacity-70" : "border-[#444748]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between border-b border-[#333] pb-2 mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{asset.shortId || asset.id}</span>
                    <span className="text-[#888]">·</span>
                    <span className="text-[#c4c7c8]">{item.site?.name || "Target Site"}</span>
                    <span className="text-[#888]">·</span>
                    <span className="text-[#888]">{item.project?.name || "Project"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#888]">Trust Score:</span>
                    <span
                      className={`font-bold ${
                        asset.trustScore >= 80 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {asset.trustScore}%
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                        asset.trustBand === "flagged"
                          ? "bg-red-500/20 text-red-300 border-red-500"
                          : "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                      }`}
                    >
                      {asset.trustBand}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Evidence Image */}
                  <div className="md:col-span-4 bg-black border border-[#333] aspect-video relative overflow-hidden flex items-center justify-center">
                    <img
                      src={asset.secureUrl}
                      alt="Flagged Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Flag Analysis & Adjudication Actions */}
                  <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="text-[11px] text-[#8e9192]">REASON FOR AUDIT INTERVENTION:</div>
                      <div className="bg-[#181818] p-2.5 border border-[#333] text-white">
                        {asset.flaggedReason ||
                          asset.trustChecks
                            ?.filter((c: any) => c.penalty > 0)
                            .map((c: any) => `${c.name}: ${c.detail}`)
                            .join(" | ") ||
                          "Heuristic threshold penalty triggered."}
                      </div>

                      {item.duplicateMatch && (
                        <div className="bg-[#241313] p-2 border border-red-500 text-red-300 text-[11px]">
                          <strong>POTENTIAL DUPLICATE DETECTED:</strong> Matches prior asset{" "}
                          {item.duplicateMatch.shortId} with high perceptual hash similarity.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#222] gap-2">
                      <div className="text-[11px] text-[#888]">
                        {status ? (
                          <span className="text-emerald-400 font-bold">
                            DECISION RECORDED: {status}
                          </span>
                        ) : (
                          "ADJUDICATION REQUIRED FOR DISBURSEMENT CLEARANCE"
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjudicate(asset.id, "FRAUD_REJECTED")}
                          className="bg-[#2a1111] hover:bg-red-600 hover:text-white text-red-300 border border-red-500 px-3 py-1 font-bold cursor-pointer transition-colors"
                        >
                          REJECT (FRAUD)
                        </button>
                        <button
                          onClick={() => handleAdjudicate(asset.id, "LEGITIMATE_DUPLICATE")}
                          className="bg-[#1b1b1b] hover:bg-white hover:text-black text-white border border-[#444] px-3 py-1 font-bold cursor-pointer transition-colors"
                        >
                          APPROVE AS LEGITIMATE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
