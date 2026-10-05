/* Report page: resolve the searched place, zoom to it, and build the water report. */
(() => {
  const params = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
  const SCOPES = { local: 'Local', region: 'Regional', national: 'National', global: 'Global' };
  const RAMP = ['#e3f4fd', '#a9dbf5', '#62b7e6', '#1f86c6', '#0b4f7a'];
  let map, hotspotLayer, compareLayer, refs;

  /* ---------- map ---------- */
  function hotspotPopup(h) {
    const s = SUBSTANCES[h.s];
    return `<div class="pop"><span class="eyebrow"><span class="dot" style="--c:${s.color}"></span>${s.name}</span>
      <strong>${h.name}</strong><p>${h.t}</p>
      <a href="${sourceUrl(h.q)}" target="_blank" rel="noopener">${h.src} ${ICONS.external}</a></div>`;
  }

  function initMap() {
    map = L.map('map', { zoomControl: false, worldCopyJump: true, minZoom: 2, maxZoom: 19 }).setView([20, 15], 2);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    basemapLayer().addTo(map);

    hotspotLayer = L.layerGroup().addTo(map);
    for (const h of HOTSPOTS) {
      const s = SUBSTANCES[h.s];
      L.circle([h.lat, h.lng], { radius: h.r * 1000, color: s.color, weight: 1, fillColor: s.color, fillOpacity: 0.14 })
        .bindPopup(hotspotPopup(h)).addTo(hotspotLayer);
      L.marker([h.lat, h.lng], {
        icon: L.divIcon({ className: 'hs-label', html: `<span class="sym" style="--c:${s.color}">${s.sym}</span>`, iconSize: null }),
      }).bindPopup(hotspotPopup(h)).addTo(hotspotLayer);
    }
    showHotspotLegend();
  }

  function showHotspotLegend() {
    const used = [...new Set(HOTSPOTS.map(h => h.s))];
    $('legend').innerHTML = `<details><summary><i data-icon="layers"></i> Documented hotspots</summary>
      <ul>${used.map(k => `<li><span class="dot" style="--c:${SUBSTANCES[k].color}"></span>${SUBSTANCES[k].name}</li>`).join('')}</ul></details>`;
    hydrateIcons($('legend'));
  }

  function focus(place) {
    const pad = isMobile() ? { paddingTopLeft: [20, 90], paddingBottomRight: [20, window.innerHeight * 0.45] }
                           : { paddingTopLeft: [40, 100], paddingBottomRight: [460, 40] };
    if (place.shape) {
      L.geoJSON(place.shape, { style: { color: '#1c8fd1', weight: 2, fillColor: '#5bbbea', fillOpacity: 0.06, dashArray: '5 5' } }).addTo(map);
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

  /* ---------- comparison mode ---------- */
  function bins(values) {
    const s = [...values].sort((a, b) => a - b);
    return [0.2, 0.4, 0.6, 0.8].map(q => s[Math.floor(q * (s.length - 1))]);
  }

  async function compareOnMap(substance, indKey, place) {
    const ind = INDICATORS[indKey];
    const bar = $('compare-bar');
    bar.hidden = false;
    bar.innerHTML = `<span>Loading ${ind.label.toLowerCase()}…</span>`;
    let data;
    try {
      data = await WorldBank.indicator(ind.wb);
    } catch (e) {
      bar.innerHTML = `<span>World Bank data is unavailable right now.</span><button class="link" id="cmp-exit">Close</button>`;
      $('cmp-exit').onclick = exitCompare;
      return;
    }
    const documented = documentedCountries(substance);
    const breaks = bins(Object.values(data).map(d => d.value));
    const colorFor = v => RAMP[breaks.findIndex(b => v <= b) === -1 ? 4 : breaks.findIndex(b => v <= b)];

    if (compareLayer) compareLayer.remove();
    map.removeLayer(hotspotLayer);
    compareLayer = L.geoJSON(COUNTRIES_GEO, {
      style: f => {
        const d = data[f.properties.iso3];
        const doc = documented.has(f.properties.iso2);
        return {
          fillColor: d ? colorFor(d.value) : '#f1f4f6', fillOpacity: 0.85,
          color: doc ? '#c0485a' : '#ffffff', weight: doc ? 2 : 0.6,
        };
      },
      onEachFeature: (f, layer) => {
        const d = data[f.properties.iso3];
        const doc = documented.has(f.properties.iso2);
        layer.bindTooltip(`<strong>${f.properties.name}</strong><br>${d ? `${d.value.toFixed(1)} ${ind.unit} (${d.year})` : 'No data'}<br>
          <span class="${doc ? 'flag' : 'muted'}">${doc ? `Documented ${SUBSTANCES[substance].name.toLowerCase()} contamination` : 'None documented in our index'}</span>`, { sticky: true, className: 'cmp-tip' });
        layer.on('mouseover', () => layer.setStyle({ weight: 2.5 }));
        layer.on('mouseout', () => compareLayer.resetStyle(layer));
      },
    }).addTo(map);
    map.flyTo(place ? [place.lat, place.lng] : [20, 15], 3, { duration: 1 });

    const fmt = v => v >= 100 ? Math.round(v) : v.toFixed(1);
    const edges = [Math.min(...Object.values(data).map(d => d.value)), ...breaks, Math.max(...Object.values(data).map(d => d.value))];
    $('legend').innerHTML = `<div class="choro-legend"><strong>${ind.label}</strong><small>${ind.unit}</small>
      <div class="ramp">${RAMP.map(c => `<span style="background:${c}"></span>`).join('')}</div>
      <div class="ramp-labels"><span>${fmt(edges[0])}</span><span>${fmt(edges[5])}</span></div>
      <div class="key"><span class="outline"></span>Documented ${SUBSTANCES[substance].name.toLowerCase()}</div>
      <small>Source: ${ind.src}</small></div>`;
    bar.innerHTML = `<span><span class="dot" style="--c:${SUBSTANCES[substance].color}"></span>${SUBSTANCES[substance].name} vs ${ind.label.toLowerCase()}</span>
      <button class="link" id="cmp-exit">${ICONS.close} Exit comparison</button>`;
    $('cmp-exit').onclick = exitCompare;
    if (isMobile()) $('panel').classList.add('collapsed');
  }

  function exitCompare() {
    if (compareLayer) { compareLayer.remove(); compareLayer = null; }
    hotspotLayer.addTo(map);
    $('compare-bar').hidden = true;
    showHotspotLegend();
  }

  /* ---------- place resolution ---------- */
  async function resolvePlace() {
    const q = params.get('q') || '';
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
    let nearest = null;
    for (const h of HOTSPOTS) {
      const d = Geo.vincenty(place.lat, place.lng, h.lat, h.lng);
      if (!nearest || d < nearest.d) nearest = { h, d };
      if (d <= h.r * 1000 || inBbox(h, place.bbox)) out.push({ scope: 'local', s: h.s, t: `${h.name}: ${h.t}`, src: h.src, q: h.q });
    }
    const region = REGIONS[place.cc];
    if (region) {
      const st = (place.state || '').toLowerCase();
      for (const f of (region.states && region.states[st]) || []) out.push({ scope: 'region', ...f });
      for (const f of region.national) out.push({ scope: 'national', ...f });
    }
    return { findings: out, region, nearest };
  }

  function groupBySubstance(findings) {
    const groups = new Map();
    for (const f of findings) {
      if (!groups.has(f.s)) groups.set(f.s, []);
      groups.get(f.s).push(f);
    }
    return [...groups.entries()];
  }

  // Number each distinct source in order of first appearance.
  function buildRefs(list) {
    const m = new Map();
    for (const f of list) if (!m.has(f.src)) m.set(f.src, { n: m.size + 1, src: f.src, q: f.q });
    return m;
  }
  const cite = f => { const r = refs.get(f.src); return `<a class="ref" href="#src-${r.n}" data-ref="${r.n}" title="${escapeHtml(f.src)}">${r.n}</a>`; };

  /* ---------- rendering ---------- */
  function substanceRow([key, items], open) {
    const s = SUBSTANCES[key];
    const scope = items.some(i => i.scope === 'local') ? 'local' : items[0].scope;
    return `<details class="row" ${open ? 'open' : ''}>
      <summary>
        <span class="dot" style="--c:${s.color}"></span>
        <span class="row-name">${s.name}<small>${s.sym}</small></span>
        <span class="scope ${scope}">${SCOPES[scope]}</span>
        <i class="chev" data-icon="chevron"></i>
      </summary>
      <div class="row-body">
        <ul class="findings">${items.map(f => `<li>${f.t}${cite(f)}</li>`).join('')}</ul>
        <dl class="facts">
          <dt>Health effect</dt><dd>${s.health}</dd>
          <dt>Guideline</dt><dd>${s.limit}</dd>
        </dl>
      </div>
    </details>`;
  }

  function renderHead(place, groups, findings, region) {
    const today = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    if (!place) {
      $('report-head').innerHTML = `<p class="eyebrow">Water quality report</p><h2 class="place">Global overview</h2>
        <p class="meta">${HOTSPOTS.length} documented hotspots · ${Object.keys(REGIONS).length} countries indexed</p>`;
      return;
    }
    const where = [place.state, region ? region.name : (place.cc || '').toUpperCase()].filter(Boolean).join(', ');
    const local = findings.filter(f => f.scope === 'local').length;
    $('report-head').innerHTML = `
      <p class="eyebrow">Water quality report · ${today}</p>
      <h2 class="place">${escapeHtml(shortLabel(place.label))}</h2>
      <p class="meta">${escapeHtml(where)}${where ? ' · ' : ''}${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</p>
      <dl class="summary">
        <div><dt>Substances</dt><dd>${groups.length}</dd></div>
        <div><dt>Local hotspots</dt><dd>${local}</dd></div>
        <div><dt>Sources</dt><dd>${refs.size}</dd></div>
      </dl>`;
  }

  function renderFindings(groups, nearest, hasLocal) {
    const near = !hasLocal && nearest
      ? `<p class="note"><i data-icon="pin"></i>Nearest documented hotspot: ${nearest.h.name} (${SUBSTANCES[nearest.h.s].name.toLowerCase()}), ${Geo.formatDistance(nearest.d)} away.</p>` : '';
    const list = groups.length
      ? `<div class="rows">${groups.map((g, i) => substanceRow(g, i === 0 && !isMobile())).join('')}</div>`
      : `<p class="note"><i data-icon="book"></i>No published research is indexed for this area yet. This says nothing about whether the water is safe.</p>`;
    $('tab-findings').innerHTML = `${near}${list}
      <h3 class="section">Global context</h3>
      <ul class="findings global">${GLOBAL_FINDINGS.map(f => `<li>${f.t}${cite(f)}</li>`).join('')}</ul>`;
  }

  function renderSources() {
    $('tab-sources').innerHTML = `<ol class="sources">${[...refs.values()].map(r =>
      `<li id="src-${r.n}"><a href="${sourceUrl(r.q)}" target="_blank" rel="noopener">${escapeHtml(r.src)} ${ICONS.external}</a></li>`).join('')}</ol>
      <p class="fine">Links open a search for each source’s exact title.</p>`;
  }

  function renderImpact(keys, place) {
    const blocks = [];
    if (keys.includes('lead')) {
      const a = ANALYTICS.lead;
      blocks.push(`<article class="impact">
        <h3 class="section"><span class="dot" style="--c:${SUBSTANCES.lead.color}"></span>Lead and children’s IQ</h3>
        <p>Pooled data from seven birth cohorts: IQ points lost as blood lead rises.</p>
        ${Charts.line(a.iq.curve, { xLabel: 'Blood lead (µg/dL)', yLabel: 'IQ points lost', xMax: 30, yMax: 8 })}
        <p class="cite-line">${cite({ src: a.iq.src })} ${a.iq.src}</p>
        <h4>${a.beforeAfter.title}</h4>
        ${Charts.bars(a.beforeAfter.bars.map(([label, value], i) => ({ label, value, highlight: i === 1 })), { unit: '%', max: 6, suffix: '%' })}
        <p class="cite-line">${a.beforeAfter.note} ${cite({ src: a.beforeAfter.src })}</p>
        <p class="fine">No reliable country-level child IQ dataset exists, so lead is shown through dose-response and before/after evidence rather than a world map.</p>
      </article>`);
    }
    for (const key of keys) {
      const a = ANALYTICS[key];
      if (!a || !a.indicators) continue;
      blocks.push(`<article class="impact" data-sub="${key}">
        <h3 class="section"><span class="dot" style="--c:${SUBSTANCES[key].color}"></span>${SUBSTANCES[key].name} and child health</h3>
        <p>${a.why} ${cite(a)}</p>
        <div class="seg" role="group">${a.indicators.map((k, i) => `<button data-ind="${k}" aria-pressed="${i === 0}">${INDICATORS[k].label}</button>`).join('')}</div>
        <div class="impact-chart"><p class="loading small">Loading World Bank data…</p></div>
        <button class="btn outline" data-map="${key}">${ICONS.globe} Compare on map</button>
      </article>`);
    }
    $('tab-impact').innerHTML = blocks.length
      ? blocks.join('') + `<p class="fine">Country comparisons are descriptive. Income, healthcare and sanitation also differ between countries, so a gap is not caused by one substance alone.</p>`
      : `<p class="note"><i data-icon="book"></i>No population health comparisons are available for the substances documented here.</p>`;
    hydrateIcons($('tab-impact'));

    $('tab-impact').querySelectorAll('.impact[data-sub]').forEach(el => {
      const key = el.dataset.sub;
      let ind = ANALYTICS[key].indicators[0];
      const draw = () => drawComparison(el.querySelector('.impact-chart'), key, ind, place);
      el.querySelectorAll('[data-ind]').forEach(b => b.addEventListener('click', () => {
        ind = b.dataset.ind;
        el.querySelectorAll('[data-ind]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }));
      el.querySelector('[data-map]').addEventListener('click', () => compareOnMap(key, ind, place));
      draw();
    });
  }

  async function drawComparison(el, substance, indKey, place) {
    const ind = INDICATORS[indKey];
    let data;
    try {
      data = await WorldBank.indicator(ind.wb);
    } catch {
      el.innerHTML = '<p class="fine">World Bank data is unavailable right now.</p>';
      return;
    }
    const iso3 = Object.fromEntries(COUNTRY_CODES.map(([a2, a3]) => [a2, a3]));
    const documented = documentedCountries(substance);
    const withV = [], withoutV = [];
    for (const [a2, a3] of COUNTRY_CODES) {
      const d = data[a3];
      if (!d) continue;
      (documented.has(a2) ? withV : withoutV).push(d.value);
    }
    const rows = [
      { label: 'Documented', sub: `median of ${withV.length} countries`, value: Charts.median(withV) },
      { label: 'Not documented', sub: `median of ${withoutV.length} countries`, value: Charts.median(withoutV) },
    ];
    const here = place && data[iso3[place.cc]];
    if (here) rows.push({ label: here.name, sub: here.year, value: here.value, highlight: true });
    el.innerHTML = `<p class="chart-title">${ind.label} <small>${ind.unit}</small></p>
      ${Charts.bars(rows, { unit: ind.unit })}
      <p class="fine">Source: ${ind.src}, latest year available.</p>`;
  }

  function shortLabel(label) {
    const parts = String(label || '').split(',').map(s => s.trim()).filter(Boolean);
    return parts.slice(0, 2).join(', ') || 'Selected location';
  }

  function renderError(msg) {
    $('report-head').innerHTML = `<p class="note"><i data-icon="alert"></i>${msg}</p>`;
    hydrateIcons($('report-head'));
  }

  function render(place) {
    let groups = [], findings = [], region = null, nearest = null;
    if (place) ({ findings, region, nearest } = gather(place));
    groups = groupBySubstance(findings);
    const keys = place ? groups.map(([k]) => k) : Object.keys(ANALYTICS);
    const impactSources = keys.flatMap(k => ANALYTICS[k] ? [ANALYTICS[k], ANALYTICS[k].iq, ANALYTICS[k].beforeAfter] : [])
      .filter(a => a && a.src);
    refs = buildRefs([...findings, ...GLOBAL_FINDINGS, ...impactSources]);
    renderHead(place, groups, findings, region);
    renderFindings(groups, nearest, findings.some(f => f.scope === 'local'));
    renderImpact(keys, place);
    renderSources();
    $('tabs').hidden = false;
    hydrateIcons($('panel-body'));
  }

  /* ---------- panel & tabs ---------- */
  function initPanel() {
    const panel = $('panel');
    $('panel-toggle').addEventListener('click', () => {
      const collapsed = panel.classList.toggle('collapsed');
      $('panel-toggle').setAttribute('aria-expanded', String(!collapsed));
    });
    const show = name => {
      $('tabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
      ['findings', 'impact', 'sources'].forEach(t => { $('tab-' + t).hidden = t !== name; });
    };
    $('tabs').addEventListener('click', e => { if (e.target.dataset.tab) show(e.target.dataset.tab); });
    $('panel-body').addEventListener('click', e => {
      const r = e.target.closest('.ref');
      if (!r) return;
      e.preventDefault();
      show('sources');
      const li = $('src-' + r.dataset.ref);
      li.scrollIntoView({ block: 'center', behavior: 'smooth' });
      li.classList.add('flash');
      setTimeout(() => li.classList.remove('flash'), 1200);
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    hydrateIcons();
    const world = params.get('view') === 'world' || !params.get('q');
    const form = $('search');
    form.querySelector('input').value = world ? '' : params.get('q');
    attachSearch(form);
    initPanel();

    if (typeof L === 'undefined') return renderError('The map failed to load.');
    initMap();
    if (world) return render(null);

    let place;
    try {
      place = await resolvePlace();
    } catch (e) {
      return renderError(`Search is unavailable right now (${escapeHtml(e.message)}). Try coordinates like <code>51.50, -0.12</code>.`);
    }
    if (!place) return renderError(`We couldn’t find “${escapeHtml(params.get('q'))}”. Try a street, city or postcode.`);
    focus(place);
    render(place);
  });
})();
