export interface LatLng {
  lat: number;
  lng: number;
}

export interface NavigationRoute {
  distanceKm: number;
  etaMinutes: number;
  points: LatLng[];
}

export function buildNavigationRoute(start: LatLng, end: LatLng): NavigationRoute {
  const distanceKm = haversineDistanceKm(start, end);
  const etaMinutes = Math.max(5, Math.round((distanceKm / 28) * 60));

  const points = interpolatePoints(start, end, 8);
  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    etaMinutes,
    points
  };
}

function interpolatePoints(start: LatLng, end: LatLng, segments: number): LatLng[] {
  const points: LatLng[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    points.push({
      lat: Number((start.lat + (end.lat - start.lat) * t).toFixed(6)),
      lng: Number((start.lng + (end.lng - start.lng) * t).toFixed(6))
    });
  }

  return points;
}

function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}
