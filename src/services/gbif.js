export async function fetchGbifOccurrences(scientificName, signal) {
  const matchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`;
  const matchRes = await fetch(matchUrl, { signal });
  if (!matchRes.ok) {
    throw new Error('GBIF species match failed');
  }

  const matchData = await matchRes.json();
  if (!matchData.usageKey) {
    throw new Error('GBIF usageKey missing');
  }

  const occUrl = `https://api.gbif.org/v1/occurrence/search?taxonKey=${matchData.usageKey}&hasCoordinate=true&limit=300`;
  const occRes = await fetch(occUrl, { signal });
  if (!occRes.ok) {
    throw new Error('GBIF occurrence request failed');
  }

  const occData = await occRes.json();
  const unique = new Set();
  const points = [];

  (occData.results ?? []).forEach((item) => {
    const lat = item.decimalLatitude;
    const lon = item.decimalLongitude;
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return;
    }

    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (unique.has(key)) {
      return;
    }

    unique.add(key);
    points.push({ lat, lon });
  });

  return {
    points,
    gbifTaxonKey: matchData.usageKey,
  };
}

export function buildRangePolygon(points) {
  if (!points || points.length < 3) {
    return null;
  }

  let minLat = 90;
  let maxLat = -90;
  let minLon = 180;
  let maxLon = -180;

  points.forEach(({ lat, lon }) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  });

  return [
    { lat: minLat, lon: minLon },
    { lat: maxLat, lon: minLon },
    { lat: maxLat, lon: maxLon },
    { lat: minLat, lon: maxLon },
    { lat: minLat, lon: minLon },
  ];
}

export function buildFallbackPoints(focus) {
  if (!focus) {
    return [];
  }

  const { lat, lon, spread = 8 } = focus;
  return Array.from({ length: 80 }).map((_, idx) => {
    const angle = (idx / 80) * Math.PI * 2;
    const ring = 0.3 + ((idx % 7) / 7) * 0.7;
    const latOffset = Math.sin(angle) * spread * ring;
    const lonOffset = Math.cos(angle) * spread * ring;
    return {
      lat: Math.max(-75, Math.min(75, lat + latOffset)),
      lon: ((lon + lonOffset + 540) % 360) - 180,
    };
  });
}
