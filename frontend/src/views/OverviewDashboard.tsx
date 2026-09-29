import React, { useState } from 'react';
import { ProjectSite } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';

interface OverviewDashboardProps {
  sites: ProjectSite[];
  onSelectSite: (site: ProjectSite) => void;
  onNavigateToTriage: () => void;
  onNavigateToCapture: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  sites,
  onSelectSite,
  onNavigateToTriage,
  onNavigateToCapture,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'verified' | 'flagged' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewStyle, setViewStyle] = useState<'table' | 'map'>('table');
  const [frozenSites, setFrozenSites] = useState<string[]>([]);
  const [freezeNotice, setFreezeNotice] = useState<string | null>(null);

  const filteredSites = sites.filter((site) => {
    if (filterMode === 'verified' && site.status !== 'verified') return false;
    if (filterMode === 'flagged' && site.status !== 'flagged') return false;
    if (filterMode === 'pending' && site.status !== 'pending') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        site.name.toLowerCase().includes(q) ||
        site.id.toLowerCase().includes(q) ||
        site.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFreezeDisbursement = (siteName: string) => {
    setFrozenSites((prev) => [...prev, siteName]);
    setFreezeNotice(`[!] DISBURSEMENT FROZEN FOR ${siteName.toUpperCase()} UNDER SECTION 135(5)`);
    setTimeout(() => {
      setFreezeNotice(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Top Console Ledger Status */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-1.5 flex flex-wrap items-center justify-between font-code text-[11px] gap-y-1">
        <div className="flex items-center gap-2 text-[#8e9192] flex-wrap">
          <span className="text-white font-bold">PORTAL::COMMAND_CENTER</span>
          <span>//</span>
          <span>SEC_135_COMPLIANCE_ENGINE</span>
          <span>//</span>
          <span className="text-[#e2e2e2]">SESSION: ROOT_AUDITOR_09</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8e9192]">SYSTEM_PULSE:</span>
          <span className="text-white font-metric">0.042ms LATENCY</span>
          <span className="text-[#444748]">|</span>
          <span className="text-white font-metric">UTC 05:54:12 [ACTIVE]</span>
        </div>
      </div>

      {/* Freeze Action Toast Notice */}
      {freezeNotice && (
        <div className="w-full bg-[#bb0112] text-white px-4 py-2 font-code text-[11px] font-bold flex items-center justify-between animate-pulse">
          <span>{freezeNotice}</span>
          <button
            onClick={() => setFreezeNotice(null)}
            className="text-white hover:text-black uppercase text-[10px] underline ml-2"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* KPI Metrics Bar (4 Panels with 1px border) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#0e0e0e] border-b border-[#444748]">
        {/* KPI 1 */}
        <div className="p-3 md:p-4 border-b sm:border-b-0 sm:border-r border-[#444748] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e9192] font-code text-[11px]">
            <span>01 // TOTAL COMMITMENT</span>
            <span>[INR_LGD]</span>
          </div>
          <div className="my-2">
            <span className="font-metric text-xl md:text-2xl text-white font-bold tracking-tight">
              ₹24,800,000
            </span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#c4c7c8]">
            <span>ALLOCATION MATRIX</span>
            <span className="text-white font-bold">100% ALLOCATED</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-3 md:p-4 border-b sm:border-b-0 lg:border-r border-[#444748] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e9192] font-code text-[11px]">
            <span>02 // EVIDENCED MILESTONES</span>
            <span>[STAT_Q4]</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-metric text-xl md:text-2xl text-white font-bold tracking-tight">
              78%
            </span>
            <span className="font-metric text-[12px] text-[#8e9192] font-medium">[28/36]</span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#c4c7c8]">
            <span>PIPELINE VERIFICATION</span>
            <span className="text-white font-bold">8 IN PROGRESS</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-3 md:p-4 border-b lg:border-b-0 sm:border-r border-[#444748] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e9192] font-code text-[11px]">
            <span>03 // AVERAGE TRUST SCORE</span>
            <span>[CERTAINTY]</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-metric text-xl md:text-2xl text-white font-bold tracking-tight">
              94/100
            </span>
            <span className="font-code text-[11px] text-white font-bold">[*] VERIFIED</span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#c4c7c8]">
            <span>STATUTORY CONFIDENCE</span>
            <span className="text-white font-bold">HIGH COMPLIANCE</span>
          </div>
        </div>

        {/* KPI 4 (Alert Variant) */}
        <div
          onClick={onNavigateToTriage}
          className="p-3 md:p-4 bg-[#bb0112]/20 border-b lg:border-b-0 border-[#ffb4ab] flex flex-col justify-between cursor-pointer hover:bg-[#bb0112]/30 transition-none"
        >
          <div className="flex items-center justify-between text-[#ffb4ab] font-code text-[11px]">
            <span className="font-bold">[!] 04 // SUSPECT &amp; FLAGGED</span>
            <span>§135(5)</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-metric text-xl md:text-2xl text-[#ffb4ab] tracking-tight font-bold">
              02
            </span>
            <span className="font-code text-[11px] text-[#ffb4ab] uppercase font-bold">
              [ACTION REQUIRED]
            </span>
          </div>
          <div className="flex items-center justify-between font-code text-[11px] text-[#ffb4ab]">
            <span>FORENSIC EXCEPTION</span>
            <span className="underline decoration-[#ffb4ab] underline-offset-2 font-bold">
              INSPECT DOSSIER -&gt;
            </span>
          </div>
        </div>
      </div>

      {/* Main Viewport Split Workstation: 65% / 35% */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Left Panel: Site Coverage & Latency Matrix (Col span 8) */}
        <div className="lg:col-span-8 bg-[#0e0e0e] border-b lg:border-b-0 lg:border-r border-[#444748] flex flex-col">
          {/* Panel Title & Meta Bar */}
          <div className="p-3 md:p-4 border-b border-[#444748] bg-[#1b1b1b] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-code text-[11px] text-white font-bold uppercase tracking-wider">
                SITE COVERAGE &amp; LATENCY MATRIX
              </span>
              <span className="font-code text-[11px] text-[#8e9192]">
                [SEC-135 VERIFIED LEDGER]
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewStyle(viewStyle === 'table' ? 'map' : 'table')}
                className="bg-[#2a2a2a] text-white hover:border-white border border-[#444748] px-2 py-0.5 font-code text-[10px] uppercase font-bold"
              >
                {viewStyle === 'table' ? '[ VIEW MAP & GEOFENCES ]' : '[ VIEW DENSE TABLE ]'}
              </button>
              <div className="font-code text-[11px] text-[#8e9192] hidden sm:inline">
                HASH_CHAIN: 0x88f2a...c01e :: SYNCED
              </div>
            </div>
          </div>

          {/* Filter Controls Bar */}
          <div className="px-3 md:px-4 py-2 border-b border-[#444748] bg-[#0e0e0e] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1 font-code text-[11px]">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2 py-1 uppercase tracking-tight font-bold ${
                  filterMode === 'all'
                    ? 'bg-white text-black'
                    : 'bg-[#1b1b1b] border border-[#444748] text-[#e2e2e2] hover:border-white'
                }`}
              >
                [ ALL SITES ({sites.length}) ]
              </button>
              <button
                onClick={() => setFilterMode('verified')}
                className={`px-2 py-1 uppercase tracking-tight font-bold ${
                  filterMode === 'verified'
                    ? 'bg-white text-black'
                    : 'bg-[#1b1b1b] border border-[#444748] text-[#e2e2e2] hover:border-white'
                }`}
              >
                [ VERIFIED ({sites.filter((s) => s.status === 'verified').length}) ]
              </button>
              <button
                onClick={() => setFilterMode('flagged')}
                className={`px-2 py-1 uppercase tracking-tight font-bold ${
                  filterMode === 'flagged'
                    ? 'bg-[#bb0112] text-white border border-[#ffb4ab]'
                    : 'bg-[#1b1b1b] border border-[#ffb4ab] text-[#ffb4ab] hover:bg-[#bb0112]/20'
                }`}
              >
                [ FLAGGED (02) ]
              </button>
              <button
                onClick={() => setFilterMode('pending')}
                className={`px-2 py-1 uppercase tracking-tight font-bold ${
                  filterMode === 'pending'
                    ? 'bg-white text-black'
                    : 'bg-[#1b1b1b] border border-[#444748] text-[#8e9192] hover:border-white'
                }`}
              >
                [ PENDING (01) ]
              </button>
            </div>

            {/* Instant Search Monospace Input */}
            <div className="flex items-center border border-[#444748] bg-[#1b1b1b] px-2 py-1 w-full sm:w-auto">
              <span className="font-code text-[11px] text-[#8e9192] mr-1">&gt;</span>
              <input
                type="text"
                placeholder="FILTER DISTRICT OR CSR ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent font-code text-[11px] text-white placeholder-[#8e9192] focus:outline-none w-full sm:w-52 uppercase"
              />
            </div>
          </div>

          {/* Map View Toggle */}
          {viewStyle === 'map' ? (
            <div className="p-3 flex-1 flex flex-col">
              <InteractiveMap sites={filteredSites} onSelectSite={onSelectSite} heightClass="h-[460px]" />
            </div>
          ) : (
            /* Dense Tabular Data View (1px boundaries, zero radii) */
            <div className="w-full overflow-x-auto flex-1">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#1b1b1b] border-b border-[#444748] font-code text-[11px] text-[#8e9192] uppercase tracking-wider">
                    <th className="p-2.5 border-r border-[#444748] font-medium">UID // PROJECT NAME</th>
                    <th className="p-2.5 border-r border-[#444748] font-medium">DISTRICT</th>
                    <th className="p-2.5 border-r border-[#444748] font-medium">LAST CAPTURE</th>
                    <th className="p-2.5 border-r border-[#444748] font-medium text-right">COVERAGE</th>
                    <th className="p-2.5 font-medium">TRUST STATUS</th>
                  </tr>
                </thead>
                <tbody className="font-metric text-[12px] divide-y divide-[#444748]">
                  {filteredSites.map((site) => {
                    const isFlagged = site.status === 'flagged';
                    const isPending = site.status === 'pending';

                    return (
                      <tr
                        key={site.id}
                        onClick={() => onSelectSite(site)}
                        className={`transition-none cursor-pointer ${
                          isFlagged
                            ? 'bg-[#bb0112]/20 border-y border-[#ffb4ab] hover:bg-[#bb0112]/30'
                            : 'hover:bg-[#1f1f1f]'
                        }`}
                      >
                        <td
                          className={`p-2.5 border-r ${
                            isFlagged ? 'border-[#ffb4ab] text-[#ffb4ab]' : 'border-[#444748] text-white'
                          }`}
                        >
                          <div className="font-bold text-[13px] flex items-center gap-1.5">
                            {isFlagged && <span className="font-bold">[!]</span>}
                            <span>{site.name}</span>
                          </div>
                          <div
                            className={`font-code text-[11px] ${
                              isFlagged ? 'text-[#ffb4ab]/80' : 'text-[#8e9192]'
                            }`}
                          >
                            {site.id}
                          </div>
                        </td>
                        <td
                          className={`p-2.5 border-r font-code text-[11px] ${
                            isFlagged
                              ? 'border-[#ffb4ab] text-[#ffb4ab]'
                              : 'border-[#444748] text-[#e2e2e2]'
                          }`}
                        >
                          {site.district}, {site.state === 'Rajasthan' ? 'RJ' : site.state}
                        </td>
                        <td
                          className={`p-2.5 border-r font-code text-[11px] ${
                            isFlagged
                              ? 'border-[#ffb4ab] text-[#ffb4ab]'
                              : 'border-[#444748] text-[#e2e2e2]'
                          }`}
                        >
                          {site.lastCaptureTime}
                        </td>
                        <td
                          className={`p-2.5 border-r text-right font-metric ${
                            isFlagged
                              ? 'border-[#ffb4ab] text-[#ffb4ab] font-bold'
                              : 'border-[#444748] text-white'
                          }`}
                        >
                          {site.coveragePct.toFixed(1)}%
                        </td>
                        <td className={`p-2.5 ${isFlagged ? 'bg-[#bb0112]/30' : ''}`}>
                          <div className="flex items-center justify-between">
                            {isFlagged ? (
                              <span className="font-code text-[11px] text-[#ffb4ab] font-bold tracking-wider">
                                [FLAGGED: RECYCLED PHOTO]
                              </span>
                            ) : isPending ? (
                              <span className="font-code text-[11px] text-[#ffb4ab] font-medium">
                                [REVIEW: GEOFENCE DRIFT]
                              </span>
                            ) : (
                              <span className="font-code text-[11px] text-white font-bold">
                                [*] VERIFIED
                              </span>
                            )}
                            <span
                              className={`font-code text-[11px] ${
                                isFlagged ? 'text-[#ffb4ab] font-bold' : 'text-[#c4c7c8]'
                              }`}
                            >
                              TRUST: {site.trustScore}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer Audit Bar */}
          <div className="p-2.5 border-t border-[#444748] bg-[#1b1b1b] flex items-center justify-between font-code text-[11px] text-[#8e9192]">
            <div>DISPLAYING {filteredSites.length} OF {sites.length} LEDGER SITES</div>
            <div className="flex items-center gap-3">
              <span className="cursor-pointer text-white hover:underline">&lt;&lt; PREV</span>
              <span className="text-[#e2e2e2]">PAGE 01 / 08</span>
              <span className="cursor-pointer text-white hover:underline">NEXT &gt;&gt;</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Realtime Field Feed (Col span 4) */}
        <div className="lg:col-span-4 bg-[#0e0e0e] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-[#444748] bg-[#1b1b1b] flex items-center justify-between">
              <div className="flex items-center gap-1 font-code text-[11px]">
                <span className="text-white font-bold uppercase tracking-wider">
                  REALTIME FIELD FEED
                </span>
                <span className="text-[#8e9192]">:: [INGEST_V4]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateToCapture}
                  className="bg-white text-black px-2 py-0.5 font-code text-[10px] font-bold uppercase hover:bg-[#e2e2e2]"
                >
                  + CAPTURE
                </button>
                <span className="font-code text-[11px] text-white animate-pulse font-bold">
                  [ LIVE ]
                </span>
              </div>
            </div>

            {/* Ingestion Feed Logs */}
            <div className="divide-y divide-[#444748] overflow-y-auto max-h-[520px]">
              {/* Event Item 1 */}
              <div className="p-3 md:p-4 hover:bg-[#1f1f1f] transition-none flex flex-col gap-1">
                <div className="flex items-center justify-between font-code text-[11px]">
                  <span className="text-white font-metric font-bold">11:24:02 IST</span>
                  <span className="text-white font-bold">TRUST: 98</span>
                </div>
                <div className="text-[13px] text-white font-bold uppercase">
                  Chohtan Site 01 (Classroom Roof)
                </div>
                <div className="font-code text-[11px] text-[#8e9192] font-metric">
                  LOC: 25.7532° N, 71.3964° E
                </div>
                <div className="font-code text-[11px] text-[#8e9192] font-metric">
                  SENSOR: SONY_IMX766 // EXIF_SIG: SHA-256_MATCH
                </div>
                <div className="mt-1">
                  <span className="font-code text-[10px] border border-[#444748] bg-[#1f1f1f] px-1 py-0.5 text-white">
                    [*] PASSED GEOFENCE: 4M ACCURACY
                  </span>
                </div>
              </div>

              {/* Event Item 2 (Flagged Anomaly) */}
              <div className="p-3 md:p-4 bg-[#bb0112]/20 border-l-2 border-[#ffb4ab] flex flex-col gap-1">
                <div className="flex items-center justify-between font-code text-[11px]">
                  <span className="text-[#ffb4ab] font-metric font-bold">11:18:45 IST</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#ffb4ab] font-bold">TRUST: 41</span>
                    <span className="border border-[#ffb4ab] text-[#ffb4ab] px-1 font-code text-[10px] font-bold">
                      [FLAGGED]
                    </span>
                  </div>
                </div>
                <div className="text-[13px] text-[#ffb4ab] font-bold uppercase">
                  Baytu PHC Wing (Tele-Clinic)
                </div>
                <div className="font-code text-[11px] text-[#ffb4ab] font-metric">
                  LOC: 25.8821° N, 71.7701° E
                </div>
                <div className="font-code text-[11px] text-[#ffb4ab] font-metric">
                  SENSOR: VIRTUAL_CAM // EXIF_SIG: ZERO_HASH_MISMATCH
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-code text-[10px] border border-[#ffb4ab] bg-[#0e0e0e] px-1 py-0.5 text-[#ffb4ab] font-bold">
                    [!] OUT OF BOUNDS: +1.2KM
                  </span>
                  {frozenSites.includes('Baytu PHC Wing') ? (
                    <span className="font-code text-[10px] bg-[#bb0112] text-white px-1.5 py-0.5 font-bold">
                      [X] DISBURSEMENT FROZEN
                    </span>
                  ) : (
                    <button
                      onClick={() => handleFreezeDisbursement('Baytu PHC Wing')}
                      className="font-code text-[10px] text-[#ffb4ab] underline hover:text-white cursor-pointer uppercase font-bold"
                    >
                      -&gt; FREEZE GRANT DISBURSEMENT
                    </button>
                  )}
                </div>
              </div>

              {/* Event Item 3 */}
              <div className="p-3 md:p-4 hover:bg-[#1f1f1f] transition-none flex flex-col gap-1">
                <div className="flex items-center justify-between font-code text-[11px]">
                  <span className="text-white font-metric font-bold">10:55:10 IST</span>
                  <span className="text-white font-bold">TRUST: 95</span>
                </div>
                <div className="text-[13px] text-white font-bold uppercase">
                  Sindhari Water Plant
                </div>
                <div className="font-code text-[11px] text-[#8e9192] font-metric">
                  LOC: 25.5601° N, 71.4920° E
                </div>
                <div className="font-code text-[11px] text-[#8e9192] font-metric">
                  SENSOR: OMNIVISION_64B // MCA_CA_KEY: SIGNED_VALID
                </div>
                <div className="mt-1">
                  <span className="font-code text-[10px] border border-[#444748] bg-[#1f1f1f] px-1 py-0.5 text-white">
                    [*] PASSED GEOFENCE: 6M ACCURACY
                  </span>
                </div>
              </div>

              {/* Event Item 4 */}
              <div className="p-3 md:p-4 hover:bg-[#1f1f1f] transition-none flex flex-col gap-1">
                <div className="flex items-center justify-between font-code text-[11px]">
                  <span className="text-white font-metric font-bold">10:32:00 IST</span>
                  <span className="text-white font-bold">TRUST: 92</span>
                </div>
                <div className="text-[13px] text-white font-bold uppercase">
                  Gudamalani School
                </div>
                <div className="font-code text-[11px] text-[#8e9192] font-metric">
                  LOC: 25.2104° N, 71.7100° E
                </div>
                <div className="font-code text-[11px] text-[#8e9192] font-metric">
                  SENSOR: QUALCOMM_SPECTRA // HARDWARE_TEE_VERIFIED
                </div>
                <div className="mt-1">
                  <span className="font-code text-[10px] border border-[#444748] bg-[#1f1f1f] px-1 py-0.5 text-white">
                    [*] HASH INTEGRITY PASSED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Sink Bottom Status Bar */}
          <div className="p-3 md:p-4 border-t border-[#444748] bg-[#1b1b1b] font-code text-[11px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#8e9192]">INGEST_NODE:</span>
              <span className="text-[#e2e2e2]">IN-BLR-02 (TLS 1.3)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8e9192]">AUTO_ARCHIVE:</span>
              <span className="text-white font-bold">IPFS_EVIDENCE_STORE // OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
