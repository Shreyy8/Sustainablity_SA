"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Camera,
  Search,
  GitCompare,
  FileText,
  Film,
  FolderGit2,
  LayoutDashboard,
  Menu,
  X,
  ExternalLink,
  ChevronDown
} from "lucide-react";

export type Role = "Corporate Admin" | "NGO Manager" | "Field Worker" | "Statutory Auditor";
export type Tenant =
  | "TATA SUSTAINABILITY TRUST :: FY 2025-26"
  | "PRATHAM RURAL FOUNDATION"
  | "RELIANCE FOUNDATION :: GUJARAT"
  | "ADANI ACT FOUNDATION";

const ALL_TENANTS: Tenant[] = [
  "TATA SUSTAINABILITY TRUST :: FY 2025-26",
  "PRATHAM RURAL FOUNDATION",
  "RELIANCE FOUNDATION :: GUJARAT",
  "ADANI ACT FOUNDATION"
];

const ALL_ROLES: Role[] = [
  "Corporate Admin",
  "NGO Manager",
  "Field Worker",
  "Statutory Auditor"
];

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeAlert?: boolean;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentTenant, setCurrentTenant] = useState<Tenant>("TATA SUSTAINABILITY TRUST :: FY 2025-26");
  const [currentRole, setCurrentRole] = useState<Role>("Corporate Admin");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pendingTriageCount, setPendingTriageCount] = useState(3);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: NavItem[] = [
    { id: "overview", href: "/dashboard", label: "01 // OVERVIEW", icon: LayoutDashboard },
    { id: "projects", href: "/projects", label: "02 // GRANTS & SITES", icon: FolderGit2 },
    { id: "capture", href: "/capture", label: "03 // FIELD CAPTURE", icon: Camera },
    {
      id: "triage",
      href: "/triage",
      label: "04 // TRIAGE INBOX",
      icon: ShieldAlert,
      badge: `[0${pendingTriageCount}]`,
      badgeAlert: true
    },
    { id: "search", href: "/search", label: "05 // HYBRID SEARCH", icon: Search },
    { id: "comparisons", href: "/pairs", label: "06 // COMPARISONS", icon: GitCompare },
    { id: "reports", href: "/reports", label: "07 // AUDIT REPORTS", icon: FileText },
    { id: "stories", href: "/stories", label: "08 // STORY STUDIO", icon: Film }
  ];

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col font-sans select-none antialiased">
      {/* Top Application Header */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-[#0e0e0e] border-b border-[#444748] z-50 flex items-center justify-between px-3 md:px-4">
        {/* Brand & Workspace Zone */}
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden text-[#c4c7c8] hover:text-white p-1"
            title="Toggle Menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-1.5 cursor-pointer select-none shrink-0 group">
            <span className="font-code text-xs md:text-sm font-bold tracking-wider text-white uppercase group-hover:text-emerald-400 transition-colors">
              PLURIBUS
            </span>
            <span className="font-code text-xs text-[#8e9192]">//</span>
            <span className="font-code text-[11px] text-[#c4c7c8] uppercase tracking-wider hidden sm:inline">
              EVIDENCE VAULT
            </span>
          </Link>

          <span className="font-code text-[11px] text-[#444748] hidden md:inline">::</span>

          {/* Workspace / Tenant Switcher */}
          <div className="relative group shrink min-w-0">
            <select
              value={currentTenant}
              onChange={(e) => setCurrentTenant(e.target.value as Tenant)}
              className="bg-[#1b1b1b] text-white border border-[#444748] hover:border-[#8e9192] font-code text-[11px] px-2 py-1 focus:outline-none cursor-pointer max-w-[190px] sm:max-w-none truncate"
            >
              {ALL_TENANTS.map((t) => (
                <option key={t} value={t} className="bg-[#1b1b1b] text-white">
                  WORKSPACE: {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role Selector & Profile Zone */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-code text-[#8e9192] uppercase">
            <span>
              [ORG:{" "}
              {currentRole === "NGO Manager" || currentRole === "Field Worker"
                ? "NGO_ENTITY"
                : currentRole === "Statutory Auditor"
                ? "AUDIT_FIRM"
                : "CORPORATE"}
              ]
            </span>
            <span className="text-[#444748]">|</span>
          </div>

          {/* Role Switcher */}
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as Role)}
            className="bg-[#1b1b1b] text-white border border-[#444748] hover:border-[#8e9192] font-code text-[11px] px-2 py-1 focus:outline-none cursor-pointer uppercase font-medium"
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r} className="bg-[#1b1b1b] text-white">
                {r === "Corporate Admin"
                  ? "ARJUN (CSR HEAD)"
                  : r === "Statutory Auditor"
                  ? "CA ARJUN MEHTA (AUDITOR)"
                  : r === "NGO Manager"
                  ? "MOHAN RAM (PRATHAM)"
                  : "POOJA (FIELD WORKER)"}
              </option>
            ))}
          </select>

          {/* User Icon Avatar */}
          <div
            title={`Active Role: ${currentRole}`}
            className="w-7 h-7 bg-white text-[#2f3131] flex items-center justify-center shrink-0 font-code font-bold text-xs shadow"
          >
            {currentRole === "Corporate Admin"
              ? "CA"
              : currentRole === "Statutory Auditor"
              ? "SA"
              : currentRole === "NGO Manager"
              ? "NM"
              : "FW"}
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
        />
      )}

      {/* Navigation Ledger Sidebar */}
      <aside
        className={`fixed left-0 top-12 bottom-0 w-72 bg-[#0e0e0e] border-r border-[#444748] z-40 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Section Header */}
          <div className="px-3 py-2 border-b border-[#444748] bg-[#1b1b1b] flex items-center justify-between">
            <span className="font-code text-[11px] uppercase tracking-widest text-[#8e9192]">
              NAVIGATION LEDGER
            </span>
            <span className="font-code text-[11px] text-emerald-400 font-semibold">SEC-135</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/dashboard" && pathname === "/") ||
                (pathname.startsWith(item.href) && item.href !== "/dashboard");
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 border-b border-[#444748] font-code text-[11px] transition-colors cursor-pointer group ${
                    isActive
                      ? "bg-[#1f1f1f] text-white border-l-4 border-white font-bold"
                      : "text-[#c4c7c8] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-[#8e9192] group-hover:text-white"}`} />
                    <span className="tracking-wide uppercase">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold ${
                        item.badgeAlert
                          ? "bg-[#bb0112] text-white border border-[#ffb4ab]"
                          : "bg-[#353535] text-[#e2e2e2]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Ledger Status */}
        <div className="p-3 border-t border-[#444748] bg-[#141414] font-code text-[10px] text-[#8e9192] space-y-2">
          <div className="flex items-center justify-between">
            <span>CHAIN_STATE:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE [SYNCED]
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>CLOUDINARY:</span>
            <span className="text-white font-semibold">SIGNED_STRICT</span>
          </div>
          <div className="flex items-center justify-between">
            <span>TIME_REF:</span>
            <span className="text-white font-mono">{currentTime || "LIVE"}</span>
          </div>
          <div className="pt-1 border-t border-[#333] text-[9px] text-[#777] leading-tight">
            COMPLIANCE GUARANTEE UNDER MCA CSR RULES 2014 & SEC 135(5)
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-12 md:pl-72 flex-1 flex flex-col min-h-screen bg-[#131313]">
        {children}
      </main>
    </div>
  );
}
