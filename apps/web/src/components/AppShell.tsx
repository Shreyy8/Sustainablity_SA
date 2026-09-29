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
  ChevronDown,
  KeyRound,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  UserCheck,
  Sparkles
} from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeAlert?: boolean;
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, users, tenants, switchUser, switchTenant, logout, refreshSession } = useAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pendingTriageCount, setPendingTriageCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [ledgerStats, setLedgerStats] = useState<any>(null);
  const [clearingLedger, setClearingLedger] = useState(false);
  const [ledgerNotice, setLedgerNotice] = useState<string | null>(null);

  // UTC clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live triage counts and ledger status
  const fetchTriageAndLedger = () => {
    fetch("/api/review")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.counts?.all !== undefined) {
          setPendingTriageCount(data.counts.all);
        }
      })
      .catch(console.error);

    fetch("/api/data/ledger")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLedgerStats(data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchTriageAndLedger();
  }, [pathname]);

  const handleClearLedger = async () => {
    setClearingLedger(true);
    try {
      const res = await fetch("/api/data/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" })
      });
      if (res.ok) {
        setLedgerNotice("✓ Ledger wiped: 0 sample records. Running on original authentic ledger.");
        fetchTriageAndLedger();
        setTimeout(() => setLedgerNotice(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearingLedger(false);
    }
  };

  const currentOrgName =
    session?.orgName || session?.reusableData?.tenantName || tenants[0] || "Tata Sustainability Trust";

  const userRoleDisplay = session?.role?.replace("_", " ") || "CORP ADMIN";
  const userInitials = (session?.name || "Arjun Mehta")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
      badgeAlert: pendingTriageCount > 0
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

          {/* Dynamic Workspace / Tenant Selector */}
          <div className="relative group shrink min-w-0">
            <select
              value={currentOrgName}
              onChange={(e) => switchTenant(e.target.value)}
              className="bg-[#1b1b1b] text-white border border-[#444748] hover:border-[#8e9192] font-code text-[11px] px-2 py-1 focus:outline-none cursor-pointer max-w-[190px] sm:max-w-none truncate"
            >
              {tenants.map((t) => (
                <option key={t} value={t} className="bg-[#1b1b1b] text-white">
                  WORKSPACE: {t.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role Selector & Profile Zone */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* JWT Token & Session Indicator Badge */}
          <button
            onClick={() => setSessionModalOpen(true)}
            title="View JWT Session & Reusable Data"
            className="flex items-center gap-1.5 bg-[#1b1b1b] hover:bg-[#282828] border border-emerald-500/40 hover:border-emerald-400 px-2 py-1 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-code font-bold text-emerald-400 tracking-wider hidden sm:inline">
              JWT SESSION: ACTIVE
            </span>
            <span className="text-[10px] font-code text-[#8e9192] hidden md:inline">
              [HS256]
            </span>
          </button>

          {/* Dynamic User & Role Switcher */}
          <select
            value={session?.userId || ""}
            onChange={(e) => switchUser(e.target.value)}
            className="bg-[#1b1b1b] text-white border border-[#444748] hover:border-[#8e9192] font-code text-[11px] px-2 py-1 focus:outline-none cursor-pointer uppercase font-medium max-w-[150px] sm:max-w-none truncate"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#1b1b1b] text-white">
                {u.name.toUpperCase()} [{u.role.replace("_", " ")}]
              </option>
            ))}
          </select>

          {/* User Icon Avatar */}
          <div
            onClick={() => setSessionModalOpen(true)}
            title={`Active User: ${session?.name || "User"} (${userRoleDisplay})\nClick to view JWT session`}
            className="w-7 h-7 bg-white text-[#2f3131] hover:bg-emerald-400 hover:text-black transition-colors flex items-center justify-center shrink-0 font-code font-bold text-xs shadow cursor-pointer"
          >
            {userInitials}
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
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? "text-emerald-400" : "text-[#8e9192] group-hover:text-white"
                      }`}
                    />
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
            <span>SESSION_COOKIE:</span>
            <span className="text-white font-semibold flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-emerald-400" />
              pluribus_session
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>DATA_MODE:</span>
            <span className="text-emerald-400 font-semibold">
              {ledgerStats?.isSampleData ? "SAMPLE_DATA" : "ORIGINAL_DATA"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>TIME_REF:</span>
            <span className="text-white font-mono">{currentTime || "LIVE"}</span>
          </div>

          {/* Quick Ledger Reset Button */}
          <div className="pt-2 border-t border-[#333] flex items-center justify-between">
            <button
              onClick={handleClearLedger}
              disabled={clearingLedger}
              className="text-[9px] text-[#8e9192] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset evidence ledger back to 0 assets"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>CLEAR EVIDENCE LEDGER</span>
            </button>
            <button
              onClick={() => setSessionModalOpen(true)}
              className="text-[9px] text-emerald-400 hover:underline cursor-pointer"
            >
              INSPECT JWT
            </button>
          </div>

          {ledgerNotice && (
            <div className="text-[9px] text-emerald-400 bg-emerald-950/40 p-1 border border-emerald-800">
              {ledgerNotice}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-12 md:pl-72 flex-1 flex flex-col min-h-screen bg-[#131313]">
        {children}
      </main>

      {/* JWT Session & Reusable Info Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#444748] w-full max-w-xl max-h-[90vh] overflow-y-auto font-code text-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#333] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold text-sm uppercase">
                  JWT Session &amp; Cookie Diagnostics
                </span>
              </div>
              <button
                onClick={() => setSessionModalOpen(false)}
                className="text-[#888] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Token details */}
            <div className="space-y-3 bg-[#181818] p-3 border border-[#333]">
              <div className="text-emerald-400 font-bold text-[11px] uppercase flex items-center justify-between">
                <span>ACTIVE HTTPONLY COOKIE: pluribus_session</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 border border-emerald-700">
                  SIGNED HS256
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#888]">User ID:</span>
                  <div className="text-white font-bold">{session?.userId}</div>
                </div>
                <div>
                  <span className="text-[#888]">User Name:</span>
                  <div className="text-white font-bold">{session?.name}</div>
                </div>
                <div>
                  <span className="text-[#888]">Email:</span>
                  <div className="text-white font-bold">{session?.email || "N/A"}</div>
                </div>
                <div>
                  <span className="text-[#888]">Role:</span>
                  <div className="text-emerald-400 font-bold">{session?.role}</div>
                </div>
                <div>
                  <span className="text-[#888]">Organization:</span>
                  <div className="text-white font-bold">{session?.orgName}</div>
                </div>
                <div>
                  <span className="text-[#888]">Org Type:</span>
                  <div className="text-white font-bold">{session?.orgType}</div>
                </div>
              </div>
            </div>

            {/* Reusable Data Block */}
            <div className="space-y-2 bg-[#181818] p-3 border border-[#333]">
              <div className="text-white font-bold text-[11px] uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>SAVED REUSABLE SESSION STATE</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between border-b border-[#282828] py-1">
                  <span className="text-[#888]">Active Workspace:</span>
                  <span className="text-white font-bold">
                    {session?.reusableData?.tenantName || session?.orgName || "Default"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#282828] py-1">
                  <span className="text-[#888]">Last Project ID:</span>
                  <span className="text-emerald-400 font-bold">
                    {session?.reusableData?.lastProjectId || "None (Select any project)"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#282828] py-1">
                  <span className="text-[#888]">Preferred Site ID:</span>
                  <span className="text-emerald-400 font-bold">
                    {session?.reusableData?.preferredSiteId || "None"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#888]">Recent Searches:</span>
                  <span className="text-white">
                    {session?.reusableData?.recentSearches?.join(", ") || "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Ledger Status */}
            <div className="space-y-2 bg-[#181818] p-3 border border-[#333]">
              <div className="text-white font-bold text-[11px] uppercase flex items-center justify-between">
                <span>ORIGINAL EVIDENCE LEDGER STATUS</span>
                <span className="text-emerald-400 font-mono">
                  {ledgerStats?.counts?.assets ?? 0} ASSETS LOADED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="bg-[#111] p-2 border border-[#222]">
                  <span className="text-[#888]">VERIFIED:</span>
                  <div className="text-emerald-400 font-bold text-sm">
                    {ledgerStats?.counts?.verifiedAssets ?? 0}
                  </div>
                </div>
                <div className="bg-[#111] p-2 border border-[#222]">
                  <span className="text-[#888]">IN REVIEW:</span>
                  <div className="text-yellow-400 font-bold text-sm">
                    {ledgerStats?.counts?.reviewAssets ?? 0}
                  </div>
                </div>
                <div className="bg-[#111] p-2 border border-[#222]">
                  <span className="text-[#888]">FLAGGED:</span>
                  <div className="text-red-400 font-bold text-sm">
                    {ledgerStats?.counts?.flaggedAssets ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#333]">
              <button
                onClick={handleClearLedger}
                disabled={clearingLedger}
                className="bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 px-3 py-1.5 font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearingLedger ? "CLEARING..." : "RESET CLEAN LEDGER (0 ASSETS)"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={logout}
                  className="bg-[#222] hover:bg-[#333] text-white px-3 py-1.5 font-bold cursor-pointer transition-colors"
                >
                  LOGOUT
                </button>
                <button
                  onClick={() => setSessionModalOpen(false)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 font-bold cursor-pointer transition-colors"
                >
                  DONE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}
