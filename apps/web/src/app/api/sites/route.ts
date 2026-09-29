import { NextResponse } from "next/server";
import { store } from "@pluribus/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const sites = store.getSites(projectId);
    return NextResponse.json({ sites, count: sites.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch sites" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, name, centroid, radiusMeters } = body;

    if (!projectId || !name || !centroid) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, name, centroid [lat, lng]" },
        { status: 400 }
      );
    }

    const lat = Number(centroid[0]);
    const lng = Number(centroid[1]);
    const radius = radiusMeters ? Number(radiusMeters) : 500;
    // rough conversion: 1 deg lat ~ 111,000m
    const degDelta = radius / 111000;

    const newSite = store.insertSite({
      id: `site-${Date.now().toString(36)}`,
      projectId,
      name,
      centroid: [lat, lng],
      geofence: [
        [lat - degDelta, lng - degDelta],
        [lat - degDelta, lng + degDelta],
        [lat + degDelta, lng + degDelta],
        [lat + degDelta, lng - degDelta]
      ]
    });

    return NextResponse.json({ success: true, site: newSite });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create site" }, { status: 500 });
  }
}
