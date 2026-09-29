import { NextResponse } from "next/server";
import { store } from "@pluribus/db";
import { createSessionToken, buildSessionCookieHeader, UserSessionPayload } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, reusableData } = body;

    const users = store.getUsers();
    let user = users.find((u) => u.id === userId || (email && u.email === email));

    // Default to primary administrator if not specified
    if (!user) {
      user = users[0];
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const org = store.getOrgById(user.orgId);

    const payload: UserSessionPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      orgName: org?.name || "Corporate Enterprise",
      orgType: org?.type || "CORPORATE",
      reusableData: {
        tenantName: org?.name || "Corporate Enterprise",
        lastProjectId: reusableData?.lastProjectId,
        preferredSiteId: reusableData?.preferredSiteId,
        recentSearches: reusableData?.recentSearches || [],
        customFilters: reusableData?.customFilters || {}
      }
    };

    const token = await createSessionToken(payload);
    const cookieHeader = buildSessionCookieHeader(token);

    const res = NextResponse.json({
      success: true,
      token,
      user: payload
    });

    res.headers.set("Set-Cookie", cookieHeader);
    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
