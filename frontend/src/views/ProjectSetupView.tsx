import React, { useState } from 'react';
import { ProjectSite } from '../types';

interface ProjectSetupViewProps {
  sites: ProjectSite[];
  onAddSite: (newSite: ProjectSite) => void;
  onSelectSite?: (site: ProjectSite) => void;
}

export const ProjectSetupView: React.FC<ProjectSetupViewProps> = ({
  sites,
  onAddSite,
  onSelectSite,
}) => {
  const [siteName, setSiteName] = useState('');
  const [siteCode, setSiteCode] = useState('RAJ-BMR-EDU-025');
  const [district, setDistrict] = useState('Barmer');
  const [implementingEntity, setImplementingEntity] = useState('Pratham Rural Foundation');
  const [scheduleHead, setScheduleHead] = useState('Item (ii) - Education & Infrastructure');
  const [sanctionedAmount, setSanctionedAmount] = useState('3600000');
  const [lat, setLat] = useState('25.7532');
  const [lng, setLng] = useState('71.3964');
  const [points, setPoints] = useState<[number, number][]>([
    [25.7540, 71.3955],
    [25.7542, 71.3975],
    [25.7525, 71.3978],
    [25.7522, 71.3958],
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddVertex = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setPoints([...points, [latNum + (Math.random() - 0.5) * 0.002, lngNum + (Math.random() - 0.5) * 0.002]]);
    }
  };

  const handleClearPolygon = () => {
    setPoints([]);
  };

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      alert('Please enter a site name.');
      return;
    }

    const newProject: ProjectSite = {
      id: `CSR-TATA-2025-0${Math.floor(100 + Math.random() * 900)}`,
      code: siteCode,
      name: siteName,
      district,
      state: 'Rajasthan',
      sanctionedAmount: Number(sanctionedAmount) || 3000000,
      disbursedAmount: 0,
      coveragePct: 0,
      trustScore: 100,
      status: 'pending',
      lastCaptureTime: 'Just configured',
      implementingEntity,
      scheduleVIIHead: scheduleHead,
      coordinates: {
        lat: Number(lat) || 25.7532,
        lng: Number(lng) || 71.3964,
        cep: 3.5,
      },
      centroid: {
        lat: Number(lat) || 25.7532,
        lng: Number(lng) || 71.3964,
      },
      geofencePolygon: points.length >= 3 ? points : [
        [Number(lat) + 0.001, Number(lng) - 0.001],
        [Number(lat) + 0.001, Number(lng) + 0.001],
        [Number(lat) - 0.001, Number(lng) + 0.001],
        [Number(lat) - 0.001, Number(lng) - 0.001],
      ],
      milestones: [
        {
          id: 'MS-01',
          code: 'MS-01',
          name: 'Site Demarcation & Geofence Ingestion',
          plannedPct: 100,
          evidencedPct: 100,
          status: 'COMPLETED',
          assetCount: 1,
          avgTrust: 100,
          targetDate: '2026-04-01',
        },
        {
          id: 'MS-02',
          code: 'MS-02',
          name: 'Phase 1 Civil Superstructure',
          plannedPct: 100,
          evidencedPct: 0,
          status: 'PENDING',
          assetCount: 0,
          avgTrust: 0,
          targetDate: '2026-06-30',
        },
      ],
    };

    onAddSite(newProject);
    setFeedback(`[+] PROJECT SITE '${siteName.toUpperCase()}' COMMITTED TO SEC-135 REGISTRY`);
    setSiteName('');
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            siteCode,
            name: siteName || 'New Geofenced Site',
            district,
            regulatoryStandard: 'MCA-SEC-135-RULE-8',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [points.map(([plat, plng]) => [plng, plat])],
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GEOFENCE_${siteCode}_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] font-code">
      {/* Setup Subheader */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-white font-bold uppercase tracking-wider">
            [S10: PROJECT &amp; SITE SETUP WORKSTATION]
          </span>
          <span className="text-[#8e9192] hidden sm:inline">
            // GEOFENCE POLYGON DRAWING &amp; GRANT CRUD
          </span>
        </div>
        <span className="text-white font-bold text-[11px]">
          TOTAL SITES CONFIGURED: {sites.length}
        </span>
      </div>

      {/* Confirmation Banner */}
      {feedback && (
        <div className="bg-[#1b1b1b] border-b border-white px-4 py-2 text-white text-[11px] font-bold flex justify-between items-center animate-pulse">
          <span>{feedback}</span>
          <span className="text-[#8e9192] text-[10px]">LEDGER NOTARIZED</span>
        </div>
      )}

      {/* Main Grid: Form + Geofence Polygon Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 border-b border-[#444748]">
        {/* Left Form (Col span 6) */}
        <form
          onSubmit={handleSaveSite}
          className="lg:col-span-6 bg-[#0e0e0e] p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-[#444748] flex flex-col justify-between"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#444748] text-[11px]">
              <span className="text-white font-bold uppercase tracking-wider">
                GRANT &amp; SITE SPECIFICATION
              </span>
              <span className="text-[#8e9192]">MANDATORY STATUTORY FORM</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="text-[#8e9192] uppercase text-[10px]">
                  SITE IDENTIFIER / CODE:
                </label>
                <input
                  type="text"
                  value={siteCode}
                  onChange={(e) => setSiteCode(e.target.value)}
                  className="bg-[#1b1b1b] border border-[#444748] p-1.5 text-white focus:outline-none focus:border-white uppercase"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#8e9192] uppercase text-[10px]">DISTRICT / STATE:</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="bg-[#1b1b1b] border border-[#444748] p-1.5 text-white focus:outline-none"
                >
                  <option value="Barmer">Barmer, Rajasthan</option>
                  <option value="Jalore">Jalore, Rajasthan</option>
                  <option value="Baytu">Baytu, Rajasthan</option>
                  <option value="Sirohi">Sirohi, Rajasthan</option>
                  <option value="Pokhran">Pokhran, Rajasthan</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-[11px]">
              <label className="text-[#8e9192] uppercase text-[10px]">
                PROJECT TITLE / PUBLIC NAME:
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Model Girls Residential School Compound"
                className="bg-[#1b1b1b] border border-[#444748] p-1.5 text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="text-[#8e9192] uppercase text-[10px]">IMPLEMENTING NGO:</label>
                <input
                  type="text"
                  value={implementingEntity}
                  onChange={(e) => setImplementingEntity(e.target.value)}
                  className="bg-[#1b1b1b] border border-[#444748] p-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#8e9192] uppercase text-[10px]">
                  SANCTIONED BUDGET (INR):
                </label>
                <input
                  type="number"
                  value={sanctionedAmount}
                  onChange={(e) => setSanctionedAmount(e.target.value)}
                  className="bg-[#1b1b1b] border border-[#444748] p-1.5 text-white focus:outline-none font-metric"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-[11px]">
              <label className="text-[#8e9192] uppercase text-[10px]">
                COMPANIES ACT SCHEDULE VII ITEM:
              </label>
              <select
                value={scheduleHead}
                onChange={(e) => setScheduleHead(e.target.value)}
                className="bg-[#1b1b1b] border border-[#444748] p-1.5 text-white focus:outline-none"
              >
                <option value="Item (ii) - Education & Infrastructure">
                  Item (ii) - Education, Classrooms &amp; Special Education
                </option>
                <option value="Item (i) - Eradicating Hunger & Potable Water">
                  Item (i) - Safe Drinking Water &amp; Sanitation
                </option>
                <option value="Item (i) - Healthcare & Preventive Care">
                  Item (i) - Healthcare &amp; Medical Facilities
                </option>
                <option value="Item (iv) - Environmental Sustainability">
                  Item (iv) - Environmental Sustainability &amp; Renewable Energy
                </option>
              </select>
            </div>

            {/* GPS Centroid Inputs */}
            <div className="grid grid-cols-2 gap-3 text-[11px] bg-[#1b1b1b] p-2.5 border border-[#444748]">
              <div className="flex flex-col gap-1">
                <label className="text-[#8e9192] text-[10px]">CENTROID LATITUDE (°N):</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="bg-[#0e0e0e] border border-[#444748] p-1 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[#8e9192] text-[10px]">CENTROID LONGITUDE (°E):</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="bg-[#0e0e0e] border border-[#444748] p-1 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#444748] flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-white text-black py-2.5 font-bold uppercase hover:bg-[#e2e2e2] transition-none cursor-pointer text-xs"
            >
              [ + COMMITT &amp; NOTARIZE SITE ]
            </button>
            <button
              type="button"
              onClick={handleExportGeoJSON}
              className="bg-[#1b1b1b] text-white px-3 py-2 text-xs uppercase border border-[#444748] hover:border-white"
            >
              [ EXPORT GEOJSON ]
            </button>
          </div>
        </form>

        {/* Right Polygon Geofence Canvas (Col span 6) */}
        <div className="lg:col-span-6 bg-[#131313] p-4 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-[#444748] text-[11px]">
              <span className="text-white font-bold uppercase tracking-wider">
                INTERACTIVE GEOFENCE POLYGON DRAWING
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddVertex}
                  className="text-white hover:underline text-[10px] uppercase font-bold"
                >
                  [ + ADD VERTEX ]
                </button>
                <button
                  type="button"
                  onClick={handleClearPolygon}
                  className="text-[#ffb4ab] hover:underline text-[10px] uppercase"
                >
                  [ CLEAR ]
                </button>
              </div>
            </div>

            {/* Polygon Map Simulation Canvas */}
            <div className="relative w-full aspect-[4/3] bg-[#0e0e0e] border border-[#444748] overflow-hidden">
              <svg viewBox="0 0 500 375" className="w-full h-full">
                {/* Grid Lines */}
                <defs>
                  <pattern id="setupGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path
                      d="M 25 0 L 0 0 0 25"
                      fill="none"
                      stroke="#222"
                      strokeWidth="0.8"
                    />
                  </pattern>
                </defs>
                <rect width="500" height="375" fill="#0e0e0e" />
                <rect width="500" height="375" fill="url(#setupGrid)" />

                {/* Satellite Radar Concentric Circles */}
                <circle cx="250" cy="187" r="100" fill="none" stroke="#333" strokeDasharray="2,2" />
                <circle cx="250" cy="187" r="50" fill="none" stroke="#444" strokeDasharray="2,2" />

                {/* Draw polygon points */}
                {points.length >= 3 && (
                  <polygon
                    points={points
                      .map((_, i) => {
                        const angle = (i / points.length) * Math.PI * 2;
                        const px = 250 + Math.cos(angle) * (80 + (i % 2) * 20);
                        const py = 187 + Math.sin(angle) * (65 + (i % 2) * 15);
                        return `${px},${py}`;
                      })
                      .join(' ')}
                    fill="rgba(255, 255, 255, 0.12)"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                {/* Draw Points Vertices */}
                {points.map((_, i) => {
                  const angle = (i / points.length) * Math.PI * 2;
                  const px = 250 + Math.cos(angle) * (80 + (i % 2) * 20);
                  const py = 187 + Math.sin(angle) * (65 + (i % 2) * 15);
                  return (
                    <g key={i}>
                      <circle cx={px} cy={py} r="4" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                      <text x={px + 6} y={py - 6} fill="#8e9192" fontSize="9" fontFamily="JetBrains Mono">
                        V{i + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Centroid Pin */}
                <circle cx="250" cy="187" r="5" fill="#bb0112" stroke="#fff" strokeWidth="1" />
                <text x="260" y="191" fill="#fff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  CENTROID (LOCKED)
                </text>
              </svg>

              <div className="absolute bottom-2 left-2 bg-[#0e0e0e]/90 border border-[#444748] px-2 py-1 text-[10px] text-white">
                ENCLOSED VERTICES: {points.length} :: TOLERANCE: +/- 3.5m CEP
              </div>
            </div>

            {/* Current Points List */}
            <div className="mt-3 bg-[#0e0e0e] p-2 border border-[#444748] flex flex-col gap-1 text-[10px]">
              <span className="text-[#8e9192] uppercase font-bold">VERTICES MATRIX:</span>
              <div className="grid grid-cols-2 gap-2 text-[#c4c7c8]">
                {points.map(([plat, plng], idx) => (
                  <div key={idx} className="bg-[#1b1b1b] p-1 border border-[#353535]">
                    V0{idx + 1}: {plat.toFixed(5)}°N, {plng.toFixed(5)}°E
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#444748] text-[#8e9192] text-[10px]">
            TERRA-DRAW PROTOCOL // MCA SECTION 135(5) AUDIT READY
          </div>
        </div>
      </div>
    </div>
  );
};
