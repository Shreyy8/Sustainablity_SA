/**
 * Calculate the Haversine distance between two coordinates in meters.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks whether a given point [lat, lon] is inside a polygon [[lat, lon], ...]
 * using the Ray-Casting algorithm.
 */
export function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  if (!polygon || polygon.length < 3) return false;

  const [lat, lon] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > lon !== yj > lon &&
      lat < ((xj - xi) * (lon - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate approximate minimum distance in meters from a point [lat, lon]
 * to a polygon [[lat, lon], ...].
 * Returns 0 if the point is inside the polygon.
 */
export function distanceToPolygon(
  point: [number, number],
  polygon: [number, number][]
): number {
  if (!polygon || polygon.length === 0) return Infinity;
  if (pointInPolygon(point, polygon)) return 0;

  let minDistance = Infinity;
  const [pLat, pLon] = point;

  for (let i = 0; i < polygon.length; i++) {
    const [lat1, lon1] = polygon[i];
    const [lat2, lon2] = polygon[(i + 1) % polygon.length];

    // Distance to edge vertices
    const d1 = haversineDistance(pLat, pLon, lat1, lon1);
    if (d1 < minDistance) minDistance = d1;

    // Approximate distance to midpoint of edge
    const midLat = (lat1 + lat2) / 2;
    const midLon = (lon1 + lon2) / 2;
    const dMid = haversineDistance(pLat, pLon, midLat, midLon);
    if (dMid < minDistance) minDistance = dMid;
  }

  return minDistance;
}
