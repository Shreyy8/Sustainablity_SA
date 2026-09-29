"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Film, Sparkles, RefreshCw, Play, Plus, Clock, ExternalLink } from "lucide-react";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeStory, setActiveStory] = useState<any>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const [storyRes, projRes] = await Promise.all([
        fetch("/api/stories").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json())
      ]);

      if (storyRes?.stories) {
        setStories(storyRes.stories);
        if (storyRes.stories.length > 0 && !activeStory) {
          setActiveStory(storyRes.stories[0]);
        }
      }
      if (projRes?.projects && projRes.projects.length > 0) {
        setProjects(projRes.projects);
        setSelectedProjectId(projRes.projects[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleComposeStory = async () => {
    if (!selectedProjectId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId })
      });

      if (res.ok) {
        const data = await res.json();
        setStories((prev) => [data.story, ...prev]);
        setActiveStory(data.story);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      {/* Top Banner */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">CSR IMPACT STORY &amp; REEL STUDIO</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">CLOUDINARY DYNAMIC 9:16 VERTICAL TIMELINES</span>
        </div>
        <div className="text-[#8e9192]">
          ACTIVE REELS: <span className="text-emerald-400 font-bold">{stories.length}</span>
        </div>
      </div>

      {/* Story Reel Composer Console */}
      <div className="bg-[#0e0e0e] border border-[#444748] p-4 mb-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#333] pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-bold uppercase">COMPOSE DYNAMIC 9:16 CAMPAIGN REEL</h3>
          </div>
          <span className="text-[#888] text-[11px]">AUTOMATED MULTI-FRAME EDITING</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="text-[#888] block text-[10px] uppercase mb-1">SELECT TARGET PROJECT:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.district}, {p.state})
                </option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              onClick={handleComposeStory}
              disabled={generating || !selectedProjectId}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{generating ? "COMPOSE IN PROGRESS..." : "COMPOSE STORY REEL"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reels Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#8e9192]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
          <span>LOADING REEL REPOSITORY...</span>
        </div>
      ) : stories.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#333] text-[#888]">
          No story reels generated yet. Select a project above and click "COMPOSE STORY REEL".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((st: any) => {
            const beats = st.script?.beats || [];
            const duration =
              st.script?.totalDurationSeconds ||
              beats.reduce((acc: number, b: any) => acc + (b.durationSeconds || 3), 0) ||
              15;

            return (
              <div
                key={st.id}
                className="bg-[#0e0e0e] border border-[#333] hover:border-[#555] transition-colors overflow-hidden flex flex-col justify-between"
              >
                {/* 9:16 Video Canvas / Preview */}
                <div className="relative aspect-[9/16] bg-black max-h-[420px] overflow-hidden flex items-center justify-center group">
                  <img
                    src={st.url || "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80"}
                    alt={st.id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 ml-0.5 fill-black" />
                    </div>
                  </div>

                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 text-[10px] text-white border border-[#444] font-bold">
                    9:16 VERTICAL
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 bg-black/85 p-2.5 text-[10px] text-white border border-[#333]">
                    <div className="font-bold text-emerald-300 uppercase mb-0.5">
                      {st.script?.targetAudience || "COMMUNITY IMPACT STORY"}
                    </div>
                    <div className="line-clamp-2">
                      {beats[0]?.headline || "Transformational CSR milestone achieved on-site."}
                    </div>
                  </div>
                </div>

                {/* Metadata & Beats */}
                <div className="p-3 border-t border-[#333] space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-bold text-xs uppercase truncate">
                      {st.id}
                    </h4>
                    <span className="text-emerald-400 font-bold text-[10px]">
                      {duration}s DURATION
                    </span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-[#222]">
                    <div className="text-[10px] text-[#888] font-bold uppercase">
                      STORY BEATS ({beats.length}):
                    </div>
                    {beats.slice(0, 3).map((b: any, bIdx: number) => (
                      <div key={bIdx} className="text-[10px] text-[#aaa] truncate flex items-center gap-1">
                        <span className="text-emerald-400">#{bIdx + 1}</span>
                        <span>{b.headline || b.caption}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
