"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FolderGit2,
  MapPin,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Camera,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Plus
} from "lucide-react";
import { InteractiveMap } from "@/components/InteractiveMap";
import { useAuth } from "@/context/AuthContext";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { updateReusableData } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("all");

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Project not found");
      const json = await res.json();
      setData(json);
      if (json?.project?.id) {
        updateReusableData({ lastProjectId: json.project.id });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] bg-[#131313] text-[#8e9192] font-code text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mb-3 text-emerald-400" />
        <span>LOADING PROJECT DETAILS [{id}]...</span>
      </div>
    );
  }

  if (!data || !data.project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] bg-[#131313] text-[#8e9192] font-code text-xs p-6">
        <span className="text-white font-bold text-sm">PROJECT NOT FOUND</span>
        <button
          onClick={() => router.push("/projects")}
          className="mt-4 bg-[#222] hover:bg-[#333] text-white px-4 py-1.5 border border-[#444] cursor-pointer"
        >
          [ &lt;- BACK TO PROJECTS ]
        </button>
      </div>
    );
  }

  const { project, grant, sites, milestones, assets, stats } = data;

  const filteredAssets =
    selectedMilestoneId === "all"
      ? assets
      : assets.filter((a: any) => a.milestoneId === selectedMilestoneId);

  // Map sites format for InteractiveMap
  const mapSites = (sites || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    centroid: s.centroid,
    geofence: s.geofence,
    status: s.status || "verified",
    trustScore: stats?.avgTrustScore ?? 95,
    coveragePercent: stats?.coveragePercent ?? 80,
    totalAssets: assets.filter((a: any) => a.siteId === s.id).length
  }));

  const primarySiteId = sites?.[0]?.id || "";

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] font-code text-xs">
      {/* Top Header */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/projects"
            className="text-[#8e9192] hover:text-white font-bold"
          >
            [&lt;- ALL GRANTS &amp; SITES]
          </Link>
          <span className="text-[#444748]">//</span>
          <span className="text-white font-bold uppercase tracking-wider">
            {project.name}
          </span>
          <span className="text-[#444748]">::</span>
          <span className="text-[#8e9192]">
            {project.district}, {project.state}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/capture?siteId=${primarySiteId}&projectId=${project.id}`}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>CAPTURE EVIDENCE</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#0e0e0e] border border-[#333] p-3 space-y-1">
            <span className="text-[#888] text-[10px] uppercase">SANCTIONED BUDGET:</span>
            <div className="text-white font-bold text-sm">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                project.budgetInr || 5000000
              )}
            </div>
            <span className="text-emerald-400 text-[10px]">GRANT: {grant?.title || "MCA Section 135"}</span>
          </div>

          <div className="bg-[#0e0e0e] border border-[#333] p-3 space-y-1">
            <span className="text-[#888] text-[10px] uppercase">MILESTONE PROGRESS:</span>
            <div className="text-white font-bold text-sm">
              {stats?.evidencedMilestones} / {stats?.totalMilestones} ({stats?.coveragePercent}%)
            </div>
            <div className="w-full bg-[#222] h-1.5 overflow-hidden mt-1">
              <div
                className="bg-emerald-400 h-full"
                style={{ width: `${stats?.coveragePercent || 0}%` }}
              />
            </div>
          </div>

          <div className="bg-[#0e0e0e] border border-[#333] p-3 space-y-1">
            <span className="text-[#888] text-[10px] uppercase">PORTFOLIO TRUST:</span>
            <div className="text-emerald-400 font-bold text-sm">
              {stats?.avgTrustScore}% STATUTORY GRADE
            </div>
            <span className="text-[#888] text-[10px]">ZERO FRAUD PENALTIES</span>
          </div>

          <div className="bg-[#0e0e0e] border border-[#333] p-3 space-y-1">
            <span className="text-[#888] text-[10px] uppercase">EVIDENCE LEDGER:</span>
            <div className="text-white font-bold text-sm">
              {stats?.totalAssets} VERIFIED ASSETS
            </div>
            <span className="text-[#888] text-[10px]">{sites.length} REGISTERED SITES</span>
          </div>
        </div>

        {/* Map and Milestones Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Map */}
          <div className="lg:col-span-7 bg-[#0e0e0e] border border-[#444748] p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#333] pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold uppercase">GEOFENCED FACILITY BOUNDARY</span>
              </div>
              <span className="text-[#888] text-[10px]">RTK GNSS L1/L5 TELEMETRY</span>
            </div>

            <div className="h-[320px] w-full">
              <InteractiveMap sites={mapSites} selectedSiteId={primarySiteId} />
            </div>
          </div>

          {/* Right: Milestones Checklist */}
          <div className="lg:col-span-5 bg-[#0e0e0e] border border-[#444748] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#333] pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold uppercase">SECTION 135 DELIVERABLES</span>
              </div>
              <span className="text-[#888] text-[10px]">{milestones.length} TARGETS</span>
            </div>

            <div className="space-y-2">
              {milestones.map((m: any) => {
                const isEvidenced = assets.some(
                  (a: any) => a.milestoneId === m.id && a.trustBand === "verified"
                );
                const assetCount = assets.filter((a: any) => a.milestoneId === m.id).length;

                return (
                  <div
                    key={m.id}
                    onClick={() =>
                      setSelectedMilestoneId(selectedMilestoneId === m.id ? "all" : m.id)
                    }
                    className={`p-2.5 border cursor-pointer transition-colors ${
                      selectedMilestoneId === m.id
                        ? "bg-[#1f2922] border-emerald-500"
                        : "bg-[#141414] border-[#262626] hover:border-[#444]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            isEvidenced ? "text-emerald-400" : "text-[#555]"
                          }`}
                        />
                        <span className="text-white font-bold">{m.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 ${
                          isEvidenced
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                            : "bg-[#222] text-[#888]"
                        }`}
                      >
                        {isEvidenced ? "EVIDENCED" : "IN PROGRESS"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#888] text-[10px] mt-1 pl-5.5">
                      <span>Target: {m.targetDate || "Q4 FY 25-26"}</span>
                      <span>{assetCount} assets linked</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assets Gallery Grid */}
        <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333] pb-2">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold uppercase">ASSOCIATED EVIDENCE ASSETS</span>
              <span className="text-[#888]">[{filteredAssets.length}]</span>
            </div>

            {selectedMilestoneId !== "all" && (
              <button
                onClick={() => setSelectedMilestoneId("all")}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                [SHOW ALL MILESTONES]
              </button>
            )}
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-[#888]">
              No evidence assets uploaded for this milestone filter yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredAssets.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/assets/${a.shortId || a.id}`}
                  className="bg-[#141414] border border-[#2a2a2a] overflow-hidden hover:border-[#666] transition-colors group flex flex-col justify-between"
                >
                  <div className="aspect-square bg-black overflow-hidden relative">
                    <img
                      src={a.secureUrl}
                      alt={a.caption || "Asset"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-1 right-1 bg-black/80 text-emerald-400 font-bold px-1 text-[9px] border border-black">
                      {a.trustScore}%
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <span className="text-white font-bold block truncate text-[10px]">
                      {a.shortId || a.id}
                    </span>
                    <span className="text-[#777] block truncate text-[9px]">
                      {a.caption || "Photo evidence"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
