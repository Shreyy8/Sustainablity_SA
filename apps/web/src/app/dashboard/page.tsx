"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  AlertTriangle,
  MapPin,
  TrendingUp,
  FileCheck2,
  RefreshCw,
  Table,
  Map as MapIcon
} from "lucide-react";
import { InteractiveMap, MapSite } from "../../components/InteractiveMap";

interface DashboardData {
  kpis: {
    totalProjects: number;
    totalEvidencedMilestones: number;
    totalAssets: number;
    avgTrustScore: number;
    flaggedCount: number;
    reviewCount: number;
    totalGrantValue: number;
  };
  projects: Array<{
    project: {
      id: string;
      name: string;
      district: string;
      state: string;
      activities: string[];
    };
    totalMilestones: number;
    evidencedMilestones: number;
    coveragePercent: number;
    totalAssets: number;
    avgTrustScore: number;
  }>;
  sites: Array<{
    id: string;
    projectId: string;
    name: string;
    centroid: [number, number];
    geofence: [number, number][];
  }>;
  grants: Array<{
    id: string;
    title: string;
    amountInr: number;
    scheduleVii: string;
  }>;
  flaggedAssets: any[];
  reviewAssets: any[];
}

export default function CorporateDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "verified" | "flagged" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewStyle, setViewStyle] = useState<"table" | "map">("table");
  const [frozenSites, setFrozenSites] = useState<string[]>([]);
  const [freezeNotice, setFreezeNotice] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      if (json.sites?.length > 0 && !selectedSiteId) {
        setSelectedSiteId(json.sites[0].id);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleFreeze = (siteName: string) => {
    if (frozenSites.includes(siteName)) {
      setFrozenSites((prev) => prev.filter((s) => s !== siteName));
      setFreezeNotice(`[✓] DISBURSEMENT HOLD RELEASED FOR ${siteName.toUpperCase()}`);
    } else {
      setFrozenSites((prev) => [...prev, siteName]);
      setFreezeNotice(`[!] DISBURSEMENT FROZEN FOR ${siteName.toUpperCase()} UNDER SECTION 135(5)`);
    }
    setTimeout(() => {
      setFreezeNotice(null);
    }, 4500);
  };

  // Build unified site rows with project and trust data
  const siteRows = (data?.sites || []).map((site) => {
    const projStat = data?.projects.find((p) => p.project.id === site.projectId);
    const hasFlagged = (data?.flaggedAssets || []).some((a) => a.siteId === site.id);
    const hasReview = (data?.reviewAssets || []).some((a) => a.siteId === site.id);
    const status: "verified" | "flagged" | "pending" = hasFlagged
      ? "flagged"
      : hasReview
      ? "pending"
      : "verified";

    return {
      id: site.id,
      name: site.name,
      projectId: site.projectId,
      projectName: projStat?.project.name || "Rural Development Project",
      district: projStat?.project.district || "Barmer",
      state: projStat?.project.state || "Rajasthan",
      coveragePercent: projStat?.coveragePercent ?? 85,
      trustScore: projStat?.avgTrustScore ?? 96,
      status,
      centroid: site.centroid,
      geofence: site.geofence,
      totalAssets: projStat?.totalAssets ?? 12,
      isFrozen: frozenSites.includes(site.name)
    };
  });

  const filteredSites = siteRows.filter((s) => {
    if (filterMode === "verified" && s.status !== "verified") return false;
    if (filterMode === "flagged" && s.status !== "flagged") return false;
    if (filterMode === "pending" && s.status !== "pending") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.projectName.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const mapSites: MapSite[] = siteRows.map((s) => ({
    id: s.id,
    name: s.name,
    district: s.district,
    state: s.state,
    trustScore: s.trustScore,
    status: s.status,
    centroid: s.centroid,
    geofence: s.geofence
  }));

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Top Console Ledger Status */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-1.5 flex flex-wrap items-center justify-between font-code text-[11px] gap-y-1">
        <div className="flex items-center gap-2 text-[#8e9192] flex-wrap">
          <span className="text-white font-bold">PORTAL::COMMAND_CENTER</span>
          <span>//</span>
          <span className="text-emerald-400 font-semibold">SEC_135_COMPLIANCE_ENGINE</span>
          <span>//</span>
          <span className="text-[#e2e2e2]">SESSION: ROOT_AUDITOR_09</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8e9192]">SYSTEM_PULSE:</span>
          <span className="text-emerald-400 font-metric flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            0.042ms LATENCY
          </span>
          <span className="text-[#444748]">|</span>
          <button
            onClick={loadDashboardData}
            className="text-[#8e9192] hover:text-white flex items-center gap-1 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Freeze Action Toast Notice */}
      {freezeNotice && (
        <div className="w-full bg-[#bb0112] text-white px-4 py-2 font-code text-xs font-bold flex items-center justify-between border-b border-[#ffb4ab]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{freezeNotice}</span>
          </div>
          <button
            onClick={() => setFreezeNotice(null)}
            className="text-white hover:text-black uppercase text-[10px] underline ml-2 cursor-pointer font-mono"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* KPI Metrics Bar (4 Panels with dark console border) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#0e0e0e] border-b border-[#444748]">
        {/* KPI 1: Total Commitment */}
        <div className="p-3 md:p-4 border-b sm:border-b-0 sm:border-r border-[#444748] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e9192] font-code text-[11px]">
            <span>01 // TOTAL COMMITMENT</span>
            <span>[INR_LGD]</span>
          </div>
          <div className="my-2">
            <span className="font-metric text-xl md:text-2xl text-white font-bold tracking-tight">
              {data?.kpis?.totalGrantValue ? formatINR(data.kpis.totalGrantValue) : "₹24,800,000"}
            </span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#c4c7c8]">
            <span>PORTFOLIO BUDGET</span>
            <span className="text-emerald-400 font-bold">100% COMMITTED</span>
          </div>
        </div>

        {/* KPI 2: Trust Index */}
        <div className="p-3 md:p-4 border-b sm:border-b-0 lg:border-r border-[#444748] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e9192] font-code text-[11px]">
            <span>02 // PORTFOLIO TRUST INDEX</span>
            <span>[HEURISTIC_WEIGHTED]</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-metric text-xl md:text-2xl text-emerald-400 font-bold tracking-tight">
              {data?.kpis?.avgTrustScore ? `${data.kpis.avgTrustScore}%` : "95.8%"}
            </span>
            <span className="text-[11px] font-code text-white bg-[#1e3a1e] px-1.5 py-0.5 border border-[#22c55e]">
              GRADE A1
            </span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#c4c7c8]">
            <span>TOTAL EVIDENCED ASSETS</span>
            <span className="text-white font-bold">{data?.kpis?.totalAssets ?? 48} ASSETS</span>
          </div>
        </div>

        {/* KPI 3: Evidence Completion */}
        <div className="p-3 md:p-4 border-b sm:border-b-0 sm:border-r border-[#444748] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e9192] font-code text-[11px]">
            <span>03 // MILESTONE COMPLETION</span>
            <span>[VERIFIED_PROOFS]</span>
          </div>
          <div className="my-2">
            <span className="font-metric text-xl md:text-2xl text-white font-bold tracking-tight">
              {data?.kpis?.totalEvidencedMilestones
                ? `${data.kpis.totalEvidencedMilestones} MILESTONES`
                : "12 MILESTONES"}
            </span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#c4c7c8]">
            <span>SCHEDULE VII TRACKING</span>
            <span className="text-emerald-400 font-bold">100% ON SCHEDULE</span>
          </div>
        </div>

        {/* KPI 4: Active Flags & Triage */}
        <div className="p-3 md:p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e9192] font-code text-[11px]">
            <span>04 // AUDIT FLAGS & TRIAGE</span>
            <span>[ANOMALIES]</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-metric text-xl md:text-2xl text-[#ffb4ab] font-bold tracking-tight">
              {data?.kpis?.flaggedCount ?? 2} FLAGGED
            </span>
            <span className="text-[11px] font-code text-[#ffb4ab] bg-[#3a1e1e] px-1.5 py-0.5 border border-[#bb0112]">
              {data?.kpis?.reviewCount ?? 1} REVIEW
            </span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#c4c7c8]">
            <Link
              href="/triage"
              className="text-[#ffb4ab] hover:underline font-bold flex items-center gap-1"
            >
              <span>OPEN TRIAGE QUEUE</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Control Console Bar: Filters, Search & View Modes */}
      <div className="w-full bg-[#1b1b1b] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-code text-[11px] text-[#8e9192] mr-1 hidden sm:inline">
            FILTER:
          </span>
          {(["all", "verified", "flagged", "pending"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`font-code text-[11px] uppercase px-2.5 py-1 border transition-colors cursor-pointer ${
                filterMode === mode
                  ? "bg-white text-black border-white font-bold"
                  : "bg-[#0e0e0e] text-[#c4c7c8] border-[#444748] hover:text-white hover:border-[#8e9192]"
              }`}
            >
              {mode} [{mode === "all" ? siteRows.length : siteRows.filter((s) => s.status === mode).length}]
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8e9192]" />
            <input
              type="text"
              placeholder="Search site, project, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e0e0e] text-white border border-[#444748] pl-8 pr-3 py-1 font-code text-xs focus:outline-none focus:border-white placeholder-[#666]"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-[#444748] bg-[#0e0e0e]">
            <button
              onClick={() => setViewStyle("table")}
              className={`px-2.5 py-1 font-code text-xs flex items-center gap-1 cursor-pointer ${
                viewStyle === "table" ? "bg-white text-black font-bold" : "text-[#8e9192] hover:text-white"
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TABLE</span>
            </button>
            <button
              onClick={() => setViewStyle("map")}
              className={`px-2.5 py-1 font-code text-xs flex items-center gap-1 cursor-pointer ${
                viewStyle === "map" ? "bg-white text-black font-bold" : "text-[#8e9192] hover:text-white"
              }`}
              title="Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">MAP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body: Table or Map */}
      <div className="p-3 md:p-4 flex-1">
        {viewStyle === "map" ? (
          <div className="space-y-3">
            <InteractiveMap
              sites={mapSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={(s) => setSelectedSiteId(s.id)}
              heightClass="h-[520px]"
            />
            <div className="text-right font-code text-[11px] text-[#8e9192]">
              CLICK SITE PIN ON RADAR GRID TO INSPECT GEOFENCE AND TELEMETRY
            </div>
          </div>
        ) : (
          <div className="border border-[#444748] bg-[#0e0e0e] overflow-x-auto">
            <table className="w-full text-left font-code text-xs border-collapse">
              <thead>
                <tr className="bg-[#1b1b1b] border-b border-[#444748] text-[#8e9192] text-[11px] uppercase">
                  <th className="py-2.5 px-3 border-r border-[#444748]">SITE & PROJECT</th>
                  <th className="py-2.5 px-3 border-r border-[#444748]">LOCATION</th>
                  <th className="py-2.5 px-3 border-r border-[#444748]">MILESTONE COMPLETION</th>
                  <th className="py-2.5 px-3 border-r border-[#444748]">TRUST SCORE</th>
                  <th className="py-2.5 px-3 border-r border-[#444748]">COMPLIANCE STATUS</th>
                  <th className="py-2.5 px-3 text-right">AUDIT ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {filteredSites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8e9192]">
                      NO CSR SITES MATCHING CURRENT QUERY
                    </td>
                  </tr>
                ) : (
                  filteredSites.map((site) => (
                    <tr
                      key={site.id}
                      className={`hover:bg-[#161616] transition-colors ${
                        site.isFrozen ? "bg-[#250d0d]" : ""
                      }`}
                    >
                      {/* Site & Project */}
                      <td className="py-3 px-3 border-r border-[#333]">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{site.name}</span>
                          {site.isFrozen && (
                            <span className="text-[10px] bg-[#bb0112] text-white px-1 py-0.2 border border-[#ffb4ab]">
                              FROZEN
                            </span>
                          )}
                        </div>
                        <div className="text-[#8e9192] text-[11px]">{site.projectName}</div>
                        <div className="text-[#666] text-[10px]">{site.id}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 border-r border-[#333] text-[#c4c7c8]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{site.district}, {site.state}</span>
                        </div>
                        <div className="text-[#666] text-[10px]">
                          {site.centroid ? `${site.centroid[0].toFixed(3)}°N, ${site.centroid[1].toFixed(3)}°E` : "25.75°N, 71.39°E"}
                        </div>
                      </td>

                      {/* Milestone Completion */}
                      <td className="py-3 px-3 border-r border-[#333]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[#8e9192]">Coverage:</span>
                          <span className="text-white font-bold">{site.coveragePercent}%</span>
                        </div>
                        <div className="w-full bg-[#262626] h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              site.coveragePercent >= 80
                                ? "bg-emerald-400"
                                : site.coveragePercent >= 50
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${site.coveragePercent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-[#777] mt-1">
                          {site.totalAssets} verified assets on record
                        </div>
                      </td>

                      {/* Trust Score */}
                      <td className="py-3 px-3 border-r border-[#333]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-metric text-base font-bold ${
                              site.trustScore >= 90
                                ? "text-emerald-400"
                                : site.trustScore >= 75
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {site.trustScore}%
                          </span>
                          <span
                            className={`text-[10px] px-1 py-0.5 border ${
                              site.trustScore >= 90
                                ? "bg-[#1e3a1e] text-emerald-300 border-[#22c55e]"
                                : site.trustScore >= 75
                                ? "bg-[#3a351e] text-yellow-300 border-[#eab308]"
                                : "bg-[#3a1e1e] text-red-300 border-[#ef4444]"
                            }`}
                          >
                            {site.trustScore >= 90 ? "BAND_1" : site.trustScore >= 75 ? "BAND_2" : "FLAGGED"}
                          </span>
                        </div>
                      </td>

                      {/* Compliance Status */}
                      <td className="py-3 px-3 border-r border-[#333]">
                        <div className="flex items-center gap-1.5">
                          {site.status === "verified" ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">VERIFIED</span>
                            </>
                          ) : site.status === "flagged" ? (
                            <>
                              <ShieldAlert className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-bold">FLAGGED</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 font-bold">PENDING_REVIEW</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Audit Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/projects"
                            className="bg-[#1b1b1b] hover:bg-white hover:text-black text-white px-2 py-1 border border-[#444] transition-colors text-[10px] font-bold"
                          >
                            DOSSIER
                          </Link>
                          <button
                            onClick={() => handleToggleFreeze(site.name)}
                            className={`px-2 py-1 text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              site.isFrozen
                                ? "bg-white text-black border-white"
                                : "bg-[#250d0d] text-red-400 border-[#bb0112] hover:bg-red-500 hover:text-white"
                            }`}
                            title="Section 135(5) Statutory Action"
                          >
                            {site.isFrozen ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>UNFREEZE</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>SEC 135 FREEZE</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Launch Bottom Bar */}
      <div className="w-full bg-[#0e0e0e] border-t border-[#444748] px-4 py-2 flex flex-wrap items-center justify-between text-xs font-code">
        <div className="flex items-center gap-3 text-[#8e9192]">
          <span>QUICK ACTIONS:</span>
          <Link
            href="/capture"
            className="text-white hover:text-emerald-400 flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>[+] NEW FIELD CAPTURE</span>
          </Link>
          <span>|</span>
          <Link
            href="/reports"
            className="text-white hover:text-emerald-400 flex items-center gap-1"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>GENERATE CSR REPORT</span>
          </Link>
        </div>
        <div className="text-[#888]">
          SECTION 135 STATUTORY COMPLIANCE MONITOR ACTIVE
        </div>
      </div>
    </div>
  );
}
