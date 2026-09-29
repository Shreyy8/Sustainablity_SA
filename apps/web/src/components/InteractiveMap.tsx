"use client";

import React, { useState } from "react";

export interface MapSite {
  id: string;
  name: string;
  district: string;
  state?: string;
  trustScore?: number;
  status?: "verified" | "flagged" | "pending";
  centroid?: [number, number]; // [lat, lng]
  coordinates?: { lat: number; lng: number; cep?: number };
  geofence?: [number, number][];
}

interface InteractiveMapProps {
  sites: MapSite[];
  selectedSiteId?: string;
  onSelectSite?: (site: MapSite) => void;
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
  heightClass = "h-[380px]",
}) => {
  const [mapMode, setMapMode] = useState<"forensic" | "satellite">("forensic");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredSite, setHoveredSite] = useState<MapSite | null>(null);

  // Lat range for India Rajasthan/Gujarat/Maharashtra clusters
  const minLat = 18.0;
  const maxLat = 28.5;
  const minLng = 70.0;
  const maxLng = 78.5;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 860 + 70;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 460 + 70;
    return { x: Math.max(30, Math.min(970, x)), y: Math.max(30, Math.min(570, y)) };
  };

  const getSiteCoords = (site: MapSite) => {
    if (site.centroid) return { lat: site.centroid[0], lng: site.centroid[1] };
    if (site.coordinates) return { lat: site.coordinates.lat, lng: site.coordinates.lng };
    return { lat: 25.75, lng: 71.39 }; // Barmer default
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#0a0a0a] border border-[#333] overflow-hidden select-none`}>
      {/* HUD Header */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="bg-[#111]/90 border border-[#444] px-2 py-0.5 font-code text-[11px] text-white uppercase font-bold">
            [GEO_SURFACE: CSR_CORRIDOR_WEST]
          </span>
          <span className="hidden sm:inline bg-[#1b1b1b]/80 border border-[#333] px-2 py-0.5 font-code text-[10px] text-[#8e9192]">
            EPSG:4326 (WGS84)
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMapMode("forensic")}
            className={`px-2 py-0.5 font-code text-[10px] uppercase font-bold border transition-colors ${
              mapMode === "forensic"
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-[#1b1b1b] text-[#8e9192] border-[#444] hover:text-white"
            }`}
          >
            FORENSIC
          </button>
          <button
            onClick={() => setMapMode("satellite")}
            className={`px-2 py-0.5 font-code text-[10px] uppercase font-bold border transition-colors ${
              mapMode === "satellite"
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-[#1b1b1b] text-[#8e9192] border-[#444] hover:text-white"
            }`}
          >
            SATELLITE
          </button>
          <div className="flex items-center bg-[#1b1b1b] border border-[#444] text-white px-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="px-1.5 text-xs hover:text-emerald-400"
              title="Zoom Out"
            >
              -
            </button>
            <span className="font-code text-[10px] px-1 text-[#8e9192]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="px-1.5 text-xs hover:text-emerald-400"
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
        className="w-full h-full cursor-crosshair"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out",
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="satelliteGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f291e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Background Grid */}
        <rect width="1000" height="600" fill="#0a0a0a" />
        <rect width="1000" height="600" fill="url(#grid)" />
        {mapMode === "satellite" && (
          <rect width="1000" height="600" fill="url(#satelliteGlow)" />
        )}

        {/* State boundary schematic (Western India Corridor) */}
        <path
          d="M 120 80 Q 250 140 400 90 T 700 130 T 900 240 L 850 480 Q 600 520 400 450 T 150 400 Z"
          fill="none"
          stroke="#262626"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Geofence Polygons & Markers */}
        {sites.map((site) => {
          const coords = getSiteCoords(site);
          const pt = projectCoords(coords.lat, coords.lng);
          const isSelected = selectedSiteId === site.id;
          const isHovered = hoveredSite?.id === site.id;
          const isFlagged = site.status === "flagged";
          const isPending = site.status === "pending";

          return (
            <g
              key={site.id}
              onClick={() => onSelectSite && onSelectSite(site)}
              onMouseEnter={() => setHoveredSite(site)}
              onMouseLeave={() => setHoveredSite(null)}
              className="cursor-pointer group"
            >
              {/* Radar pulse around site */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 22 : 14}
                fill={isFlagged ? "#bb0112" : "#22c55e"}
                fillOpacity={isSelected ? 0.25 : 0.12}
                className={isSelected ? "animate-ping" : ""}
              />

              {/* Pin Ring */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 7 : 5}
                fill="#000"
                stroke={isFlagged ? "#ef4444" : isPending ? "#f59e0b" : "#22c55e"}
                strokeWidth={isSelected ? 3 : 2}
              />

              {/* Pin Center */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={2}
                fill={isFlagged ? "#ef4444" : "#22c55e"}
              />

              {/* Label */}
              <text
                x={pt.x + 9}
                y={pt.y + 4}
                fill={isSelected ? "#fff" : isHovered ? "#e2e2e2" : "#8e9192"}
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fontWeight={isSelected ? "bold" : "normal"}
              >
                {site.name} {site.trustScore ? `[${site.trustScore}%]` : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected/Hovered Site Tooltip Footer */}
      {(hoveredSite || selectedSiteId) && (
        <div className="absolute bottom-2 left-2 right-2 bg-[#0e0e0e]/95 border border-[#444] px-3 py-1.5 flex items-center justify-between font-code text-[11px] pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">SITE TARGET:</span>
            <span className="text-white font-semibold">
              {(hoveredSite || sites.find((s) => s.id === selectedSiteId))?.name}
            </span>
            <span className="text-[#888]">
              [{(hoveredSite || sites.find((s) => s.id === selectedSiteId))?.district}]
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#8e9192]">TRUST_SCORE:</span>
            <span className="text-emerald-400 font-bold">
              {(hoveredSite || sites.find((s) => s.id === selectedSiteId))?.trustScore ?? 96}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
