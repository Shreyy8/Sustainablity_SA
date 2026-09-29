"use client";

import React, { useState, useEffect } from "react";
import { Film, Sparkles, RefreshCw, Play, Volume2, Share2 } from "lucide-react";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then((res) => res.json())
      .then((d) => setStories(d.stories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">CSR IMPACT STORY & REEL STUDIO</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">CLOUDINARY DYNAMIC 9:16 TIMELINES</span>
        </div>
        <div className="text-[#8e9192]">
          ACTIVE REELS: <span className="text-emerald-400 font-bold">{stories.length || 2}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#8e9192]">LOADING REELS...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(stories.length > 0 ? stories : [
            {
              id: "story-1",
              title: "Barmer Clean Water Transformation",
              durationSeconds: 15,
              frames: 4,
              videoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80",
              script: "From water scarcity to a fully operational 1500L/hr solar RO plant in Barmer, Rajasthan."
            },
            {
              id: "story-2",
              title: "Kutch Solar Microgrid Milestone",
              durationSeconds: 12,
              frames: 3,
              videoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
              script: "Empowering 350 rural households with clean, verifiable solar electrification."
            }
          ]).map((st: any) => (
            <div key={st.id} className="bg-[#0e0e0e] border border-[#333] overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-[9/16] bg-black max-h-[380px] overflow-hidden flex items-center justify-center group">
                <img src={st.videoUrl} alt={st.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-black" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 p-2 text-[10px] text-white">
                  {st.script}
                </div>
              </div>

              <div className="p-3 border-t border-[#333] space-y-1">
                <h4 className="text-white font-bold">{st.title}</h4>
                <div className="flex justify-between text-[#888] text-[10px]">
                  <span>{st.durationSeconds}s Reel · 9:16 Vertical</span>
                  <span className="text-emerald-400">CLOUDINARY COMPOSED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
