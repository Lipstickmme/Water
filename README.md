# Water Water

A global water-safety and plastic-free free-water platform, built as a static website (no build step).

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

Map tiles (OpenStreetMap) and place search (Nominatim) need an internet connection. Coordinate search (`51.50, -0.12`) works offline.

## Modules

| # | Module | Where |
|---|--------|-------|
| 1 | Global water quality map: heat layer, street-level zoom, site-type filters, ZIP/city/coordinate search, "Data Pending: Not Yet Locally Sampled" status, and the nearest tested source by geodesic distance (Vincenty, WGS-84) | `js/map.js`, `js/geo.js` |
| 2 | Toxicological database: guideline limits, acute and chronic effects, and a contaminant × body-system matrix | `js/data.js` (`CONTAMINANTS`) |
| 3 | Scarcity and potability index: Critical Risk, Water Scarce, Safe Havens | `js/data.js` (`POTABILITY`) |
| 4 | Remediation: RO, desalination, phytoremediation, rainwater harvesting, and a treatment recommender | `index.html`, `js/app.js` |
| 5 | Packaging analysis: glass vs carton vs PET | `index.html` |
| 6 | Free-water model: ad-revenue simulator, account-strength tiering, crowdfunded relief ledger | `js/app.js` |

## Data status

- **Sample points are demo data.** The locations are real places, but the readings are illustrative. Before launch, swap in live feeds. `js/sources.js` has a USGS/EPA Water Quality Portal adapter and a scoring function that turns readings into the 0–100 contamination index.
- **The relief ledger is a demo.** Pledges are stored in `localStorage` and no payment is processed.
- The economics assumptions (unit costs, impressions per post) are constants at the top of the simulator code in `js/app.js`.

## Third-party

- [Leaflet](https://leafletjs.com) 1.9.4 (BSD-2) and [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) 0.2.0 are vendored in `vendor/`.
