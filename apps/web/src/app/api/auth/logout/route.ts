import { NextResponse } from "next/server";
import { buildLogoutCookieHeader } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Session successfully terminated" });
  res.headers.set("Set-Cookie", buildLogoutCookieHeader());
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  res.headers.set("Set-Cookie", buildLogoutCookieHeader());
  return res;
}
