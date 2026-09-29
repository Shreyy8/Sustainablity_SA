import { NextResponse } from "next/server";
import { store } from "@pluribus/db";
import {
  getSessionFromRequest,
  createSessionToken,
  buildSessionCookieHeader,
  buildLogoutCookieHeader,
  UserSessionPayload
} from "@/lib/auth";

export async function GET(req: Request) {
  try {
    let session = await getSessionFromRequest(req);

    // If no existing session, establish default session
    if (!session) {
      const users = store.getUsers();
      const defaultUser = users[0];
      const org = defaultUser ? store.getOrgById(defaultUser.orgId) : undefined;

      session = {
        userId: defaultUser?.id || "user-corp-1",
        name: defaultUser?.name || "Arjun Mehta (CSR Head)",
        email: defaultUser?.email || "arjun.mehta@tatatrust.org",
        role: defaultUser?.role || "CORP_ADMIN",
        orgId: defaultUser?.orgId || "org-corp-1",
        orgName: org?.name || "Tata Sustainability Trust",
        orgType: org?.type || "CORPORATE",
        reusableData: {
          tenantName: org?.name || "Tata Sustainability Trust",
          recentSearches: ["water purification barmer", "solar installation"],
          customFilters: {}
        }
      };

      const token = await createSessionToken(session);
      const res = NextResponse.json({ authenticated: true, session });
      res.headers.set("Set-Cookie", buildSessionCookieHeader(token));
      return res;
    }

    return NextResponse.json({ authenticated: true, session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to get session" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No active session" }, { status: 401 });
    }

    const body = await req.json();
    const updatedReusableData = {
      ...session.reusableData,
      ...body.reusableData
    };

    const updatedSession: UserSessionPayload = {
      ...session,
      ...body.user,
      reusableData: updatedReusableData
    };

    const token = await createSessionToken(updatedSession);
    const res = NextResponse.json({
      success: true,
      session: updatedSession
    });

    res.headers.set("Set-Cookie", buildSessionCookieHeader(token));
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.headers.set("Set-Cookie", buildLogoutCookieHeader());
  return res;
}
