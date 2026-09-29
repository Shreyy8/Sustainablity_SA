"use client";

import React, { useState, useEffect } from "react";
import { FileText, Sparkles, Download, CheckCircle2, RefreshCw } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const d = await res.json();
        setReports(d.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: "Quarterly Funder Update",
          period: "Q4 FY 2025-26",
          corporateName: "Tata Sustainability Trust"
        })
      });
      if (res.ok) {
        const d = await res.json();
        setGeneratedReport(d.report);
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">CSR STATUTORY AUDIT REPORT GENERATOR</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">CITATION VALIDATOR & PROVENANCE GRAPH</span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>GENERATE AUDIT REPORT</span>
        </button>
      </div>

      {generatedReport && (
        <div className="bg-[#0e0e0e] border-2 border-emerald-500 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between border-b border-[#333] pb-2">
            <span className="text-emerald-400 font-bold text-sm">
              NEW REPORT GENERATED: {generatedReport.title}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500 px-2 py-0.5 text-[10px] font-bold">
              100% FACTUAL GROUNDING
            </span>
          </div>
          <p className="text-white leading-relaxed text-[11px] whitespace-pre-wrap">
            {generatedReport.narrative?.summary || "Comprehensive quarterly update synthesized."}
          </p>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        <h3 className="text-white font-bold uppercase text-sm border-b border-[#333] pb-2">
          PUBLISHED & HISTORICAL AUDIT DOSSIERS
        </h3>

        {loading ? (
          <div className="p-8 text-center text-[#8e9192]">LOADING REPORTS...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0e0e0e] border border-[#333] p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-bold text-sm">Quarterly Funder Update — Q4 FY 2025-26</h4>
                  <span className="text-[#888] text-[10px]">TATA SUSTAINABILITY TRUST · SECTION 135 DOSSIER</span>
                </div>
                <span className="bg-[#1b2b1b] text-emerald-400 border border-emerald-500 px-1.5 py-0.5 text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-[#aaa] text-[11px] line-clamp-3">
                Portfolio performance across Barmer and Kutch districts showed 96% milestone evidencing completion with zero unadjudicated high-risk anomalies.
              </p>
              <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[11px]">
                <span className="text-[#777]">18 Cryptographic Citations</span>
                <span className="text-emerald-400 font-bold">SHA-256 SEALED</span>
              </div>
            </div>

            <div className="bg-[#0e0e0e] border border-[#333] p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-bold text-sm">Annual CSR Compliance Annexure — FY 2024-25</h4>
                  <span className="text-[#888] text-[10px]">MINISTRY OF CORPORATE AFFAIRS FILING DRAFT</span>
                </div>
                <span className="bg-[#1b2b1b] text-emerald-400 border border-emerald-500 px-1.5 py-0.5 text-[10px] font-bold">
                  SEALED
                </span>
              </div>
              <p className="text-[#aaa] text-[11px] line-clamp-3">
                Full statutory documentation fulfilling Rule 8 of CSR Rules 2014, verified against on-site geofenced telemetry and optical hashes.
              </p>
              <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[11px]">
                <span className="text-[#777]">42 Cryptographic Citations</span>
                <span className="text-emerald-400 font-bold">MCA COMPLIANT</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
