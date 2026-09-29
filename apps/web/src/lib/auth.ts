import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { store } from "@pluribus/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pluribus_statutory_jwt_secret_key_32_bytes_min!"
);

export const COOKIE_NAME = "pluribus_session";

export interface UserSessionPayload {
  userId: string;
  name: string;
  email?: string;
  role: string;
  orgId: string;
  orgName: string;
  orgType: string;
  reusableData: {
    lastProjectId?: string;
    preferredSiteId?: string;
    recentSearches?: string[];
    tenantName?: string;
    customFilters?: Record<string, any>;
  };
}

/**
 * Sign a new JWT with user identity and reusable session data.
 */
export async function createSessionToken(payload: UserSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an existing JWT token.
 */
export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Extract session payload from an incoming Next.js Request.
 */
export async function getSessionFromRequest(req: Request): Promise<UserSessionPayload | null> {
  // Check cookie header
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  let token = match ? match.substring(COOKIE_NAME.length + 1) : null;

  // Fallback to Authorization: Bearer
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Server Component / Server Action cookie extractor.
 */
export async function getServerSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Helper to generate Set-Cookie header string for responses.
 */
export function buildSessionCookieHeader(token: string, maxAgeSeconds: number = 7 * 24 * 3600): string {
  const isProduction = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${
    isProduction ? "; Secure" : ""
  }`;
}

/**
 * Helper to generate clear-cookie header string for logout.
 */
export function buildLogoutCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
