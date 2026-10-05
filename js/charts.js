/*
 * Small inline-SVG charts for the report panel, plus the World Bank client
 * that feeds them. One hue per chart; text stays in ink colours.
 */
const WorldBank = (() => {
  const cache = new Map();
  // Latest non-empty value per country: { ISO3: { value, year, name } }
  function indicator(code) {
    if (!cache.has(code)) {
      cache.set(code, fetch(`https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&mrnev=1&per_page=400`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(([, rows]) => {
          const out = {};
          for (const row of rows || []) {
            if (row.value != null && row.countryiso3code) out[row.countryiso3code] = { value: row.value, year: row.date, name: row.country.value };
          }
          return out;
        })
        .catch(e => { cache.delete(code); throw e; }));
    }
    return cache.get(code);
  }
  return { indicator };
})();

const Charts = (() => {
  const INK = '#12324a', MUTED = '#6a8396', GRID = '#e3edf4', BAR = '#1c8fd1', HILITE = '#0b4f7a';
  const fmt = v => (v >= 100 ? Math.round(v) : v.toFixed(1)).toString();

  // rows: [{ label, value, sub?, highlight? }]
  function bars(rows, { unit = '', max, suffix = '' } = {}) {
    const w = 340, rowH = 34, labelW = 150, pad = 46;
    const top = max || Math.max(...rows.map(r => r.value)) * 1.05;
    const h = rows.length * rowH + 4;
    const body = rows.map((r, i) => {
      const y = i * rowH + 6;
      const bw = Math.max(2, ((w - labelW - pad) * r.value) / top);
      return `<g class="bar-row"><title>${r.label}: ${fmt(r.value)} ${unit}</title>
        <text x="0" y="${y + 13}" fill="${INK}" font-size="12">${r.label}</text>
        ${r.sub ? `<text x="0" y="${y + 26}" fill="${MUTED}" font-size="10.5">${r.sub}</text>` : ''}
        <rect x="${labelW}" y="${y + 2}" width="${bw}" height="16" rx="4" fill="${r.highlight ? HILITE : BAR}"/>
        <text x="${labelW + bw + 6}" y="${y + 14}" fill="${INK}" font-size="12" font-weight="600">${fmt(r.value)}${suffix}</text>
      </g>`;
    }).join('');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Bar chart">${body}</svg>`;
  }

  // points: [[x, y]] — a single series line with markers.
  function line(points, { xLabel, yLabel, xMax, yMax }) {
    const w = 340, h = 170, l = 34, r = 12, t = 12, b = 34;
    const sx = x => l + (x / xMax) * (w - l - r);
    const sy = y => t + (1 - y / yMax) * (h - t - b);
    const yTicks = [0, Math.round(yMax / 2), yMax];
    const xTicks = [0, 10, 20, 30].filter(v => v <= xMax);
    const grid = yTicks.map(v => `<line x1="${l}" x2="${w - r}" y1="${sy(v)}" y2="${sy(v)}" stroke="${GRID}"/>
      <text x="${l - 6}" y="${sy(v) + 4}" text-anchor="end" fill="${MUTED}" font-size="10.5">${v}</text>`).join('');
    const xt = xTicks.map(v => `<text x="${sx(v)}" y="${h - b + 15}" text-anchor="middle" fill="${MUTED}" font-size="10.5">${v}</text>`).join('');
    const path = points.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
    const dots = points.map(([x, y]) => `<g><title>${x} µg/dL → −${y} IQ points</title>
      <circle cx="${sx(x)}" cy="${sy(y)}" r="4.5" fill="${BAR}" stroke="#fff" stroke-width="2"/></g>`).join('');
    const last = points[points.length - 1];
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${yLabel} by ${xLabel}">
      ${grid}${xt}
      <path d="${path}" fill="none" stroke="${BAR}" stroke-width="2" stroke-linejoin="round"/>
      ${dots}
      <text x="${sx(last[0]) - 6}" y="${sy(last[1]) - 10}" text-anchor="end" fill="${INK}" font-size="11.5" font-weight="600">−${last[1]} IQ points</text>
      <text x="${(l + w - r) / 2}" y="${h - 4}" text-anchor="middle" fill="${MUTED}" font-size="10.5">${xLabel}</text>
    </svg>`;
  }

  const median = arr => {
    const s = [...arr].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };

  return { bars, line, median };
})();
