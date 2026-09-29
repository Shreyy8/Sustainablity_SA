import { NextResponse } from "next/server";
import { store } from "@pluribus/db";
import { createSessionToken, buildSessionCookieHeader, UserSessionPayload } from "@/lib/auth";
import type { UserRole, OrgType } from "@pluribus/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, orgId, newOrgName, newOrgType, phone, language } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please provide a valid full name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = store.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }

    // Resolve Organization
    let targetOrgId = orgId;
    let targetOrgName = "Enterprise Corporate";
    let targetOrgType: OrgType = "CORPORATE";

    if (newOrgName && typeof newOrgName === "string" && newOrgName.trim().length > 0) {
      const trimmedOrg = newOrgName.trim();
      const generatedOrgId = `org-${Date.now()}`;
      const slug = trimmedOrg.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const resolvedType: OrgType =
        newOrgType === "NGO" || newOrgType === "ASSESSOR" ? newOrgType : "CORPORATE";

      const createdOrg = store.insertOrg({
        id: generatedOrgId,
        name: trimmedOrg,
        slug,
        type: resolvedType,
        createdAt: new Date().toISOString()
      });

      targetOrgId = createdOrg.id;
      targetOrgName = createdOrg.name;
      targetOrgType = createdOrg.type;
    } else if (orgId) {
      const org = store.getOrgById(orgId);
      if (org) {
        targetOrgId = org.id;
        targetOrgName = org.name;
        targetOrgType = org.type;
      }
    } else {
      // Default to primary corporate org
      const orgs = store.getOrgs();
      if (orgs.length > 0) {
        targetOrgId = orgs[0].id;
        targetOrgName = orgs[0].name;
        targetOrgType = orgs[0].type;
      }
    }

    // Resolve Role
    const validRoles: UserRole[] = ["CORP_ADMIN", "NGO_ADMIN", "FIELD", "ASSESSOR", "CORP_VIEWER"];
    const resolvedRole: UserRole = validRoles.includes(role as UserRole)
      ? (role as UserRole)
      : targetOrgType === "NGO"
      ? "NGO_ADMIN"
      : targetOrgType === "ASSESSOR"
      ? "ASSESSOR"
      : "CORP_ADMIN";

    // Insert user into store
    const newUserId = `user-${Date.now()}`;
    const newUser = store.insertUser({
      id: newUserId,
      orgId: targetOrgId,
      role: resolvedRole,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || undefined,
      language: language || "en",
      password
    });

    // Create session token payload
    const sessionPayload: UserSessionPayload = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      orgId: targetOrgId,
      orgName: targetOrgName,
      orgType: targetOrgType,
      reusableData: {
        tenantName: targetOrgName,
        recentSearches: [],
        customFilters: {}
      }
    };

    const token = await createSessionToken(sessionPayload);
    const cookieHeader = buildSessionCookieHeader(token);

    const res = NextResponse.json({
      success: true,
      message: "Registration successful. Session established.",
      token,
      user: sessionPayload
    });

    res.headers.set("Set-Cookie", cookieHeader);
    return res;
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to complete registration" },
      { status: 500 }
    );
  }
}
