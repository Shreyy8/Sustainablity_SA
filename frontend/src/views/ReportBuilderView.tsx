import React, { useState } from 'react';
import { EvidenceAsset } from '../types';

interface ReportBuilderViewProps {
  assets: EvidenceAsset[];
  onInspectAsset?: (assetId: string) => void;
}

export const ReportBuilderView: React.FC<ReportBuilderViewProps> = ({
  assets,
  onInspectAsset,
}) => {
  const [activeSchema, setActiveSchema] = useState<
    'quarterly' | 'annual_annexure' | 'brsr_social'
  >('annual_annexure');
  const [excludeFlagged, setExcludeFlagged] = useState(true);
  const [ms1Checked, setMs1Checked] = useState(true);
  const [ms2Checked, setMs2Checked] = useState(true);
  const [ms3Checked, setMs3Checked] = useState(true);
  const [ms4Checked, setMs4Checked] = useState(false);
  const [hoveredCitation, setHoveredCitation] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isCompiled, setIsCompiled] = useState(false);

  const handleCompileAndFreeze = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setIsCompiled(true);
    }, 1400);
  };

  const handleExportManifest = () => {
    const manifestData = {
      exportTimestamp: new Date().toISOString(),
      mcaSchema: 'FORM_CSR_2_ANNEXURE',
      reportingEntity: 'TATA SUSTAINABILITY TRUST',
      cin: 'U85100MH2012NPL228190',
      totalDisbursedINR: 2785000,
      groundedCitations: ['AST-0081', 'AST-0012', 'AST-0019', 'AST-0084', 'AST-0092', 'AST-0105'],
      auditFirm: 'PRICE WATERHOUSE CHARTERED ACCNT LLP',
      dscVerification: 'VERIFIED // ARJUN_MEHTA',
    };

    const blob = new Blob([JSON.stringify(manifestData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MCA_CSR2_MANIFEST_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCitationAsset = (id: string) => {
    return assets.find((a) => a.id === id || a.shortId === id.replace('AST-', ''));
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Top Configuration Terminal Bar */}
      <section className="bg-[#1b1b1b] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap font-code text-[11px]">
            <span className="text-[#8e9192] uppercase">SCHEMA:</span>
            <button
              type="button"
              onClick={() => setActiveSchema('quarterly')}
              className={`px-2 py-1 transition-none uppercase ${
                activeSchema === 'quarterly'
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#1f1f1f] text-[#c4c7c8] hover:text-white border border-[#444748]'
              }`}
            >
              [ QUARTERLY FUNDER UPDATE ]
            </button>
            <button
              type="button"
              onClick={() => setActiveSchema('annual_annexure')}
              className={`px-2 py-1 transition-none uppercase font-bold ${
                activeSchema === 'annual_annexure'
                  ? 'bg-white text-black'
                  : 'bg-[#1f1f1f] text-[#c4c7c8] hover:text-white border border-[#444748]'
              }`}
            >
              [ CSR ANNUAL ANNEXURE (MCA FORM CSR-1/2) - ACTIVE ]
            </button>
            <button
              type="button"
              onClick={() => setActiveSchema('brsr_social')}
              className={`px-2 py-1 transition-none uppercase ${
                activeSchema === 'brsr_social'
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#1f1f1f] text-[#c4c7c8] hover:text-white border border-[#444748]'
              }`}
            >
              [ BRSR SOCIAL PACK (SEBI) ]
            </button>
          </div>
          <div className="flex items-center gap-3 font-code text-[11px]">
            <span className="text-[#8e9192]">REGISTRY:</span>
            <span className="text-white font-bold">MCA-SEC135-REV2026.02</span>
            <span className="text-[#444748]">::</span>
            <span className="text-[#c4c7c8]">LEDGER_STATE: SYNCHRONIZED</span>
          </div>
        </div>

        {/* Parameter Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 pt-1 bg-[#0e0e0e] p-1 border border-[#353535]">
          <div className="flex flex-col px-2 py-1 bg-[#131313] font-code text-[11px]">
            <span className="text-[#8e9192] uppercase text-[10px]">01 // FINANCIAL YEAR</span>
            <span className="text-white font-bold font-metric">FY 2025-26</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-[#131313] font-code text-[11px]">
            <span className="text-[#8e9192] uppercase text-[10px]">02 // GRANTEE PARTNER</span>
            <span className="text-[#e2e2e2] truncate font-medium">PRATHAM RURAL &amp; TATA TRUST</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-[#131313] font-code text-[11px]">
            <span className="text-[#8e9192] uppercase text-[10px]">03 // PROVENANCE FILTER</span>
            <span className="text-white font-metric font-bold">TRUST SCORE &gt;= 85 ONLY</span>
          </div>
          <div className="flex flex-col px-2 py-1 bg-[#131313] font-code text-[11px]">
            <span className="text-[#8e9192] uppercase text-[10px]">04 // CITATION NOTATION</span>
            <span className="text-white font-bold">[asset:AST-XXXX]</span>
          </div>
        </div>
      </section>

      {/* Main Workcell: 2-Panel Compiler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 border-b border-[#444748]">
        {/* LEFT PANEL: EVIDENCE CURATION (Col span 5) */}
        <div className="lg:col-span-5 bg-[#0e0e0e] p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-[#444748] flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            {/* Panel Header */}
            <div className="flex items-center justify-between bg-[#1b1b1b] px-2 py-1 border border-[#444748] font-code text-[11px]">
              <span className="text-white font-bold uppercase tracking-wider">
                [+] EVIDENCE CURATION &amp; MILESTONE SELECTION
              </span>
              <span className="text-[#8e9192]">SEC_3(A) POOL</span>
            </div>

            {/* Exclusion Filter Pill */}
            <div
              onClick={() => setExcludeFlagged(!excludeFlagged)}
              className="bg-[#131313] px-2 py-1.5 flex items-center justify-between border border-[#444748] cursor-pointer hover:border-white"
            >
              <div className="flex items-center gap-1.5 font-code text-[11px]">
                <span className="text-white font-bold">{excludeFlagged ? '[X]' : '[ ]'}</span>
                <span className="text-[#e2e2e2]">AUTO-EXCLUDE RECYCLED OR FLAGGED ASSETS</span>
              </div>
              <span className="bg-[#bb0112] text-white px-1.5 font-code text-[10px] font-bold">
                2 EXCLUDED
              </span>
            </div>

            {/* Milestone Checklist Ledger */}
            <div className="flex flex-col gap-1 font-code text-[11px]">
              {/* Item 1 */}
              <div
                onClick={() => setMs1Checked(!ms1Checked)}
                className="bg-[#131313] p-2 flex flex-col gap-1 cursor-pointer hover:bg-[#1f1f1f] border border-[#353535]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">{ms1Checked ? '[X]' : '[ ]'}</span>
                    <span className="text-white font-bold text-xs">
                      MS-01: LAND LEVELING &amp; FOUNDATION EXCAVATION
                    </span>
                  </div>
                  <span className="text-[#8e9192] font-bold text-[10px]">100% COMPLETE</span>
                </div>
                <div className="flex items-center justify-between pl-4 text-[#8e9192] text-[10px]">
                  <span>ATTACHED: 03 ASSETS (AST-0012, AST-0019, AST-0024)</span>
                  <span className="text-white font-bold">AVG SCORE: 94.2</span>
                </div>
                <div className="pl-4 text-[#8e9192] text-[9px] font-mono">
                  GEO: 25.7531° N, 71.3964° E (+-2.4m) :: SHA: e3b0c442...
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setMs2Checked(!ms2Checked)}
                className="bg-[#131313] p-2 flex flex-col gap-1 cursor-pointer hover:bg-[#1f1f1f] border border-[#353535]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">{ms2Checked ? '[X]' : '[ ]'}</span>
                    <span className="text-white font-bold text-xs">
                      MS-02: BRICK MASONRY &amp; RCC COLUMNS
                    </span>
                  </div>
                  <span className="text-[#8e9192] font-bold text-[10px]">100% COMPLETE</span>
                </div>
                <div className="flex items-center justify-between pl-4 text-[#8e9192] text-[10px]">
                  <span>ATTACHED: 06 ASSETS (AST-0044 -&gt; AST-0051)</span>
                  <span className="text-white font-bold">AVG SCORE: 91.8</span>
                </div>
                <div className="pl-4 text-[#8e9192] text-[9px] font-mono">
                  MATERIAL CERT: ULTRATECH-INSP-2025-9981 // VERIFIED
                </div>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => setMs3Checked(!ms3Checked)}
                className="bg-[#131313] p-2 flex flex-col gap-1 cursor-pointer hover:bg-[#1f1f1f] border border-[#353535]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">{ms3Checked ? '[X]' : '[ ]'}</span>
                    <span className="text-white font-bold text-xs">
                      MS-03: TIN ROOFING SHEETS &amp; STEEL TRUSS SUPPORT
                    </span>
                  </div>
                  <span className="text-white font-bold text-[10px]">[INSPECTED]</span>
                </div>
                <div className="flex items-center justify-between pl-4 text-[#8e9192] text-[10px]">
                  <span>ATTACHED: 08 ASSETS (AST-0081, AST-0084, AST-0092...)</span>
                  <span className="text-white font-bold">AVG SCORE: 96.0</span>
                </div>
                <div className="pl-4 text-[#8e9192] text-[9px] font-mono">
                  DRONE ORTHOMOSAIC ID: DJI-THRM-9092 // GEO_LOCK: OK
                </div>
              </div>

              {/* Item 4 */}
              <div
                onClick={() => setMs4Checked(!ms4Checked)}
                className="bg-[#131313] p-2 flex flex-col gap-1 cursor-pointer hover:bg-[#1f1f1f] border border-[#353535] opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#8e9192]">{ms4Checked ? '[X]' : '[ ]'}</span>
                    <span className="text-[#c4c7c8] text-xs">
                      MS-04: SANITATION &amp; DRINKING WATER PIPELINE
                    </span>
                  </div>
                  <span className="text-[#ffb4ab] font-bold text-[10px]">[ PENDING UPLOAD ]</span>
                </div>
                <div className="flex items-center justify-between pl-4 text-[#8e9192] text-[10px]">
                  <span>ATTACHED: 02 ASSETS (AST-0105 PROVISIONAL)</span>
                  <span>AWAITING WATER PURITY LAB RUN</span>
                </div>
              </div>
            </div>

            {/* Citation Density & Integrity Metrics */}
            <div className="bg-[#1f1f1f] p-2.5 flex flex-col gap-1 border border-[#444748] font-code text-[11px]">
              <div className="flex justify-between items-center text-[#8e9192]">
                <span>SYNTHESIS CONFIDENCE INDEX</span>
                <span className="text-white font-bold font-metric">98.4%</span>
              </div>
              <div className="w-full bg-[#353535] h-1.5 overflow-hidden">
                <div className="bg-white h-full w-[98.4%]" />
              </div>
              <div className="flex justify-between items-center text-[#8e9192] text-[10px] pt-1">
                <span>TOTAL CLAIMS: 19 VERBS</span>
                <span>GROUNDED TOKENS: 19/19</span>
                <span>ORPHANS: 0</span>
              </div>
            </div>
          </div>

          {/* Curation Diagnostic Footnote */}
          <div className="pt-3 flex flex-col gap-1 font-code text-[10px]">
            <div className="bg-[#1b1b1b] p-1.5 flex items-center justify-between border border-[#444748]">
              <span className="text-[#8e9192]">MCA VALIDATION CHECK:</span>
              <span className="text-white font-bold">[ PASS: RULE 8 COMPLIANT ]</span>
            </div>
            <div className="text-[#8e9192]">
              * ALL ATTACHED ASSETS HAVE PASSED EXIF TAMPER ANALYSIS AND GPS HORIZON DRIFT
              VERIFICATION.
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE GROUNDED PDF PREVIEW (Col span 7) */}
        <div className="lg:col-span-7 bg-[#1f1f1f] p-3 md:p-4 flex flex-col justify-between">
          <div className="flex flex-col flex-1">
            {/* Panel Bar */}
            <div className="flex items-center justify-between pb-2 font-code text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold">:: LIVE GROUNDED NARRATIVE PREVIEW</span>
                <span className="bg-[#353535] px-1 text-[#e2e2e2] text-[10px]">
                  ISO-PDF/A-1b TARGET
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8e9192]">RENDER: RAW DRAFT</span>
                <span className="text-white font-bold">[PAGE 01 OF 04]</span>
              </div>
            </div>

            {/* STARK WHITE INVERTED AUDIT SHEET */}
            <div className="bg-white text-black p-4 md:p-6 font-metric text-[12px] flex flex-col gap-3 shadow-2xl flex-grow overflow-auto border border-black selection:bg-black selection:text-white">
              {/* Statutory Sheet Title Strip */}
              <div className="flex flex-col gap-1 pb-2 border-b border-black">
                <div className="flex justify-between items-start font-code text-[11px]">
                  <span className="font-bold tracking-widest text-black">
                    FORM CSR-2 // REGULATORY FILING ANNEXURE
                  </span>
                  <span className="text-[#454747]">
                    STATUTORY COMPLIANCE REF: MCA-CSR-2026-7782A
                  </span>
                </div>
                <div className="text-lg md:text-xl text-black uppercase tracking-tight font-bold">
                  Report on Corporate Social Responsibility Expenditure
                </div>
                <div className="flex justify-between text-[#454747] font-code text-[10px]">
                  <span>PURSUANT TO SECTION 135 OF THE COMPANIES ACT, 2013</span>
                  <span>FINANCIAL YEAR ENDED: 31 MARCH 2026</span>
                </div>
              </div>

              {/* Corporate & Entity Ledger Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#f0f0f0] p-2 font-code text-[11px] border border-black/20">
                <div>
                  <span className="text-[#454747] block text-[10px]">REPORTING ENTITY:</span>
                  <span className="text-black font-bold">TATA SUSTAINABILITY TRUST</span>
                </div>
                <div>
                  <span className="text-[#454747] block text-[10px]">CIN / REGISTRATION:</span>
                  <span className="text-black font-bold">U85100MH2012NPL228190</span>
                </div>
                <div>
                  <span className="text-[#454747] block text-[10px]">TOTAL ALLOCATED BUDGET:</span>
                  <span className="text-black font-bold">INR 4,80,00,000.00</span>
                </div>
              </div>

              {/* SECTION 3(a): Physical Achievement Audit Trail */}
              <div className="flex flex-col gap-2">
                <div className="bg-black text-white px-2 py-1 font-code text-[11px] font-bold flex justify-between">
                  <span>SECTION 3(a): PHYSICAL &amp; GEOGRAPHIC ASSET CREATION TRAIL</span>
                  <span>SCHEDULE VII ITEM: (ii) EDUCATION</span>
                </div>

                {/* Narrative Text with Grounded Monospace Pins */}
                <div className="leading-relaxed text-black bg-white p-2 font-sans text-xs flex flex-col gap-2 border border-black/20">
                  <p>
                    Under the Balika Shiksha program in Barmer district, civil works for classroom
                    superstructure were completed strictly as per sanctioned engineering specs{' '}
                    <span
                      onClick={() => onInspectAsset && onInspectAsset('AST-0081')}
                      onMouseEnter={() => setHoveredCitation('AST-0081')}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className="bg-black text-white px-1.5 py-0.5 font-code text-[10px] font-bold inline-block cursor-pointer hover:bg-gray-800"
                    >
                      [asset:AST-0081]
                    </span>
                    . Foundation excavation verified to depth of 3.2m in hard strata{' '}
                    <span
                      onClick={() => onInspectAsset && onInspectAsset('AST-0012')}
                      onMouseEnter={() => setHoveredCitation('AST-0012')}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className="bg-black text-white px-1.5 py-0.5 font-code text-[10px] font-bold inline-block cursor-pointer hover:bg-gray-800"
                    >
                      [asset:AST-0012]
                    </span>{' '}
                    with standard grade reinforced steel ties{' '}
                    <span
                      onClick={() => onInspectAsset && onInspectAsset('AST-0019')}
                      onMouseEnter={() => setHoveredCitation('AST-0019')}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className="bg-black text-white px-1.5 py-0.5 font-code text-[10px] font-bold inline-block cursor-pointer hover:bg-gray-800"
                    >
                      [asset:AST-0019]
                    </span>
                    .
                  </p>
                  <p>
                    Roof installation was completed on 28 Feb 2026 using galvanized corrugated sheets{' '}
                    <span
                      onClick={() => onInspectAsset && onInspectAsset('AST-0084')}
                      onMouseEnter={() => setHoveredCitation('AST-0084')}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className="bg-black text-white px-1.5 py-0.5 font-code text-[10px] font-bold inline-block cursor-pointer hover:bg-gray-800"
                    >
                      [asset:AST-0084]
                    </span>{' '}
                    with seismic anchor clamps{' '}
                    <span
                      onClick={() => onInspectAsset && onInspectAsset('AST-0092')}
                      onMouseEnter={() => setHoveredCitation('AST-0092')}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className="bg-black text-white px-1.5 py-0.5 font-code text-[10px] font-bold inline-block cursor-pointer hover:bg-gray-800"
                    >
                      [asset:AST-0092]
                    </span>
                    . Dual-stage RO drinking water filtration system commissioned{' '}
                    <span
                      onClick={() => onInspectAsset && onInspectAsset('AST-0105')}
                      onMouseEnter={() => setHoveredCitation('AST-0105')}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className="bg-black text-white px-1.5 py-0.5 font-code text-[10px] font-bold inline-block cursor-pointer hover:bg-gray-800"
                    >
                      [asset:AST-0105]
                    </span>{' '}
                    with verified potable flow of 250 LPH.
                  </p>
                  <p className="text-[#454747] text-[11px] font-sans">
                    All 19 referenced media assets exhibit verified geofence adherence (&lt;5m
                    deviation) and cryptographic SHA-256 provenance locked on tamper-proof
                    decentralized ledger. Verification performed under Ministry guidelines.
                  </p>

                  {/* Hovered citation quick popover preview */}
                  {hoveredCitation && (
                    <div className="bg-[#0e0e0e] text-white p-2 font-code text-[10px] border border-white mt-1">
                      <div className="font-bold text-white mb-0.5">
                        CITATION PROOF: {hoveredCitation}
                      </div>
                      <div className="text-[#c4c7c8]">
                        HASH: {getCitationAsset(hoveredCitation)?.canonicalHash || 'sha256_e3b0c442...9f86'}
                      </div>
                      <div className="text-[#8e9192]">
                        GEO: 25.7532° N, 71.3964° E (+-2.8m CEP) :: HARDWARE KEY ATTESTED
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabular Financial Ledger Grounding Table */}
              <div className="flex flex-col gap-1">
                <div className="font-code text-[11px] font-bold text-black uppercase">
                  3(b) DISBURSEMENT &amp; VENDOR CITATION LEDGER
                </div>
                <table className="w-full text-left font-metric text-xs border border-black/20">
                  <thead>
                    <tr className="bg-black text-white font-code text-[10px] uppercase">
                      <th className="p-1.5">REF ID</th>
                      <th className="p-1.5">HEAD OF EXPENSE</th>
                      <th className="p-1.5 text-right">DISBURSED (INR)</th>
                      <th className="p-1.5">VOUCHER LINK</th>
                      <th className="p-1.5 text-right">AUDIT STAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 text-black">
                    <tr className="bg-gray-50">
                      <td className="p-1.5 font-bold">EXP-8821</td>
                      <td className="p-1.5">Barmer Superstructure Framing</td>
                      <td className="p-1.5 text-right font-mono">18,50,000.00</td>
                      <td className="p-1.5 font-code text-[10px] font-bold">[asset:AST-0081]</td>
                      <td className="p-1.5 text-right font-bold text-black">[VERIFIED]</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold">EXP-8829</td>
                      <td className="p-1.5">Roofing Corrugation &amp; Clamps</td>
                      <td className="p-1.5 text-right font-mono">6,20,000.00</td>
                      <td className="p-1.5 font-code text-[10px] font-bold">[asset:AST-0084]</td>
                      <td className="p-1.5 text-right font-bold text-black">[VERIFIED]</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-1.5 font-bold">EXP-8840</td>
                      <td className="p-1.5">Potable Water RO 250 LPH</td>
                      <td className="p-1.5 text-right font-mono">3,15,000.00</td>
                      <td className="p-1.5 font-code text-[10px] font-bold">[asset:AST-0105]</td>
                      <td className="p-1.5 text-right font-bold text-black">[VERIFIED]</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Digital Signature Seal Emulation */}
              <div className="mt-auto pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-black font-code text-[10px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#454747] uppercase">AUDIT FIRM IDENTIFIER:</span>
                  <span className="text-black font-bold">
                    PRICE WATERHOUSE CHARTERED ACCNT LLP
                  </span>
                  <span className="text-[#454747]">
                    FRN: 012754N/N500016 :: UDIN: 26042918AAAAAL9921
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 sm:items-end sm:text-right">
                  <span className="text-[#454747] uppercase">CRYPTOGRAPHIC SEAL:</span>
                  <span className="text-black font-bold">
                    [ DSC_PKI_VERIFIED // ARJUN_MEHTA ]
                  </span>
                  <span className="text-[#454747]">
                    TIMESTAMP: 2026-03-01T11:42:09.112+05:30
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STATUTORY ACTION CONTROLS & STATUS */}
      <footer className="bg-[#0e0e0e] border-t border-[#444748] p-3 md:p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Status Readout */}
        <div className="flex items-center gap-3 font-code text-[11px] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-white inline-block" />
            <span className="text-white font-bold">ALL 19 CITATIONS GROUNDED</span>
          </div>
          <span className="text-[#444748]">//</span>
          <span className="text-[#e2e2e2]">ZERO ORPHAN CLAIMS</span>
          <span className="text-[#444748]">//</span>
          <span className="text-white font-bold">AUDIT INTEGRITY: 100%</span>
          <span className="text-[#444748]">|</span>
          <span className="text-[#8e9192]">MCA ENGINE: PARSED ZERO ANOMALIES</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportManifest}
            className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#e2e2e2] px-3 py-2 font-code text-[11px] uppercase tracking-wider border border-[#444748] transition-none cursor-pointer"
          >
            [ EXPORT RAW ASSET MANIFEST (CSV/JSON) ]
          </button>
          <button
            type="button"
            onClick={handleCompileAndFreeze}
            className={`px-3 py-2 font-code text-[11px] font-bold uppercase tracking-wider transition-none cursor-pointer ${
              isCompiled
                ? 'bg-[#353535] text-white border border-white'
                : 'bg-white text-black hover:bg-[#e2e2e2]'
            }`}
          >
            {isSigning
              ? '[ RUNNING SHA-256 SIGNING ENGINE... ]'
              : isCompiled
              ? '[ PDF LOCKED & SEALED // HASH STORED ]'
              : '[ COMPILE & FREEZE AUDIT PDF (DIGITALLY SIGNED) ]'}
          </button>
        </div>
      </footer>
    </div>
  );
};
