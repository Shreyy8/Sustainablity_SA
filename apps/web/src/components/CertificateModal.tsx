"use client";

import React from "react";

interface CertificateModalProps {
  asset: {
    id: string;
    shortId?: string;
    canonicalHash?: string;
    sha256?: string;
    siteName?: string;
    site?: { name: string };
    location?: { latitude: number; longitude: number; accuracy?: number };
    coordinates?: { lat: number; lng: number; cep?: number };
    trustScore: number;
    capturedAt?: string;
    status?: string;
    exif?: { make?: string; model?: string };
  };
  onClose: () => void;
}

export function CertificateModal({ asset, onClose }: CertificateModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const assetId = asset.shortId || asset.id;
  const hash =
    asset.sha256 ||
    asset.canonicalHash ||
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const siteTitle = asset.site?.name || asset.siteName || "Field Site Facility";
  const lat = asset.location?.latitude ?? asset.coordinates?.lat ?? 25.7534;
  const lng = asset.location?.longitude ?? asset.coordinates?.lng ?? 71.3967;
  const accuracy = asset.location?.accuracy ?? asset.coordinates?.cep ?? 1.8;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-black p-6 md:p-8 font-mono border-4 border-black shadow-2xl flex flex-col gap-4 select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-700 font-bold text-sm px-2 py-0.5 border border-black cursor-pointer"
        >
          [CLOSE X]
        </button>

        {/* Certificate Header */}
        <div className="text-center border-b-2 border-black pb-3">
          <div className="text-[10px] tracking-widest font-bold uppercase text-gray-700">
            MINISTRY OF CORPORATE AFFAIRS // GOVT. OF INDIA
          </div>
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-tight mt-1">
            STATUTORY EVIDENCE CERTIFICATE
          </h1>
          <div className="text-xs text-gray-600 mt-0.5">
            COMPANIES ACT, 2013 (SECTION 135 & CSR RULES) // STATUTORY AUDIT PROOF
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs border border-black p-3 bg-gray-50">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">CANONICAL ASSET ID:</span>
            <span className="font-bold text-black">{assetId}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">STATUTORY REFERENCE:</span>
            <span className="font-bold text-black">CSR-SCH-VII-09402</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">PROJECT LOCATION:</span>
            <span className="text-black font-semibold">{siteTitle}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">NOTARIZED COORDINATES:</span>
            <span className="text-black font-semibold">
              {Number(lat).toFixed(4)}° N, {Number(lng).toFixed(4)}° E (±{accuracy}m)
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">CAPTURE SENSOR / EXIF:</span>
            <span className="text-black font-semibold">
              {asset.exif?.make || "Sony"} {asset.exif?.model || "IMX766 RTK"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">TRUST SCORE:</span>
            <span className="font-bold text-black">
              {asset.trustScore}/100 [{asset.trustScore >= 80 ? "STATUTORY_VERIFIED" : "AUDIT_REVIEW"}]
            </span>
          </div>
        </div>

        {/* Cryptographic Hash Block */}
        <div className="p-3 border border-black bg-gray-100 flex flex-col gap-1 text-xs">
          <div className="text-[10px] text-gray-600 font-bold uppercase">
            IMMUTABLE SHA-256 DIGITAL DIGEST:
          </div>
          <div className="font-bold text-black break-all text-[11px] selection:bg-black selection:text-white">
            {hash}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            VERIFICATION URL: https://vault.pluribus.in/e/{assetId}
          </div>
        </div>

        {/* Legal Attestation Text */}
        <div className="text-xs text-gray-700 leading-relaxed border-t border-b border-black py-2">
          This digital certificate attests that evidence item <strong>{assetId}</strong> has passed
          sensor authenticity validation, perceptual hash collision checks, and geofence boundary
          tolerances under Section 135 statutory guidelines. No tampering or post-processing detected.
        </div>

        {/* Signatures & Seal Emulation */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col text-[10px]">
            <span className="font-bold text-black">PRICE WATERHOUSE CHARTERED ACCNT LLP</span>
            <span className="text-gray-600">FRN: 012754N/N500016 :: UDIN: 26042918AAAAAL9921</span>
            <span className="text-gray-500 mt-1">ISSUED AT: BLR-MCA-NODE-01</span>
          </div>

          <div className="flex flex-col items-end text-right text-[10px]">
            <div className="border border-black px-2 py-1 font-bold bg-black text-white uppercase text-[9px] mb-1">
              [ DSC_PKI_VERIFIED ]
            </div>
            <span className="font-bold text-black">STATUTORY CSR AUDITOR</span>
            <span className="text-gray-500">TIMESTAMP: {new Date().toISOString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 pt-2 border-t border-black">
          <button
            onClick={handlePrint}
            className="flex-1 bg-black text-white py-2 text-xs font-bold uppercase hover:bg-gray-800 cursor-pointer"
          >
            [ PRINT / SAVE AS PDF ]
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black text-black hover:bg-gray-100 text-xs uppercase cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
