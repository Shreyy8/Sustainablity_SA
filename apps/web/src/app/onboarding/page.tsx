"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  ShieldCheck,
  FileCheck2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  User,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Globe
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SCHEDULE_VII_SECTORS = [
  { id: "wash", name: "Item (i): Eradicating Hunger, Poverty, WASH & Safe Drinking Water" },
  { id: "education", name: "Item (ii): Promoting Quality Education, BALA Classrooms & Skills" },
  { id: "gender", name: "Item (iii): Gender Equality & Women Empowerment" },
  { id: "environment", name: "Item (iv): Environmental Sustainability, Afforestation & Agroforestry" },
  { id: "heritage", name: "Item (v): Protection of National Heritage & Culture" },
  { id: "health", name: "Item (i/xii): Rural Health Infrastructure & Disaster Management" }
];

const INDIAN_STATES = [
  "Rajasthan",
  "Maharashtra",
  "Bihar",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Odisha",
  "Jharkhand",
  "Gujarat",
  "Karnataka",
  "Tamil Nadu",
  "West Bengal",
  "Assam"
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [entityType, setEntityType] = useState<"CORPORATE" | "NGO" | "ASSESSOR">("CORPORATE");
  const [orgName, setOrgName] = useState("");
  const [cin, setCin] = useState("");
  const [darpanId, setDarpanId] = useState("");
  const [csr1Number, setCsr1Number] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [section12A, setSection12A] = useState("");
  const [section80G, setSection80G] = useState("");
  const [fcraStatus, setFcraStatus] = useState("NOT_APPLICABLE");
  const [annualBudgetInr, setAnnualBudgetInr] = useState("25000000");

  const [selectedSectors, setSelectedSectors] = useState<string[]>([
    "Item (i): Eradicating Hunger, Poverty, WASH & Safe Drinking Water",
    "Item (iv): Environmental Sustainability, Afforestation & Agroforestry"
  ]);
  const [selectedStates, setSelectedStates] = useState<string[]>(["Rajasthan", "Maharashtra"]);

  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("Head of Sustainability & CSR");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeDeclaration, setAgreeDeclaration] = useState(true);

  const toggleSector = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter((s) => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const toggleState = (st: string) => {
    if (selectedStates.includes(st)) {
      setSelectedStates(selectedStates.filter((s) => s !== st));
    } else {
      setSelectedStates([...selectedStates, st]);
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!orgName.trim()) {
        setError("Please enter the official legal name of your entity.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (entityType === "CORPORATE" && cin.trim().length > 0 && cin.trim().length < 21) {
        setError("Valid Corporate Identification Number (CIN) must be 21 alphanumeric characters.");
        return;
      }
      if (entityType === "NGO" && !csr1Number.trim() && !darpanId.trim()) {
        setError("Please provide either your NITI Aayog NGO Darpan ID or MCA Form CSR-1 number.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedSectors.length === 0) {
        setError("Please select at least one Schedule VII sector focus.");
        return;
      }
      if (selectedStates.length === 0) {
        setError("Please select at least one state of operation.");
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!contactName.trim() || !contactEmail.trim() || !password) {
      setError("Please complete all required authorized signatory credentials.");
      return;
    }
    if (!agreeDeclaration) {
      setError("You must certify the statutory declaration before proceeding.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orgs/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          orgName,
          cin: entityType === "CORPORATE" ? cin : undefined,
          darpanId: entityType === "NGO" ? darpanId : undefined,
          csr1Number: entityType === "NGO" ? csr1Number : undefined,
          pan,
          gstin: entityType === "CORPORATE" ? gstin : undefined,
          section12A: entityType === "NGO" ? section12A : undefined,
          section80G: entityType === "NGO" ? section80G : undefined,
          fcraStatus,
          sectors: selectedSectors,
          states: selectedStates,
          annualBudgetInr: Number(annualBudgetInr) || 0,
          contactName,
          contactEmail,
          contactPhone,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Onboarding failed. Please review your details.");
        return;
      }

      setSuccess(true);
      await refreshSession();
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Network error submitting onboarding request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#e2e2e2] font-code py-8 px-4 md:px-8 flex flex-col items-center">
      {/* Brand Header */}
      <div className="w-full max-w-3xl flex items-center justify-between border-b border-[#333] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-emerald-400" />
          <div>
            <h1 className="text-white font-bold text-base uppercase tracking-wider">
              PLURIBUS // ENTITY ONBOARDING &amp; STATUTORY KYC
            </h1>
            <p className="text-[11px] text-[#8e9192]">
              COMPANIES ACT 2013 (SEC-135) &bull; MCA FORM CSR-1 &bull; NITI AAYOG NGO DARPAN
            </p>
          </div>
        </div>
        <Link
          href="/community"
          className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#8e9192] hover:text-white border border-[#333] px-2.5 py-1 bg-[#161616]"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>OPEN COMMUNITY DATA</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-3xl bg-[#141414] border border-[#333] shadow-2xl p-6 md:p-8 space-y-6">
        {/* Progress Tracker */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold pb-4 border-b border-[#282828]">
          <div className={`p-2 border ${step === 1 ? "border-emerald-400 bg-emerald-950/40 text-emerald-300" : step > 1 ? "border-emerald-800 text-emerald-500" : "border-[#333] text-[#666]"}`}>
            01. ENTITY TYPE
          </div>
          <div className={`p-2 border ${step === 2 ? "border-emerald-400 bg-emerald-950/40 text-emerald-300" : step > 2 ? "border-emerald-800 text-emerald-500" : "border-[#333] text-[#666]"}`}>
            02. STATUTORY KYC
          </div>
          <div className={`p-2 border ${step === 3 ? "border-emerald-400 bg-emerald-950/40 text-emerald-300" : step > 3 ? "border-emerald-800 text-emerald-500" : "border-[#333] text-[#666]"}`}>
            03. SECTORS &amp; STATES
          </div>
          <div className={`p-2 border ${step === 4 ? "border-emerald-400 bg-emerald-950/40 text-emerald-300" : "border-[#333] text-[#666]"}`}>
            04. SIGNATORY AUTH
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-700/80 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-600 text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>ONBOARDING COMPLETED &bull; AUTHENTIC SESSION ESTABLISHED</span>
            </div>
            <p>
              Your organization and authorized administrator profile have been registered with verified statutory status. Redirecting to your operational command center...
            </p>
          </div>
        )}

        {/* STEP 1: ENTITY CLASSIFICATION */}
        {step === 1 && !success && (
          <div className="space-y-6">
            <div>
              <label className="text-[#8e9192] block uppercase text-[11px] mb-2 font-bold">
                SELECT ORGANIZATIONAL CLASSIFICATION:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setEntityType("CORPORATE")}
                  className={`p-4 border text-left cursor-pointer transition-all ${
                    entityType === "CORPORATE"
                      ? "border-emerald-400 bg-emerald-950/30 text-white"
                      : "border-[#333] bg-[#1a1a1a] text-[#8e9192] hover:border-[#666]"
                  }`}
                >
                  <div className="font-bold text-sm text-white mb-1">CORPORATE ENTITY</div>
                  <div className="text-[10px] text-[#aaa]">
                    Funder under Companies Act Sec-135. Manages CSR grants, milestone verifications &amp; Board Form CSR-2 filings.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEntityType("NGO")}
                  className={`p-4 border text-left cursor-pointer transition-all ${
                    entityType === "NGO"
                      ? "border-emerald-400 bg-emerald-950/30 text-white"
                      : "border-[#333] bg-[#1a1a1a] text-[#8e9192] hover:border-[#666]"
                  }`}
                >
                  <div className="font-bold text-sm text-white mb-1">IMPLEMENTING AGENCY (NGO)</div>
                  <div className="text-[10px] text-[#aaa]">
                    Ground non-profit execution partner. Manages field sites, photo evidence capture &amp; project milestones.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEntityType("ASSESSOR")}
                  className={`p-4 border text-left cursor-pointer transition-all ${
                    entityType === "ASSESSOR"
                      ? "border-emerald-400 bg-emerald-950/30 text-white"
                      : "border-[#333] bg-[#1a1a1a] text-[#8e9192] hover:border-[#666]"
                  }`}
                >
                  <div className="font-bold text-sm text-white mb-1">INDEPENDENT AUDITOR</div>
                  <div className="text-[10px] text-[#aaa]">
                    Third-party social audit &amp; impact assessment agency. Conducts forensic verification, pHash checks &amp; sign-offs.
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                OFFICIAL REGISTERED LEGAL NAME:
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Reliance Foundation / Vikas Rural Sansthan"
                className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
              />
              <span className="text-[10px] text-[#666] mt-1 block">
                Must match the name registered on Ministry of Corporate Affairs or NGO Darpan.
              </span>
            </div>

            <div>
              <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                {entityType === "CORPORATE"
                  ? "ANNUAL STATUTORY CSR BUDGET (INR):"
                  : "ANNUAL PROJECT IMPLEMENTATION BUDGET (INR):"}
              </label>
              <input
                type="number"
                value={annualBudgetInr}
                onChange={(e) => setAnnualBudgetInr(e.target.value)}
                placeholder="25000000"
                className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#282828]">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <span>CONTINUE TO STATUTORY KYC</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: STATUTORY KYC & COMPLIANCE */}
        {step === 2 && !success && (
          <div className="space-y-6">
            <div className="bg-[#1b1b1b] border border-[#333] p-3 text-xs text-[#8e9192]">
              <span className="text-white font-bold block mb-1">
                REGULATORY IDENTIFIERS FOR {entityType}:
              </span>
              Under Indian law, entities deploying or receiving CSR funds require verifiable MCA and NITI Aayog registration identifiers.
            </div>

            {entityType === "CORPORATE" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                    CORPORATE IDENTIFICATION NUMBER (CIN):
                  </label>
                  <input
                    type="text"
                    value={cin}
                    onChange={(e) => setCin(e.target.value.toUpperCase())}
                    placeholder="e.g. L28920MH1945PLC004520"
                    maxLength={21}
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400 uppercase font-mono"
                  />
                  <span className="text-[10px] text-[#666] mt-1 block">
                    21-character alphanumeric identifier issued by MCA.
                  </span>
                </div>

                <div>
                  <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                    CORPORATE GSTIN:
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 27AAACT2727Q1ZW"
                    maxLength={15}
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400 uppercase font-mono"
                  />
                </div>
              </div>
            )}

            {entityType === "NGO" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                      NITI AAYOG NGO DARPAN ID:
                    </label>
                    <input
                      type="text"
                      value={darpanId}
                      onChange={(e) => setDarpanId(e.target.value.toUpperCase())}
                      placeholder="e.g. RJ/2022/029148"
                      className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                      MCA FORM CSR-1 NUMBER:
                    </label>
                    <input
                      type="text"
                      value={csr1Number}
                      onChange={(e) => setCsr1Number(e.target.value.toUpperCase())}
                      placeholder="e.g. CSR00019283"
                      className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400 uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                      SECTION 12A REGISTRATION NO.:
                    </label>
                    <input
                      type="text"
                      value={section12A}
                      onChange={(e) => setSection12A(e.target.value)}
                      placeholder="e.g. AABTG1234FE20214"
                      className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                      SECTION 80G APPROVAL NO.:
                    </label>
                    <input
                      type="text"
                      value={section80G}
                      onChange={(e) => setSection80G(e.target.value)}
                      placeholder="e.g. AABTG1234FD20217"
                      className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                    FOREIGN CONTRIBUTION (FCRA) STATUS:
                  </label>
                  <select
                    value={fcraStatus}
                    onChange={(e) => setFcraStatus(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                  >
                    <option value="NOT_APPLICABLE">Not Applicable (Domestic Funds Only)</option>
                    <option value="REGISTERED">Active FCRA Registration (Eligible for Global Grants)</option>
                    <option value="EXEMPTED">Exempted Organization</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                PERMANENT ACCOUNT NUMBER (PAN):
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="e.g. AABCT1234K"
                maxLength={10}
                className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400 uppercase font-mono"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-[#282828]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-[#222] hover:bg-[#333] border border-[#444] text-white px-4 py-2 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <span>CONTINUE TO SECTORS &amp; GEOGRAPHY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SECTORS & GEOGRAPHIC FOOTPRINT */}
        {step === 3 && !success && (
          <div className="space-y-6">
            <div>
              <label className="text-[#8e9192] block uppercase text-[11px] mb-2 font-bold">
                PRIMARY SCHEDULE VII STATUTORY FOCUS AREAS:
              </label>
              <div className="space-y-2">
                {SCHEDULE_VII_SECTORS.map((sec) => {
                  const checked = selectedSectors.includes(sec.name);
                  return (
                    <div
                      key={sec.id}
                      onClick={() => toggleSector(sec.name)}
                      className={`p-2.5 border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        checked
                          ? "border-emerald-400 bg-emerald-950/20 text-white font-bold"
                          : "border-[#333] bg-[#1a1a1a] text-[#8e9192] hover:text-white"
                      }`}
                    >
                      <span>{sec.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 border ${checked ? "border-emerald-400 text-emerald-300 bg-emerald-950" : "border-[#444] text-[#666]"}`}>
                        {checked ? "SELECTED" : "ADD"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[#8e9192] block uppercase text-[11px] mb-2 font-bold">
                OPERATIONAL STATES &amp; DISTRICTS:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INDIAN_STATES.map((st) => {
                  const selected = selectedStates.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleState(st)}
                      className={`p-2 border text-xs text-left cursor-pointer transition-colors ${
                        selected
                          ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold"
                          : "border-[#333] bg-[#181818] text-[#8e9192] hover:text-white"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#282828]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#222] hover:bg-[#333] border border-[#444] text-white px-4 py-2 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <span>CONTINUE TO SIGNATORY AUTH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SIGNATORY CREDENTIALS & SUBMISSION */}
        {step === 4 && !success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1b1b1b] border border-[#333] p-3 text-xs text-[#8e9192]">
              <span className="text-white font-bold block mb-1">
                AUTHORIZED ADMINISTRATOR &amp; SIGNATORY CREDENTIALS:
              </span>
              This profile will hold primary administrative rights, manage permissions, and execute cryptographic sign-offs.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                  SIGNATORY FULL NAME:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Verma"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                  OFFICIAL DESIGNATION:
                </label>
                <input
                  type="text"
                  required
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  placeholder="e.g. Executive Director / CSR Lead"
                  className="w-full bg-[#0a0a0a] border border-[#444] text-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                  OFFICIAL CORPORATE / NGO EMAIL:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. rajesh@tatatrust.org"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                  CONTACT NUMBER / WHATSAPP:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[#8e9192] block uppercase text-[11px] mb-1 font-bold">
                ACCOUNT PASSWORD:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0a0a] border border-[#444] text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Statutory Self-Declaration */}
            <div className="bg-[#0e0e0e] border border-[#333] p-3 text-xs space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeDeclaration}
                  onChange={(e) => setAgreeDeclaration(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-[#aaa] leading-relaxed">
                  I hereby certify that the statutory registration numbers and entity details provided are authentic, that the organization is not blacklisted by the Ministry of Corporate Affairs or NITI Aayog, and agree to uphold the verification policies under Pluribus SEC-135 Statutory Vault.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#282828]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#222] hover:bg-[#333] border border-[#444] text-white px-4 py-2 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 font-bold uppercase transition-colors flex items-center gap-2 cursor-pointer text-xs"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>COMPLETE ONBOARDING &amp; INITIALIZE VAULT</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
