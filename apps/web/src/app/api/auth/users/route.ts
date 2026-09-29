import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET() {
  try {
    const users = store.getUsers();
    const orgs = store.getOrgs();

    const enriched = users.map((u) => {
      const org = orgs.find((o) => o.id === u.orgId);
      return {
        ...u,
        orgName: org?.name || "Corporate Enterprise",
        orgType: org?.type || "CORPORATE"
      };
    });

    return NextResponse.json({ users: enriched, count: enriched.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}
