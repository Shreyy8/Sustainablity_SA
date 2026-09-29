import React, { useState, useEffect } from 'react';
import { TriageItem } from '../types';

interface TriageInboxViewProps {
  items: TriageItem[];
  onAdjudicate?: (itemId: string, decision: 'FRAUD_REJECTED' | 'LEGITIMATE_DUPLICATE' | 'REASSIGNED') => void;
}

export const TriageInboxView: React.FC<TriageInboxViewProps> = ({
  items,
  onAdjudicate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unassigned' | 'low_trust' | 'duplicates' | 'moderation'>('duplicates');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<{
    title: string;
    details: string;
    isError: boolean;
  } | null>(null);

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    return item.statusCategory === activeTab;
  });

  const activeItem = filteredItems[currentIndex] || filteredItems[0] || items[0];

  const handleAction = (
    actionType: 'FRAUD_REJECTED' | 'LEGITIMATE_DUPLICATE' | 'REASSIGNED'
  ) => {
    let title = '';
    let isError = false;

    if (actionType === 'FRAUD_REJECTED') {
      title = '[!] SECTION 135 FRAUD AUDIT REJECTION COMMITTED';
      isError = true;
    } else if (actionType === 'LEGITIMATE_DUPLICATE') {
      title = '[*] CLASSIFIED AS LEGITIMATE PERMANENT STRUCTURE';
      isError = false;
    } else {
      title = '[->] DISPATCHED RE-CAPTURE DIRECTIVE TO FIELD AGENT';
      isError = false;
    }

    setActionFeedback({
      title,
      details: `ASSET_ID: ${activeItem?.historicalAssetId || 'AST-4821'} | SUBMISSION: ${activeItem?.submissionId || '#INB-88392'} | TIMESTAMP: ${new Date().toISOString()}`,
      isError,
    });

    if (onAdjudicate && activeItem) {
      onAdjudicate(activeItem.id, actionType);
    }

    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  // Keyboard shortcut listener for A, B, C keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toUpperCase();
      if (key === 'A') {
        e.preventDefault();
        handleAction('FRAUD_REJECTED');
      } else if (key === 'B') {
        e.preventDefault();
        handleAction('LEGITIMATE_DUPLICATE');
      } else if (key === 'C') {
        e.preventDefault();
        handleAction('REASSIGNED');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem]);

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Triage Sub-Header / Status Bar */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap font-code text-[11px]">
          <span className="uppercase tracking-wider text-[#8e9192]">TRIAGE_SUBSYSTEM:</span>
          <span className="uppercase tracking-widest text-white font-bold">
            SECTION 135 FRAUD AUDIT ENGINE
          </span>
          <span className="text-[#444748]">::</span>
          <span className="text-[#c4c7c8]">ACTIVE QUEUE: FORENSIC DIFFERENTIAL</span>
        </div>
        <div className="flex items-center gap-3 font-code text-[11px]">
          <span className="text-[#8e9192]">
            PENDING RESOLUTION: <strong className="text-white font-metric">07</strong>
          </span>
          <span className="text-[#444748]">|</span>
          <span className="text-[#8e9192]">
            LATENCY: <strong className="text-white font-metric">18ms</strong>
          </span>
          <span className="text-[#444748]">|</span>
          <span className="text-[#ffb4ab] font-bold">[!] STATUTORY WATCHDOG ENGAGED</span>
        </div>
      </div>

      {/* Queue Status Tabs */}
      <div className="w-full bg-[#1b1b1b] border-b border-[#444748] px-3 md:px-4 py-1.5 flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setCurrentIndex(0);
          }}
          className={`px-3 py-1 font-code text-[11px] uppercase tracking-wider transition-none ${
            activeTab === 'all'
              ? 'bg-white text-black font-bold'
              : 'text-[#c4c7c8] bg-[#0e0e0e] hover:text-white hover:bg-[#1f1f1f]'
          }`}
        >
          [ ALL [14] ]
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('unassigned');
            setCurrentIndex(0);
          }}
          className={`px-3 py-1 font-code text-[11px] uppercase tracking-wider transition-none ${
            activeTab === 'unassigned'
              ? 'bg-white text-black font-bold'
              : 'text-[#c4c7c8] bg-[#0e0e0e] hover:text-white hover:bg-[#1f1f1f]'
          }`}
        >
          [ UNASSIGNED [4] ]
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('low_trust');
            setCurrentIndex(0);
          }}
          className={`px-3 py-1 font-code text-[11px] uppercase tracking-wider transition-none ${
            activeTab === 'low_trust'
              ? 'bg-white text-black font-bold'
              : 'text-[#c4c7c8] bg-[#0e0e0e] hover:text-white hover:bg-[#1f1f1f]'
          }`}
        >
          [ LOW TRUST [2] ]
        </button>

        {/* ACTIVE RED HIGHLIGHT TAB */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('duplicates');
            setCurrentIndex(0);
          }}
          className={`px-3 py-1 font-code text-[11px] uppercase tracking-wider font-bold transition-none ${
            activeTab === 'duplicates'
              ? 'bg-[#bb0112] text-white'
              : 'bg-[#bb0112]/30 text-[#ffb4ab] border border-[#ffb4ab]'
          }`}
        >
          [ DUPLICATES [3] - ACTIVE RED HIGHLIGHT ]
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('moderation');
            setCurrentIndex(0);
          }}
          className={`px-3 py-1 font-code text-[11px] uppercase tracking-wider transition-none ${
            activeTab === 'moderation'
              ? 'bg-white text-black font-bold'
              : 'text-[#8e9192] bg-[#0e0e0e] hover:text-white hover:bg-[#1f1f1f]'
          }`}
        >
          [ MODERATION [0] ]
        </button>

        <div className="ml-auto hidden lg:flex items-center gap-2 text-[#8e9192] font-code text-[11px]">
          <span>QUEUE_CURSOR:</span>
          <span className="text-white font-metric">
            ENTRY 0{currentIndex + 1} / 0{filteredItems.length || 1}
          </span>
        </div>
      </div>

      {/* Floating Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`fixed bottom-6 right-6 p-4 z-50 font-code text-[11px] max-w-lg shadow-2xl border ${
            actionFeedback.isError
              ? 'bg-[#bb0112]/90 text-white border-[#ffb4ab]'
              : 'bg-[#0e0e0e]/95 text-white border-white'
          }`}
        >
          <div className="font-bold pb-1 mb-1 border-b border-white/20 text-xs">
            {actionFeedback.title}
          </div>
          <div className="text-white/80 text-[10px] break-all">{actionFeedback.details}</div>
          <div className="text-[#c4c7c8] text-[9px] mt-1">
            DISPATCH PROTOCOL 200 OK // IMMUTABLE LEDGER COMMITTED
          </div>
        </div>
      )}

      {/* Core Forensic Analysis Canvas (Tiled Grid Framework) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-[#131313] border-b border-[#444748]">
        {/* LEFT FRAME: NEW INCOMING SUBMISSION (Col span 4) */}
        <div className="lg:col-span-4 bg-[#0e0e0e] p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-[#444748] flex flex-col justify-between">
          <div>
            {/* Section Header */}
            <div className="flex items-center justify-between pb-2 mb-3 bg-[#1b1b1b] px-2 py-1 border border-[#444748]">
              <div className="flex items-center gap-1.5 font-code text-[11px]">
                <span className="text-white font-bold">[SUBMISSION_A]</span>
                <span className="text-white uppercase font-bold">NEW INCOMING SUBMISSION</span>
              </div>
              <span className="font-code text-[10px] bg-[#1f1f1f] px-1 py-0.5 text-[#e2e2e2]">
                STATUS: UNCOMMITTED
              </span>
            </div>

            {/* Document Preview Canvas */}
            <div className="relative w-full aspect-video bg-[#2a2a2a] overflow-hidden mb-3 border border-[#444748]">
              <img
                src={activeItem?.submissionImage}
                alt="New incoming submission"
                className="w-full h-full object-cover grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-90" />
              <div className="absolute top-2 left-2 bg-[#0e0e0e]/90 px-1.5 py-0.5 font-code text-[10px] text-white">
                CAM_STREAM_01 :: RAW_FRAME_3840x2160
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-code text-[10px] text-[#c4c7c8] bg-[#0e0e0e]/95 p-1 border border-[#444748]">
                <span>SIG: SHA256:4a8b...e92f</span>
                <span className="text-white font-bold">LENS_HW_SIG: VERIFIED</span>
              </div>
            </div>

            {/* Telemetry Data Grid */}
            <div className="w-full bg-[#1b1b1b] mb-3 border border-[#444748]">
              <div className="px-2 py-1 bg-[#1f1f1f] flex items-center justify-between font-code text-[10px]">
                <span className="uppercase tracking-wider text-[#8e9192]">
                  TELEMETRY &amp; ATTRIBUTION
                </span>
                <span className="text-white">SUB_ID: #{activeItem?.submissionId}</span>
              </div>
              <div className="flex flex-col font-code text-[11px] divide-y divide-[#353535]">
                <div className="flex items-center justify-between px-2 py-1 bg-[#0e0e0e]">
                  <span className="text-[#8e9192]">GEOGRAPHICAL SITE:</span>
                  <span className="text-white font-bold text-right truncate pl-2">
                    {activeItem?.siteName}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#1b1b1b]">
                  <span className="text-[#8e9192]">CAPTURE TIMESTAMP:</span>
                  <span className="text-white font-metric">{activeItem?.captureTimestamp}</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#0e0e0e]">
                  <span className="text-[#8e9192]">SUBMITTING AGENT:</span>
                  <span className="text-[#e2e2e2] text-right">{activeItem?.submittingAgent}</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#1b1b1b]">
                  <span className="text-[#8e9192]">PHYSICAL HARDWARE:</span>
                  <span className="text-[#e2e2e2]">{activeItem?.hardware}</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#0e0e0e]">
                  <span className="text-[#8e9192]">GEOFENCE INTEGRITY:</span>
                  <span className="text-white font-metric">{activeItem?.coordinates}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hash Metadata Footer */}
          <div className="bg-[#1b1b1b] p-2.5 flex flex-col gap-1 font-code text-[10px] border border-[#444748]">
            <div className="flex justify-between text-[#8e9192]">
              <span>HARDWARE CRYPTO-CHIP:</span>
              <span className="text-white">{activeItem?.cryptoChip}</span>
            </div>
            <div className="flex justify-between text-[#8e9192]">
              <span>OPERATOR CREDENTIAL:</span>
              <span className="text-white">{activeItem?.operatorCredential}</span>
            </div>
          </div>
        </div>

        {/* CENTER FRAME: FORENSIC DIFFERENTIAL & REASONING (Col span 4) */}
        <div className="lg:col-span-4 bg-[#1b1b1b] p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-[#444748] flex flex-col justify-between">
          <div>
            {/* Differential Analysis Banner */}
            <div className="flex items-center justify-between pb-2 mb-3 bg-[#1f1f1f] px-2 py-1 border border-[#444748]">
              <div className="flex items-center gap-1.5 font-code text-[11px]">
                <span className="text-[#ffb4ab] font-bold">[DELTA_ENGINE]</span>
                <span className="text-white uppercase font-bold">FORENSIC COMPARISON</span>
              </div>
              <span className="bg-[#bb0112] text-white px-1.5 py-0.5 font-code text-[10px] font-bold">
                HIGH CONFIDENCE MATCH
              </span>
            </div>

            {/* High-Impact Trust Metric Gauge Block */}
            <div className="bg-[#0e0e0e] p-3 mb-3 border border-[#444748]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-code text-[10px] uppercase tracking-widest text-[#8e9192]">
                    STATUTORY TRUST SCORE
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-metric text-2xl text-[#ffb4ab] font-bold">
                      {activeItem?.trustScore}
                    </span>
                    <span className="font-metric text-sm text-[#8e9192]">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-code text-[10px] text-[#ffb4ab] bg-[#1f1f1f] px-1.5 py-1 inline-block border border-[#ffb4ab] font-bold">
                    [!] NON_COMPLIANT §135(5)
                  </span>
                  <div className="font-code text-[10px] text-[#8e9192] mt-1">SEVERITY: CRITICAL</div>
                </div>
              </div>

              {/* Gauge Visual Bar */}
              <div className="w-full h-2 bg-[#1f1f1f] overflow-hidden border border-[#353535]">
                <div
                  className="h-full bg-[#bb0112]"
                  style={{ width: `${activeItem?.trustScore || 40}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 font-code text-[10px] text-[#8e9192]">
                <span>00 [VOID]</span>
                <span className="text-[#ffb4ab] font-bold">
                  DEFICIT APPLIED: -{activeItem?.penaltyPoints || 60} PTS
                </span>
                <span>100 [AUDIT_VALID]</span>
              </div>
            </div>

            {/* Monospace Forensic Correlation Matrix */}
            <div className="bg-[#0e0e0e] p-2.5 mb-3 flex flex-col gap-1 font-code text-[11px] border border-[#444748]">
              <div className="text-[#8e9192] uppercase tracking-wider pb-1 bg-[#1b1b1b] px-1 text-[10px]">
                MATHEMATICAL CORRELATION LEDGER
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[#8e9192]">pHash HAMMING DISTANCE:</span>
                <span className="bg-[#bb0112] text-white px-1.5 font-bold font-metric text-[10px]">
                  0{activeItem?.pHashDistance} [RECYCLED DETECTED]
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[#8e9192]">PIXEL CORRELATION COEFF:</span>
                <span className="text-[#ffb4ab] font-bold font-metric">
                  {activeItem?.pixelCorrelationPct}% IDENTICAL
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[#8e9192]">SSIM STRUCTURAL INDEX:</span>
                <span className="text-white font-metric">{activeItem?.ssimIndex} / 1.0000</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[#8e9192]">HISTOGRAM SPECTRUM SHIFT:</span>
                <span className="text-[#e2e2e2] font-metric">
                  {activeItem?.histogramShiftPct}% (SLIGHT RE-COMPRESSION)
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-[#8e9192]">SENSOR PRNU CORRELATION:</span>
                <span className="text-[#ffb4ab] font-bold font-metric">
                  {activeItem?.sensorPrnu} [DEVICE MISMATCH]
                </span>
              </div>
            </div>

            {/* Algorithmic Finding Box */}
            <div className="bg-[#0e0e0e] p-2.5 mb-2 border border-[#ffb4ab]">
              <div className="flex items-center gap-1 text-[#ffb4ab] font-code text-[10px] mb-1 uppercase tracking-wider font-bold">
                <span>[!] FORENSIC EXCEPTION LOG: SENSOR_ANOMALY</span>
              </div>
              <p className="text-[11px] text-[#c4c7c8] leading-relaxed">
                {activeItem?.forensicAnomalyLog}
              </p>
              <div className="mt-2 p-1 bg-[#2a2a2a] font-code text-[10px] text-[#8e9192]">
                RESULT: Physical photo-reuse detected across disparate corporate sanction accounts.
                Section 135 penalty protocol automatically triggered.
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Diff Block */}
          <div className="bg-[#0e0e0e] p-2 font-code text-[10px] border border-[#444748]">
            <div className="flex items-center justify-between text-[#8e9192] mb-0.5">
              <span>FORENSIC KERNEL:</span>
              <span className="text-white font-bold">OPENCV-CUDA v4.10 // SURF</span>
            </div>
            <div className="truncate text-[#c4c7c8] text-[9px] font-mono">
              DIFF_HASH: {activeItem?.diffHash}
            </div>
          </div>
        </div>

        {/* RIGHT FRAME: HISTORICAL MATCH IN VAULT (Col span 4) */}
        <div className="lg:col-span-4 bg-[#0e0e0e] p-3 md:p-4 flex flex-col justify-between">
          <div>
            {/* Section Header with Alert */}
            <div className="flex items-center justify-between pb-2 mb-3 bg-[#1b1b1b] px-2 py-1 border border-[#444748]">
              <div className="flex items-center gap-1.5 font-code text-[11px]">
                <span className="text-[#ffb4ab] font-bold">[VAULT_RECORD_B]</span>
                <span className="text-[#ffb4ab] uppercase font-bold">HISTORICAL MATCH DETECTED</span>
              </div>
              <span className="font-code text-[10px] bg-[#bb0112] text-white px-1.5 py-0.5 font-bold">
                {activeItem?.historicalAssetId}
              </span>
            </div>

            {/* Historical Photo Container */}
            <div className="relative w-full aspect-video bg-[#2a2a2a] overflow-hidden mb-3 border border-[#ffb4ab]">
              <img
                src={activeItem?.historicalImage}
                alt="Historical vault record"
                className="w-full h-full object-cover grayscale contrast-125 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-90" />
              <div className="absolute top-2 left-2 bg-[#bb0112] text-white px-1.5 py-0.5 font-code text-[10px] font-bold">
                [!] VAULT_ARCHIVE :: CANONICAL RECORD
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-code text-[10px] text-[#c4c7c8] bg-[#0e0e0e]/95 p-1 border border-[#444748]">
                <span className="text-[#ffb4ab] font-bold">
                  LOCKED: {activeItem?.historicalTimestamp?.split(' ')[0]}
                </span>
                <span className="text-[#8e9192]">MCA_VERIFIED_LEDGER</span>
              </div>
            </div>

            {/* Archival Telemetry Ledger */}
            <div className="w-full bg-[#1b1b1b] mb-3 border border-[#444748]">
              <div className="px-2 py-1 bg-[#1f1f1f] flex items-center justify-between font-code text-[10px]">
                <span className="uppercase tracking-wider text-[#8e9192]">ORIGINAL GRANT RECORD</span>
                <span className="text-[#ffb4ab]">MATCH_REF: VAULT://2025/RURAL-INF</span>
              </div>
              <div className="flex flex-col font-code text-[11px] divide-y divide-[#353535]">
                <div className="flex items-center justify-between px-2 py-1 bg-[#0e0e0e]">
                  <span className="text-[#8e9192]">CANONICAL ASSET ID:</span>
                  <span className="text-white font-bold font-metric">
                    {activeItem?.historicalAssetId}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#1b1b1b]">
                  <span className="text-[#8e9192]">ORIGINAL SITE SANCTION:</span>
                  <span className="text-white font-bold text-right truncate pl-2">
                    {activeItem?.historicalSite}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#0e0e0e]">
                  <span className="text-[#8e9192]">HISTORICAL TIMESTAMP:</span>
                  <span className="text-[#ffb4ab] font-metric">
                    {activeItem?.historicalTimestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#1b1b1b]">
                  <span className="text-[#8e9192]">SANCTIONED PROGRAM:</span>
                  <span className="text-[#e2e2e2] text-right">{activeItem?.historicalGrant}</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-[#0e0e0e]">
                  <span className="text-[#8e9192]">DISBURSEMENT AUDIT:</span>
                  <span className="text-white font-metric">
                    {activeItem?.historicalDisbursement}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vault Certifying Authority Signature */}
          <div className="bg-[#1b1b1b] p-2.5 flex flex-col gap-1 font-code text-[10px] border border-[#444748]">
            <div className="flex justify-between text-[#8e9192]">
              <span>CERTIFYING CA DIGITAL ID:</span>
              <span className="text-white">{activeItem?.historicalCaId}</span>
            </div>
            <div className="flex justify-between text-[#8e9192]">
              <span>DISPOSITION STATUS:</span>
              <span className="text-[#ffb4ab] font-bold">DUPLICATE CLAIM PROHIBITED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Decision Matrix Bar / Statutory Action Dock */}
      <div className="w-full bg-[#0e0e0e] p-3 md:p-4 border-b border-[#444748]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left Context Hint */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 font-code text-[11px]">
              <span className="text-[#ffb4ab] font-bold">[!]</span>
              <span className="text-white font-bold uppercase tracking-wider">
                MANDATORY STATUTORY ADJUDICATION:
              </span>
              <span className="text-[#8e9192]">SECTION 135 SUB-SECTION (5)</span>
            </div>
            <span className="text-[11px] text-[#8e9192]">
              Action is cryptographically recorded directly to corporate audit ledger and dispatches
              immediate discrepancy notices.
            </span>
          </div>

          {/* Action Button Group with Monospace Hotkeys */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Button 1: Rejection / Fraud Confirmation */}
            <button
              type="button"
              onClick={() => handleAction('FRAUD_REJECTED')}
              className="flex items-center gap-2 px-3 py-2 bg-[#0e0e0e] text-[#ffb4ab] font-code text-[11px] uppercase tracking-wider hover:bg-[#bb0112] hover:text-white border border-[#ffb4ab] transition-none cursor-pointer"
            >
              <span className="bg-[#bb0112] text-white px-1 py-0.5 font-bold">[KEY: A]</span>
              <span className="font-bold">[!] CONFIRM FRAUD &amp; REJECT (NOTIFY AUDITOR)</span>
            </button>

            {/* Button 2: Legitimate Signboard / Structural Duplicate */}
            <button
              type="button"
              onClick={() => handleAction('LEGITIMATE_DUPLICATE')}
              className="flex items-center gap-2 px-3 py-2 bg-[#1b1b1b] text-[#c4c7c8] font-code text-[11px] uppercase tracking-wider hover:bg-[#2a2a2a] hover:text-white border border-[#444748] transition-none cursor-pointer"
            >
              <span className="bg-[#2a2a2a] text-[#8e9192] px-1 py-0.5">[KEY: B]</span>
              <span>[=] MARK LEGITIMATE DUPLICATE (PERMANENT SIGNBOARD)</span>
            </button>

            {/* Button 3: Site Reassignment */}
            <button
              type="button"
              onClick={() => handleAction('REASSIGNED')}
              className="flex items-center gap-2 px-3 py-2 bg-white text-black font-code text-[11px] uppercase font-bold tracking-wider hover:bg-[#e2e2e2] transition-none cursor-pointer"
            >
              <span className="bg-[#1f1f1f] text-white px-1 py-0.5">[KEY: C]</span>
              <span>[-&gt;] REASSIGN TO ORIGINAL SITE &amp; REQUEST RE-CAPTURE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Forensic Telemetry Terminal Console */}
      <div className="w-full bg-[#1b1b1b] p-3 md:p-4">
        <div className="flex items-center justify-between pb-1 mb-2 bg-[#1f1f1f] px-2 py-1 font-code text-[10px]">
          <span className="uppercase tracking-wider text-[#8e9192]">
            EVIDENCE LOG RUNTIME: AUDIT TRAIL EXPANSION
          </span>
          <span className="text-white">SESSION_ID: #SES-90124-MCA</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-code text-[11px]">
          {/* Node 1 */}
          <div className="bg-[#0e0e0e] p-2 flex flex-col gap-0.5 border border-[#444748]">
            <span className="text-[#8e9192] uppercase text-[9px]">SUBMISSION ENCRYPTION</span>
            <span className="text-white font-medium">TLS 1.3 / ECDHE-RSA-AES256-GCM-SHA384</span>
            <span className="text-[#c4c7c8] text-[9px]">Node Barmer-West-Tower-04 (IP: 103.21.244.18)</span>
          </div>

          {/* Node 2 */}
          <div className="bg-[#0e0e0e] p-2 flex flex-col gap-0.5 border border-[#ffb4ab]">
            <span className="text-[#8e9192] uppercase text-[9px]">EXIF &amp; METADATA INTEGRITY</span>
            <span className="text-[#ffb4ab] font-bold">[!] SENSOR_FINGERPRINT_TAMPER_FLAG</span>
            <span className="text-[#c4c7c8] text-[9px]">Noise Variance: 0.00014 (Archive identical)</span>
          </div>

          {/* Node 3 */}
          <div className="bg-[#0e0e0e] p-2 flex flex-col gap-0.5 border border-[#ffb4ab]">
            <span className="text-[#8e9192] uppercase text-[9px]">
              NEXT SCHEDULED STATUTORY DISBURSEMENT
            </span>
            <span className="text-[#ffb4ab] font-bold">
              SUSPENDED / ESCALATED TO BOARD CSR COMM.
            </span>
            <span className="text-[#c4c7c8] text-[9px]">Section 135(5) Automatic Freeze Invoked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
