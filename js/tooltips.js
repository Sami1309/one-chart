// ============================================================
// TOOLTIP POSITIONING
// ============================================================
function positionTooltip(event) {
  const tooltip = document.getElementById('tooltip');
  const rect = App.container.getBoundingClientRect();
  let tx = event.clientX - rect.left + 16;
  let ty = event.clientY - rect.top - 10;
  if (tx + 340 > rect.width) tx -= 356;
  if (ty + 160 > rect.height) ty -= 170;
  if (tx < 0) tx = 10;
  if (ty < 0) ty = 10;
  tooltip.style.left = tx + 'px';
  tooltip.style.top = ty + 'px';
}

// ============================================================
// ERA TOOLTIPS (isodensity lines + energy labels)
// ============================================================
function addEraTooltip(el, title, desc, wiki) {
  const tooltip = d3.select('#tooltip');
  el.style('cursor', 'pointer')
    .on('mouseover', function(event) {
      const tooltipEl = tooltip.node();
      tooltipEl.className = 'tooltip';
      tooltip.html(`
        <div class="tt-body">
          <div class="tt-title">${title}</div>
          <div class="tt-desc">${desc}</div>
          ${wiki ? '<div class="tt-wiki-link">Click to open Wikipedia \u2197</div>' : ''}
        </div>
      `);
      positionTooltip(event);
      tooltipEl.classList.add('tt-visible');
    })
    .on('mousemove', function(event) { positionTooltip(event); })
    .on('mouseout', function() {
      tooltip.node().className = 'tooltip';
    })
    .on('click', function() {
      if (wiki) window.open(`https://en.wikipedia.org/wiki/${wiki}`, '_blank');
    });
}

// ============================================================
// DETAIL PANEL
// ============================================================
function showDetail(obj) {
  const panel = document.getElementById('detailPanel');
  const mG = 10 ** obj.logM;
  const rCm = 10 ** obj.logR;
  const mSun = mG / M_sun;
  const rho = mG / ((4/3) * Math.PI * rCm**3);
  const rs = 2 * G_N * mG / (c_light * c_light);
  const lc = hbar_cgs / (mG * c_light);

  document.getElementById('detailTitle').textContent = obj.name;

  let mStr = `10^${obj.logM.toFixed(2)} g`;
  if (mSun > 0.001) mStr += ` = ${mSun.toExponential(2)} M\u2609`;

  const logRs = log10(rs), logLc = log10(lc);

  document.getElementById('detailData').innerHTML = `
    <strong>Mass:</strong> ${mStr}<br>
    <strong>Radius:</strong> 10<sup>${obj.logR.toFixed(2)}</sup> cm<br>
    <strong>Density:</strong> 10<sup>${log10(rho).toFixed(1)}</sup> g/cm\u00B3<br>
    <strong>Schwarzschild radius:</strong> 10<sup>${logRs.toFixed(1)}</sup> cm
    ${Math.abs(logRs - obj.logR) < 0.5 ? '&larr; on BH line!' : ''}<br>
    <strong>Compton wavelength:</strong> 10<sup>${logLc.toFixed(1)}</sup> cm
    ${Math.abs(logLc - obj.logR) < 0.5 ? '&larr; on Compton line!' : ''}
  `;
  document.getElementById('detailText').textContent = obj.desc;
  panel.style.display = 'block';
}
