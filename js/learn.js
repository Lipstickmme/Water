/* Collapsible "learn" panels shared by both pages: icons + small infographics. */
function renderLearn(el) {
  const yes = `<span class="ok" title="Removes">${ICONS.check}</span>`;
  const no = `<span class="no" title="Does not remove">${ICONS.x}</span>`;
  const some = `<span class="some" title="Partly / certified units only">~</span>`;
  const methods = [
    ['Boiling', yes, no, no, no, no],
    ['Carbon filter', no, some, no, some, no],
    ['Reverse osmosis', some, yes, yes, yes, yes],
    ['Distillation', yes, yes, yes, some, yes],
  ];
  const cols = ['Germs', 'Metals', 'Nitrate', 'PFAS', 'Fluoride'];

  el.innerHTML = `
    <details class="learn">
      <summary><i data-icon="heart"></i><span>Health effects</span><i class="chev" data-icon="chevron"></i></summary>
      <ul class="sub-list">${Object.values(SUBSTANCES).map(s => `
        <li><span class="badge" style="--c:${s.color}">${s.sym}</span>
          <span><strong>${s.name}</strong> <small>${s.limit}</small><br>${s.health}</span></li>`).join('')}
      </ul>
    </details>
    <details class="learn">
      <summary><i data-icon="filter"></i><span>What removes what</span><i class="chev" data-icon="chevron"></i></summary>
      <div class="scroll-x"><table class="purify">
        <thead><tr><th></th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${methods.map(([m, ...r]) => `<tr><th>${m}</th>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <p class="fine">Boiling kills germs but concentrates metals and nitrate. Choose filters certified to NSF/ANSI 53 or 58 for the contaminant you need removed.</p>
    </details>
    <details class="learn">
      <summary><i data-icon="bottle"></i><span>Why no plastic</span><i class="chev" data-icon="chevron"></i></summary>
      <div class="pack">
        <div><b class="ok">${ICONS.check}</b><strong>Glass</strong><small>Inert, refillable, endlessly recyclable</small></div>
        <div><b class="ok">${ICONS.check}</b><strong>Carton</strong><small>Mostly paperboard, light to ship</small></div>
        <div><b class="no">${ICONS.x}</b><strong>Plastic</strong><small>Sheds microplastics, lasts centuries</small></div>
      </div>
    </details>
    <details class="learn">
      <summary><i data-icon="gift"></i><span>Free water, paid by ads</span><i class="chev" data-icon="chevron"></i></summary>
      <ol class="flow">
        <li><i data-icon="bottle"></i>Brands print ads on our glass &amp; cartons</li>
        <li><i data-icon="drop"></i>You get the water free</li>
        <li><i data-icon="search"></i>Scan the QR on your empty</li>
        <li><i data-icon="gift"></i>Share a post, unlock a daily 6-pack</li>
      </ol>
    </details>`;
  hydrateIcons(el);
}
