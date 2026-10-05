/*
 * Site configuration.
 *
 * Basemap: paste your raster (PNG) tile provider's API key into apiKey.
 * The key is added to the tile URL as the `key` parameter ({key} below).
 * Browser keys are visible to visitors, so restrict the key to your domain
 * in the provider's dashboard.
 *
 * With no key set, the map falls back to CARTO's keyless basemap.
 */
const MAP_CONFIG = {
  apiKey: 'cb1_4ar1_1_e5f1051f34a23d26f90b2e49',
  tileUrl: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key={key}',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',

  fallbackUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  fallbackAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

function basemapLayer() {
  if (MAP_CONFIG.apiKey) {
    return L.tileLayer(MAP_CONFIG.tileUrl, {
      key: encodeURIComponent(MAP_CONFIG.apiKey), maxZoom: 19, crossOrigin: true,
      attribution: MAP_CONFIG.attribution,
    });
  }
  return L.tileLayer(MAP_CONFIG.fallbackUrl, { subdomains: 'abcd', maxZoom: 19, attribution: MAP_CONFIG.fallbackAttribution });
}
