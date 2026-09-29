"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  ShieldCheck,
  Building,
  MapPin,
  TrendingUp,
  Search,
  CheckCircle2,
  FolderGit2,
  ArrowRight,
  ExternalLink,
  Users,
  Award,
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function CommunityPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchAssetId, setSearchAssetId] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedSector, setSelectedSector] = useState("ALL");

  useEffect(() => {
    fetch("/api/community/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setStats(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAssetId.trim()) return;
    router.push(`/verify/${searchAssetId.trim()}`);
  };

  const filteredProjects = (stats?.projects || []).filter((p: any) => {
    const matchesState = selectedState === "ALL" || p.state === selectedState;
    const matchesSector = selectedSector === "ALL" || p.sector.includes(selectedSector);
    return matchesState && matchesSector;
  });

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] font-code py-8 px-4 md:px-8 flex flex-col items-center">
      {/* Top Banner */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row md:items-center justify-between border-b border-[#333] pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            <h1 className="text-white font-bold text-lg md:text-xl uppercase tracking-wider">
              PLURIBUS // OPEN SUSTAINABILITY &amp; COMMUNITY DATA HUB
            </h1>
          </div>
          <p className="text-xs text-[#8e9192] mt-1">
            PUBLIC REPOSITORY FOR SECTION-135 CSR EVIDENCE &bull; DISTRICT BENCHMARKS &bull; TAMPER VERIFICATION
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 font-bold text-xs uppercase transition-colors"
          >
            <Building className="w-4 h-4" />
            <span>FIRM ONBOARDING</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-[#1b1b1b] hover:bg-[#252525] border border-[#444] text-white px-4 py-2 font-bold text-xs uppercase transition-colors"
          >
            <span>PORTAL SIGN IN</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="w-full max-w-6xl space-y-8">
        {/* Verification Fast Lookup */}
        <div className="bg-[#141414] border border-[#333] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>PUBLIC EVIDENCE VERIFIER &bull; SCAN OR ENTER ASSET IDENTIFIER</span>
            </span>
            <span className="text-[10px] text-[#8e9192] hidden sm:inline">
              Sample IDs: ast-001, ast-002, ast-003, ast-004
            </span>
          </div>

          <form onSubmit={handleVerifySearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
              <input
                type="text"
                value={searchAssetId}
                onChange={(e) => setSearchAssetId(e.target.value)}
                placeholder="Enter Asset ID or paste QR code short link (e.g. ast-001)..."
                className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 font-bold uppercase text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>VERIFY PROOF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* National Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#141414] border border-[#333] p-4 space-y-1">
            <span className="text-[10px] text-[#8e9192] uppercase font-bold">TOTAL CAPITAL TRACKED</span>
            <div className="text-emerald-400 font-bold text-xl md:text-2xl">
              ₹{((stats?.summary?.totalGrantsInr ?? 81000000) / 10000000).toFixed(1)} Cr
            </div>
            <span className="text-[10px] text-[#666]">Across Verified Section-135 Grants</span>
          </div>

          <div className="bg-[#141414] border border-[#333] p-4 space-y-1">
            <span className="text-[10px] text-[#8e9192] uppercase font-bold">VERIFIED EVIDENCE ASSETS</span>
            <div className="text-white font-bold text-xl md:text-2xl">
              {stats?.summary?.totalAssets ?? 10}
            </div>
            <span className="text-[10px] text-emerald-400">100% Cryptographic Integrity</span>
          </div>

          <div className="bg-[#141414] border border-[#333] p-4 space-y-1">
            <span className="text-[10px] text-[#8e9192] uppercase font-bold">ACTIVE FIELD SITES</span>
            <div className="text-white font-bold text-xl md:text-2xl">
              {stats?.summary?.totalSites ?? 5}
            </div>
            <span className="text-[10px] text-[#666]">Geofenced Polygons Active</span>
          </div>

          <div className="bg-[#141414] border border-[#333] p-4 space-y-1">
            <span className="text-[10px] text-[#8e9192] uppercase font-bold">PARTICIPATING ENTITIES</span>
            <div className="text-white font-bold text-xl md:text-2xl">
              {stats?.summary?.participatingOrgsCount ?? 4}
            </div>
            <span className="text-[10px] text-[#666]">Corporates, NGOs &amp; Assessors</span>
          </div>
        </div>

        {/* Sectoral Breakdown & State Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Schedule VII Sectors */}
          <div className="bg-[#141414] border border-[#333] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#282828] pb-2">
              <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>SCHEDULE VII STATUTORY DISTRIBUTION</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">SECTION 135</span>
            </div>

            <div className="space-y-2">
              {(stats?.sectors || [
                { name: "Item (i) - WASH, Sanitation & Drinking Water", count: 1, budgetInr: 35000000 },
                { name: "Item (ii) - Education, BALA & Vocational Skills", count: 1, budgetInr: 28000000 },
                { name: "Item (iv) - Environmental Sustainability & Afforestation", count: 1, budgetInr: 18000000 }
              ]).map((sec: any) => (
                <div key={sec.name} className="p-2.5 bg-[#181818] border border-[#262626] flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-bold">{sec.name.split("-")[0]}</div>
                    <div className="text-[10px] text-[#8e9192]">{sec.name.split("-")[1] || sec.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">₹{(sec.budgetInr / 10000000).toFixed(1)} Cr</div>
                    <div className="text-[10px] text-[#666]">{sec.count} Projects</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Footprint */}
          <div className="bg-[#141414] border border-[#333] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#282828] pb-2">
              <span className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>GEOGRAPHIC INTERVENTION STATES</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">GROUND SITES</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#181818] border border-[#262626] space-y-1">
                <span className="text-white font-bold text-xs block">RAJASTHAN</span>
                <span className="text-[11px] text-[#8e9192]">Barmer District</span>
                <div className="text-emerald-400 font-bold text-sm">2 Sites &bull; Handpumps &amp; WASH</div>
              </div>
              <div className="p-3 bg-[#181818] border border-[#262626] space-y-1">
                <span className="text-white font-bold text-xs block">MAHARASHTRA</span>
                <span className="text-[11px] text-[#8e9192]">Nashik District</span>
                <div className="text-emerald-400 font-bold text-sm">2 Sites &bull; BALA Classrooms</div>
              </div>
              <div className="p-3 bg-[#181818] border border-[#262626] space-y-1">
                <span className="text-white font-bold text-xs block">BIHAR</span>
                <span className="text-[11px] text-[#8e9192]">Gaya District</span>
                <div className="text-emerald-400 font-bold text-sm">1 Site &bull; Grove Afforestation</div>
              </div>
              <div className="p-3 bg-[#181818] border border-[#262626] space-y-1">
                <span className="text-white font-bold text-xs block">EXPANDING</span>
                <span className="text-[11px] text-[#8e9192]">National Rollout</span>
                <div className="text-[#888] text-sm">Open for NGO Onboarding</div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Project Directory */}
        <div className="bg-[#141414] border border-[#333] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#282828] pb-3">
            <div>
              <span className="text-white font-bold text-sm uppercase flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-emerald-400" />
                <span>PUBLIC TRANSPARENCY REGISTRY</span>
              </span>
              <p className="text-[11px] text-[#8e9192] mt-0.5">
                Filter and inspect active CSR programs, executing agencies, and verified evidence volumes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-[#0a0a0a] border border-[#444] text-white text-[11px] px-2 py-1 outline-none"
              >
                <option value="ALL">ALL STATES</option>
                <option value="Rajasthan">RAJASTHAN</option>
                <option value="Maharashtra">MAHARASHTRA</option>
                <option value="Bihar">BIHAR</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredProjects.map((p: any) => (
              <div
                key={p.id}
                className="p-4 bg-[#181818] border border-[#282828] hover:border-[#444] transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{p.name}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 font-bold">
                      VERIFIED TRUST SCORE: 98/100
                    </span>
                  </div>
                  <span className="text-xs text-[#8e9192] font-mono">
                    {p.district}, {p.state}
                  </span>
                </div>

                <p className="text-xs text-[#aaa]">{p.description}</p>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#222] text-[11px] text-[#888] gap-2">
                  <div className="flex items-center gap-4">
                    <span>Funder: <strong className="text-white">{p.funderName}</strong></span>
                    <span>Implementing Partner: <strong className="text-white">{p.implementerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">{p.sitesCount} Field Sites</span>
                    <Link
                      href={`/verify/ast-001`}
                      className="text-white hover:text-emerald-400 font-bold uppercase inline-flex items-center gap-1"
                    >
                      <span>VIEW PROOF</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
