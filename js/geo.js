/*
 * Geodesic helpers for the proximity engine.
 * Distances use Vincenty's inverse formula on the WGS-84 ellipsoid, falling
 * back to the haversine great-circle distance when Vincenty fails to converge
 * (nearly antipodal points).
 */
const Geo = (() => {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const b = (1 - f) * a;
  const R = 6371008.8;
  const rad = d => (d * Math.PI) / 180;

  function haversine(lat1, lon1, lat2, lon2) {
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  // Returns metres.
  function vincenty(lat1, lon1, lat2, lon2) {
    const L = rad(lon2 - lon1);
    const U1 = Math.atan((1 - f) * Math.tan(rad(lat1)));
    const U2 = Math.atan((1 - f) * Math.tan(rad(lat2)));
    const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
    let lambda = L, lambdaP, iter = 100;
    let sinSigma, cosSigma, sigma, cosSqAlpha, cos2SigmaM;
    do {
      const sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
      sinSigma = Math.sqrt((cosU2 * sinLambda) ** 2 + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2);
      if (sinSigma === 0) return 0;
      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      sigma = Math.atan2(sinSigma, cosSigma);
      const sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma;
      cosSqAlpha = 1 - sinAlpha * sinAlpha;
      cos2SigmaM = cosSqAlpha !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha : 0;
      const C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      lambdaP = lambda;
      lambda = L + (1 - C) * f * sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iter > 0);
    if (iter === 0) return haversine(lat1, lon1, lat2, lon2);

    const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b);
    const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const deltaSigma = B * sinSigma * (cos2SigmaM + (B / 4) *
      (cosSigma * (-1 + 2 * cos2SigmaM ** 2) - (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)));
    return b * A * (sigma - deltaSigma);
  }

  function nearest(lat, lng, points) {
    let best = null;
    for (const p of points) {
      const d = vincenty(lat, lng, p.lat, p.lng);
      if (!best || d < best.distance) best = { point: p, distance: d };
    }
    return best;
  }

  function formatDistance(m) {
    if (m < 1000) return `${Math.round(m)} m`;
    if (m < 100000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m / 1000).toLocaleString()} km`;
  }

  // Accepts "lat, lng" in decimal degrees.
  function parseCoords(text) {
    const m = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/);
    if (!m) return null;
    const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return { lat, lng };
  }

  return { vincenty, haversine, nearest, formatDistance, parseCoords };
})();

if (typeof module !== 'undefined') module.exports = Geo;
