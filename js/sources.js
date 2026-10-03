/*
 * Live data adapters (not wired in by default).
 *
 * The map runs on the demo SAMPLE_POINTS dataset. These adapters show the
 * shape a live feed must be normalised into ({ id, name, type, lat, lng,
 * index, sampled, readings }) so it can replace the demo data.
 *
 * - USGS / EPA Water Quality Portal (waterqualitydata.us): open, no key,
 *   CSV/GeoJSON station + result endpoints. Good US coverage.
 * - UNEP GEMS/Water (GEMStat): global river/lake station data; bulk access
 *   is by request, so it is best ingested server-side on a schedule.
 */
const Sources = (() => {
  const WQP = 'https://www.waterqualitydata.us/data';

  // Stations inside a bounding box [west, south, east, north].
  async function wqpStations(bbox) {
    const url = `${WQP}/Station/search?bBox=${bbox.join(',')}&mimeType=geojson&siteType=Stream&siteType=Well&siteType=Lake%2C%20Reservoir%2C%20Impoundment`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WQP stations: HTTP ${res.status}`);
    const geo = await res.json();
    return geo.features.map(f => ({
      id: f.properties.MonitoringLocationIdentifier,
      name: f.properties.MonitoringLocationName,
      type: /well/i.test(f.properties.MonitoringLocationTypeName) ? 'well' : 'river',
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      index: null, // scored once results are fetched
      sampled: null,
      readings: {},
    }));
  }

  // Score readings against guideline values: each contaminant contributes its
  // exceedance ratio; the index saturates at 100.
  const LIMITS = { lead: 10, arsenic: 10, mercury: 6, cadmium: 3, pfas: 4, fluoride: 1.5, nitrate: 50, e_coli: 1, microplastics: 50 };
  function scoreReadings(readings) {
    let worst = 0;
    for (const [k, v] of Object.entries(readings)) {
      if (v === 'detected') { worst = Math.max(worst, 2); continue; }
      if (LIMITS[k] && typeof v === 'number') worst = Math.max(worst, v / LIMITS[k]);
    }
    return Math.min(100, Math.round(worst <= 1 ? worst * 50 : 50 + Math.log10(worst) * 35));
  }

  return { wqpStations, scoreReadings };
})();
