import { distanceToPolygon } from "../../geo/distance.js";
import type { CheckResult } from "./duplicate.js";

export interface GeofenceCheckSite {
  id: string;
  name: string;
  geofence?: [number, number][]; // [[lat, lon], ...]
}

export interface GeofenceCheckLocation {
  latitude?: number;
  longitude?: number;
}

export function geofenceCheck(
  site: GeofenceCheckSite | null | undefined,
  location: GeofenceCheckLocation | null | undefined
): CheckResult | null {
  if (!location || location.latitude === undefined || location.longitude === undefined) {
    return {
      id: "geofence",
      penalty: 15,
      severity: "warning",
      reason: "Missing geolocation: image was uploaded without GPS coordinates",
      evidence: { hasLocation: false }
    };
  }

  if (!site || !site.geofence || site.geofence.length < 3) {
    // If site has no polygon defined yet, no penalty
    return null;
  }

  const point: [number, number] = [location.latitude, location.longitude];
  const dist = distanceToPolygon(point, site.geofence);

  // 0 - 200m buffer allows normal GPS drift in rural areas
  if (dist <= 200) {
    return null;
  }

  if (dist <= 1000) {
    const metersRounded = Math.round(dist);
    return {
      id: "geofence",
      penalty: 10,
      severity: "warning",
      reason: `Slight geofence deviation: capture point is ${metersRounded}m outside designated site boundary '${site.name}'`,
      evidence: { distanceMeters: dist, siteName: site.name }
    };
  }

  const kmRounded = (dist / 1000).toFixed(1);
  return {
    id: "geofence",
    penalty: 25,
    severity: "critical",
    reason: `Major geofence breach: capture point is ${kmRounded}km outside designated site boundary '${site.name}'`,
    evidence: { distanceMeters: dist, siteName: site.name }
  };
}
