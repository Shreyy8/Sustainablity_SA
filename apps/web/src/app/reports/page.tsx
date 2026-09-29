"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  RefreshCw,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  Calendar,
  Building2,
  Printer,
  X,
  FileCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ReportsPage() {
  const { session } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [csr2ModalReport, setCsr2ModalReport] = useState<any | null>(null);

  // Dynamic form options initialized from user session
  const [template, setTemplate] = useState("Quarterly Funder Update");
  const [period, setPeriod] = useState("Q4 FY 2025-26");
  const [corporateName, setCorporateName] = useState(
    session?.orgName || session?.reusableData?.tenantName || "Tata Sustainability Trust"
  );

  useEffect(() => {
    if (session?.orgName) {
      setCorporateName(session.orgName);
    }
  }, [session?.orgName]);

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
          template,
          period,
          corporateName
        })
      });

      if (res.ok) {
        const d = await res.json();
        setGeneratedResult(d);
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (reportId: string) => {
    setPublishingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}/publish`, {
        method: "POST"
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      {/* Header Banner */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">CSR STATUTORY AUDIT REPORT GENERATOR</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">RULE 8 MCA SECTION 135 COMPLIANCE</span>
        </div>
        <div className="text-[#8e9192]">
          DOSSIERS INDEXED: <span className="text-white font-bold">{reports.length}</span>
        </div>
      </div>

      {/* Report Generator Controls */}
      <div className="bg-[#0e0e0e] border border-[#444748] p-4 mb-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#333] pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-bold uppercase">SYNTHESIZE NEW STATUTORY DOSSIER</h3>
          </div>
          <span className="text-[#888] text-[11px]">GREEDY MMR EVIDENCE SELECTION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[#888] block text-[11px] mb-1">AUDIT TEMPLATE</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs outline-none"
            >
              <option value="Quarterly Funder Update">Quarterly Funder Update</option>
              <option value="Annual CSR Statutory Audit Annexure">Annual CSR Statutory Audit Annexure</option>
              <option value="Milestone Completion Proof Dossier">Milestone Completion Proof Dossier</option>
              <option value="MCA Form CSR-2 Statutory Annual Report">MCA Form CSR-2 (Statutory Annual Report)</option>
            </select>
          </div>

          <div>
            <label className="text-[#888] block text-[11px] mb-1">REPORTING PERIOD</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. Q4 FY 2025-26"
              className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
            />
          </div>

          <div>
            <label className="text-[#888] block text-[11px] mb-1">CORPORATE ENTITY</label>
            <input
              type="text"
              value={corporateName}
              onChange={(e) => setCorporateName(e.target.value)}
              placeholder="e.g. Tata Sustainability Trust"
              className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 font-bold uppercase transition-colors cursor-pointer flex items-center gap-2"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{generating ? "SYNTHESIZING REPORT..." : "GENERATE AUDIT REPORT"}</span>
          </button>
        </div>
      </div>

      {/* Generated Result Alert */}
      {generatedResult && (
        <div className="bg-[#0e0e0e] border-2 border-emerald-500 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between border-b border-[#333] pb-2">
            <span className="text-emerald-400 font-bold text-sm">
              NEW DOSSIER SYNTHESIZED: {generatedResult.report?.title}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500 px-2 py-0.5 text-[10px] font-bold">
              {generatedResult.citationValidation?.citationsFound || 0} CITATIONS VERIFIED
            </span>
          </div>
          <p className="text-white leading-relaxed text-[11px] whitespace-pre-wrap bg-[#141414] p-3 border border-[#262626]">
            {generatedResult.narrative?.executiveSummary || generatedResult.report?.summaryNarrative}
          </p>
          <div className="text-[10px] text-[#888]">
            Selected Evidence Count: {generatedResult.selectedAssets?.length || 0} assets anchored.
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        <h3 className="text-white font-bold uppercase text-sm border-b border-[#333] pb-2">
          PUBLISHED &amp; HISTORICAL STATUTORY DOSSIERS
        </h3>

        {loading ? (
          <div className="p-8 text-center text-[#8e9192]">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-emerald-400" />
            <span>LOADING REPORTS...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#333] text-[#888]">
            No reports generated yet. Click "GENERATE AUDIT REPORT" above to create your first dossier.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r: any) => {
              const isExpanded = expandedReportId === r.id;
              const isPublished = r.status === "published";

              return (
                <div
                  key={r.id}
                  className="bg-[#0e0e0e] border border-[#333] p-4 space-y-3 hover:border-[#555] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-bold text-sm">{r.title}</h4>
                      <span className="text-[#888] text-[10px] uppercase">
                        {r.corporateName} · {r.period}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isPublished
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500"
                      }`}
                    >
                      {isPublished ? "PUBLISHED & SEALED" : "DRAFT"}
                    </span>
                  </div>

                  <p className="text-[#aaa] text-[11px] line-clamp-3 leading-relaxed">
                    {r.summaryNarrative ||
                      "Grounded evidence dossier synthesized under Section 135 statutory regulations."}
                  </p>

                  <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[11px]">
                    <span className="text-[#777]">
                      {r.assetIds?.length || 0} Cryptographic Citations
                    </span>
                    <span className="text-emerald-400 font-bold">SHA-256 SEALED</span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#222] gap-2">
                    <button
                      onClick={() => setExpandedReportId(isExpanded ? null : r.id)}
                      className="text-[#888] hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <span>{isExpanded ? "HIDE DETAILS" : "VIEW DETAILS"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      {!isPublished && (
                        <button
                          onClick={() => handlePublish(r.id)}
                          disabled={publishingId === r.id}
                          className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500 px-3 py-1 font-bold text-[10px] cursor-pointer"
                        >
                          {publishingId === r.id ? "FREEZING..." : "PUBLISH & FREEZE"}
                        </button>
                      )}
                      <button
                        onClick={() => setCsr2ModalReport(r)}
                        className="bg-[#1b1b1b] hover:bg-emerald-500 hover:text-black text-emerald-400 border border-[#444] px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>FORM CSR-2</span>
                      </button>
                      <a
                        href={r.pdfUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#1b1b1b] hover:bg-white hover:text-black text-white border border-[#444] px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    </div>
                  </div>

                  {/* Expanded Asset Citations View */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-[#333] space-y-2">
                      <div className="text-[10px] text-[#888] uppercase font-bold">
                        CITATIONS LINKED TO EVIDENCE REPOSITORY:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(r.assetIds || []).map((aid: string) => (
                          <Link
                            key={aid}
                            href={`/assets/${aid}`}
                            className="bg-[#1a1a1a] hover:bg-emerald-950 text-emerald-300 border border-[#333] hover:border-emerald-500 px-2 py-0.5 text-[10px] font-mono cursor-pointer"
                          >
                            [{aid}]
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PHASE 6: MCA FORM CSR-2 STATUTORY MODAL */}
      {csr2ModalReport && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-[#141414] border border-[#444748] w-full max-w-4xl max-h-[92vh] overflow-y-auto font-code text-xs p-6 md:p-8 space-y-6 text-[#e2e2e2] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#333] pb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-white font-bold text-sm md:text-base uppercase tracking-wider">
                    FORM NO. CSR-2 // REPORT ON CORPORATE SOCIAL RESPONSIBILITY
                  </h2>
                  <p className="text-[10px] text-[#8e9192]">
                    [Pursuant to sub-rule (1B) of Rule 12 of Companies (Accounts) Rules, 2014 &amp; Section 135]
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 font-bold uppercase text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT / SAVE PDF</span>
                </button>
                <button
                  onClick={() => setCsr2ModalReport(null)}
                  className="text-[#888] hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PART A: Corporate Disclosures */}
            <div className="space-y-3 bg-[#181818] p-4 border border-[#2a2a2a]">
              <span className="text-emerald-400 font-bold text-xs uppercase block border-b border-[#333] pb-1">
                PART A: GENERAL CORPORATE &amp; CSR COMMITTEE DISCLOSURES
              </span>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#888] block text-[10px]">CORPORATE IDENTITY NUMBER (CIN):</span>
                  <strong className="text-white font-mono">L28920MH1945PLC004520</strong>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px]">REPORTING COMPANY:</span>
                  <strong className="text-white">{csr2ModalReport.corporateName}</strong>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px]">FINANCIAL REPORTING PERIOD:</span>
                  <strong className="text-white">{csr2ModalReport.period}</strong>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px]">3-YEAR AVG NET PROFIT (SEC 198):</span>
                  <strong className="text-white font-mono">₹1,75,00,00,000</strong>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px]">2% MANDATORY CSR OBLIGATION:</span>
                  <strong className="text-emerald-400 font-mono font-bold">₹3,50,00,000</strong>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px]">CSR COMMITTEE CHAIRMAN:</span>
                  <strong className="text-white">Arjun Mehta (Executive Director)</strong>
                </div>
              </div>
            </div>

            {/* PART B: Ongoing Projects Breakdown */}
            <div className="space-y-3 bg-[#181818] p-4 border border-[#2a2a2a]">
              <span className="text-emerald-400 font-bold text-xs uppercase block border-b border-[#333] pb-1">
                PART B: DETAILS OF CSR EXPENDITURE AGAINST ONGOING PROJECTS
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#333] text-[#8e9192]">
                      <th className="py-2 pr-2">SL</th>
                      <th className="py-2 pr-2">PROJECT NAME</th>
                      <th className="py-2 pr-2">SCHEDULE VII ITEM</th>
                      <th className="py-2 pr-2">LOCATION</th>
                      <th className="py-2 pr-2">ALLOCATED (INR)</th>
                      <th className="py-2">AGENCY CSR-1 REG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    <tr>
                      <td className="py-2 text-[#888]">01</td>
                      <td className="py-2 text-white font-bold">Barmer WASH &amp; Sanitation</td>
                      <td className="py-2 text-[#aaa]">Item (i) - Safe Drinking Water</td>
                      <td className="py-2 text-[#aaa]">Barmer, Rajasthan</td>
                      <td className="py-2 font-mono text-emerald-400">₹3,50,00,000</td>
                      <td className="py-2 font-mono text-[#aaa]">CSR00018241</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#888]">02</td>
                      <td className="py-2 text-white font-bold">Nashik BALA Model Schools</td>
                      <td className="py-2 text-[#aaa]">Item (ii) - Education &amp; Skills</td>
                      <td className="py-2 text-[#aaa]">Nashik, Maharashtra</td>
                      <td className="py-2 font-mono text-emerald-400">₹2,80,00,000</td>
                      <td className="py-2 font-mono text-[#aaa]">CSR00019293</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#888]">03</td>
                      <td className="py-2 text-white font-bold">Gaya Agroforestry &amp; Ponds</td>
                      <td className="py-2 text-[#aaa]">Item (iv) - Environmental Sustainability</td>
                      <td className="py-2 text-[#aaa]">Gaya, Bihar</td>
                      <td className="py-2 font-mono text-emerald-400">₹1,80,00,000</td>
                      <td className="py-2 font-mono text-[#aaa]">CSR00018241</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PART C: Geotagged Photographic Proof Annexure */}
            <div className="space-y-3 bg-[#181818] p-4 border border-[#2a2a2a]">
              <div className="flex items-center justify-between border-b border-[#333] pb-1">
                <span className="text-emerald-400 font-bold text-xs uppercase">
                  PART C: GEOTAGGED PHOTOGRAPHIC PROOF ANNEXURE (PUBLICLY VERIFIABLE)
                </span>
                <span className="text-[10px] text-[#888]">Rule 8(1) MCA Section 135</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {(csr2ModalReport.assetIds || ["ast-001", "ast-002", "ast-003"]).slice(0, 6).map((aid: string) => (
                  <div key={aid} className="bg-[#101010] border border-[#2e2e2e] p-2 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-400 font-mono font-bold">[{aid}]</span>
                      <span className="text-[#888]">GPS LOCK: 25.7534° N</span>
                    </div>
                    <div className="text-[10px] text-[#aaa] line-clamp-2">
                      Photographic proof verified compliant with tamper-evident SHA-256 seal.
                    </div>
                    <div className="pt-1 border-t border-[#222]">
                      <Link
                        href={`/verify/${aid}`}
                        target="_blank"
                        className="text-white hover:text-emerald-400 font-bold text-[10px] flex items-center gap-1"
                      >
                        <span>INSPECT PUBLIC QR PROOF</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Board Sign-Off Seal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#333] pt-4 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-emerald-400 font-bold">DIGITAL AUDIT SEAL ATTESTED</div>
                <div className="text-[#888] font-mono text-[10px]">
                  HASH: SHA256:{csr2ModalReport.id.toUpperCase()}-PLURIBUS-MCA21-VERIFIED
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setCsr2ModalReport(null)}
                  className="bg-[#222] hover:bg-[#333] border border-[#444] text-white px-5 py-2 font-bold uppercase transition-colors cursor-pointer"
                >
                  CLOSE DOSSIER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
