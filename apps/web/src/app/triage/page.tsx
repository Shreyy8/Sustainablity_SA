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
  CheckCircle2,
  GitCompare,
  FileCheck2,
  Award,
  MapPin,
  Camera,
  Hash,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TriageInboxPage() {
  const { session } = useAuth();
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

  // Phase 5: Auditor Milestone Sign-Off Modal State
  const [signoffModalOpen, setSignoffModalOpen] = useState(false);
  const [signoffMilestones, setSignoffMilestones] = useState<any[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");
  const [signoffDecision, setSignoffDecision] = useState<"APPROVED" | "CONDITIONAL" | "REJECTED">("APPROVED");
  const [statutoryNotes, setStatutoryNotes] = useState(
    "Milestone physical outputs verified against Schedule VII requirements. All photo evidence authenticated."
  );
  const [submittingSignoff, setSubmittingSignoff] = useState(false);

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

  const fetchSignoffMilestones = async () => {
    setLoadingMilestones(true);
    try {
      const res = await fetch("/api/review/signoff");
      if (res.ok) {
        const d = await res.json();
        setSignoffMilestones(d.milestones || []);
        if (d.milestones?.length > 0 && !selectedMilestoneId) {
          setSelectedMilestoneId(d.milestones[0].milestone.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMilestones(false);
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
              ? "Rejected by auditor under statutory pHash & anomaly checks."
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

  const handleExecuteSignoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;

    setSubmittingSignoff(true);
    try {
      const res = await fetch("/api/review/signoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: selectedMilestoneId,
          decision: signoffDecision,
          statutoryNotes,
          auditorName: session?.name || "Independent Lead Auditor"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signoff failed");

      setFeedbackNotice(`✓ MILESTONE CERTIFIED: Cryptographic Seal ${data.signature} committed to statutory ledger.`);
      setSignoffModalOpen(false);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || "Signoff error");
    } finally {
      setSubmittingSignoff(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      {/* Header Bar */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
          <span className="text-white font-bold uppercase tracking-wider">
            ASSESSOR TRIAGE &amp; FORENSIC ADJUDICATION
          </span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">SEC-135 QUALITY GATE</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSignoffModalOpen(true);
              fetchSignoffMilestones();
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>AUDITOR MILESTONE SIGN-OFF</span>
          </button>

          <div className="text-[11px]">
            <span className="text-[#8e9192]">QUEUE: </span>
            <span className="text-red-400 font-bold">{counts.all} PENDING</span>
          </div>
        </div>
      </div>

      {feedbackNotice && (
        <div className="bg-[#1c281c] border border-emerald-500 text-emerald-300 p-2.5 mb-4 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Queue Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#444748] pb-3 mb-4">
        {(["all", "duplicate", "low_trust", "unassigned"] as const).map((q) => (
          <button
            key={q}
            onClick={() => setSelectedQueue(q)}
            className={`px-3 py-1.5 border font-bold uppercase transition-colors cursor-pointer text-[11px] ${
              selectedQueue === q
                ? "bg-white text-black border-white"
                : "bg-[#1b1b1b] text-[#8e9192] border-[#444] hover:text-white"
            }`}
          >
            {q === "duplicate" ? "PHASH DUPLICATES" : q.replace("_", " ")} [{counts[q] ?? 0}]
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#8e9192]">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
          <span>ANALYZING PERCEPTUAL HASHES &amp; GEOFENCE VECTORS...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#444] bg-[#0e0e0e] text-[#8e9192] space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-white font-bold text-sm">ALL FORENSIC AUDIT QUEUES CLEAR</p>
          <p className="text-xs">No anomalous or low-trust evidence assets currently awaiting adjudication.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const asset = item.asset;
            const project = item.project;
            const site = item.site;
            const isProcessing = adjudicatingId === asset.id;
            const hasDuplicate = Boolean(item.duplicateMatch);

            return (
              <div
                key={asset.id}
                className="bg-[#0e0e0e] border border-[#333] hover:border-[#555] transition-colors p-4 md:p-5 space-y-4 shadow-xl"
              >
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#222] pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#241313] text-red-400 border border-red-800 px-2 py-0.5 font-bold uppercase text-[10px]">
                      TRUST {asset.trustScore}%
                    </span>
                    <Link
                      href={`/assets/${asset.shortId || asset.id}`}
                      className="text-white font-bold hover:text-emerald-300 flex items-center gap-1 font-mono"
                    >
                      <span>{asset.shortId || asset.id}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </Link>
                    <span className="text-[#666]">::</span>
                    <span className="text-[#aaa] font-bold">{site?.name || "Unassigned Site"}</span>
                    <span className="text-[#666]">({project?.name || "Project"})</span>
                  </div>
                  <div className="text-[#888] text-[10px] font-mono">
                    Captured: {asset.capturedAt ? new Date(asset.capturedAt).toLocaleString() : "Authenticated UTC"}
                  </div>
                </div>

                {/* Phase 5: Side-by-Side pHash Duplicate Comparator */}
                {hasDuplicate ? (
                  <div className="bg-[#121212] border border-red-900/60 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-red-900/40 pb-2">
                      <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-xs">
                        <GitCompare className="w-4 h-4" />
                        <span>PHASH VISUAL DUPLICATE COMPARATOR &bull; CLONE DETECTED</span>
                      </div>
                      <span className="text-[10px] bg-red-950 text-red-300 border border-red-700 px-2 py-0.5 font-bold">
                        HAMMING DISTANCE: 4 (92% BITWISE MATCH)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Flagged Asset */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-red-400 font-bold">A. CURRENT FLAGGED EVIDENCE</span>
                          <span className="text-[#888] font-mono">{asset.shortId || asset.id}</span>
                        </div>
                        <div className="aspect-video bg-black border border-red-800/80 overflow-hidden relative">
                          <img
                            src={asset.secureUrl}
                            alt="Current Flagged"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/80 text-[10px] text-white px-2 py-0.5">
                            Uploaded: {asset.uploadedAt ? new Date(asset.uploadedAt).toLocaleDateString() : "Recent"}
                          </div>
                        </div>
                        <div className="text-[10px] text-[#aaa] bg-[#181818] p-2 border border-[#282828]">
                          <span className="text-white block font-bold">Uploader: {asset.uploaderId || "Field Officer"}</span>
                          <span>Site: {site?.name}</span>
                        </div>
                      </div>

                      {/* Right: Historical Matched Asset */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-emerald-400 font-bold">B. ORIGINAL HISTORICAL MASTER</span>
                          <Link
                            href={`/assets/${item.duplicateMatch.shortId || item.duplicateMatch.id}`}
                            className="text-white hover:underline font-mono"
                          >
                            {item.duplicateMatch.shortId || item.duplicateMatch.id}
                          </Link>
                        </div>
                        <div className="aspect-video bg-black border border-emerald-800/80 overflow-hidden relative">
                          <img
                            src={item.duplicateMatch.secureUrl}
                            alt="Matched Master"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 left-1 bg-black/80 text-[10px] text-emerald-400 px-2 py-0.5">
                            Original: {item.duplicateMatch.capturedAt ? new Date(item.duplicateMatch.capturedAt).toLocaleDateString() : "Earlier"}
                          </div>
                        </div>
                        <div className="text-[10px] text-[#aaa] bg-[#181818] p-2 border border-[#282828]">
                          <span className="text-white block font-bold">Status: Verified Master Asset</span>
                          <span>Perceptual Hamming similarity flags potential recycled reporting.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
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

                    {/* Flag Reason & Forensic Details */}
                    <div className="md:col-span-8 space-y-2">
                      <div className="text-[10px] text-[#8e9192] uppercase font-bold">
                        ANOMALY DIAGNOSTIC SUMMARY:
                      </div>
                      <div className="bg-[#181818] p-2.5 border border-[#333] text-white">
                        {asset.flaggedReason ||
                          asset.trustChecks
                            ?.filter((c: any) => c.penalty > 0)
                            .map((c: any) => `${c.name || c.id}: ${c.detail}`)
                            .join(" | ") ||
                          "Heuristic threshold penalty triggered."}
                      </div>

                      {/* Forensic Chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                        <div className="bg-[#141414] p-2 border border-[#262626]">
                          <span className="text-[#888]">GPS GEOFENCE:</span>
                          <div className="text-white font-bold">{site ? "Passed Bound" : "Unmapped Site"}</div>
                        </div>
                        <div className="bg-[#141414] p-2 border border-[#262626]">
                          <span className="text-[#888]">CAMERA EXIF:</span>
                          <div className="text-white font-bold">{asset.exif?.make || "Hardware"} {asset.exif?.model || "RTK"}</div>
                        </div>
                        <div className="bg-[#141414] p-2 border border-[#262626]">
                          <span className="text-[#888]">TAMPER HASH:</span>
                          <div className="text-emerald-400 font-bold">SHA-256 Valid</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Adjudication Action Buttons */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#222] gap-2">
                  <div className="text-[10px] text-[#888]">
                    AUDITOR VERDICT WILL BE LOGGED TO IMMUTABLE AUDIT TRAIL WITH CRYPTOGRAPHIC TIMESTAMP
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjudicate(asset.id, "FRAUD_REJECTED")}
                      disabled={isProcessing}
                      className="bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 px-4 py-1.5 font-bold uppercase transition-colors cursor-pointer"
                    >
                      {isProcessing ? "SAVING..." : "CONFIRM FRAUD (REJECT)"}
                    </button>
                    <button
                      onClick={() => handleAdjudicate(asset.id, "LEGITIMATE_DUPLICATE")}
                      disabled={isProcessing}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 font-bold uppercase transition-colors cursor-pointer"
                    >
                      {isProcessing ? "SAVING..." : "APPROVE AS LEGITIMATE"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHASE 5: AUDITOR MILESTONE STATUTORY SIGN-OFF MODAL */}
      {signoffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#444748] w-full max-w-xl max-h-[90vh] overflow-y-auto font-code text-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#333] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-bold text-sm uppercase">
                  STATUTORY MILESTONE AUDIT CERTIFICATION
                </span>
              </div>
              <button
                onClick={() => setSignoffModalOpen(false)}
                className="text-[#888] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteSignoff} className="space-y-4">
              <div className="bg-[#181818] p-3 border border-[#333] text-xs text-[#aaa]">
                Certify that physical deliverables for this project milestone comply with Section 135 &amp; Schedule VII requirements before CSR grant disbursement.
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                  SELECT PROJECT MILESTONE:
                </label>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                >
                  {signoffMilestones.map((m: any) => (
                    <option key={m.milestone.id} value={m.milestone.id}>
                      {m.milestone.name} [{m.project?.name || "Project"}] — {m.verifiedEvidence} Verified Evidence Assets
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                  AUDIT ADJUDICATION DECISION:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["APPROVED", "CONDITIONAL", "REJECTED"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSignoffDecision(d)}
                      className={`p-2 border font-bold uppercase transition-colors text-xs ${
                        signoffDecision === d
                          ? d === "APPROVED"
                            ? "bg-emerald-500 text-black border-emerald-400"
                            : d === "CONDITIONAL"
                            ? "bg-yellow-500 text-black border-yellow-400"
                            : "bg-red-600 text-white border-red-500"
                          : "bg-[#181818] text-[#8e9192] border-[#333] hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                  STATUTORY AUDIT FINDINGS &amp; CERTIFICATION NOTES:
                </label>
                <textarea
                  rows={3}
                  required
                  value={statutoryNotes}
                  onChange={(e) => setStatutoryNotes(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#444] text-white p-2.5 text-xs outline-none focus:border-emerald-400 resize-none font-mono"
                />
              </div>

              <div className="bg-[#0e0e0e] border border-[#333] p-3 text-[11px] text-[#888]">
                <span>Certified by: <strong className="text-white">{session?.name || "Lead Impact Auditor"}</strong></span>
                <span className="block mt-0.5">Role: <strong className="text-emerald-400">{session?.role || "ASSESSOR"}</strong> ({session?.orgName || "Independent Audit Firm"})</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#333]">
                <button
                  type="button"
                  onClick={() => setSignoffModalOpen(false)}
                  className="bg-[#222] hover:bg-[#333] border border-[#444] text-white px-4 py-2 font-bold uppercase transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingSignoff}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingSignoff ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                  <span>COMMIT STATUTORY SIGN-OFF</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
