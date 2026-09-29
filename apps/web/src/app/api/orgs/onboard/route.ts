import { NextResponse } from "next/server";
import { store } from "@pluribus/db";
import type { OrgType, UserRole } from "@pluribus/db";
import { createSessionToken, buildSessionCookieHeader, UserSessionPayload } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      entityType,
      orgName,
      cin,
      darpanId,
      csr1Number,
      pan,
      gstin,
      section12A,
      section80G,
      fcraStatus,
      sectors,
      states,
      annualBudgetInr,
      contactName,
      contactEmail,
      contactPhone,
      password
    } = body;

    // Basic Validation
    if (!orgName || typeof orgName !== "string" || orgName.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a valid official organization name." }, { status: 400 });
    }
    if (!contactName || !contactEmail || !contactEmail.includes("@")) {
      return NextResponse.json({ error: "Valid representative contact name and email are required." }, { status: 400 });
    }

    const cleanEmail = contactEmail.trim().toLowerCase();
    const existingUser = store.getUserByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in or use an alternative email." },
        { status: 409 }
      );
    }

    // Role and Type resolution
    const resolvedType: OrgType =
      entityType === "NGO" ? "NGO" : entityType === "ASSESSOR" ? "ASSESSOR" : "CORPORATE";

    const resolvedRole: UserRole =
      resolvedType === "NGO" ? "NGO_ADMIN" : resolvedType === "ASSESSOR" ? "ASSESSOR" : "CORP_ADMIN";

    const orgId = `org-${Date.now()}`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newOrg = store.insertOrg({
      id: orgId,
      name: orgName.trim(),
      slug,
      type: resolvedType,
      createdAt: new Date().toISOString(),
      cin: cin?.trim() || undefined,
      darpanId: darpanId?.trim() || undefined,
      csr1Number: csr1Number?.trim() || undefined,
      pan: pan?.trim() || undefined,
      gstin: gstin?.trim() || undefined,
      section12A: section12A?.trim() || undefined,
      section80G: section80G?.trim() || undefined,
      fcraStatus: fcraStatus || "NOT_APPLICABLE",
      sectors: Array.isArray(sectors) ? sectors : [],
      states: Array.isArray(states) ? states : [],
      annualBudgetInr: Number(annualBudgetInr) || 0,
      contactName: contactName.trim(),
      contactEmail: cleanEmail,
      contactPhone: contactPhone?.trim() || undefined,
      complianceStatus: "verified"
    });

    const userId = `user-${Date.now()}`;
    const newUser = store.insertUser({
      id: userId,
      orgId: newOrg.id,
      role: resolvedRole,
      name: contactName.trim(),
      email: cleanEmail,
      phone: contactPhone?.trim() || undefined,
      language: "en",
      password: password || "Pluribus#2026"
    });

    // Establish JWT session
    const payload: UserSessionPayload = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      orgId: newOrg.id,
      orgName: newOrg.name,
      orgType: newOrg.type,
      reusableData: {
        tenantName: newOrg.name,
        recentSearches: [],
        customFilters: {}
      }
    };

    const token = await createSessionToken(payload);
    const res = NextResponse.json({
      success: true,
      org: newOrg,
      user: payload,
      message: "Organization onboarded and statutory profile registered successfully."
    });

    res.headers.set("Set-Cookie", buildSessionCookieHeader(token));
    return res;
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: err.message || "Failed to process firm onboarding" }, { status: 500 });
  }
}
