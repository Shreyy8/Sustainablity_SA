import { NextResponse } from "next/server";
import { store } from "@pluribus/db";
import { createSessionToken, buildSessionCookieHeader, UserSessionPayload } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, password, reusableData } = body;

    const users = store.getUsers();
    let user: any = undefined;

    if (email) {
      user = store.getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: "No user found with this email address. Please register an account." },
          { status: 401 }
        );
      }

      // Check password if set on user
      if (user.password && password && user.password !== password) {
        return NextResponse.json(
          { error: "Invalid password. Please check your credentials." },
          { status: 401 }
        );
      }
    } else if (userId) {
      user = store.getUserById(userId);
    } else {
      user = users[0];
    }

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
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
