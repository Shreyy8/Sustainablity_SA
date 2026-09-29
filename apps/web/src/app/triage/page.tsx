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
  Eye,
  CheckCircle2
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
  const [adjudicatingId, setAdjudicatingId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

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

  const handleAdjudicate = async (
    assetId: string,
    action: "FRAUD_REJECTED" | "LEGITIMATE_DUPLICATE"
  ) => {
    try {
      setAdjudicatingId(assetId);
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          action,
          notes:
            action === "FRAUD_REJECTED"
              ? "Rejected by auditor under statutory anomaly checks."
              : "Approved by auditor as distinct legitimate field proof."
        })
      });

      if (!res.ok) {
        throw new Error("Adjudication API failed");
      }

      const data = await res.json();
      if (data.counts) setCounts(data.counts);

      // Remove the adjudicated item from the current view
      setItems((prev) => prev.filter((item) => item.asset?.id !== assetId));

      setFeedbackNotice(
        action === "FRAUD_REJECTED"
          ? `[!] ASSET ${assetId} FLAGGED AS FRAUD AND REJECTED`
          : `[✓] ASSET ${assetId} CLEARED AND MARKED VERIFIED`
      );
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      console.error("Adjudication error:", err);
      alert(err.message || "Failed to adjudicate asset");
    } finally {
      setAdjudicatingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      {/* Header Bar */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
          <span className="text-white font-bold">TRIAGE &amp; ADJUDICATION INBOX</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">HUMAN-IN-THE-LOOP QUALITY GATE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8e9192]">QUEUE COUNT:</span>
          <span className="text-red-400 font-bold">{counts.all} PENDING</span>
        </div>
      </div>

      {feedbackNotice && (
        <div className="bg-[#1c281c] border border-emerald-500 text-emerald-300 p-2.5 mb-4 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Queue Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#444748] pb-3 mb-4">
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
        <div className="flex items-center justify-center p-12 text-[#8e9192]">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
          <span>LOADING AUDIT QUEUE...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#444] bg-[#0e0e0e] text-[#8e9192]">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-white font-bold">ALL QUEUES CLEAR</p>
          <p className="mt-1">No anomalous or low-trust evidence assets currently awaiting adjudication.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const asset = item.asset;
            const project = item.project;
            const site = item.site;
            const isProcessing = adjudicatingId === asset.id;

            return (
              <div
                key={asset.id}
                className="bg-[#0e0e0e] border border-[#333] hover:border-[#555] transition-colors p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between border-b border-[#222] pb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#241313] text-red-400 border border-red-800 px-2 py-0.5 font-bold uppercase text-[10px]">
                      TRUST {asset.trustScore}%
                    </span>
                    <Link
                      href={`/assets/${asset.shortId || asset.id}`}
                      className="text-white font-bold hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>{asset.shortId || asset.id}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </Link>
                    <span className="text-[#666]">::</span>
                    <span className="text-[#888]">{site?.name || "Unassigned Site"}</span>
                  </div>
                  <div className="text-[#888] text-[10px]">
                    Captured: {asset.capturedAt ? new Date(asset.capturedAt).toISOString().split("T")[0] : "Recorded"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Thumbnail Preview */}
                  <div className="md:col-span-4 aspect-video bg-black overflow-hidden relative border border-[#222]">
                    <img
                      src={asset.secureUrl}
                      alt={asset.caption || "Asset"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/80 text-[9px] text-[#aaa] px-1.5 py-0.5">
                      {asset.caption || "Photo evidence"}
                    </div>
                  </div>

                  {/* Flag Reason & Actions */}
                  <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="text-[10px] text-[#8e9192] uppercase font-bold">
                        REASON FOR AUDIT INTERVENTION:
                      </div>
                      <div className="bg-[#181818] p-2.5 border border-[#333] text-white">
                        {asset.flaggedReason ||
                          asset.trustChecks
                            ?.filter((c: any) => c.penalty > 0)
                            .map((c: any) => `${c.name || c.id}: ${c.detail}`)
                            .join(" | ") ||
                          "Heuristic threshold penalty triggered."}
                      </div>

                      {item.duplicateMatch && (
                        <div className="bg-[#241313] p-2 border border-red-500 text-red-300 text-[11px]">
                          <strong>POTENTIAL DUPLICATE DETECTED:</strong> Matches prior asset{" "}
                          <Link
                            href={`/assets/${item.duplicateMatch.shortId || item.duplicateMatch.id}`}
                            className="underline font-bold"
                          >
                            {item.duplicateMatch.shortId || item.duplicateMatch.id}
                          </Link>{" "}
                          with high perceptual hash similarity.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#222] gap-2">
                      <div className="text-[10px] text-[#888]">
                        AUDITOR DECISION WILL BE COMMITTED TO COMPLIANCE AUDIT TRAIL
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjudicate(asset.id, "FRAUD_REJECTED")}
                          disabled={isProcessing}
                          className="bg-[#2a1111] hover:bg-red-600 hover:text-white text-red-300 border border-red-500 px-3 py-1 font-bold cursor-pointer transition-colors"
                        >
                          {isProcessing ? "SAVING..." : "REJECT (FRAUD)"}
                        </button>
                        <button
                          onClick={() => handleAdjudicate(asset.id, "LEGITIMATE_DUPLICATE")}
                          disabled={isProcessing}
                          className="bg-[#1b1b1b] hover:bg-white hover:text-black text-white border border-[#444] px-3 py-1 font-bold cursor-pointer transition-colors"
                        >
                          {isProcessing ? "SAVING..." : "APPROVE AS LEGITIMATE"}
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
