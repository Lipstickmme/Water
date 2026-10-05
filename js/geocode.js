/*
 * Place lookup. Photon (komoot) powers type-ahead suggestions; Nominatim
 * resolves a submitted query to a boundary and its country/state. Both are
 * built on OpenStreetMap. For production traffic, self-host or use a paid
 * provider: the public instances are rate-limited.
 */
const Geocode = (() => {
  const PHOTON = 'https://photon.komoot.io/api/';
  const NOMINATIM = 'https://nominatim.openstreetmap.org';

  function photonLabel(p) {
    const line1 = [p.housenumber && p.street ? `${p.street} ${p.housenumber}` : p.street, p.name]
      .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
    const line2 = [p.postcode, p.city || p.county, p.state, p.country].filter(Boolean)
      .filter(v => v !== p.name).join(', ');
    return { main: line1 || line2, sub: line1 ? line2 : '' };
  }

  async function suggest(q, signal) {
    const res = await fetch(`${PHOTON}?limit=6&lang=en&q=${encodeURIComponent(q)}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { features } = await res.json();
    return features.map(f => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      const ext = p.extent; // [minLon, maxLat, maxLon, minLat]
      return {
        ...photonLabel(p),
        kind: p.osm_value || p.type,
        lat, lng,
        cc: (p.countrycode || '').toLowerCase(),
        state: p.state || '',
        bbox: ext ? [ext[3], ext[1], ext[0], ext[2]] : null, // south, north, west, east
      };
    });
  }

  function fromNominatim(hit) {
    const a = hit.address || {};
    return {
      label: hit.display_name,
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      cc: (a.country_code || '').toLowerCase(),
      state: a.state || a.region || a.state_district || '',
      bbox: hit.boundingbox ? hit.boundingbox.map(Number) : null, // south, north, west, east
      shape: hit.geojson && hit.geojson.type !== 'Point' ? hit.geojson : null,
    };
  }

  async function lookup(q) {
    const url = `${NOMINATIM}/search?format=jsonv2&limit=1&addressdetails=1&polygon_geojson=1&polygon_threshold=0.0005&q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [hit] = await res.json();
    return hit ? fromNominatim(hit) : null;
  }

  async function reverse(lat, lng) {
    const res = await fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&zoom=14&lat=${lat}&lon=${lng}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const hit = await res.json();
    if (hit.error) return null;
    const place = fromNominatim(hit);
    // Keep the exact point the user asked about, not the snapped feature.
    return { ...place, lat, lng, bbox: null, shape: null };
  }

  return { suggest, lookup, reverse };
})();
