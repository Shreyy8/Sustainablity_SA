import React, { useState } from 'react';
import { EvidenceAsset } from '../types';

interface HybridSearchViewProps {
  assets: EvidenceAsset[];
  onSelectAsset: (asset: EvidenceAsset) => void;
}

export const HybridSearchView: React.FC<HybridSearchViewProps> = ({
  assets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('Barmer tin roof foundation verified >= 85');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('all');
  const [minTrustScore, setMinTrustScore] = useState<number>(0);
  const [selectedSensor, setSelectedSensor] = useState<string>('all');

  // Simulated NLP extraction from natural language query
  const parsedIntent = {
    detectedDistrict: query.toLowerCase().includes('barmer')
      ? 'Barmer'
      : query.toLowerCase().includes('jalore')
      ? 'Jalore'
      : null,
    detectedActivity: query.toLowerCase().includes('roof')
      ? 'Tin Roofing'
      : query.toLowerCase().includes('water')
      ? 'RO Water'
      : query.toLowerCase().includes('foundation')
      ? 'Foundation Excavation'
      : null,
    detectedMinScore: query.includes('85') ? 85 : 0,
    statusFilter: query.toLowerCase().includes('verified') ? 'VERIFIED' : null,
  };

  const filteredResults = assets.filter((asset) => {
    if (selectedDistrict !== 'all' && asset.district !== selectedDistrict) return false;
    if (selectedSchedule !== 'all' && !asset.scheduleVIIHead.includes(selectedSchedule)) return false;
    if (asset.trustScore < minTrustScore) return false;
    if (selectedSensor !== 'all' && !asset.opticalSensor.includes(selectedSensor)) return false;

    // Search query matching
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchText = `${asset.id} ${asset.siteName} ${asset.district} ${asset.milestoneName} ${asset.scheduleVIIHead}`.toLowerCase();
      // Simple multi-term scoring
      const terms = q.split(' ').filter((t) => t.length > 2);
      if (terms.length > 0 && !terms.some((term) => matchText.includes(term))) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Search Header Bar */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] p-3 md:p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between font-code text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-wider">
              [S4: HYBRID FORENSIC SEARCH UI]
            </span>
            <span className="text-[#8e9192] hidden sm:inline">
              // NATURAL LANGUAGE SEMANTIC &amp; ATTRIBUTE RETRIEVAL
            </span>
          </div>
          <span className="text-[#8e9192]">VECTOR_INDEX: MILVUS_V2 // 84,912 ASSETS</span>
        </div>

        {/* Unified Search Input */}
        <div className="flex items-center border border-white bg-[#1b1b1b] px-3 py-2">
          <span className="font-code text-white mr-2 text-sm font-bold">&gt;</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type natural language query e.g. 'Barmer tin roof foundation verified after Jan 2026'..."
            className="w-full bg-transparent font-code text-xs md:text-sm text-white placeholder-[#8e9192] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#8e9192] hover:text-white font-code text-xs px-2"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* NLP Query Parsing Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 font-code text-[10px]">
          <span className="text-[#8e9192] uppercase">ACTIVE PARSED CHIPS:</span>
          {parsedIntent.detectedDistrict && (
            <span className="bg-[#1f1f1f] text-white border border-[#444748] px-2 py-0.5">
              District: <strong className="text-white">{parsedIntent.detectedDistrict}</strong>
            </span>
          )}
          {parsedIntent.detectedActivity && (
            <span className="bg-[#1f1f1f] text-white border border-[#444748] px-2 py-0.5">
              Activity: <strong className="text-white">{parsedIntent.detectedActivity}</strong>
            </span>
          )}
          {parsedIntent.detectedMinScore > 0 && (
            <span className="bg-[#1f1f1f] text-white border border-[#444748] px-2 py-0.5">
              Score: <strong className="text-white">&gt;= {parsedIntent.detectedMinScore}</strong>
            </span>
          )}
          {parsedIntent.statusFilter && (
            <span className="bg-white text-black px-2 py-0.5 font-bold">
              STATUS: {parsedIntent.statusFilter}
            </span>
          )}
          <button
            onClick={() => setQuery('Jalore water RO plant 2026')}
            className="text-[#8e9192] hover:text-white underline cursor-pointer ml-auto"
          >
            TRY: "Jalore water RO plant 2026"
          </button>
        </div>
      </div>

      {/* Main Body: Faceted Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Faceted Filter Sidebar (Col span 3) */}
        <div className="lg:col-span-3 bg-[#0e0e0e] border-b lg:border-b-0 lg:border-r border-[#444748] p-3 md:p-4 flex flex-col gap-4 font-code text-[11px]">
          <div className="flex items-center justify-between border-b border-[#444748] pb-1">
            <span className="text-white font-bold uppercase tracking-wider">FACET FILTERS</span>
            <button
              onClick={() => {
                setSelectedDistrict('all');
                setSelectedSchedule('all');
                setMinTrustScore(0);
                setSelectedSensor('all');
              }}
              className="text-[#8e9192] hover:text-white text-[10px] uppercase"
            >
              RESET
            </button>
          </div>

          {/* Facet 1: District */}
          <div className="flex flex-col gap-1">
            <span className="text-[#8e9192] text-[10px] uppercase font-bold">DISTRICT JURISDICTION</span>
            {['all', 'Barmer', 'Jalore', 'Baytu', 'Sirohi'].map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`text-left px-2 py-1 flex items-center justify-between ${
                  selectedDistrict === dist
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#1b1b1b] text-[#c4c7c8] hover:text-white'
                }`}
              >
                <span className="uppercase">{dist === 'all' ? '[ ALL DISTRICTS ]' : dist}</span>
                <span className="text-[10px]">
                  {dist === 'all'
                    ? assets.length
                    : assets.filter((a) => a.district === dist).length}
                </span>
              </button>
            ))}
          </div>

          {/* Facet 2: Schedule VII Category */}
          <div className="flex flex-col gap-1">
            <span className="text-[#8e9192] text-[10px] uppercase font-bold">CSR SCHEDULE VII HEAD</span>
            {[
              { id: 'all', label: '[ ALL SCHEDULE HEADS ]' },
              { id: 'Education', label: 'Item (ii) - Education' },
              { id: 'Drinking Water', label: 'Item (i) - Potable Water' },
              { id: 'Healthcare', label: 'Item (i) - Healthcare' },
            ].map((head) => (
              <button
                key={head.id}
                onClick={() => setSelectedSchedule(head.id)}
                className={`text-left px-2 py-1 text-xs truncate ${
                  selectedSchedule === head.id
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#1b1b1b] text-[#c4c7c8] hover:text-white'
                }`}
              >
                {head.label}
              </button>
            ))}
          </div>

          {/* Facet 3: Trust Score Threshold Slider */}
          <div className="flex flex-col gap-1.5 bg-[#1b1b1b] p-2 border border-[#444748]">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#8e9192] uppercase font-bold">MIN STATUTORY TRUST</span>
              <span className="text-white font-bold font-metric">{minTrustScore}/100</span>
            </div>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={minTrustScore}
              onChange={(e) => setMinTrustScore(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#8e9192]">
              <span>0 (ALL)</span>
              <span>85 (AUDIT THRESHOLD)</span>
              <span>95+</span>
            </div>
          </div>

          {/* Facet 4: Camera Sensor Model */}
          <div className="flex flex-col gap-1">
            <span className="text-[#8e9192] text-[10px] uppercase font-bold">AUTHENTICATED SENSOR</span>
            {['all', 'Sony', 'Samsung', 'OmniVision'].map((sensor) => (
              <button
                key={sensor}
                onClick={() => setSelectedSensor(sensor)}
                className={`text-left px-2 py-1 ${
                  selectedSensor === sensor
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#1b1b1b] text-[#c4c7c8] hover:text-white'
                }`}
              >
                {sensor === 'all' ? '[ ALL OPTICAL SENSORS ]' : sensor}
              </button>
            ))}
          </div>
        </div>

        {/* Results Canvas (Col span 9) */}
        <div className="lg:col-span-9 bg-[#131313] p-3 md:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#444748] font-code text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold uppercase tracking-wider">
                  HYBRID MATCH RESULTS ({filteredResults.length})
                </span>
                <span className="text-[#8e9192]">RANKED BY STATUTORY CONFIDENCE &amp; RELEVANCE</span>
              </div>
              <span className="text-[#8e9192]">QUERY LATENCY: 24ms</span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredResults.map((asset) => {
                const isFlagged = asset.trustScore < 50;

                return (
                  <div
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className={`bg-[#0e0e0e] border p-3 cursor-pointer transition-none flex flex-col justify-between ${
                      isFlagged
                        ? 'border-[#ffb4ab] bg-[#bb0112]/10 hover:bg-[#bb0112]/20'
                        : 'border-[#444748] hover:border-white'
                    }`}
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div className="relative aspect-[4/3] bg-black overflow-hidden mb-2 border border-[#353535]">
                        <img
                          src={asset.imageUrl}
                          alt={asset.id}
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                        <div className="absolute top-1 left-1 bg-[#0e0e0e]/90 px-1.5 py-0.5 font-code text-[10px] text-white">
                          [{asset.id}]
                        </div>
                        <div
                          className={`absolute top-1 right-1 px-1.5 py-0.5 font-code text-[10px] font-bold ${
                            isFlagged ? 'bg-[#bb0112] text-white' : 'bg-white text-black'
                          }`}
                        >
                          {isFlagged ? '[FLAGGED]' : `TRUST: ${asset.trustScore}`}
                        </div>
                      </div>

                      {/* "Why matched" explainability badge */}
                      <div className="bg-[#1b1b1b] border border-[#353535] p-1.5 mb-2 font-code text-[10px]">
                        <span className="text-[#ffb4ab] font-bold">WHY MATCHED:</span>{' '}
                        <span className="text-[#c4c7c8]">
                          Semantic overlap on &ldquo;{asset.milestoneName}&rdquo; + Geofence GPS match in{' '}
                          {asset.district}.
                        </span>
                      </div>

                      <div className="font-code text-xs text-white font-bold truncate">
                        {asset.siteName}
                      </div>
                      <div className="font-code text-[10px] text-[#8e9192] mt-0.5">
                        {asset.milestoneName}
                      </div>
                      <div className="font-code text-[9px] text-[#8e9192] truncate mt-1">
                        HASH: {asset.canonicalHash.substring(0, 24)}...
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#353535] flex items-center justify-between font-code text-[10px]">
                      <span className="text-[#8e9192]">{asset.timestamp.split('T')[0]}</span>
                      <span className="text-white font-bold hover:underline">
                        [INSPECT FORENSIC -&gt;]
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
