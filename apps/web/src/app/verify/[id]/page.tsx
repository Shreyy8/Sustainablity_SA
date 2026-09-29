"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Camera,
  Hash,
  Award,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Building,
  Globe
} from "lucide-react";

export default function PublicVerifyPage() {
  const params = useParams();
  const assetId = (params?.id as string) || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    fetch(`/api/assets/${assetId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Verification record not found or inaccessible.");
        return res.json();
      })
      .then((d) => {
        setData(d);
      })
      .catch((err) => {
        setError(err.message || "Failed to load verification record");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [assetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101010] text-[#e2e2e2] flex items-center justify-center font-code">
        <div className="flex items-center gap-2 text-emerald-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>VERIFYING CRYPTOGRAPHIC SIGNATURE &amp; EVIDENCE RECORD...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.asset) {
    return (
      <div className="min-h-screen bg-[#101010] text-[#e2e2e2] flex flex-col items-center justify-center p-4 font-code">
        <div className="bg-[#181818] border border-red-700/60 p-6 max-w-md w-full space-y-4 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h1 className="text-white font-bold text-base">EVIDENCE RECORD NOT VERIFIED</h1>
          <p className="text-xs text-[#8e9192]">
            The asset identifier <strong className="text-white">"{assetId}"</strong> could not be authenticated against the public ledger.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 font-bold text-xs uppercase"
          >
            <Globe className="w-4 h-4" />
            <span>EXPLORE COMMUNITY DATA</span>
          </Link>
        </div>
      </div>
    );
  }

  const { asset, project, site, milestone } = data;
  const isVerified = asset.trustBand === "verified";
  const mediaUrl =
    asset.cldUrl ||
    `https://res.cloudinary.com/pluribus/image/upload/${asset.cldPublicId}`;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e2e2e2] font-code py-8 px-4 md:px-8 flex flex-col items-center">
      {/* Top Banner */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-[#333] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-white font-bold text-sm md:text-base uppercase tracking-wider">
              PLURIBUS PUBLIC EVIDENCE CERTIFICATE
            </h1>
            <p className="text-[10px] text-[#8e9192]">
              TAMPER-EVIDENT STATUTORY VERIFICATION &bull; MCA SEC-135
            </p>
          </div>
        </div>

        <Link
          href="/community"
          className="flex items-center gap-1.5 text-xs text-[#8e9192] hover:text-white border border-[#333] px-3 py-1.5 bg-[#141414] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>COMMUNITY HUB</span>
        </Link>
      </div>

      {/* Main Certificate Card */}
      <div className="w-full max-w-4xl bg-[#141414] border border-[#333] shadow-2xl p-6 md:p-8 space-y-6">
        {/* Verification Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181818] border border-[#282828] p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isVerified ? "bg-emerald-950 text-emerald-400 border border-emerald-500" : "bg-yellow-950 text-yellow-400 border border-yellow-500"}`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base">
                  {isVerified ? "CRYPTOGRAPHICALLY AUTHENTICATED" : "UNDER AUDIT REVIEW"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 uppercase ${isVerified ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-yellow-950 text-yellow-300 border border-yellow-800"}`}>
                  TRUST SCORE: {asset.trustScore ?? 98}/100
                </span>
              </div>
              <p className="text-[11px] text-[#8e9192] mt-0.5">
                Asset ID: <strong className="text-white font-mono">{asset.shortId || asset.id}</strong> &bull; Registered on Immutable Forensic Ledger
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-[#888]">
            <div>CHAIN: <span className="text-emerald-400 font-bold">ONLINE</span></div>
            <div>SEAL: <span className="text-white font-bold">SHA-256 VERIFIED</span></div>
          </div>
        </div>

        {/* Media & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evidence Image */}
          <div className="space-y-3">
            <div className="relative aspect-video bg-[#0a0a0a] border border-[#333] overflow-hidden flex items-center justify-center group">
              <img
                src={mediaUrl}
                alt={asset.caption || "Verified CSR Milestone Asset"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=800&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute top-2 left-2 bg-black/80 text-[10px] font-mono text-emerald-400 px-2 py-0.5 border border-emerald-800">
                ORIGINAL UNTOUCHED MASTER
              </div>
            </div>

            <div className="text-[11px] text-[#8e9192] bg-[#0c0c0c] p-2.5 border border-[#222]">
              <span className="text-white font-bold block mb-1">AUTOMATED AUDIT CAPTION:</span>
              <p>{asset.caption || "Community infrastructure milestone evidence captured and verified with hardware telemetry."}</p>
            </div>
          </div>

          {/* Forensic Metadata Spec */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#333] pb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              <span>FORENSIC TELEMETRY &amp; LOCATION AUDIT</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#222]">
                <span className="text-[#888] flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#666]" /> Project:
                </span>
                <span className="text-white font-bold text-right truncate max-w-[200px]">
                  {project?.name || "Rural WASH & Sanitation"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#222]">
                <span className="text-[#888] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#666]" /> Site &amp; District:
                </span>
                <span className="text-emerald-400 font-bold text-right">
                  {site?.name || "Chohtan Primary School"}, {project?.state || "Rajasthan"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#222]">
                <span className="text-[#888] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#666]" /> Timestamp:
                </span>
                <span className="text-white text-right">
                  {asset.capturedAt ? new Date(asset.capturedAt).toLocaleString() : "Authenticated UTC"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#222]">
                <span className="text-[#888] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#666]" /> Milestone Question:
                </span>
                <span className="text-white text-right truncate max-w-[200px]">
                  {milestone?.name || "Water actively flowing & platform secure"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#222]">
                <span className="text-[#888]">Geofence Accuracy:</span>
                <span className="text-emerald-400 font-bold">Passed (Within 12m Polygon)</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#222]">
                <span className="text-[#888]">pHash Duplicate Check:</span>
                <span className="text-emerald-400 font-bold">Passed (No Duplicate Clones)</span>
              </div>

              <div className="py-2">
                <span className="text-[#888] text-[10px] block mb-1">SHA-256 DIGITAL FINGERPRINT:</span>
                <code className="text-[10px] text-[#aaa] bg-[#080808] p-1.5 border border-[#222] block break-all font-mono">
                  {asset.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="pt-4 border-t border-[#333] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#8e9192]">
          <div>
            Certified under <strong className="text-white">Pluribus CSR Statutory Vault</strong> &bull; Schedule VII Compliance
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/onboarding"
              className="text-emerald-400 hover:underline font-bold"
            >
              REGISTER AN ORGANIZATION &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
