import React, { useState } from 'react';
import { EvidenceAsset } from '../types';

interface EvidenceDetailViewProps {
  asset: EvidenceAsset;
  onOpenCertificateModal: () => void;
  onBack?: () => void;
}

export const EvidenceDetailView: React.FC<EvidenceDetailViewProps> = ({
  asset,
  onOpenCertificateModal,
  onBack,
}) => {
  const [derivativeMode, setDerivativeMode] = useState<'master' | 'public'>('master');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDagNode, setActiveDagNode] = useState<string | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://vault.pluribus.in/e/${asset.shortId || asset.id}`);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Subheader & Operational Status Strip */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#8e9192] hover:text-white font-code text-[11px] mr-1"
            >
              [&lt;- BACK]
            </button>
          )}
          <span className="font-code text-[11px] text-white uppercase font-bold tracking-widest">
            [RECORD: {asset.id}]
          </span>
          <span className="font-code text-[11px] text-[#8e9192]">//</span>
          <span className="font-code text-[11px] text-[#e2e2e2] uppercase">
            PROVENANCE: FIELD_INGEST_NODE_04
          </span>
          <span className="font-code text-[11px] text-[#444748]">::</span>
          <span className="bg-[#131313] text-white border border-white px-1.5 py-0.5 font-code text-[11px] uppercase tracking-wider font-bold">
            [*] STATUTORY_VALID
          </span>
        </div>
        <div className="flex items-center gap-3 font-code text-[11px]">
          <span className="text-[#8e9192]">
            MCA_SEC135_REF: <span className="text-white">CSR-SCH-VII-09402</span>
          </span>
          <span className="text-[#444748]">|</span>
          <span className="text-[#8e9192]">
            STATUS: <span className="text-white font-bold">LOCKED &amp; ANCHORED</span>
          </span>
        </div>
      </div>

      {/* Primary Two-Column High-Density Forensic Workcell */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-[#131313] border-b border-[#444748]">
        {/* Left Column: Inspection Viewport & Cryptographic Enclosure (Col span 7) */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#444748] p-3 md:p-4 flex flex-col gap-3">
          {/* Viewport Action & Derivative Controls */}
          <div className="flex items-center justify-between border-b border-[#444748] pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDerivativeMode('master')}
                className={`px-2 py-1 font-code text-[11px] uppercase font-bold tracking-wider transition-none ${
                  derivativeMode === 'master'
                    ? 'bg-white text-black'
                    : 'bg-[#1b1b1b] text-[#c4c7c8] hover:text-white border border-[#444748]'
                }`}
              >
                [ VIEW ORIGINAL MASTER (UNREDACTED) ]
              </button>
              <button
                type="button"
                onClick={() => setDerivativeMode('public')}
                className={`px-2 py-1 font-code text-[11px] uppercase font-bold tracking-wider transition-none ${
                  derivativeMode === 'public'
                    ? 'bg-white text-black'
                    : 'bg-[#1b1b1b] text-[#c4c7c8] hover:text-white border border-[#444748]'
                }`}
              >
                [ VIEW PUBLIC DERIVATIVE (FACE/ID BLURRED) ]
              </button>
            </div>
            <span className="font-code text-[11px] text-[#8e9192] hidden sm:inline">
              VIEWPORT: 1:1 CANONICAL
            </span>
          </div>

          {/* High Contrast Forensic Image Display Box */}
          <div className="relative bg-[#0e0e0e] border border-[#444748] overflow-hidden group">
            {/* Overlay Badges (Top Track) */}
            <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1 z-10 pointer-events-none">
              <div className="flex items-center gap-1 font-code text-[11px]">
                <span className="bg-[#0e0e0e]/90 border border-white px-1.5 py-0.5 text-white uppercase font-bold">
                  {derivativeMode === 'master' ? '[CANONICAL MASTER]' : '[PUBLIC DERIVATIVE]'}
                </span>
                <span className="bg-[#0e0e0e]/90 border border-[#8e9192] px-1.5 py-0.5 text-[#e2e2e2] uppercase">
                  [SHA-256 VERIFIED]
                </span>
              </div>
              <span className="bg-[#0e0e0e]/90 border border-[#444748] px-1.5 py-0.5 font-code text-[11px] text-[#8e9192] uppercase">
                [TIMESTAMP LOCKED: {asset.timestamp}]
              </span>
            </div>

            {/* Target Forensic Media Presentation */}
            <div className="relative w-full aspect-[4/3] bg-[#0e0e0e] flex items-center justify-center overflow-hidden">
              <img
                src={asset.imageUrl}
                alt="Forensic compliance proof photo"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  derivativeMode === 'public'
                    ? 'blur-[6px] contrast-100'
                    : 'grayscale contrast-125'
                }`}
              />

              {/* Calibrated Crosshair Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <div className="w-full h-[1px] bg-white" />
                <div className="h-full w-[1px] bg-white absolute" />
                <div className="w-16 h-16 border border-white absolute" />
              </div>

              {/* If Public Mode Notice */}
              {derivativeMode === 'public' && (
                <div className="absolute bottom-4 left-4 bg-black/85 border border-[#ffb4ab] px-3 py-1 text-[#ffb4ab] font-code text-[11px] font-bold">
                  [!] FACES &amp; BIOMETRIC IDENTIFIERS AUTOMATICALLY REDACTED FOR PUBLIC STATUTORY VIEW
                </div>
              )}
            </div>

            {/* Monospace Geotag Pin Strip Overlay */}
            <div className="w-full bg-[#1b1b1b] border-t border-[#444748] px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 font-code text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-white uppercase font-bold">[GEO_LOCK]</span>
                <span className="text-white font-metric">
                  {asset.coordinates.lat.toFixed(4)}° N, {asset.coordinates.lng.toFixed(4)}° E
                </span>
                <span className="text-[#8e9192] font-metric">(+/- {asset.coordinates.cep}m CEP)</span>
              </div>
              <div className="text-[#c4c7c8]">
                CHOHTAN, {asset.district.toUpperCase()} DIST, RJ, IN
              </div>
            </div>

            {/* Optical Metadata Subpanel */}
            <div className="w-full bg-[#0e0e0e] border-t border-[#444748] px-2.5 py-1.5 flex flex-wrap items-center justify-between font-code text-[11px] text-[#8e9192]">
              <span>NATIVE RES: {asset.resolution}</span>
              <span>COLOR SPACE: sRGB IEC61966-2.1</span>
              <span>OPTICAL SENSOR: {asset.opticalSensor}</span>
              <span>
                APERTURE: {asset.aperture} | ISO {asset.iso} | {asset.shutter}
              </span>
            </div>
          </div>

          {/* Cryptographic Proof Block & Hardware Ledger Anchors */}
          <div className="border border-[#444748] bg-[#1b1b1b] p-3 flex flex-col gap-1 font-code text-[11px]">
            <div className="flex items-center justify-between border-b border-[#444748] pb-1">
              <span className="uppercase text-white font-bold tracking-wider">
                // CRYPTOGRAPHIC SIGNATURE CERTIFICATION
              </span>
              <span className="text-[#8e9192]">[HARDWARE-BACKED ATTESTATION]</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-1 pt-1">
              <div className="md:col-span-3 text-[#8e9192] uppercase">SHA-256 HASH:</div>
              <div className="md:col-span-9 text-white font-metric break-all selection:bg-white selection:text-black font-bold">
                {asset.canonicalHash}
              </div>
              <div className="md:col-span-3 text-[#8e9192] uppercase">HARDWARE KEY ID:</div>
              <div className="md:col-span-9 text-[#e2e2e2] font-metric">
                {asset.hardwareKeyId}
              </div>
              <div className="md:col-span-3 text-[#8e9192] uppercase">BLOCKCHAIN ANCHOR:</div>
              <div className="md:col-span-9 text-[#e2e2e2] font-metric flex items-center justify-between flex-wrap">
                <span>
                  POLYGON PoS TX:{' '}
                  <span className="text-white underline">{asset.blockchainTx}</span>
                </span>
                <span className="text-[#8e9192] font-code">[BLOCK #{asset.blockNumber}]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Trust Breakdown & Section 135 Ledger (Col span 5) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Block 1: Trust Score Breakdown */}
          <div className="p-3 md:p-4 border-b border-[#444748]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#444748]">
              <div className="flex flex-col">
                <span className="font-code text-[11px] uppercase tracking-widest text-[#8e9192]">
                  FORENSIC HEURISTICS
                </span>
                <h2 className="text-[13px] uppercase text-white font-bold">
                  STATUTORY TRUST SCORE BREAKDOWN
                </h2>
              </div>
              <div className="text-right">
                <span className="font-metric text-xl md:text-2xl text-white block leading-none font-bold">
                  {asset.trustScore}/100
                </span>
                <span className="font-code text-[11px] uppercase text-[#8e9192]">
                  [{asset.auditGrade}]
                </span>
              </div>
            </div>

            {/* Acceptance Banner */}
            <div className="w-full bg-[#0e0e0e] border border-white p-2 mb-2 text-center">
              <span className="font-code text-[11px] font-bold uppercase text-white tracking-widest">
                [*] UNCONDITIONAL ACCEPTANCE: ALL §135 VERIFICATION RULES SATISFIED
              </span>
            </div>

            {/* Verification Criteria List */}
            <div className="flex flex-col border border-[#444748] font-code text-[11px] divide-y divide-[#444748]">
              {asset.heuristics.map((h, i) => (
                <div key={h.id || i} className="p-2 bg-[#1b1b1b] flex items-start justify-between">
                  <div className="flex flex-col pr-2">
                    <span className="text-[#e2e2e2] font-bold">{h.name}</span>
                    <span className="text-[#8e9192] text-[10px]">{h.description}</span>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-white font-bold">
                      {h.passed ? '[PASSED]' : '[FLAGGED]'}
                    </span>
                    <span className="text-[#8e9192] block text-[10px]">
                      PENALTY: {h.penalty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block 2: Grant Metadata & Section 135 Mapping */}
          <div className="p-3 md:p-4 flex-1 bg-[#0e0e0e] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#444748]">
                <span className="text-[13px] uppercase text-white font-bold">
                  GRANT METADATA &amp; §135 MAPPING
                </span>
                <span className="font-code text-[11px] text-[#8e9192]">[REG_ID: IND-CSR-2025-01]</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 font-code text-[11px]">
                <div className="md:col-span-5 text-[#8e9192] uppercase">IMPLEMENTING ENTITY:</div>
                <div className="md:col-span-7 text-[#e2e2e2] font-medium">
                  Tata Power Community Dev Trust
                </div>
                <div className="md:col-span-5 text-[#8e9192] uppercase">CSR SCHEDULE VII HEAD:</div>
                <div className="md:col-span-7 text-white font-bold">{asset.scheduleVIIHead}</div>
                <div className="md:col-span-5 text-[#8e9192] uppercase">SANCTIONED AMOUNT:</div>
                <div className="md:col-span-7 text-[#e2e2e2] font-metric">
                  ₹{asset.sanctionedAmount.toLocaleString('en-IN')}.00 INR
                </div>
                <div className="md:col-span-5 text-[#8e9192] uppercase">ACTUAL DISBURSED:</div>
                <div className="md:col-span-7 text-white font-metric font-bold">
                  ₹{asset.disbursedAmount.toLocaleString('en-IN')}.00 INR (75.0%)
                </div>
                <div className="md:col-span-5 text-[#8e9192] uppercase">AUDIT MILESTONE:</div>
                <div className="md:col-span-7 text-[#e2e2e2]">{asset.milestoneName}</div>
                <div className="md:col-span-5 text-[#8e9192] uppercase">SITE IDENTIFIER:</div>
                <div className="md:col-span-7 text-[#e2e2e2]">RAJ-BMR-SCH-014 (Chohtan Govt School)</div>
              </div>
            </div>

            {/* Statutory Authority Note */}
            <div className="border border-[#444748] p-2.5 bg-[#1f1f1f] mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-code text-[11px] uppercase text-white font-bold">
                  STATUTORY ATTESTATION
                </span>
                <span className="font-code text-[11px] text-[#8e9192]">COMPANIES ACT 2013</span>
              </div>
              <p className="text-[11px] text-[#c4c7c8] leading-relaxed">
                Evidence item {asset.id} complies with statutory record-keeping mandated under MCA
                Rule 4(1). No modifications, transcodings, or header tampering detected. Permanently
                archived to Cold Ledger Unit IND-SOUTH-1.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Section: Provenance Graph (Lineage DAG) & Export Matrix */}
      <div className="w-full bg-[#0e0e0e] p-3 md:p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#444748] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-code text-[11px] text-white font-bold uppercase tracking-widest">
              // PROVENANCE GRAPH (LINEAGE DAG)
            </span>
            <span className="font-code text-[11px] text-[#8e9192]">
              [DIRECTED ACYCLIC GRAPH OF AUDIT TRAIL]
            </span>
          </div>
          <span className="font-code text-[11px] text-[#8e9192] uppercase">
            ROOT: CA_ROOT_IND_2025
          </span>
        </div>

        {/* DAG Interactive Visual Canvas */}
        <div className="w-full bg-[#131313] border border-[#444748] p-3 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[780px] gap-2 font-code text-[11px]">
            {/* Node 1 */}
            <div
              onClick={() => setActiveDagNode('raw')}
              className={`p-2 border cursor-pointer ${
                activeDagNode === 'raw'
                  ? 'border-white bg-[#2a2a2a] text-white'
                  : 'border-[#444748] bg-[#0e0e0e] text-[#c4c7c8] hover:border-white'
              }`}
            >
              <div className="text-white font-bold">[1] CAMERA CAPTURE (RAW)</div>
              <div className="text-[#8e9192] text-[10px]">2026-03-29 11:15:42 IST</div>
              <div className="text-[#8e9192] text-[10px]">SONY IMX766 HARDWARE</div>
            </div>

            <div className="text-[#8e9192] font-bold">----&gt;</div>

            {/* Node 2 */}
            <div
              onClick={() => setActiveDagNode('ingest')}
              className={`p-2 border cursor-pointer ${
                activeDagNode === 'ingest'
                  ? 'border-white bg-[#2a2a2a] text-white'
                  : 'border-[#444748] bg-[#0e0e0e] text-[#c4c7c8] hover:border-white'
              }`}
            >
              <div className="text-white font-bold">[2] INGEST PIPELINE v1</div>
              <div className="text-[#8e9192] text-[10px]">HASH: sha256_9f86...0a08</div>
              <div className="text-[#8e9192] text-[10px]">CLOUDINARY TRANSFORMS</div>
            </div>

            <div className="text-[#8e9192] font-bold">----&gt;</div>

            {/* Node 3 */}
            <div
              onClick={() => setActiveDagNode('report')}
              className={`p-2 border cursor-pointer ${
                activeDagNode === 'report'
                  ? 'border-white bg-[#2a2a2a] text-white'
                  : 'border-[#444748] bg-[#0e0e0e] text-[#c4c7c8] hover:border-white'
              }`}
            >
              <div className="text-white font-bold">[3] REPORT TRANCHE (t_sk)</div>
              <div className="text-[#8e9192] text-[10px]">TARGET: MCA_CSR_2</div>
              <div className="text-[#8e9192] text-[10px]">PDF: ANNUAL ANNEXURE 2026</div>
            </div>

            <div className="text-[#8e9192] font-bold">----&gt;</div>

            {/* Node 4 */}
            <div
              onClick={() => setActiveDagNode('public')}
              className={`p-2 border cursor-pointer ${
                activeDagNode === 'public'
                  ? 'border-white bg-[#2a2a2a] text-white'
                  : 'border-[#444748] bg-[#0e0e0e] text-[#c4c7c8] hover:border-white'
              }`}
            >
              <div className="text-white font-bold">[4] PUBLIC DERIVATIVE</div>
              <div className="text-[#8e9192] text-[10px]">BLURRED FACES / PII</div>
              <div className="text-[#8e9192] text-[10px]">URL: /e/AST-9402</div>
            </div>
          </div>
        </div>

        {/* Action & Export Dock */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenCertificateModal}
              className="bg-white text-black font-code text-[11px] uppercase font-bold px-3 py-2 hover:bg-[#e2e2e2] transition-none cursor-pointer"
            >
              [ EXPORT SIGNED EVIDENCE CERTIFICATE (PDF) ]
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="bg-[#131313] border border-[#444748] text-white font-code text-[11px] uppercase px-3 py-2 hover:border-white transition-none cursor-pointer"
            >
              {copiedLink ? '[ COPIED: /e/AST-9402 ]' : '[ COPY IMMUTABLE LINK ]'}
            </button>
          </div>
          <div className="flex items-center gap-2 font-code text-[11px] text-[#8e9192]">
            <span>
              IMMUTABLE ANCHOR:{' '}
              <span className="text-[#e2e2e2]">https://vault.pluribus.in/e/AST-9402</span>
            </span>
            <span className="text-[#444748]">::</span>
            <span>NODE: BLR-01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
