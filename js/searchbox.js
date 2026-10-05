/*
 * Search box with type-ahead suggestions, shared by the home and map pages.
 * Submitting goes to map.html with the place encoded in the URL.
 */
function resultsUrl(place) {
  const p = new URLSearchParams({ q: place.q });
  if (place.lat != null) {
    p.set('lat', place.lat.toFixed(6));
    p.set('lng', place.lng.toFixed(6));
    if (place.cc) p.set('cc', place.cc);
    if (place.state) p.set('st', place.state);
    if (place.bbox) p.set('bb', place.bbox.map(n => n.toFixed(5)).join(','));
  }
  return 'map.html?' + p.toString();
}

function attachSearch(form) {
  const input = form.querySelector('input');
  const list = form.querySelector('.suggestions');
  let items = [], active = -1, timer, controller;

  const close = () => { list.hidden = true; active = -1; form.classList.remove('open'); };
  const go = place => { window.location.href = resultsUrl(place); };

  function render() {
    if (!items.length) return close();
    list.innerHTML = items.map((s, i) => `
      <li role="option" id="sg-${i}" aria-selected="${i === active}" data-i="${i}">
        <span class="sg-icon">${ICONS.pin}</span>
        <span><strong>${escapeHtml(s.main)}</strong>${s.sub ? `<small>${escapeHtml(s.sub)}</small>` : ''}</span>
      </li>`).join('');
    list.hidden = false;
    form.classList.add('open');
    input.setAttribute('aria-activedescendant', active >= 0 ? `sg-${active}` : '');
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 3 || Geo.parseCoords(q)) { items = []; return close(); }
    timer = setTimeout(async () => {
      if (controller) controller.abort();
      controller = new AbortController();
      try {
        items = await Geocode.suggest(q, controller.signal);
        active = -1;
        render();
      } catch (e) {
        if (e.name !== 'AbortError') { items = []; close(); }
      }
    }, 250);
  });

  input.addEventListener('keydown', e => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown') { active = (active + 1) % items.length; render(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { active = (active - 1 + items.length) % items.length; render(); e.preventDefault(); }
    else if (e.key === 'Escape') close();
  });

  list.addEventListener('mousedown', e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    const s = items[+li.dataset.i];
    go({ ...s, q: [s.main, s.sub].filter(Boolean).join(', ') });
  });

  input.addEventListener('blur', () => setTimeout(close, 120));

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (active >= 0 && items[active]) {
      const s = items[active];
      return go({ ...s, q: [s.main, s.sub].filter(Boolean).join(', ') });
    }
    const q = input.value.trim();
    if (q) go({ q });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
