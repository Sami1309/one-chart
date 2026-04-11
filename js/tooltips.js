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
      App._tooltipStaleAfterZoom = false;
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
// ============================================================
// MOBILE TOOLTIPS
// ============================================================
function showMobileTooltip(obj, cx, cy) {
  const tooltip = document.getElementById('tooltip');
  const wd = wikiData[obj.name];

  const mG = 10 ** obj.logM;
  const rCm = 10 ** obj.logR;
  const mSun = mG / M_sun;
  let mStr = '10^' + obj.logM.toFixed(1) + ' g';
  if (mSun > 0.001 && mSun < 1e20) mStr += ' \u2248 ' + mSun.toExponential(1) + ' M\u2609';
  const rStr = '10^' + obj.logR.toFixed(1) + ' cm';
  const rho = mG / ((4/3) * Math.PI * rCm**3);

  const wikiLink = wd
    ? '<a href="https://en.wikipedia.org/wiki/' + wd.wiki + '" target="_blank" class="tt-wiki-link" style="pointer-events:auto; display:block; margin-top:6px; color:#6688bb; font-size:12px;">View on Wikipedia \u2197</a>'
    : '';

  const textHtml = '<div class="tt-body">' +
    '<div class="tt-title">' + obj.name + '</div>' +
    '<div class="tt-data">Mass: ' + mStr + '<br>Radius: ' + rStr + '<br>Density: ~10^' + log10(rho).toFixed(0) + ' g/cm\u00B3</div>' +
    '<div class="tt-desc">' + obj.desc.substring(0, 180) + (obj.desc.length > 180 ? '\u2026' : '') + '</div>' +
    wikiLink +
    '</div>';

  tooltip.className = 'tooltip mobile-tooltip';
  if (wd && wd.img) {
    tooltip.classList.add('tt-layout-top');
    tooltip.innerHTML = '<div class="tt-img-wrap"><img class="tt-wiki-img" src="' + wd.img + '" /></div>' + textHtml;
  } else {
    tooltip.innerHTML = textHtml;
  }

  // Position at bottom center of chart container
  tooltip.style.left = '10px';
  tooltip.style.right = '10px';
  tooltip.style.bottom = '10px';
  tooltip.style.top = 'auto';
  tooltip.style.maxWidth = 'none';
  tooltip.style.width = 'auto';
  tooltip.classList.add('tt-visible');

  App._selectedObj = obj;

  // Highlight the tapped object
  if (App._mobileHighlight) App._mobileHighlight.remove();
  var col = catCol[obj.cat] || '#555';
  App._mobileHighlight = App.chartArea.append('circle')
    .attr('class', 'hover-ring')
    .attr('cx', cx).attr('cy', cy)
    .attr('stroke', obj.cat === 'blackhole' ? '#c44' : col);
}

function hideMobileTooltip() {
  var tooltip = document.getElementById('tooltip');
  tooltip.className = 'tooltip';
  tooltip.style.left = '';
  tooltip.style.right = '';
  tooltip.style.bottom = '';
  tooltip.style.top = '';
  tooltip.style.maxWidth = '';
  tooltip.style.width = '';
  App._selectedObj = null;
  if (App._mobileHighlight) {
    App._mobileHighlight.remove();
    App._mobileHighlight = null;
  }
}

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
