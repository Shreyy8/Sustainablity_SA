import { NextResponse } from "next/server";
import { store } from "@saakshi/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = store.getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const sites = store.getSites(id);
  const assets = store.getAssets({ projectId: id });

  const features: any[] = [];

  // 1. Site Polygons
  for (const s of sites) {
    // GeoJSON coordinates are [lon, lat]
    const polygonCoords = s.geofence.map(([lat, lon]) => [lon, lat]);
    // Close the polygon ring
    if (polygonCoords.length > 0) {
      polygonCoords.push(polygonCoords[0]);
    }

    features.push({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [polygonCoords]
      },
      properties: {
        type: "site",
        id: s.id,
        name: s.name,
        centroid: s.centroid
      }
    });
  }

  // 2. Asset Points
  for (const a of assets) {
    if (a.location) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [a.location.longitude, a.location.latitude]
        },
        properties: {
          type: "asset",
          id: a.id,
          shortId: a.shortId,
          caption: a.caption,
          trustScore: a.trustScore,
          trustBand: a.trustBand,
          capturedAt: a.capturedAt,
          thumbnailUrl: a.secureUrl,
          siteId: a.siteId
        }
      });
    }
  }

  return NextResponse.json({
    type: "FeatureCollection",
    project: {
      id: project.id,
      name: project.name,
      state: project.state,
      district: project.district
    },
    features
  });
}
