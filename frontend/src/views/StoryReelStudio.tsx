import React, { useState, useEffect } from 'react';
import { StoryReel } from '../types';

interface StoryReelStudioProps {
  initialStory: StoryReel;
}

export const StoryReelStudio: React.FC<StoryReelStudioProps> = ({
  initialStory,
}) => {
  const [story, setStory] = useState<StoryReel>(initialStory);
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto-advance video beats if playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentBeatIndex((prev) => (prev + 1) % story.beats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, story.beats.length]);

  const activeBeat = story.beats[currentBeatIndex] || story.beats[0];

  const handleCopySocial = (key: 'linkedin' | 'sebiBrsr' | 'instagram', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const handleCaptionEdit = (newCaption: string) => {
    const updatedBeats = [...story.beats];
    updatedBeats[currentBeatIndex] = {
      ...updatedBeats[currentBeatIndex],
      caption: newCaption,
    };
    setStory({ ...story, beats: updatedBeats });
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)]">
      {/* Studio Header Bar */}
      <div className="w-full bg-[#0e0e0e] border-b border-[#444748] px-3 md:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap font-code text-[11px]">
          <span className="text-white font-bold uppercase tracking-wider">
            [S9: STORY &amp; REEL STUDIO]
          </span>
          <span className="text-[#8e9192] hidden sm:inline">
            // 9:16 VERTICAL IMPACT VIDEO BUILDER
          </span>
          <span className="text-[#444748]">::</span>
          <span className="text-white uppercase truncate max-w-sm">{story.title}</span>
        </div>

        <div className="flex items-center gap-2 font-code text-[11px]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white text-black px-2.5 py-1 font-bold uppercase hover:bg-[#e2e2e2] transition-none"
          >
            {isPlaying ? '[ PAUSE PREVIEW ]' : '[ PLAY PREVIEW ]'}
          </button>
        </div>
      </div>

      {/* Main Studio Workcell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 border-b border-[#444748]">
        {/* Left Column: 9:16 Vertical Video Player (Col span 5) */}
        <div className="lg:col-span-5 bg-[#0e0e0e] p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-[#444748] flex flex-col items-center justify-center">
          {/* Phone Frame Simulator */}
          <div className="relative w-full max-w-[320px] aspect-[9/16] bg-black border-2 border-[#444748] shadow-2xl overflow-hidden flex flex-col justify-between select-none">
            {/* Background Beat Image */}
            <img
              src={activeBeat.imageUrl}
              alt="Story beat preview"
              className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

            {/* Story Top Progress Bars */}
            <div className="relative z-20 p-2.5 flex items-center gap-1">
              {story.beats.map((beat, i) => (
                <div
                  key={beat.id}
                  onClick={() => setCurrentBeatIndex(i)}
                  className="flex-1 h-1 bg-white/30 cursor-pointer overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      i === currentBeatIndex
                        ? 'w-full'
                        : i < currentBeatIndex
                        ? 'w-full'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Top Identity Tag */}
            <div className="relative z-20 px-3 flex items-center justify-between font-code text-[10px] text-white">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-white text-black flex items-center justify-center font-bold text-[9px]">
                  TT
                </div>
                <span className="font-bold">TATA SUSTAINABILITY TRUST</span>
              </div>
              <span className="bg-[#bb0112] text-white px-1 font-bold text-[9px]">
                SEC 135 VERIFIED
              </span>
            </div>

            {/* Bottom Overlay Narrative & Script */}
            <div className="relative z-20 p-3.5 flex flex-col gap-2">
              {/* Dynamic Subtitle / Caption Card */}
              <div className="bg-black/85 border border-white p-2.5 backdrop-blur-sm">
                <span className="font-code text-[9px] text-[#8e9192] uppercase block mb-0.5">
                  CHAPTER {currentBeatIndex + 1} OF {story.beats.length} // {activeBeat.label}
                </span>
                <p className="font-sans text-xs text-white font-medium leading-relaxed">
                  {activeBeat.caption}
                </p>
              </div>

              {/* Verified Trust Stamp */}
              <div className="flex items-center justify-between font-code text-[9px] text-[#c4c7c8]">
                <span>📍 CHOHTAN, BARMER (25.7532° N)</span>
                <span className="text-white font-bold font-mono">[SHA-256 LOCKED]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Beat Timeline Editor & Social Exporter (Col span 7) */}
        <div className="lg:col-span-7 bg-[#131313] p-4 md:p-6 flex flex-col justify-between font-code">
          <div className="flex flex-col gap-4">
            {/* Timeline Beat Navigation */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#444748] text-[11px]">
                <span className="text-white font-bold uppercase tracking-wider">
                  // BEAT TIMELINE EDITOR ({story.beats.length} CHAPTERS)
                </span>
                <span className="text-[#8e9192]">TARGET DURATION: {story.durationSec}s</span>
              </div>

              <div className="flex flex-col gap-2">
                {story.beats.map((beat, idx) => (
                  <div
                    key={beat.id}
                    onClick={() => setCurrentBeatIndex(idx)}
                    className={`p-2.5 border cursor-pointer text-[11px] ${
                      idx === currentBeatIndex
                        ? 'bg-[#1f1f1f] border-white text-white'
                        : 'bg-[#0e0e0e] border-[#353535] text-[#c4c7c8] hover:border-[#8e9192]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white uppercase">{beat.label}</span>
                      <span className="text-[#8e9192] text-[10px]">TIMESTAMP: {beat.timestamp}</span>
                    </div>
                    <div className="text-[10px] text-[#c4c7c8]">{beat.caption}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Beat Script Editor */}
            <div className="bg-[#0e0e0e] p-3 border border-[#444748] flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white font-bold uppercase">
                  ACTIVE CHAPTER SCRIPT ADJUSTMENT:
                </span>
                <span className="text-[#8e9192]">EDIT BELOW TO SYNC OVERLAY</span>
              </div>
              <textarea
                rows={2}
                value={activeBeat.caption}
                onChange={(e) => handleCaptionEdit(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#444748] p-2 text-white font-sans text-xs focus:outline-none focus:border-white resize-none"
              />
            </div>

            {/* Direct Social Copy Exporter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#444748] text-[11px]">
                <span className="text-white font-bold uppercase tracking-wider">
                  DIRECT SOCIAL COMPLIANCE EXPORTER
                </span>
                <span className="text-[#8e9192]">1-CLICK COPY</span>
              </div>

              {/* LinkedIn Copy */}
              <div className="bg-[#0e0e0e] p-2.5 border border-[#353535] flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8e9192] text-[10px] uppercase font-bold">
                    LINKEDIN CORPORATE CSR DISCLOSURE:
                  </span>
                  <button
                    onClick={() => handleCopySocial('linkedin', story.socialCopy.linkedin)}
                    className="text-white hover:underline text-[10px] uppercase font-bold"
                  >
                    {copiedKey === 'linkedin' ? '[ COPIED! ]' : '[ COPY TEXT ]'}
                  </button>
                </div>
                <div className="text-[#c4c7c8] text-[11px] font-sans">
                  {story.socialCopy.linkedin}
                </div>
              </div>

              {/* SEBI BRSR Copy */}
              <div className="bg-[#0e0e0e] p-2.5 border border-[#353535] flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8e9192] text-[10px] uppercase font-bold">
                    SEBI BRSR PRINCIPLE 8 STATUTORY EXTRACT:
                  </span>
                  <button
                    onClick={() => handleCopySocial('sebiBrsr', story.socialCopy.sebiBrsr)}
                    className="text-white hover:underline text-[10px] uppercase font-bold"
                  >
                    {copiedKey === 'sebiBrsr' ? '[ COPIED! ]' : '[ COPY TEXT ]'}
                  </button>
                </div>
                <div className="text-[#c4c7c8] text-[11px] font-sans">
                  {story.socialCopy.sebiBrsr}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#444748] flex justify-between items-center text-[10px] text-[#8e9192]">
            <span>RENDER ENGINE: FFMPEG-WASM // 1080x1920 60FPS</span>
            <span className="text-white font-bold">READY TO EXPORT FOR ANNUAL REPORT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
