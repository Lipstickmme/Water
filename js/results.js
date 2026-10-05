/* Map page: resolve the searched place, zoom to it, and list researched substances. */
(() => {
  const params = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
  const SCOPES = { local: 'In this area', region: 'Region', national: 'National', global: 'Global' };
  let map;

  /* ---------- map ---------- */
  function initMap() {
    map = L.map('map', { zoomControl: false, worldCopyJump: true, minZoom: 2, maxZoom: 19 }).setView([20, 15], 2);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    for (const h of HOTSPOTS) {
      const s = SUBSTANCES[h.s];
      const popup = `<div class="pop"><span class="badge" style="--c:${s.color}">${s.sym}</span>
        <strong>${h.name}</strong><p>${h.t}</p>
        <a href="${sourceUrl(h.q)}" target="_blank" rel="noopener">${h.src} ${ICONS.external}</a></div>`;
      L.circle([h.lat, h.lng], { radius: h.r * 1000, color: s.color, weight: 1, fillColor: s.color, fillOpacity: 0.16 })
        .bindPopup(popup).addTo(map);
      L.marker([h.lat, h.lng], {
        icon: L.divIcon({ className: 'hs-label', html: `<span class="badge" style="--c:${s.color}">${s.sym}</span>`, iconSize: null }),
      }).bindPopup(popup).addTo(map);
    }

    const used = [...new Set(HOTSPOTS.map(h => h.s))];
    $('legend').innerHTML = `<details><summary><i data-icon="layers"></i> Research hotspots</summary>
      <ul>${used.map(k => `<li><span class="dot" style="--c:${SUBSTANCES[k].color}"></span>${SUBSTANCES[k].name}</li>`).join('')}</ul></details>`;
  }

  function focus(place) {
    const pad = isMobile() ? { paddingTopLeft: [20, 90], paddingBottomRight: [20, window.innerHeight * 0.45] }
                           : { paddingTopLeft: [40, 100], paddingBottomRight: [440, 40] };
    if (place.shape) {
      L.geoJSON(place.shape, { style: { color: '#1c8fd1', weight: 2, fillColor: '#5bbbea', fillOpacity: 0.08, dashArray: '5 5' } }).addTo(map);
    }
    L.marker([place.lat, place.lng], {
      icon: L.divIcon({ className: 'you-are-here', html: `<span class="pulse"></span><span class="pin">${ICONS.drop}</span>`, iconSize: [36, 36], iconAnchor: [18, 18] }),
    }).addTo(map);

    if (place.bbox) {
      const [s, n, w, e] = place.bbox;
      map.flyToBounds([[s, w], [n, e]], { ...pad, maxZoom: 17, duration: 1.4 });
    } else {
      map.flyTo([place.lat, place.lng], 16, { duration: 1.4 });
    }
  }

  /* ---------- place resolution ---------- */
  async function resolvePlace() {
    const q = params.get('q') || '';
    if (params.get('view') === 'world') return null;

    if (params.has('lat')) {
      const place = {
        label: q, lat: +params.get('lat'), lng: +params.get('lng'),
        cc: params.get('cc') || '', state: params.get('st') || '',
        bbox: params.get('bb') ? params.get('bb').split(',').map(Number) : null,
      };
      if (!place.cc) Object.assign(place, await Geocode.reverse(place.lat, place.lng).catch(() => null) || {}, { label: q });
      return place;
    }

    const coords = Geo.parseCoords(q);
    if (coords) {
      const rev = await Geocode.reverse(coords.lat, coords.lng).catch(() => null);
      return { label: q, cc: '', state: '', bbox: null, ...(rev || {}), ...coords };
    }
    return Geocode.lookup(q);
  }

  /* ---------- findings ---------- */
  function inBbox(h, bbox) {
    if (!bbox) return false;
    const [s, n, w, e] = bbox;
    return h.lat >= s && h.lat <= n && h.lng >= w && h.lng <= e;
  }

  function gather(place) {
    const out = [];
    const near = [];
    for (const h of HOTSPOTS) {
      const d = Geo.vincenty(place.lat, place.lng, h.lat, h.lng);
      near.push({ h, d });
      if (d <= h.r * 1000 || inBbox(h, place.bbox)) {
        out.push({ scope: 'local', s: h.s, t: `${h.name}: ${h.t}`, src: h.src, q: h.q });
      }
    }
    const region = REGIONS[place.cc];
    if (region) {
      const st = (place.state || '').toLowerCase();
      for (const f of (region.states && region.states[st]) || []) out.push({ scope: 'region', ...f });
      for (const f of region.national) out.push({ scope: 'national', ...f });
    }
    near.sort((a, b) => a.d - b.d);
    return { findings: out, region, nearest: near[0] };
  }

  function groupBySubstance(findings) {
    const groups = new Map();
    for (const f of findings) {
      if (!groups.has(f.s)) groups.set(f.s, []);
      groups.get(f.s).push(f);
    }
    return [...groups.entries()];
  }

  /* ---------- rendering ---------- */
  function findingItem(f) {
    return `<li><span class="scope ${f.scope}">${SCOPES[f.scope]}</span>${f.t}
      <a class="src" href="${sourceUrl(f.q)}" target="_blank" rel="noopener">${f.src} ${ICONS.external}</a></li>`;
  }

  function substanceCard([key, items]) {
    const s = SUBSTANCES[key];
    const scopes = [...new Set(items.map(i => i.scope))];
    return `<details class="sub-card" style="--c:${s.color}">
      <summary>
        <span class="badge" style="--c:${s.color}">${s.sym}</span>
        <span class="sub-name"><strong>${s.name}</strong>
          <small>${scopes.map(sc => SCOPES[sc]).join(' · ')}</small></span>
        <i class="chev" data-icon="chevron"></i>
      </summary>
      <div class="sub-body">
        <ul class="findings">${items.map(findingItem).join('')}</ul>
        <p class="health"><i data-icon="heart"></i>${s.health}</p>
        <p class="limit">Safe limit: <strong>${s.limit}</strong></p>
      </div>
    </details>`;
  }

  function renderResults(place) {
    const el = $('results');
    if (!place) {
      el.innerHTML = `<h2 class="place">The world’s water</h2>
        <p class="meta">${HOTSPOTS.length} documented hotspots · ${Object.keys(REGIONS).length} countries indexed</p>
        <p>Search an address, street or region, or tap a circle on the map.</p>
        ${globalBlock(true)}`;
      hydrateIcons(el);
      return;
    }

    const { findings, region, nearest } = gather(place);
    const groups = groupBySubstance(findings);
    const where = [place.state, region ? region.name : place.cc.toUpperCase()].filter(Boolean).join(' · ');
    const localCount = findings.filter(f => f.scope === 'local').length;

    const stats = `<div class="stats">
      <div><b>${groups.length}</b><span>substances<br>documented</span></div>
      <div><b>${localCount}</b><span>local<br>hotspots</span></div>
      <div><b>${new Set(findings.map(f => f.src)).size}</b><span>research<br>sources</span></div>
    </div>`;
    const badges = groups.length
      ? `<div class="badge-row">${groups.map(([k]) => `<span class="badge" style="--c:${SUBSTANCES[k].color}" title="${SUBSTANCES[k].name}">${SUBSTANCES[k].sym}</span>`).join('')}</div>`
      : '';

    const nearestLine = !localCount && nearest
      ? `<p class="nearest"><i data-icon="pin"></i> Nearest documented hotspot: <strong>${nearest.h.name}</strong>
         (${SUBSTANCES[nearest.h.s].name}), ${Geo.formatDistance(nearest.d)} away.</p>` : '';

    const body = groups.length
      ? `<div class="cards">${groups.map(substanceCard).join('')}</div>`
      : `<div class="empty"><i data-icon="book"></i><p><strong>No published research indexed for this area yet.</strong><br>
         That doesn’t mean the water is safe or unsafe, only that we haven’t catalogued studies here.</p></div>`;

    el.innerHTML = `
      <h2 class="place">${escapeHtml(shortLabel(place.label))}</h2>
      <p class="meta">${escapeHtml(where)}</p>
      ${stats}${badges}${nearestLine}${body}${globalBlock(false)}`;
    hydrateIcons(el);
    // Open the first card so there is always something visible.
    const first = el.querySelector('.sub-card');
    if (first && !isMobile()) first.open = true;
  }

  function globalBlock(open) {
    return `<details class="sub-card global" ${open ? 'open' : ''}>
      <summary><span class="badge globe">${ICONS.globe}</span>
        <span class="sub-name"><strong>Global context</strong><small>Applies everywhere</small></span>
        <i class="chev" data-icon="chevron"></i></summary>
      <div class="sub-body"><ul class="findings">${GLOBAL_FINDINGS.map(f => findingItem({ scope: 'global', ...f })).join('')}</ul></div>
    </details>`;
  }

  function shortLabel(label) {
    const parts = String(label || '').split(',').map(s => s.trim()).filter(Boolean);
    return parts.slice(0, 2).join(', ') || 'Selected location';
  }

  function renderError(msg) {
    $('results').innerHTML = `<div class="empty"><i data-icon="alert"></i><p>${msg}</p></div>`;
    hydrateIcons($('results'));
  }

  /* ---------- panel ---------- */
  function initPanel() {
    const panel = $('panel');
    const btn = $('panel-toggle');
    btn.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    hydrateIcons();
    const form = $('search');
    form.querySelector('input').value = params.get('view') === 'world' ? '' : (params.get('q') || '');
    attachSearch(form);
    initPanel();
    renderLearn($('learn'));
    hydrateIcons($('legend'));

    if (typeof L === 'undefined') return renderError('The map failed to load.');
    initMap();
    hydrateIcons($('legend'));

    if (!params.get('q')) return renderResults(null);
    let place;
    try {
      place = await resolvePlace();
    } catch (e) {
      return renderError(`Search is unavailable right now (${escapeHtml(e.message)}). Try coordinates like <code>51.50, -0.12</code>.`);
    }
    if (params.get('view') === 'world') return renderResults(null);
    if (!place) return renderError(`We couldn’t find “${escapeHtml(params.get('q'))}”. Try a street, city or postcode.`);
    focus(place);
    renderResults(place);
  });
})();
