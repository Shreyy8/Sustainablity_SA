"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  MapPin,
  Calendar,
  Save,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Compass
} from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();

  const [grants, setGrants] = useState<any[]>([]);
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [grantId, setGrantId] = useState("");
  const [district, setDistrict] = useState("Barmer");
  const [state, setState] = useState("Rajasthan");
  const [budgetInr, setBudgetInr] = useState("5000000");
  const [activities, setActivities] = useState<string>("water_purification, solar_installation");
  const [siteName, setSiteName] = useState("");
  const [lat, setLat] = useState("25.7534");
  const [lng, setLng] = useState("71.3967");

  // Milestones
  const [milestones, setMilestones] = useState<Array<{ name: string; targetOffsetDays: number }>>([
    { name: "Baseline Land & Hydrogeological Survey", targetOffsetDays: 30 },
    { name: "Civil Foundation & Solar Array Commissioning", targetOffsetDays: 90 },
    { name: "Water Quality Testing & Community Handover", targetOffsetDays: 180 }
  ]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.grants && data.grants.length > 0) {
          setGrants(data.grants);
          setGrantId(data.grants[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingGrants(false));
  }, []);

  const handleUseCurrentGps = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
        },
        () => alert("Could not fetch GPS coordinates from browser.")
      );
    }
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { name: `Milestone 0${milestones.length + 1} Deliverable`, targetOffsetDays: 30 * (milestones.length + 1) }
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a project name");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const activityArray = activities
        .split(",")
        .map((a) => a.trim().toLowerCase().replace(/\s+/g, "_"))
        .filter(Boolean);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          grantId,
          district: district.trim(),
          state: state.trim(),
          budgetInr: Number(budgetInr),
          activities: activityArray,
          siteName: siteName.trim() || `${name.trim()} Main Facility`,
          centroid: [Number(lat), Number(lng)],
          milestones
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to create project");
      }

      const data = await res.json();
      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      {/* Top Header */}
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/projects" className="text-[#8e9192] hover:text-white font-bold">
            [&lt;- CANCEL]
          </Link>
          <span className="text-[#444748]">//</span>
          <span className="text-white font-bold uppercase">REGISTER NEW SECTION 135 PROJECT</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full space-y-6">
        {error && (
          <div className="bg-red-950/60 border border-red-500 text-red-200 p-3">
            ERROR: {error}
          </div>
        )}

        {/* Project Basic Info */}
        <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-4">
          <h3 className="text-white font-bold uppercase border-b border-[#333] pb-2 text-sm">
            1. PROJECT SPECIFICATIONS &amp; GRANT LINKAGE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[#888] block text-[11px] mb-1">PROJECT TITLE *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Solar Drinking Water RO Facility Phase II"
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>

            <div>
              <label className="text-[#888] block text-[11px] mb-1">SANCTIONING GRANT *</label>
              <select
                value={grantId}
                onChange={(e) => setGrantId(e.target.value)}
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs outline-none"
              >
                {grants.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#888] block text-[11px] mb-1">BUDGET SANCTIONED (INR)</label>
              <input
                type="number"
                value={budgetInr}
                onChange={(e) => setBudgetInr(e.target.value)}
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>

            <div>
              <label className="text-[#888] block text-[11px] mb-1">DISTRICT *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>

            <div>
              <label className="text-[#888] block text-[11px] mb-1">STATE *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[#888] block text-[11px] mb-1">
                SECTOR ACTIVITIES (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="water_purification, solar_installation, classroom_construction"
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Primary Site & Geofence Coordinates */}
        <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#333] pb-2">
            <h3 className="text-white font-bold uppercase text-sm">
              2. PRIMARY SITE CENTROID &amp; GEOFENCE
            </h3>
            <button
              type="button"
              onClick={handleUseCurrentGps}
              className="bg-[#1e1e1e] hover:bg-[#333] text-emerald-400 border border-[#444] px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>USE CURRENT GPS FIX</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="text-[#888] block text-[11px] mb-1">SITE NAME</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Barmer Block A Water Filtration Shed"
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>

            <div>
              <label className="text-[#888] block text-[11px] mb-1">CENTROID LATITUDE</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>

            <div>
              <label className="text-[#888] block text-[11px] mb-1">CENTROID LONGITUDE</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-[#161616] border border-[#444] p-2 text-white text-xs focus:border-white outline-none"
              />
            </div>

            <div>
              <label className="text-[#888] block text-[11px] mb-1">GEOFENCE BUFFER RADIUS</label>
              <div className="bg-[#161616] border border-[#444] p-2 text-white text-xs">
                ±500 METERS (RTK POLYGON)
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Definition */}
        <div className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#333] pb-2">
            <h3 className="text-white font-bold uppercase text-sm">
              3. STATUTORY MILESTONES CHECKLIST
            </h3>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="bg-[#1e1e1e] hover:bg-[#333] text-emerald-400 border border-[#444] px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD MILESTONE</span>
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-[#161616] p-2 border border-[#333]">
                <span className="text-[#888] font-bold w-6">0{idx + 1}.</span>
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[idx].name = e.target.value;
                    setMilestones(updated);
                  }}
                  className="flex-1 bg-transparent border-b border-[#444] text-white text-xs p-1 outline-none focus:border-white"
                />
                <div className="flex items-center gap-1 text-[#888]">
                  <span>+</span>
                  <input
                    type="number"
                    value={m.targetOffsetDays}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].targetOffsetDays = Number(e.target.value);
                      setMilestones(updated);
                    }}
                    className="w-16 bg-[#222] border border-[#444] text-white text-xs p-1 text-center"
                  />
                  <span>days</span>
                </div>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/projects"
            className="px-5 py-2.5 border border-[#444] text-white hover:bg-[#222] font-bold uppercase"
          >
            CANCEL
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer"
          >
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>CREATE &amp; REGISTER PROJECT</span>
          </button>
        </div>
      </form>
    </div>
  );
}
