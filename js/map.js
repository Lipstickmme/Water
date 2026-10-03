/* Module 1 — global water quality map & spatial query engine. */
const WaterMap = (() => {
  const LOCAL_RADIUS_M = 2000; // a sample within this radius counts as "locally sampled"
  let map, heat, markerLayer, searchMarker;
  const activeTypes = new Set(Object.keys(SITE_TYPES));

  const band = index => RISK_BANDS.find(b => index < b.max);

  function popupHtml(p) {
    const b = band(p.index);
    const rows = Object.entries(p.readings).map(([k, v]) => {
      const c = CONTAMINANTS.find(x => x.key === k);
      return `<tr><td>${c ? c.name : k}</td><td>${v}${typeof v === 'number' && c ? ' ' + c.unit : ''}</td></tr>`;
    }).join('');
    return `<div class="popup">
      <strong>${p.name}</strong>
      <div class="popup-meta">${SITE_TYPES[p.type]} · sampled ${p.sampled}</div>
      <div class="pill" style="--pill:${b.color}">${b.label} · index ${p.index}</div>
      ${rows ? `<table>${rows}</table>` : ''}
      <div class="popup-demo">Demo reading — illustrative only</div>
    </div>`;
  }

  function render() {
    const pts = SAMPLE_POINTS.filter(p => activeTypes.has(p.type));
    markerLayer.clearLayers();
    for (const p of pts) {
      L.circleMarker([p.lat, p.lng], {
        radius: 7, weight: 2, color: '#fff', fillColor: band(p.index).color, fillOpacity: 0.95,
      }).bindPopup(popupHtml(p)).addTo(markerLayer);
    }
    heat.setLatLngs(pts.map(p => [p.lat, p.lng, Math.max(0.05, p.index / 100)]));
  }

  async function geocode(q) {
    const coords = Geo.parseCoords(q);
    if (coords) return { ...coords, label: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` };
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': navigator.language || 'en' } });
    if (!res.ok) throw new Error(`Geocoder returned HTTP ${res.status}`);
    const [hit] = await res.json();
    if (!hit) return null;
    return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), label: hit.display_name };
  }

  function showResult(html, tone) {
    const el = document.getElementById('search-result');
    el.className = `search-result ${tone}`;
    el.innerHTML = html;
    el.hidden = false;
  }

  async function search(q) {
    if (!q.trim()) return;
    showResult('Locating…', 'neutral');
    let loc;
    try {
      loc = await geocode(q);
    } catch (e) {
      showResult(`Search is unavailable right now (${e.message}). Try coordinates, e.g. <code>51.50, -0.12</code>.`, 'warn');
      return;
    }
    if (!loc) { showResult(`No place found for “${escapeHtml(q)}”.`, 'warn'); return; }

    const hit = Geo.nearest(loc.lat, loc.lng, SAMPLE_POINTS);
    if (searchMarker) searchMarker.remove();
    searchMarker = L.marker([loc.lat, loc.lng]).addTo(map).bindPopup(escapeHtml(loc.label));

    const dist = Geo.formatDistance(hit.distance);
    const b = band(hit.point.index);
    if (hit.distance <= LOCAL_RADIUS_M) {
      map.setView([hit.point.lat, hit.point.lng], 15);
      showResult(`<strong>Locally sampled.</strong> ${escapeHtml(hit.point.name)} is ${dist} from your search —
        <span class="pill" style="--pill:${b.color}">${b.label} · index ${hit.point.index}</span>`, 'ok');
    } else {
      map.fitBounds(L.latLngBounds([[loc.lat, loc.lng], [hit.point.lat, hit.point.lng]]).pad(0.3), { maxZoom: 14 });
      L.polyline([[loc.lat, loc.lng], [hit.point.lat, hit.point.lng]], { color: '#555', dashArray: '6 6', weight: 2 })
        .addTo(markerLayer);
      showResult(`<strong>Data Pending: Not Yet Locally Sampled.</strong><br>
        Your searched location has no direct data. The closest tested water source is
        <strong>${dist}</strong> away at <strong>${escapeHtml(hit.point.name)}</strong>
        <span class="pill" style="--pill:${b.color}">${b.label} · index ${hit.point.index}</span>`, 'pending');
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function buildFilters() {
    const box = document.getElementById('type-filters');
    box.innerHTML = Object.entries(SITE_TYPES).map(([k, label]) =>
      `<label><input type="checkbox" value="${k}" checked> ${label}</label>`).join('');
    box.addEventListener('change', e => {
      if (e.target.checked) activeTypes.add(e.target.value); else activeTypes.delete(e.target.value);
      render();
    });
  }

  function buildLegend() {
    document.getElementById('legend').innerHTML = RISK_BANDS.map(b =>
      `<span><i style="background:${b.color}"></i>${b.label}</span>`).join('');
  }

  function init() {
    if (typeof L === 'undefined') {
      document.getElementById('map').innerHTML = '<p class="map-fallback">The map library failed to load.</p>';
      return;
    }
    map = L.map('map', { worldCopyJump: true, minZoom: 2, maxZoom: 19 }).setView([20, 10], 2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    heat = L.heatLayer([], {
      radius: 32, blur: 24, maxZoom: 9, max: 1,
      gradient: { 0.15: '#1f7ae0', 0.35: '#1fa67a', 0.55: '#e0a21f', 0.75: '#d4561c', 0.95: '#9e1028' },
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);

    buildFilters();
    buildLegend();
    render();

    document.getElementById('search-form').addEventListener('submit', e => {
      e.preventDefault();
      search(document.getElementById('search-input').value);
    });
    document.getElementById('heat-toggle').addEventListener('change', e => {
      if (e.target.checked) heat.addTo(map); else heat.remove();
    });
  }

  return { init, search };
})();
