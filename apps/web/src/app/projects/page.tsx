"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderGit2, MapPin, ShieldCheck, FileText, ChevronRight, RefreshCw } from "lucide-react";

export default function ProjectsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#131313] min-h-[calc(100vh-48px)] p-4 md:p-6 font-code text-xs">
      <div className="w-full bg-[#0e0e0e] border border-[#444748] p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">PORTFOLIO GRANTS, PROJECTS & CSR SITES</span>
          <span className="text-[#8e9192]">//</span>
          <span className="text-[#c4c7c8]">SECTION 135 STATUTORY MONITORING</span>
        </div>
        <div className="text-[#8e9192]">
          ACTIVE GRANTS: <span className="text-white font-bold">{data?.grants?.length || 2}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#8e9192]">
          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
          <span>LOADING GRANTS & SITES...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grants Cards */}
          {(data?.grants || []).map((grant: any) => (
            <div key={grant.id} className="bg-[#0e0e0e] border border-[#444748] p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-[#333] pb-2 gap-2">
                <div>
                  <h3 className="text-white font-bold text-sm uppercase">{grant.title}</h3>
                  <span className="text-[#888] text-[11px]">
                    Grant ID: {grant.id} · Schedule VII: {grant.scheduleVii || "Clean Water & Sanitation"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-sm">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                      grant.amountInr
                    )}
                  </div>
                  <span className="text-[#888] text-[10px]">100% DISBURSEMENT SANCTIONED</span>
                </div>
              </div>

              {/* Projects Under this Grant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.projects || [])
                  .filter((p: any) => p.project.grantId === grant.id || true)
                  .map((item: any) => (
                    <div
                      key={item.project.id}
                      className="bg-[#141414] border border-[#333] p-3 space-y-2 hover:border-[#666] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{item.project.name}</span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500 px-1 text-[10px] font-bold">
                          TRUST {item.avgTrustScore}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[#888] text-[11px]">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>
                          {item.project.district}, {item.project.state}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] text-[#aaa]">
                          <span>Milestone Evidence Progress:</span>
                          <span className="font-bold text-white">
                            {item.evidencedMilestones} / {item.totalMilestones} ({item.coveragePercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#222] h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full"
                            style={{ width: `${item.coveragePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
