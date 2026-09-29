import React, { useState } from 'react';
import { ProjectSite, EvidenceAsset } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';

interface ProjectDetailViewProps {
  site: ProjectSite;
  allSites: ProjectSite[];
  assets: EvidenceAsset[];
  onSelectAsset: (asset: EvidenceAsset) => void;
  onNavigateToCapture: () => void;
  onBackToOverview: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  site,
  allSites,
  assets,
  onSelectAsset,
  onNavigateToCapture,
  onBackToOverview,
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('all');
  const [selectedAssetForDrawer, setSelectedAssetForDrawer] = useState<EvidenceAsset | null>(null);

  const siteAssets = assets.filter(
    (a) =>
      a.siteId === site.id ||
      a.siteName.toLowerCase().includes(site.name.toLowerCase().substring(0, 10))
  );

  const filteredAssets =
    selectedMilestoneId === 'all'
      ? siteAssets
      : siteAssets.filter((a) => a.milestoneId === selectedMilestoneId);

  const totalSanctioned = site.sanctionedAmount;
  const totalDisbursed = site.disbursedAmount;
  const disbursedPct = ((totalDisbursed / totalSanctioned) * 100).toFixed(1);

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Top Breadcrumb & Status Header */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-2 flex-wrap font-code text-[11px]">
          <button
            onClick={onBackToOverview}
            className="text-[#8e9192] hover:text-white uppercase font-bold"
          >
            [&lt;- ALL GRANTS &amp; SITES]
          </button>
          <span className="text-[#444748]">//</span>
          <span className="text-white font-bold uppercase">{site.name}</span>
          <span className="text-[#444748]">::</span>
          <span className="text-[#8e9192]">{site.code}</span>
          <span className="text-[#444748]">|</span>
          <span
            className={`px-1.5 py-0.5 font-bold uppercase ${
              site.status === 'flagged'
                ? 'bg-[#bb0112] text-white'
                : 'bg-white text-black'
            }`}
          >
            {site.status === 'flagged' ? '[FLAGGED]' : '[VERIFIED ACTIVE]'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToCapture}
            className="bg-white text-black px-2.5 py-1 font-code text-[11px] font-bold uppercase hover:bg-[#e2e2e2] transition-none"
          >
            + CAPTURE EVIDENCE
          </button>
        </div>
      </div>

      {/* Grant Summary Header Card */}
      <div className="w-full bg-[#1b1b1b] border-b border-[#444748] p-3 md:p-4 grid grid-cols-1 md:grid-cols-4 gap-3 font-code text-[11px]">
        <div>
          <span className="text-[#8e9192] block text-[10px] uppercase">IMPLEMENTING ENTITY</span>
          <span className="text-white font-bold">{site.implementingEntity}</span>
          <span className="text-[#8e9192] block text-[10px] mt-0.5">
            SCHEDULE VII: {site.scheduleVIIHead}
          </span>
        </div>

        <div>
          <span className="text-[#8e9192] block text-[10px] uppercase">SANCTION VS DISBURSEMENT</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-white font-bold font-metric text-sm">
              ₹{(site.disbursedAmount / 100000).toFixed(2)}L
            </span>
            <span className="text-[#8e9192] text-[10px]">
              / ₹{(site.sanctionedAmount / 100000).toFixed(2)}L ({disbursedPct}%)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#0e0e0e] h-1.5 mt-1 border border-[#353535]">
            <div className="bg-white h-full" style={{ width: `${disbursedPct}%` }} />
          </div>
        </div>

        <div>
          <span className="text-[#8e9192] block text-[10px] uppercase">GEOFENCE INTEGRITY</span>
          <span className="text-white font-metric font-bold">
            {site.coordinates.lat.toFixed(4)}°N, {site.coordinates.lng.toFixed(4)}°E
          </span>
          <span className="text-[#c4c7c8] block text-[10px] mt-0.5">
            CENTROID ACCURACY: +/- {site.coordinates.cep}m CEP (LOCKED)
          </span>
        </div>

        <div>
          <span className="text-[#8e9192] block text-[10px] uppercase">STATUTORY TRUST SCORE</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`font-metric text-xl font-bold ${
                site.trustScore < 50 ? 'text-[#ffb4ab]' : 'text-white'
              }`}
            >
              {site.trustScore}/100
            </span>
            <span className="text-[#8e9192] text-[10px]">
              {site.trustScore >= 85 ? '[AUDIT VALID]' : '[INSPECTION REQUIRED]'}
            </span>
          </div>
          <span className="text-[#8e9192] block text-[10px]">
            LAST NOTARIZED CAPTURE: {site.lastCaptureTime}
          </span>
        </div>
      </div>

      {/* Main Content Area: Milestones & Map Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 border-b border-[#444748]">
        {/* Left Side: Milestones & Horizontal Evidence Gallery (Col span 7) */}
        <div className="lg:col-span-7 bg-[#0e0e0e] p-3 md:p-4 border-b lg:border-b-0 lg:border-r border-[#444748] flex flex-col gap-4">
          {/* Milestone Progress Bar (Planned vs Evidenced) */}
          <div className="flex flex-col gap-2 bg-[#1b1b1b] p-3 border border-[#444748]">
            <div className="flex items-center justify-between font-code text-[11px]">
              <span className="text-white font-bold uppercase tracking-wider">
                // MILESTONE AUDIT PROGRESSION [PLANNED VS EVIDENCED]
              </span>
              <span className="text-[#8e9192]">SEC-135 REGULATION</span>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {site.milestones.map((ms) => (
                <div
                  key={ms.id}
                  onClick={() =>
                    setSelectedMilestoneId(selectedMilestoneId === ms.id ? 'all' : ms.id)
                  }
                  className={`p-2 border cursor-pointer font-code text-[11px] ${
                    selectedMilestoneId === ms.id
                      ? 'bg-[#2a2a2a] border-white text-white'
                      : 'bg-[#131313] border-[#353535] text-[#c4c7c8] hover:border-[#8e9192]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">
                      {ms.code}: {ms.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1 py-0.5 ${
                        ms.status === 'COMPLETED'
                          ? 'bg-white text-black'
                          : ms.status === 'FLAGGED'
                          ? 'bg-[#bb0112] text-white'
                          : 'bg-[#353535] text-white'
                      }`}
                    >
                      [{ms.status}]
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8e9192] mb-1">
                    <div>
                      PLANNED: <span className="text-white">{ms.plannedPct}%</span>
                    </div>
                    <div>
                      EVIDENCED: <span className="text-white">{ms.evidencedPct}%</span>
                    </div>
                  </div>

                  {/* Dual comparison bar */}
                  <div className="w-full bg-[#0e0e0e] h-2 flex overflow-hidden border border-[#353535]">
                    <div
                      className="bg-white h-full"
                      style={{ width: `${ms.evidencedPct}%` }}
                      title="Evidenced Progress"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal Timeline Evidence Gallery */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between font-code text-[11px]">
              <span className="text-white font-bold uppercase tracking-wider">
                // EVIDENCE VAULT STREAM [CHRONOLOGICAL TIMELINE]
              </span>
              <span className="text-[#8e9192]">
                SHOWING {filteredAssets.length} OF {siteAssets.length} ARTIFACTS
              </span>
            </div>

            {/* Horizontal Scroll Gallery */}
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
              {filteredAssets.length === 0 ? (
                <div className="w-full p-6 text-center font-code text-[11px] text-[#8e9192] border border-dashed border-[#444748]">
                  NO ASSETS DIRECTLY MATCHING THIS FILTER CRITERIA
                </div>
              ) : (
                filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setSelectedAssetForDrawer(asset);
                      onSelectAsset(asset);
                    }}
                    className="w-56 shrink-0 bg-[#1b1b1b] border border-[#444748] hover:border-white p-2 cursor-pointer transition-none flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-[#0e0e0e] overflow-hidden mb-2 border border-[#353535]">
                        <img
                          src={asset.imageUrl}
                          alt={asset.id}
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                        <div className="absolute top-1 left-1 bg-[#0e0e0e]/90 px-1 py-0.5 font-code text-[9px] text-white">
                          [{asset.id}]
                        </div>
                        <div className="absolute bottom-1 right-1 bg-white text-black px-1 font-code text-[9px] font-bold">
                          TRUST: {asset.trustScore}
                        </div>
                      </div>

                      <div className="font-code text-[11px] text-white font-bold truncate">
                        {asset.milestoneName}
                      </div>
                      <div className="font-code text-[10px] text-[#8e9192] truncate mt-0.5">
                        {asset.timestamp.split('T')[0]} :: {asset.opticalSensor.split(' ')[0]}
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-[#353535] flex items-center justify-between font-code text-[9px] text-[#8e9192]">
                      <span className="text-white font-bold">[INSPECT FORENSIC]</span>
                      <span>SHA-256</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Embedded Site Polygon Map with Clustered Pins (Col span 5) */}
        <div className="lg:col-span-5 bg-[#0e0e0e] p-3 md:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#444748] font-code text-[11px]">
              <span className="text-white font-bold uppercase tracking-wider">
                GEOFENCE BOUNDARY &amp; POLYGON MAP
              </span>
              <span className="text-[#8e9192]">4 VERTICES LOCKED</span>
            </div>

            {/* Embedded interactive map instance */}
            <InteractiveMap
              sites={allSites}
              selectedSiteId={site.id}
              showPolygons={true}
              heightClass="h-[380px]"
            />

            {/* Geofence Boundary Coordinates Matrix */}
            <div className="bg-[#1b1b1b] p-3 mt-3 border border-[#444748] font-code text-[11px]">
              <div className="text-white font-bold mb-1 uppercase text-[10px]">
                POLYGON VERTEX COORDINATE LEDGER
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8e9192]">
                {site.geofencePolygon.map(([lat, lng], idx) => (
                  <div key={idx} className="bg-[#0e0e0e] p-1.5 border border-[#353535]">
                    <span className="text-white font-bold">V-0{idx + 1}:</span> {lat.toFixed(5)}°N,{' '}
                    {lng.toFixed(5)}°E
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-[#353535] flex justify-between text-[10px] text-[#8e9192]">
                <span>ENCLOSED SURFACE AREA: 12,400 SQ. M</span>
                <span className="text-white font-bold">TOLERANCE: +/- 5.0M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Detail Quick Drawer / Flyout Modal */}
      {selectedAssetForDrawer && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#0e0e0e] border-l border-[#444748] z-50 p-4 shadow-2xl flex flex-col justify-between overflow-y-auto font-code">
          <div>
            <div className="flex items-center justify-between border-b border-[#444748] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs">
                  [QUICK ASSET INSPECT: {selectedAssetForDrawer.id}]
                </span>
              </div>
              <button
                onClick={() => setSelectedAssetForDrawer(null)}
                className="text-white hover:text-[#ffb4ab] text-sm px-1.5 border border-[#444748]"
              >
                [X]
              </button>
            </div>

            <div className="aspect-[4/3] bg-black mb-3 border border-[#444748] overflow-hidden">
              <img
                src={selectedAssetForDrawer.imageUrl}
                alt={selectedAssetForDrawer.id}
                className="w-full h-full object-cover grayscale contrast-125"
              />
            </div>

            <div className="flex flex-col gap-2 text-[11px] text-[#c4c7c8]">
              <div className="flex justify-between border-b border-[#353535] pb-1">
                <span className="text-[#8e9192]">SITE:</span>
                <span className="text-white font-bold">{selectedAssetForDrawer.siteName}</span>
              </div>
              <div className="flex justify-between border-b border-[#353535] pb-1">
                <span className="text-[#8e9192]">MILESTONE:</span>
                <span className="text-white">{selectedAssetForDrawer.milestoneName}</span>
              </div>
              <div className="flex justify-between border-b border-[#353535] pb-1">
                <span className="text-[#8e9192]">SHA-256 HASH:</span>
                <span className="text-white font-mono text-[9px] truncate max-w-[240px]">
                  {selectedAssetForDrawer.canonicalHash}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#353535] pb-1">
                <span className="text-[#8e9192]">COORDINATES:</span>
                <span className="text-white font-mono">
                  {selectedAssetForDrawer.coordinates.lat}° N, {selectedAssetForDrawer.coordinates.lng}° E
                </span>
              </div>
              <div className="flex justify-between border-b border-[#353535] pb-1">
                <span className="text-[#8e9192]">SENSOR:</span>
                <span className="text-white">{selectedAssetForDrawer.opticalSensor}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#444748] flex gap-2">
            <button
              onClick={() => {
                onSelectAsset(selectedAssetForDrawer);
                setSelectedAssetForDrawer(null);
              }}
              className="flex-1 bg-white text-black py-2 font-bold text-xs uppercase hover:bg-[#e2e2e2]"
            >
              [ OPEN FULL FORENSIC DOSSIER ]
            </button>
            <button
              onClick={() => setSelectedAssetForDrawer(null)}
              className="bg-[#1b1b1b] text-white px-3 py-2 text-xs uppercase border border-[#444748]"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
