/* Page wiring for Modules 2–6 and the concept explorer. */
(() => {
  const $ = sel => document.querySelector(sel);
  const money = (n, d = 0) => (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  const num = n => Math.round(n).toLocaleString();

  /* ---------- Module 2: toxicological matrix ---------- */
  function renderToxicology() {
    const groups = ['All', ...new Set(CONTAMINANTS.map(c => c.group))];
    const systems = [...new Set(CONTAMINANTS.flatMap(c => c.systems))].sort();
    $('#tox-group').innerHTML = groups.map(g => `<option>${g}</option>`).join('');
    $('#tox-system').innerHTML = ['All body systems', ...systems].map(s => `<option>${s}</option>`).join('');

    const draw = () => {
      const g = $('#tox-group').value;
      const s = $('#tox-system').value;
      const list = CONTAMINANTS.filter(c =>
        (g === 'All' || c.group === g) && (s === 'All body systems' || c.systems.includes(s)));
      $('#tox-grid').innerHTML = list.map(c => `
        <article class="tox-card">
          <header><h3>${c.name}</h3><span class="tag">${c.group}</span></header>
          <dl>
            <dt>WHO guideline</dt><dd>${c.who}</dd>
            <dt>US EPA</dt><dd>${c.epa}</dd>
            <dt>Common sources</dt><dd>${c.sources}</dd>
            <dt>Acute effects</dt><dd>${c.acute}</dd>
            <dt>Chronic effects</dt><dd>${c.chronic}</dd>
            <dt>Most vulnerable</dt><dd>${c.vulnerable}</dd>
          </dl>
          <div class="chips">${c.systems.map(x => `<span class="chip">${x}</span>`).join('')}</div>
          <p class="treat"><strong>Effective treatment:</strong> ${c.treatment.map(t => TREATMENTS[t]).join(' · ')}</p>
        </article>`).join('') || '<p>No contaminants match that filter.</p>';
    };
    $('#tox-group').addEventListener('change', draw);
    $('#tox-system').addEventListener('change', draw);
    draw();

    // Matrix view: contaminants × body systems
    const head = `<tr><th>Contaminant</th>${systems.map(s => `<th><span>${s}</span></th>`).join('')}</tr>`;
    const body = CONTAMINANTS.map(c => `<tr><th>${c.name}</th>${systems.map(s =>
      `<td>${c.systems.includes(s) ? '<span class="dot" aria-label="affected">●</span>' : ''}</td>`).join('')}</tr>`).join('');
    $('#tox-matrix').innerHTML = `<thead>${head}</thead><tbody>${body}</tbody>`;
  }

  /* ---------- Module 3: potability index ---------- */
  function renderPotability() {
    const tabs = $('#pot-tabs');
    const show = key => {
      const cat = POTABILITY[key];
      tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.key === key));
      $('#pot-panel').className = `pot-panel ${key}`;
      $('#pot-panel').innerHTML = `<h3>${cat.title}</h3><p>${cat.blurb}</p>
        <ul class="region-list">${cat.regions.map(r =>
          `<li><strong>${r.name}</strong>${r.kind ? ` <span class="tag">${r.kind}</span>` : ''}<br><span>${r.why}</span></li>`).join('')}</ul>`;
    };
    tabs.innerHTML = Object.entries(POTABILITY).map(([k, c]) =>
      `<button role="tab" data-key="${k}" class="${k}">${c.title.split(' — ')[0]}</button>`).join('');
    tabs.addEventListener('click', e => { if (e.target.dataset.key) show(e.target.dataset.key); });
    show('critical');
  }

  /* ---------- Module 4: treatment recommender ---------- */
  function renderRemediation() {
    const sel = $('#remedy-contaminant');
    sel.innerHTML = CONTAMINANTS.map(c => `<option value="${c.key}">${c.name}</option>`).join('');
    const draw = () => {
      const c = CONTAMINANTS.find(x => x.key === sel.value);
      $('#remedy-out').innerHTML = `For <strong>${c.name}</strong>, effective options are:
        <strong>${c.treatment.map(t => TREATMENTS[t]).join(', ')}</strong>.
        ${c.group === 'Biological pathogen'
          ? 'Boiling or UV handles pathogens but does nothing for chemical or metal contamination.'
          : 'Boiling does <em>not</em> remove this contaminant — it concentrates it as water evaporates.'}`;
    };
    sel.addEventListener('change', draw);
    draw();
  }

  /* ---------- Module 6a: ad-supported economics ---------- */
  const PACKAGING_COST = { carton: 0.14, glass: 0.38 }; // container + printing, USD/unit (assumption)
  const IMPRESSIONS_PER_POST = 150; // organic reach of one verification post (assumption)
  function renderEconomics() {
    const ids = ['eco-users', 'eco-packs', 'eco-pack', 'eco-water', 'eco-logistics', 'eco-fee', 'eco-sell', 'eco-return', 'eco-posts', 'eco-cpm'];
    const read = () => Object.fromEntries(ids.map(id => [id, $('#' + id).value]));
    const draw = () => {
      const v = read();
      ids.forEach(id => { const o = document.querySelector(`output[for="${id}"]`); if (o) o.textContent = fmt($('#' + id)); });

      const users = +v['eco-users'];
      const packsPerUser = +v['eco-packs'];
      const units = users * packsPerUser * 6;
      const isGlass = v['eco-pack'] === 'glass';
      const returnRate = isGlass ? +v['eco-return'] / 100 : 0;
      const containerCost = PACKAGING_COST[v['eco-pack']] * (1 - returnRate) + (isGlass ? 0.09 * returnRate : 0); // refill wash cost
      const unitCost = containerCost + +v['eco-water'] + +v['eco-logistics'];
      const cost = units * unitCost;

      const fee = +v['eco-fee'];
      const sell = +v['eco-sell'] / 100;
      const printRevenue = units * fee * sell;
      const posts = users * (+v['eco-posts'] / 100);
      const socialRevenue = posts * IMPRESSIONS_PER_POST * (+v['eco-cpm'] / 1000);
      const revenue = printRevenue + socialRevenue;
      const net = revenue - cost;
      const breakEvenFee = sell > 0 ? Math.max(0, (cost - socialRevenue) / (units * sell)) : Infinity;

      $('#eco-results').innerHTML = `
        <div class="kpi"><span>Units / day</span><strong>${num(units)}</strong></div>
        <div class="kpi"><span>Cost / unit</span><strong>${money(unitCost, 3)}</strong></div>
        <div class="kpi"><span>Daily cost</span><strong>${money(cost)}</strong></div>
        <div class="kpi"><span>Daily revenue</span><strong>${money(revenue)}</strong></div>
        <div class="kpi ${net >= 0 ? 'good' : 'bad'}"><span>Daily net</span><strong>${money(net)}</strong></div>
        <div class="kpi"><span>Break-even sponsor fee</span><strong>${isFinite(breakEvenFee) ? money(breakEvenFee, 3) + ' / unit' : 'n/a'}</strong></div>`;
      $('#eco-formula').innerHTML = `
        Net = units × (fee × sell-through) + posts × impressions × CPM/1000 − units × cost<br>
        = ${num(units)} × (${money(fee, 3)} × ${(sell * 100).toFixed(0)}%) + ${num(posts)} × ${IMPRESSIONS_PER_POST} × ${money(+v['eco-cpm'], 2)}/1000 − ${num(units)} × ${money(unitCost, 3)}
        = <strong>${money(net)}</strong> / day`;
      $('#eco-return-wrap').hidden = !isGlass;
    };
    const fmt = el => el.dataset.fmt === 'money' ? money(+el.value, 2) : el.dataset.fmt === 'pct' ? el.value + '%' : num(+el.value);
    ids.forEach(id => $('#' + id).addEventListener('input', draw));
    draw();
  }

  /* ---------- Module 6b: account strength ---------- */
  function accountScore(a) {
    const age = Math.min(a.ageDays / 180, 1) * 25;
    const engagement = Math.min(a.engagement / 6, 1) * 25; // 6%+ engagement saturates
    const reach = Math.min(Math.log10(Math.max(a.followers, 1)) / 4, 1) * 15; // 10k followers saturates
    const verified = (a.phone ? 10 : 0) + (a.email ? 5 : 0);
    const history = Math.min(a.redemptions / 30, 1) * 20;
    const penalty = a.flags * 15 + (a.burst ? 20 : 0);
    return Math.max(0, Math.min(100, Math.round(age + engagement + reach + verified + history - penalty)));
  }
  const TIERS = [
    { min: 80, name: 'Ambassador', packs: 2, delay: 'Instant', note: 'Priority pickup + 1 bonus pack/day' },
    { min: 55, name: 'Trusted', packs: 1, delay: 'Instant', note: 'Standard daily 6-pack' },
    { min: 30, name: 'Standard', packs: 1, delay: '2 h review', note: 'Voucher released after automated checks' },
    { min: 0, name: 'Probation', packs: 0, delay: '48 h manual review', note: 'New or bot-like profile — verify to unlock' },
  ];
  function renderAccount() {
    const ids = ['acc-age', 'acc-followers', 'acc-engagement', 'acc-redemptions', 'acc-flags', 'acc-phone', 'acc-email', 'acc-burst'];
    const draw = () => {
      const a = {
        ageDays: +$('#acc-age').value, followers: +$('#acc-followers').value,
        engagement: +$('#acc-engagement').value, redemptions: +$('#acc-redemptions').value,
        flags: +$('#acc-flags').value, phone: $('#acc-phone').checked, email: $('#acc-email').checked,
        burst: $('#acc-burst').checked,
      };
      ['acc-age', 'acc-followers', 'acc-engagement', 'acc-redemptions', 'acc-flags'].forEach(id =>
        document.querySelector(`output[for="${id}"]`).textContent = id === 'acc-engagement' ? a.engagement + '%' : num(+$('#' + id).value));
      const score = accountScore(a);
      const tier = TIERS.find(t => score >= t.min);
      $('#acc-out').innerHTML = `
        <div class="meter"><div style="width:${score}%"></div></div>
        <p class="score"><strong>${score}</strong>/100 · <span class="tier ${tier.name.toLowerCase()}">${tier.name}</span></p>
        <ul><li>Daily voucher: <strong>${tier.packs} × 6-pack</strong></li>
            <li>Release: <strong>${tier.delay}</strong></li>
            <li>${tier.note}</li></ul>`;
    };
    ids.forEach(id => $('#' + id).addEventListener('input', draw));
    draw();
  }

  /* ---------- Module 6c: relief ledger ---------- */
  const COST_PER_CARTON = 0.45; // delivered cost into a crisis zone, USD (assumption)
  const LEDGER_KEY = 'waterwater-demo-pledges';
  function loadPledges() {
    try { return JSON.parse(localStorage.getItem(LEDGER_KEY)) || {}; } catch { return {}; }
  }
  function savePledges(p) {
    try { localStorage.setItem(LEDGER_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
  }
  function renderLedger() {
    const pledges = loadPledges();
    const draw = () => {
      $('#ledger-body').innerHTML = RELIEF_LEDGER.map(r => {
        const funded = r.fundedCartons + (pledges[r.id] || 0);
        const pct = Math.min(100, (funded / r.goalCartons) * 100);
        return `<tr>
          <td><strong>${r.community}</strong><br><span class="muted">${r.crisis}</span></td>
          <td>${num(r.people)}</td>
          <td><div class="bar"><div style="width:${pct}%"></div></div>${num(funded)} / ${num(r.goalCartons)} cartons</td>
          <td>${(pledges[r.id] || 0) ? num(pledges[r.id]) : '—'}</td>
        </tr>`;
      }).join('');
    };
    $('#donate-target').innerHTML = RELIEF_LEDGER.map(r => `<option value="${r.id}">${r.community}</option>`).join('');
    const preview = () => {
      const amt = Math.max(0, +$('#donate-amount').value || 0);
      $('#donate-preview').textContent = `${money(amt, 2)} funds ≈ ${num(amt / COST_PER_CARTON)} cartons (${money(COST_PER_CARTON, 2)} delivered per carton).`;
    };
    $('#donate-amount').addEventListener('input', preview);
    $('#donate-form').addEventListener('submit', e => {
      e.preventDefault();
      const amt = Math.max(0, +$('#donate-amount').value || 0);
      if (!amt) return;
      const id = $('#donate-target').value;
      pledges[id] = (pledges[id] || 0) + Math.floor(amt / COST_PER_CARTON);
      savePledges(pledges);
      draw();
      $('#donate-preview').textContent = `Demo pledge recorded in this browser only — no payment was taken.`;
    });
    preview();
    draw();
  }

  document.addEventListener('DOMContentLoaded', () => {
    WaterMap.init();
    renderToxicology();
    renderPotability();
    renderRemediation();
    renderEconomics();
    renderAccount();
    renderLedger();
    $('#year').textContent = new Date().getFullYear();
  });
})();
