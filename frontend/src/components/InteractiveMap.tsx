import React, { useState } from 'react';
import { ProjectSite } from '../types';

interface InteractiveMapProps {
  sites: ProjectSite[];
  selectedSiteId?: string;
  onSelectSite?: (site: ProjectSite) => void;
  showPolygons?: boolean;
  compact?: boolean;
  heightClass?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  showPolygons = true,
  compact = false,
  heightClass = 'h-[360px]',
}) => {
  const [mapMode, setMapMode] = useState<'satellite' | 'topo' | 'forensic'>('forensic');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredSite, setHoveredSite] = useState<ProjectSite | null>(null);

  // Focus on selected site if exists, or center on Barmer / Rajasthan coords
  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Simulated coordinate projection helper for SVG viewBox 0 0 1000 600
  // Lat range: 24.5 to 27.5, Lng range: 70.8 to 73.2
  const minLat = 24.5;
  const maxLat = 27.2;
  const minLng = 70.8;
  const maxLng = 73.2;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 880 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 480 + 60;
    return { x, y };
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#0e0e0e] border border-[#444748] overflow-hidden select-none`}>
      {/* Top Map HUD Controls */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-1">
          <span className="bg-[#0e0e0e]/95 border border-[#444748] px-2 py-0.5 font-code text-[11px] text-white uppercase font-bold">
            [GEO_SURFACE: RAJASTHAN_WEST_CORRIDOR]
          </span>
          <span className="hidden sm:inline bg-[#1b1b1b]/90 border border-[#444748] px-2 py-0.5 font-code text-[11px] text-[#8e9192]">
            EPSG:4326 (WGS84)
          </span>
        </div>

        {/* View Mode & Zoom Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMapMode('forensic')}
            className={`px-2 py-0.5 font-code text-[10px] uppercase font-bold border ${
              mapMode === 'forensic'
                ? 'bg-white text-black border-white'
                : 'bg-[#1b1b1b] text-[#8e9192] border-[#444748] hover:text-white'
            }`}
          >
            FORENSIC
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2 py-0.5 font-code text-[10px] uppercase font-bold border ${
              mapMode === 'satellite'
                ? 'bg-white text-black border-white'
                : 'bg-[#1b1b1b] text-[#8e9192] border-[#444748] hover:text-white'
            }`}
          >
            SATELLITE
          </button>
          <div className="flex items-center bg-[#1b1b1b] border border-[#444748] text-white px-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="px-1 text-xs hover:text-[#ffb4ab]"
              title="Zoom Out"
            >
              -
            </button>
            <span className="font-code text-[10px] px-1 text-[#8e9192]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="px-1 text-xs hover:text-[#ffb4ab]"
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full transition-transform duration-300"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: '50% 50%',
        }}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#2a2a2a"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
          </pattern>
          {/* Major Grid Pattern */}
          <pattern id="majorGrid" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#grid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#353535" strokeWidth="1.2" />
          </pattern>
        </defs>

        {/* Map Background */}
        <rect width="1000" height="600" fill={mapMode === 'satellite' ? '#14181b' : '#0e0e0e'} />
        <rect width="1000" height="600" fill="url(#majorGrid)" opacity={mapMode === 'satellite' ? 0.35 : 0.9} />

        {/* Stylized Western Rajasthan District Borders */}
        <g stroke="#353535" strokeWidth="1" fill="none" opacity="0.6">
          {/* Barmer District Outline */}
          <path d="M 200 180 L 460 160 L 520 340 L 410 490 L 190 420 Z" strokeDasharray="4,4" />
          <text x="320" y="320" fill="#444748" fontSize="12" fontFamily="JetBrains Mono" letterSpacing="3">
            BARMER DISTRICT JURISDICTION
          </text>

          {/* Jalore District Outline */}
          <path d="M 520 340 L 760 360 L 710 520 L 410 490 Z" strokeDasharray="4,4" />
          <text x="560" y="440" fill="#444748" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="2">
            JALORE
          </text>

          {/* Jaisalmer / Pokhran District Outline */}
          <path d="M 200 180 L 460 160 L 620 70 L 310 50 Z" strokeDasharray="4,4" />
          <text x="360" y="110" fill="#444748" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="2">
            JAISALMER / POKHRAN
          </text>
        </g>

        {/* Draw Geofence Polygons for Sites */}
        {showPolygons &&
          sites.map((site) => {
            if (!site.geofencePolygon || site.geofencePolygon.length < 3) return null;
            const pointsString = site.geofencePolygon
              .map(([lat, lng]) => {
                const pt = projectCoords(lat, lng);
                return `${pt.x},${pt.y}`;
              })
              .join(' ');

            const isFlagged = site.status === 'flagged';
            const isSelected = site.id === selectedSiteId;

            return (
              <g key={`poly-${site.id}`}>
                <polygon
                  points={pointsString}
                  fill={isFlagged ? 'rgba(187, 1, 18, 0.25)' : isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
                  stroke={isFlagged ? '#bb0112' : isSelected ? '#ffffff' : '#8e9192'}
                  strokeWidth={isSelected ? '2' : '1'}
                  strokeDasharray={isFlagged ? '4,2' : undefined}
                />
                {/* Geofence Perimeter Radius Circle */}
                {isSelected && (
                  <circle
                    cx={projectCoords(site.centroid.lat, site.centroid.lng).x}
                    cy={projectCoords(site.centroid.lat, site.centroid.lng).y}
                    r="45"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeDasharray="2,4"
                    opacity="0.7"
                  />
                )}
              </g>
            );
          })}

        {/* Draw Site Clustered Pins */}
        {sites.map((site) => {
          const pt = projectCoords(site.coordinates.lat, site.coordinates.lng);
          const isSelected = site.id === selectedSiteId;
          const isFlagged = site.status === 'flagged';
          const isPending = site.status === 'pending';

          const pinColor = isFlagged ? '#bb0112' : isPending ? '#ffdad6' : '#ffffff';

          return (
            <g
              key={`pin-${site.id}`}
              className="cursor-pointer group"
              onClick={() => onSelectSite && onSelectSite(site)}
              onMouseEnter={() => setHoveredSite(site)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              {/* Radar pulse for active/flagged */}
              {isFlagged ? (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="none"
                  stroke="#bb0112"
                  strokeWidth="1.5"
                  className="animate-ping"
                  opacity="0.8"
                />
              ) : isSelected ? (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="animate-pulse"
                />
              ) : null}

              {/* Pin Center Marker */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? '7' : '5'}
                fill={pinColor}
                stroke="#0e0e0e"
                strokeWidth="2"
              />

              {/* Pin Label Callout */}
              <g transform={`translate(${pt.x + 10}, ${pt.y - 10})`}>
                <rect
                  x="0"
                  y="-12"
                  width={site.name.length * 7 + 36}
                  height="20"
                  fill="#0e0e0e"
                  stroke={isFlagged ? '#bb0112' : isSelected ? '#ffffff' : '#444748'}
                  strokeWidth="1"
                />
                <text
                  x="6"
                  y="2"
                  fill={isFlagged ? '#ffb4ab' : '#ffffff'}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                >
                  {isFlagged ? '[!]' : '[*]'} {site.name.substring(0, 16)}..
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Inspector HUD for Hovered / Active Site */}
      {(hoveredSite || activeSite) && (
        <div className="absolute bottom-2 left-2 bg-[#0e0e0e]/95 border border-[#444748] p-2.5 max-w-sm pointer-events-none z-20 font-code text-[11px]">
          <div className="flex items-center justify-between border-b border-[#353535] pb-1 mb-1">
            <span className="text-white font-bold uppercase truncate max-w-[210px]">
              {(hoveredSite || activeSite).name}
            </span>
            <span
              className={`px-1 text-[10px] font-bold ${
                (hoveredSite || activeSite).status === 'flagged'
                  ? 'bg-[#bb0112] text-white'
                  : 'bg-[#1b1b1b] text-white border border-[#444748]'
              }`}
            >
              {(hoveredSite || activeSite).status === 'flagged' ? '[FLAGGED]' : '[VERIFIED]'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 text-[10px] text-[#8e9192]">
            <div>
              COORD:{' '}
              <span className="text-white font-mono">
                {(hoveredSite || activeSite).coordinates.lat.toFixed(4)}°N,{' '}
                {(hoveredSite || activeSite).coordinates.lng.toFixed(4)}°E
              </span>
            </div>
            <div>
              TRUST:{' '}
              <span
                className={`font-bold font-mono ${
                  (hoveredSite || activeSite).trustScore < 50 ? 'text-[#ffb4ab]' : 'text-white'
                }`}
              >
                {(hoveredSite || activeSite).trustScore}/100
              </span>
            </div>
            <div>
              COVERAGE:{' '}
              <span className="text-white font-mono">
                {(hoveredSite || activeSite).coveragePct}%
              </span>
            </div>
            <div>
              ACCURACY:{' '}
              <span className="text-white font-mono">
                +/- {(hoveredSite || activeSite).coordinates.cep}m CEP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right Coordinates Readout */}
      <div className="absolute bottom-2 right-2 bg-[#0e0e0e]/90 border border-[#444748] px-2 py-1 font-code text-[10px] text-[#8e9192] hidden sm:block">
        GEOFENCE MATRIX: 4 SITES ACTIVE :: RAJ-GRID-SEC135
      </div>
    </div>
  );
};
