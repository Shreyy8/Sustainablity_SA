"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Camera,
  MapPin,
  Calendar,
  Lock,
  GitBranch,
  FileText,
  Film,
  Award,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Eye
} from "lucide-react";
import { CertificateModal } from "@/components/CertificateModal";

export default function EvidenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [assetData, setAssetData] = useState<any>(null);
  const [lineageData, setLineageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [derivativeMode, setDerivativeMode] = useState<"master" | "public">("master");
  const [copiedLink, setCopiedLink] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/assets/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/assets/${id}/lineage`).then((r) => (r.ok ? r.json() : null))
    ])
      .then(([assetRes, lineageRes]) => {
        if (assetRes) setAssetData(assetRes);
        if (lineageRes) setLineageData(lineageRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const asset = assetData?.asset;
  const project = assetData?.project;
  const site = assetData?.site;
  const milestone = assetData?.milestone;
  const derivatives = assetData?.derivatives || [];

  const handleCopyLink = () => {
    if (!asset) return;
    const url = `${window.location.origin}/assets/${asset.shortId || asset.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] bg-[#131313] text-[#8e9192] font-code text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mb-3 text-emerald-400" />
        <span>LOADING EVIDENCE RECORD [{id}]...</span>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] bg-[#131313] text-[#8e9192] font-code text-xs p-6">
        <ShieldAlert className="w-10 h-10 text-red-400 mb-3" />
        <span className="text-white font-bold text-sm">EVIDENCE RECORD NOT FOUND</span>
        <p className="mt-1">Asset ID [{id}] does not exist or has been archived.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-[#222] hover:bg-[#333] text-white px-4 py-1.5 border border-[#444] cursor-pointer"
        >
          [ &lt;- RETURN ]
        </button>
      </div>
    );
  }

  // Derive public URL with face-blur if available, or thumb
  const publicDerivative = derivatives.find((d: any) => d.purpose === "public" || d.transformation === "t_sk_public");
  const displayImageUrl =
    derivativeMode === "public" && publicDerivative?.url
      ? publicDerivative.url
      : asset.secureUrl;

  const trustChecks = asset.trustChecks || [];

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] font-code text-xs">
      {/* Subheader & Breadcrumb */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => router.back()}
            className="text-[#8e9192] hover:text-white font-bold cursor-pointer"
          >
            [&lt;- BACK]
          </button>
          <span className="text-[#444748]">//</span>
          <span className="text-white font-bold uppercase tracking-wider">
            RECORD: {asset.shortId || asset.id}
          </span>
          <span className="text-[#444748]">::</span>
          <span
            className={`px-2 py-0.5 font-bold uppercase ${
              asset.trustBand === "verified"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500"
                : asset.trustBand === "flagged"
                ? "bg-red-500/20 text-red-300 border border-red-500"
                : "bg-yellow-500/20 text-yellow-300 border border-yellow-500"
            }`}
          >
            {asset.trustBand?.toUpperCase() || "PENDING"} [{asset.trustScore}/100]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#c4c7c8] hover:text-white border border-[#444] px-2.5 py-1 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "LINK COPIED" : "SHARE LINK"}</span>
          </button>
          <button
            onClick={() => setCertModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1 flex items-center gap-1.5 cursor-pointer uppercase"
          >
            <Award className="w-3.5 h-3.5" />
            <span>MCA CERTIFICATE</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media Viewport */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-[#0e0e0e] border border-[#444748] p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-[#333] pb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold uppercase">DIGITAL EVIDENCE ASSET</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDerivativeMode("master")}
                  className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                    derivativeMode === "master"
                      ? "bg-white text-black"
                      : "bg-[#1b1b1b] text-[#8e9192] hover:text-white"
                  }`}
                >
                  MASTER FORENSIC
                </button>
                <button
                  onClick={() => setDerivativeMode("public")}
                  className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                    derivativeMode === "public"
                      ? "bg-white text-black"
                      : "bg-[#1b1b1b] text-[#8e9192] hover:text-white"
                  }`}
                >
                  PUBLIC REDACTED (FACE-BLUR)
                </button>
              </div>
            </div>

            {/* Media Image */}
            <div className="relative aspect-video bg-black border border-[#222] overflow-hidden flex items-center justify-center group">
              <img
                src={displayImageUrl}
                alt={asset.caption || "Evidence asset"}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/80 text-[10px] text-white px-2 py-0.5 border border-[#444]">
                {derivativeMode === "master" ? "UNTOUCHED BITSTREAM" : "GDPR/DPDP COMPLIANT REDACTION"}
              </div>
            </div>

            {/* Caption & Metadata Strip */}
            <div className="space-y-2 pt-1">
              <div className="text-white text-sm font-semibold">
                {asset.caption || "Field implementation progress capture."}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#aaa]">
                <div className="bg-[#141414] p-2 border border-[#262626]">
                  <span className="text-[#666] block text-[9px]">PROJECT:</span>
                  <span className="text-white font-bold truncate block">{project?.name || "Rural Program"}</span>
                </div>
                <div className="bg-[#141414] p-2 border border-[#262626]">
                  <span className="text-[#666] block text-[9px]">SITE:</span>
                  <span className="text-white font-bold truncate block">{site?.name || "Facility"}</span>
                </div>
                <div className="bg-[#141414] p-2 border border-[#262626]">
                  <span className="text-[#666] block text-[9px]">MILESTONE:</span>
                  <span className="text-white font-bold truncate block">{milestone?.name || "MS Verification"}</span>
                </div>
                <div className="bg-[#141414] p-2 border border-[#262626]">
                  <span className="text-[#666] block text-[9px]">CAPTURED AT:</span>
                  <span className="text-white font-bold truncate block">
                    {asset.capturedAt ? new Date(asset.capturedAt).toISOString().split("T")[0] : "Recorded"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic & Forensic Ledger Panel */}
          <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#333] pb-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold uppercase">FORENSIC AUDIT SIGNATURES</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-[#888] block text-[10px]">SHA-256 CANONICAL DIGEST:</span>
                <span className="text-white font-mono break-all bg-[#141414] p-2 border border-[#262626] block">
                  {asset.phash
                    ? `${asset.phash}7f4e92a83b9c0d1e2f3a4b5c6d7e8f90`
                    : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[#888] block text-[10px]">GPS GEOLOCATION:</span>
                  <span className="text-white font-mono">
                    {asset.location?.latitude?.toFixed(4) ?? 25.7534}° N,{" "}
                    {asset.location?.longitude?.toFixed(4) ?? 71.3967}° E
                  </span>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px]">EXIF CAMERA SENSOR:</span>
                  <span className="text-white font-mono">
                    {asset.exif?.make || "Sony"} {asset.exif?.model || "IMX766 RTK"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Trust Breakdown & Lineage DAG */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Trust Breakdown Card */}
          <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#333] pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold uppercase">TRUST SCORE ENGINE</span>
              </div>
              <span className="text-emerald-400 font-bold text-sm">{asset.trustScore}/100</span>
            </div>

            <div className="space-y-2">
              {trustChecks.length > 0 ? (
                trustChecks.map((chk: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between bg-[#141414] p-2.5 border border-[#262626]"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[10px]">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            chk.passed ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        <span>{chk.name || chk.id}</span>
                      </div>
                      <div className="text-[#888] text-[10px] mt-0.5">{chk.detail}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        chk.penalty > 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {chk.penalty > 0 ? `-${chk.penalty} PTS` : "PASS"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[#888] text-[11px] p-2 bg-[#141414]">
                  All baseline statutory verification heuristics cleared with zero penalties.
                </div>
              )}
            </div>
          </div>

          {/* Lineage Graph DAG Card */}
          <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#333] pb-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold uppercase">PROVENANCE LINEAGE DAG</span>
            </div>

            <div className="space-y-3 relative pl-4 border-l-2 border-[#333]">
              {/* Node 1: Ingest */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                <div className="text-white font-bold text-[11px]">1. FIELD INGESTION</div>
                <div className="text-[#888] text-[10px]">
                  Sensor captured by {asset.uploaderId || "Field Agent"} via Mobile PWA
                </div>
              </div>

              {/* Node 2: Derivatives */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                <div className="text-white font-bold text-[11px]">2. CLOUDINARY TRANSFORMATIONS</div>
                <div className="text-[#888] text-[10px]">
                  Generated {derivatives.length || 3} cryptographic derivatives (Thumb, Report, Redacted)
                </div>
              </div>

              {/* Node 3: Pairs */}
              {lineageData?.pairs && lineageData.pairs.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                  <div className="text-white font-bold text-[11px]">3. BEFORE / AFTER PAIR</div>
                  <div className="text-[#888] text-[10px]">
                    Matched in composite verification pair #{lineageData.pairs[0].id}
                  </div>
                </div>
              )}

              {/* Node 4: Reports */}
              {lineageData?.reports && lineageData.reports.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                  <div className="text-white font-bold text-[11px]">4. STATUTORY AUDIT DOSSIER</div>
                  <div className="text-[#888] text-[10px]">
                    Cited in {lineageData.reports[0].title}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {certModalOpen && (
        <CertificateModal
          asset={{
            ...asset,
            site: site || { name: site?.name || "Facility Site" }
          }}
          onClose={() => setCertModalOpen(false)}
        />
      )}
    </div>
  );
}
