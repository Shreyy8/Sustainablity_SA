import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET() {
  try {
    const orgs = store.getOrgs();
    const grants = store.getGrants();
    return NextResponse.json({ orgs, grants });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch organizations" }, { status: 500 });
  }
}
