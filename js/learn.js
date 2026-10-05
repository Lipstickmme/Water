/* Collapsible reference panels on the home page: health effects and treatment. */
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
    </details>`;
  hydrateIcons(el);
}
