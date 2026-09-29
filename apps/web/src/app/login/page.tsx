"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  LogIn,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";

  const {
    session,
    users,
    orgs,
    loginWithCredentials,
    registerUser,
    switchUser,
    logout
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState("CORP_ADMIN");
  const [isNewOrg, setIsNewOrg] = useState(false);
  const [regOrgId, setRegOrgId] = useState(orgs[0]?.id || "org-corp-1");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState("CORPORATE");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithCredentials(loginEmail, loginPassword);
      if (res.success) {
        setSuccessNotice("Login successful! Redirecting to command center...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 600);
      } else {
        setError(res.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: regRole,
        orgId: isNewOrg ? undefined : regOrgId,
        newOrgName: isNewOrg ? newOrgName : undefined,
        newOrgType: isNewOrg ? newOrgType : undefined
      });

      if (res.success) {
        setSuccessNotice("Account registered successfully! JWT Session created.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 700);
      } else {
        setError(res.error || "Registration failed. Please check your inputs.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] p-4 md:p-8 bg-[#101010] font-code text-xs">
      <div className="w-full max-w-xl bg-[#141414] border border-[#383a3b] shadow-2xl p-6 md:p-8 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-[#333] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-white font-bold text-base uppercase tracking-wider">
                PLURIBUS STATUTORY VAULT
              </h1>
            </div>
            <p className="text-[#8e9192] text-[11px] mt-0.5">
              MCA SEC-135 STATUTORY COMPLIANCE &amp; FORENSIC LEDGER AUTHENTICATION
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 font-bold">
              HS256 JWT
            </span>
          </div>
        </div>

        {/* Active Session Callout if already logged in */}
        {session && (
          <div className="bg-[#1a241e] border border-emerald-600/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-[11px] uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE SESSION DETECTED
              </span>
              <button
                onClick={logout}
                className="text-[10px] text-[#ff8080] hover:underline cursor-pointer"
              >
                LOGOUT
              </button>
            </div>
            <div className="text-white text-[11px]">
              Logged in as <strong className="text-emerald-300">{session.name}</strong> (
              {session.role}) at <span className="text-[#c4c7c8]">{session.orgName}</span>
            </div>
            <div className="pt-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 font-bold uppercase transition-colors"
              >
                <span>CONTINUE TO DASHBOARD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-[#0a0a0a] p-1 border border-[#333]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className={`py-2 font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-black shadow"
                : "text-[#8e9192] hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`py-2 font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-black shadow"
                : "text-[#8e9192] hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>REGISTER PROFILE</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-700/80 text-red-200 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Tab 1: SIGN IN */}
        {activeTab === "login" && (
          <div className="space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[#8e9192] block uppercase text-[10px] mb-1 font-bold">
                  OFFICIAL EMAIL ADDRESS:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. arjun.mehta@tatatrust.org"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[10px] mb-1 font-bold">
                  ACCOUNT PASSWORD / PIN:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>AUTHENTICATE &amp; SIGN IN</span>
              </button>
            </form>

            {/* Enterprise Security Notice & Onboarding Link */}
            <div className="pt-4 border-t border-[#262626] space-y-3">
              <div className="bg-[#181818] border border-[#333] p-3 text-[11px] text-[#8e9192] space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ENTERPRISE RBAC &amp; TENANT ISOLATION</span>
                </div>
                <p>
                  Each device and role requires explicit credential authentication. Shared devices must perform a clean logout before another user authenticates.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[#666]">Registering a new organization?</span>
                  <Link
                    href="/onboarding"
                    className="text-emerald-400 hover:underline font-bold uppercase"
                  >
                    FIRM ONBOARDING &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: REGISTER PROFILE */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#8e9192] block uppercase text-[10px] mb-1 font-bold">
                  FULL NAME:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[10px] mb-1 font-bold">
                  OFFICIAL EMAIL:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. ramesh@ngo-sansthan.org"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#8e9192] block uppercase text-[10px] mb-1 font-bold">
                  PASSWORD:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[10px] mb-1 font-bold">
                  CONTACT NUMBER (OPTIONAL):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-[#8e9192] block uppercase text-[10px] mb-1 font-bold">
                SELECT STATUTORY CSR ROLE:
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-white"
              >
                <option value="CORP_ADMIN">CORPORATE CSR HEAD / GRANTOR (CORP_ADMIN)</option>
                <option value="NGO_ADMIN">NGO PROGRAM DIRECTOR / GRANTEE (NGO_ADMIN)</option>
                <option value="FIELD">GROUND OPERATIONS / FIELD OFFICER (FIELD)</option>
                <option value="ASSESSOR">INDEPENDENT STATUTORY IMPACT AUDITOR (ASSESSOR)</option>
                <option value="CORP_VIEWER">CORPORATE EXECUTIVE OBSERVER (CORP_VIEWER)</option>
              </select>
            </div>

            {/* Organization Assignment */}
            <div className="space-y-2 p-3 bg-[#0a0a0a] border border-[#2a2a2a]">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  ORGANIZATION / ENTITY LINKAGE
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewOrg(!isNewOrg)}
                  className="text-emerald-400 text-[10px] hover:underline cursor-pointer"
                >
                  {isNewOrg ? "← Select Existing Organization" : "+ Register New Organization"}
                </button>
              </div>

              {!isNewOrg ? (
                <div>
                  <select
                    value={regOrgId}
                    onChange={(e) => setRegOrgId(e.target.value)}
                    className="w-full bg-[#141414] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-white"
                  >
                    {orgs.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} [{o.type}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[#888] block text-[9px] uppercase mb-0.5">
                      NEW ORG NAME:
                    </label>
                    <input
                      type="text"
                      required
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="e.g. Bharat Solar Foundation"
                      className="w-full bg-[#141414] border border-[#444] text-white px-2 py-1.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#888] block text-[9px] uppercase mb-0.5">
                      ORG TYPE:
                    </label>
                    <select
                      value={newOrgType}
                      onChange={(e) => setNewOrgType(e.target.value)}
                      className="w-full bg-[#141414] border border-[#444] text-white px-2 py-1.5 text-xs outline-none"
                    >
                      <option value="CORPORATE">CORPORATE ENTERPRISE</option>
                      <option value="NGO">NON-GOVERNMENTAL ORGANIZATION (NGO)</option>
                      <option value="ASSESSOR">STATUTORY AUDIT / IMPACT FIRM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>REGISTER ACCOUNT &amp; INITIALIZE SESSION</span>
            </button>
          </form>
        )}

        {/* Security Footer Notice */}
        <div className="pt-3 border-t border-[#262626] text-[10px] text-[#666] flex items-center justify-between">
          <span>COMPLIANT UNDER MCA CSR RULES 2014</span>
          <span className="text-[#888]">SESSION TOKEN: HTTPONLY COOKIE</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#101010] flex items-center justify-center text-[#8e9192] font-code text-xs">
          <span>INITIALIZING AUTHENTICATION VAULT...</span>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
