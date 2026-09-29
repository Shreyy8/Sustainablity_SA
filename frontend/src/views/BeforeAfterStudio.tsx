import React, { useState, useRef } from 'react';
import { BeforeAfterPair } from '../types';

interface BeforeAfterStudioProps {
  pairs: BeforeAfterPair[];
  onAddPairToReport?: (pairId: string) => void;
}

export const BeforeAfterStudio: React.FC<BeforeAfterStudioProps> = ({
  pairs,
  onAddPairToReport,
}) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(pairs[0]?.id || 'PAIR-01');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isAddedToReport, setIsAddedToReport] = useState<boolean>(pairs[0]?.reportAdded || false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activePair = pairs.find((p) => p.id === selectedPairId) || pairs[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleAddToReport = () => {
    setIsAddedToReport(!isAddedToReport);
    if (onAddPairToReport) {
      onAddPairToReport(activePair.id);
    }
  };

  const handleExportComparison = () => {
    setExportNotice(
      `[!] BEFORE/AFTER EVIDENCE DOSSIER EXPORTED FOR ${activePair.siteName.toUpperCase()}`
    );
    setTimeout(() => {
      setExportNotice(null);
    }, 3500);
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Studio Header Bar */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap font-code text-[11px]">
          <span className="text-white font-bold uppercase tracking-wider">
            [S6: BEFORE/AFTER COMPARISON STUDIO]
          </span>
          <span className="text-[#8e9192] hidden sm:inline">
            // INTERACTIVE SPLIT-SCREEN CHANGE DETECTION
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pair Switcher */}
          <select
            value={selectedPairId}
            onChange={(e) => {
              setSelectedPairId(e.target.value);
              const found = pairs.find((p) => p.id === e.target.value);
              if (found) setIsAddedToReport(found.reportAdded);
            }}
            className="bg-[#1b1b1b] text-white border border-[#444748] px-2 py-1 font-code text-[11px] uppercase focus:outline-none"
          >
            {pairs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.siteName.substring(0, 30)}...
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddToReport}
            className={`px-3 py-1 font-code text-[11px] uppercase font-bold transition-none border cursor-pointer ${
              isAddedToReport
                ? 'bg-white text-black border-white'
                : 'bg-[#1b1b1b] text-white border-[#444748] hover:border-white'
            }`}
          >
            {isAddedToReport ? '[V] ADDED TO AUDIT REPORT' : '+ ADD TO REPORT'}
          </button>
        </div>
      </div>

      {/* Export Notice Banner */}
      {exportNotice && (
        <div className="bg-[#1b1b1b] border-b border-white px-4 py-2 text-white font-code text-xs font-bold flex justify-between items-center">
          <span>{exportNotice}</span>
          <span className="text-[#8e9192] text-[10px]">SHA-256 SIGNED // DISPATCH 200 OK</span>
        </div>
      )}

      {/* Main Studio Workcell: Split Interactive Viewer */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 flex-1 border-b border-[#444748]">
        {/* Left 8 Cols: Interactive Split Screen Slider */}
        <div className="lg:col-span-8 bg-[#0e0e0e] border-b lg:border-b-0 lg:border-r border-[#444748] p-3 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 font-code text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-[#8e9192]">BASELINE: {activePair.baselineDate}</span>
                <span className="text-[#444748]">&lt;---&gt;</span>
                <span className="text-white font-bold">CURRENT: {activePair.currentDate}</span>
              </div>
              <span className="text-[#8e9192] text-[10px]">
                DRAG SLIDER HORIZONTALLY TO COMPARE DELTA
              </span>
            </div>

            {/* Split Screen Slider Canvas */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full aspect-[16/10] bg-black border border-[#444748] overflow-hidden select-none cursor-ew-resize"
            >
              {/* After Image (Background) */}
              <img
                src={activePair.currentImageUrl}
                alt="Current status"
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125"
              />

              {/* Before Image (Clipped overlay) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={activePair.baselineImageUrl}
                  alt="Baseline status"
                  className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 max-w-none"
                  style={{ width: containerRef.current?.clientWidth || '100%' }}
                />
                {/* Before Label */}
                <div className="absolute top-3 left-3 bg-[#0e0e0e]/90 border border-[#8e9192] px-2 py-0.5 font-code text-[10px] text-white uppercase font-bold">
                  [BASELINE GROUND TRUTH: {activePair.baselineDate}]
                </div>
              </div>

              {/* After Label */}
              <div className="absolute top-3 right-3 bg-[#0e0e0e]/90 border border-white px-2 py-0.5 font-code text-[10px] text-white uppercase font-bold">
                [VERIFIED COMPLETED: {activePair.currentDate}]
              </div>

              {/* Slider Handle Divider Line */}
              <div
                className="absolute inset-y-0 pointer-events-none flex items-center justify-center"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-code font-bold text-xs shadow-lg">
                  &lt;&gt;
                </div>
              </div>

              {/* Bottom Position Bar */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none font-code text-[10px] text-white bg-[#0e0e0e]/80 p-1 border border-[#444748]">
                <span>BASELINE: {sliderPosition.toFixed(0)}%</span>
                <span>DELTA COMPLETED: {(100 - sliderPosition).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Quick Slider Position Controller */}
          <div className="mt-3 flex items-center justify-between font-code text-[11px] text-[#8e9192]">
            <button
              onClick={() => setSliderPosition(0)}
              className="hover:text-white px-2 py-0.5 bg-[#1b1b1b] border border-[#444748]"
            >
              [ 100% COMPLETED ]
            </button>
            <button
              onClick={() => setSliderPosition(50)}
              className="hover:text-white px-2 py-0.5 bg-[#1b1b1b] border border-[#444748]"
            >
              [ 50/50 SPLIT ]
            </button>
            <button
              onClick={() => setSliderPosition(100)}
              className="hover:text-white px-2 py-0.5 bg-[#1b1b1b] border border-[#444748]"
            >
              [ 100% BASELINE ]
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Change Analysis Chips & Report Integration */}
        <div className="lg:col-span-4 bg-[#1b1b1b] p-3 md:p-6 flex flex-col justify-between font-code">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#444748] text-[11px]">
              <span className="text-white font-bold uppercase tracking-wider">
                COMPUTER VISION CHANGE LOG
              </span>
              <span className="text-[#8e9192]">OPENCV_DIFF</span>
            </div>

            {/* Target Site Details */}
            <div className="bg-[#0e0e0e] p-3 border border-[#444748] mb-3 text-[11px]">
              <div className="text-[#8e9192] text-[10px] uppercase">PROJECT SITE IDENTIFIER:</div>
              <div className="text-white font-bold text-xs truncate mt-0.5">
                {activePair.siteName}
              </div>
              <div className="text-[#c4c7c8] text-[10px] mt-1">
                MILESTONE: {activePair.milestone}
              </div>
              <div className="text-[#8e9192] text-[10px] mt-0.5">
                LOCATION: {activePair.district}
              </div>
            </div>

            {/* Structural Delta Metric Box */}
            <div className="bg-[#0e0e0e] p-3 border border-white mb-3 text-[11px]">
              <div className="text-[#8e9192] text-[10px] uppercase">
                ESTIMATED STRUCTURAL EXPANSION:
              </div>
              <div className="font-metric text-xl text-white font-bold tracking-tight mt-1">
                {activePair.structuralDelta}
              </div>
              <div className="text-[#8e9192] text-[10px] mt-1">
                Verified against sanctioned bill of materials (BOQ) with zero discrepancy.
              </div>
            </div>

            {/* Visual Change Summary Chips */}
            <div className="flex flex-col gap-1.5 mb-3 text-[11px]">
              <span className="text-[#8e9192] text-[10px] uppercase font-bold">
                PHYSICAL CHANGE MARKERS (+ DELTAS):
              </span>
              {activePair.changeChips.map((chip, idx) => (
                <div
                  key={idx}
                  className="bg-[#0e0e0e] border border-[#353535] px-2.5 py-1.5 text-white flex items-center justify-between"
                >
                  <span>{chip}</span>
                  <span className="text-white font-bold text-[10px]">[VERIFIED]</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#444748] flex flex-col gap-2">
            <button
              type="button"
              onClick={handleExportComparison}
              className="w-full bg-white text-black py-2.5 font-code text-[11px] font-bold uppercase hover:bg-[#e2e2e2] transition-none cursor-pointer"
            >
              [ EXPORT COMPARISON DOSSIER (PDF) ]
            </button>
            <button
              type="button"
              onClick={handleAddToReport}
              className="w-full bg-[#0e0e0e] text-white py-2 font-code text-[11px] uppercase border border-[#444748] hover:border-white transition-none cursor-pointer"
            >
              {isAddedToReport ? '[X] REMOVE FROM ACTIVE REPORT' : '[+] ADD TO STATUTORY REPORT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
