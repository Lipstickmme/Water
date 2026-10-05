# Water Water

Search any address, street, city or region and see what published research has found in its drinking water.

## Run it

Static site with no build step:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Needs an internet connection for map tiles and place search.

## How it works

1. **`index.html`** is a minimal, Google-style search page. Suggestions appear as you type, from [Photon](https://photon.komoot.io), which is built on OpenStreetMap. There's also a "use my location" button.
2. **`map.html`** zooms to the searched place and outlines its boundary (from [Nominatim](https://nominatim.org)). A collapsible panel lists every substance documented for that area:
   - **In this area:** the place falls inside a documented contamination hotspot (`HOTSPOTS`).
   - **Region / National:** findings for the state or country (`REGIONS`).
   - **Global:** context that applies everywhere.
3. Each finding cites its study or report and links to a web search for that exact source.

## Files

| File | Purpose |
|------|---------|
| `js/research.js` | Substances, hotspots, regional and national findings, with citations |
| `js/results.js` | Map page: resolve the place, zoom, gather and render findings |
| `js/searchbox.js` | Shared search box with type-ahead |
| `js/geocode.js` | Photon (suggestions) and Nominatim (lookup / reverse) |
| `js/learn.js` | Collapsible info panels: health, purification, packaging, free-water model |
| `js/geo.js` | Geodesic distance (Vincenty, WGS-84) |
| `js/sources.js` | Adapter for live USGS Water Quality Portal data (not wired in yet) |
| `css/style.css` | Light-blue and white theme |

## Notes

- Findings summarise published research at a regional or national scale. They are not a test of any one tap.
- The public Photon and Nominatim servers are rate-limited. Self-host them or use a paid geocoder before launch.
- Leaflet 1.9.4 (BSD-2) is vendored in `vendor/`.
