// ============================================================
// GLOBAL APP STATE
// ============================================================
const App = {
  container: document.getElementById('chart-container'),
  showLabels: true,
  xAxisFormat: 'log',
  yAxisFormat: 'log',
  curT: d3.zoomIdentity,
  W: 0, H: 0, width: 0, height: 0,
  margin: {top: 48, right: 80, bottom: 52, left: 65},
  X_DOMAIN: [-42, 58],
  Y_DOMAIN: [-58, 68],
  _tooltipStaleAfterZoom: false,
  // Filled during init
  svg: null, g: null, chartArea: null, zoom: null,
  baseX: null, baseY: null,
  xAxisG: null, yAxisG: null, xAxisTopG: null, yAxisRightG: null,
  xLabelBottom: null, xLabelTop: null, yLabelLeft: null, yLabelRight: null,
};

// ============================================================
// DIMENSIONS
// ============================================================
function getDims() {
  App.W = App.container.clientWidth;
  App.H = App.container.clientHeight;
  App.width = App.W - App.margin.left - App.margin.right;
  App.height = App.H - App.margin.top - App.margin.bottom;
}

function makeX() { return d3.scaleLinear().domain(App.X_DOMAIN).range([0, App.width]); }
function makeY() { return d3.scaleLinear().domain(App.Y_DOMAIN).range([App.height, 0]); }

// ============================================================
// AXES
// ============================================================
function updateAxes(xS, yS) {
  // Build a simple D3 axis-compatible scale wrapper from our potentially warped scale
  function axisScale(warpedFn, domain, range) {
    const s = d3.scaleLinear().domain(domain).range(range);
    // Override the scale function to use warped positions for tick placement
    const wrapped = Object.assign(v => warpedFn(v), {
      domain: () => domain, range: () => range,
      ticks: (n) => s.ticks(n),
      copy: () => axisScale(warpedFn, [...domain], [...range]),
    });
    return wrapped;
  }

  const xDomain = xS.domain ? xS.domain() : App.X_DOMAIN;
  const yDomain = yS.domain ? yS.domain() : App.Y_DOMAIN;
  const xRange = xS.range ? xS.range() : [0, App.width];
  const yRange = yS.range ? yS.range() : [App.height, 0];

  const xAxis = axisScale(xS, xDomain, xRange);
  const yAxis = axisScale(yS, yDomain, yRange);

  // Primary X axis (cm)
  if (App.xAxisFormat === 'linear') {
    App.xAxisG.call(d3.axisBottom(xAxis).ticks(10).tickFormat(d => '10' + toSuperscript(Math.round(d))));
  } else {
    App.xAxisG.call(d3.axisBottom(xAxis).ticks(20).tickFormat(d => d));
  }
  // Primary Y axis (g)
  if (App.yAxisFormat === 'linear') {
    App.yAxisG.call(d3.axisLeft(yAxis).ticks(10).tickFormat(d => '10' + toSuperscript(Math.round(d))));
  } else {
    App.yAxisG.call(d3.axisLeft(yAxis).ticks(20).tickFormat(d => d));
  }
  // Top: Mpc
  const mpcOffset = log10(Mpc_cm);
  const tDomain = xDomain.map(d => +(d - mpcOffset).toFixed(1));
  const tS = axisScale(v => xS(v + mpcOffset), tDomain, xRange);
  if (App.xAxisFormat === 'linear') {
    App.xAxisTopG.call(d3.axisTop(tS).ticks(10).tickFormat(d => {
      const n = Math.round(d);
      return n % 5 === 0 ? '10' + toSuperscript(n) : '';
    }));
  } else {
    App.xAxisTopG.call(d3.axisTop(tS).ticks(15).tickFormat(d => d % 5 === 0 ? d : ''));
  }
  // Right: M_sun
  const sunOffset = log10(M_sun);
  const rDomain = yDomain.map(d => +(d - sunOffset).toFixed(1));
  const rS = axisScale(v => yS(v + sunOffset), rDomain, yRange);
  if (App.yAxisFormat === 'linear') {
    App.yAxisRightG.call(d3.axisRight(rS).ticks(10).tickFormat(d => {
      const n = Math.round(d);
      return n % 5 === 0 ? '10' + toSuperscript(n) : '';
    }));
  } else {
    App.yAxisRightG.call(d3.axisRight(rS).ticks(15).tickFormat(d => d % 5 === 0 ? d : ''));
  }
  // Update axis title labels
  App.xLabelBottom.text(App.xAxisFormat === 'linear' ? 'physical radius [cm]' : 'log (physical radius) [cm]');
  App.xLabelTop.text(App.xAxisFormat === 'linear' ? 'radius [Mpc]' : 'log (radius) [Mpc]');
  App.yLabelLeft.text(App.yAxisFormat === 'linear' ? 'mass [g]' : 'log (mass) [g]');
  App.yLabelRight.text(App.yAxisFormat === 'linear' ? 'mass [M\u2609]' : 'log (mass) [M\u2609]');

  App.g.selectAll('.tick text').attr('fill','#555').style('font-size','9px');
  App.g.selectAll('.tick line').attr('stroke','#ccc');
  App.g.selectAll('.domain').attr('stroke','#999');
}

// ============================================================
// DRAW PIPELINE
// ============================================================
function drawAll(xS, yS) {
  App.chartArea.selectAll('*').remove();
  drawBackground(xS, yS);
  drawForbidden(xS, yS);
  drawIsodensity(xS, yS);
  drawBoundaries(xS, yS);
  drawSpecialAnnotations(xS, yS);
  drawObjects(xS, yS);
}

function drawBackground(xS, yS) {
  const ca = App.chartArea;
  // Planckian unknown vertical band (logR < l_planck)
  const plR = log10(l_planck);
  ca.append('rect')
    .attr('x', xS(App.X_DOMAIN[0])).attr('y', yS(App.Y_DOMAIN[1]))
    .attr('width', Math.max(0, xS(plR) - xS(App.X_DOMAIN[0])))
    .attr('height', yS(App.Y_DOMAIN[0]) - yS(App.Y_DOMAIN[1]))
    .attr('fill', 'rgba(180,170,140,0.15)');

  // Radiation-dominated background (pink tint)
  const radRegion = [
    [xS(-20), yS(App.Y_DOMAIN[1])], [xS(5), yS(App.Y_DOMAIN[1])],
    [xS(5), yS(App.Y_DOMAIN[0])], [xS(-20), yS(App.Y_DOMAIN[0])],
  ];
  ca.append('polygon').attr('points', radRegion.map(p => p.join(',')).join(' '))
    .attr('fill', 'rgba(200,140,140,0.06)');

  // Matter-dominated (blue tint)
  const matRegion = [
    [xS(5), yS(App.Y_DOMAIN[1])], [xS(30), yS(App.Y_DOMAIN[1])],
    [xS(30), yS(App.Y_DOMAIN[0])], [xS(5), yS(App.Y_DOMAIN[0])],
  ];
  ca.append('polygon').attr('points', matRegion.map(p => p.join(',')).join(' '))
    .attr('fill', 'rgba(140,160,200,0.06)');

  // Dark energy (grey tint)
  const deRegion = [
    [xS(30), yS(App.Y_DOMAIN[1])], [xS(App.X_DOMAIN[1]), yS(App.Y_DOMAIN[1])],
    [xS(App.X_DOMAIN[1]), yS(App.Y_DOMAIN[0])], [xS(30), yS(App.Y_DOMAIN[0])],
  ];
  ca.append('polygon').attr('points', deRegion.map(p => p.join(',')).join(' '))
    .attr('fill', 'rgba(180,180,180,0.06)');
}

function drawForbidden(xS, yS) {
  const ca = App.chartArea;
  // BH line: logM = logR - BH_const
  // Forbidden by gravity: ABOVE the BH line
  const bhPts = [];
  for (let lr = App.X_DOMAIN[0]; lr <= App.X_DOMAIN[1]; lr += 0.5)
    bhPts.push([xS(lr), yS(lr - BH_const)]);

  const gravPoly = [
    ...bhPts,
    [xS(App.X_DOMAIN[1]), yS(App.Y_DOMAIN[1])],
    [xS(App.X_DOMAIN[0]), yS(App.Y_DOMAIN[1])],
  ];
  ca.append('polygon').attr('points', gravPoly.map(p => p.join(',')).join(' '))
    .attr('fill', 'rgba(180,100,100,0.18)');

  // Compton line: logM = -logR + C_const
  // Forbidden by quantum uncertainty: BELOW the Compton line
  const cPts = [];
  for (let lr = App.X_DOMAIN[0]; lr <= App.X_DOMAIN[1]; lr += 0.5)
    cPts.push([xS(lr), yS(-lr + C_const)]);

  const qPoly = [
    ...cPts,
    [xS(App.X_DOMAIN[1]), yS(App.Y_DOMAIN[0])],
    [xS(App.X_DOMAIN[0]), yS(App.Y_DOMAIN[0])],
  ];
  ca.append('polygon').attr('points', qPoly.map(p => p.join(',')).join(' '))
    .attr('fill', 'rgba(160,120,100,0.15)');

  // QG doubly-forbidden region
  const instLR = log10(l_planck);
  const qgPts = [];
  for (let lr = App.X_DOMAIN[0]; lr <= instLR; lr += 0.3)
    qgPts.push([xS(lr), yS(lr - BH_const)]);
  for (let lr = instLR; lr >= App.X_DOMAIN[0]; lr -= 0.3)
    qgPts.push([xS(lr), yS(-lr + C_const)]);

  if (qgPts.length > 2) {
    ca.append('polygon').attr('points', qgPts.map(p => p.join(',')).join(' '))
      .attr('fill', 'rgba(100,60,100,0.2)');
  }

  // Region labels
  if (App.showLabels) {
    const addLabel = (text, lx, ly, rot, fill, size) => {
      ca.append('text')
        .attr('x', xS(lx)).attr('y', yS(ly))
        .attr('fill', fill).style('font-size', size+'px').style('font-weight','700')
        .style('font-style','italic')
        .attr('text-anchor','middle')
        .attr('transform', `rotate(${rot}, ${xS(lx)}, ${yS(ly)})`)
        .text(text);
    };
    addLabel('forbidden by gravity', -8, 45, -32, 'rgba(160,80,80,0.4)', 16);
    addLabel('quantum uncertainty', 8, -38, 32, 'rgba(140,100,80,0.35)', 16);
    addLabel('Compton limit', -8, -22, 40, 'rgba(140,100,80,0.4)', 11);
    addLabel('sub \u2013 Planckian unknown', -37, 10, -90, 'rgba(150,140,100,0.4)', 12);
    addLabel('QG', -36.5, -5, 0, 'rgba(140,80,160,0.5)', 11);
    addLabel('black holes', -8, 18, -40, 'rgba(80,60,60,0.5)', 12);
  }
}

function drawIsodensity(xS, yS) {
  const ca = App.chartArea;
  isodensityLines.forEach(iso => {
    const intercept = Math.log10(4 * Math.PI / 3) + iso.logRho;
    const pts = [];
    for (let lr = App.X_DOMAIN[0]; lr <= App.X_DOMAIN[1]; lr += 1) {
      const lm = 3 * lr + intercept;
      if (lm >= App.Y_DOMAIN[0] && lm <= App.Y_DOMAIN[1])
        pts.push([lr, lm]);
    }
    if (pts.length < 2) return;

    const line = pts.map(p => [xS(p[0]), yS(p[1])]);
    ca.append('polyline')
      .attr('points', line.map(p => p.join(',')).join(' '))
      .attr('fill','none').attr('stroke','rgba(255,255,255,0.6)')
      .attr('stroke-width', 1).attr('stroke-dasharray','6,4');

    if (App.showLabels) {
      const lp = pts[pts.length - 1];
      const labelText = ca.append('text')
        .attr('x', xS(lp[0]) - 2).attr('y', yS(lp[1]) + 3)
        .attr('fill','rgba(100,90,80,0.6)').style('font-size','8px')
        .attr('text-anchor','end')
        .attr('transform', `rotate(-72, ${xS(lp[0])-2}, ${yS(lp[1])+3})`)
        .text(iso.label);

      if (iso.desc) addEraTooltip(labelText, iso.label, iso.desc, iso.wiki);

      if (iso.tag) {
        const mp = pts[Math.floor(pts.length * 0.4)];
        const tagText = ca.append('text')
          .attr('x', xS(mp[0])).attr('y', yS(mp[1]) - 6)
          .attr('fill','rgba(100,90,80,0.5)').style('font-size','8px').style('font-style','italic')
          .attr('text-anchor','middle')
          .attr('transform', `rotate(-72, ${xS(mp[0])}, ${yS(mp[1])-6})`)
          .text(iso.tag);

        if (iso.desc) addEraTooltip(tagText, iso.label, iso.desc, iso.wiki);
      }
    }
  });
}

function drawBoundaries(xS, yS) {
  const ca = App.chartArea;
  // Black hole line
  const bhPts = [];
  for (let lr = App.X_DOMAIN[0]; lr <= App.X_DOMAIN[1]; lr += 0.5) {
    const lm = lr - BH_const;
    if (lm >= App.Y_DOMAIN[0] && lm <= App.Y_DOMAIN[1])
      bhPts.push([xS(lr), yS(lm)]);
  }
  ca.append('polyline').attr('points', bhPts.map(p => p.join(',')).join(' '))
    .attr('fill','none').attr('stroke','#444').attr('stroke-width', 2);

  // Compton line
  const cPts = [];
  for (let lr = App.X_DOMAIN[0]; lr <= App.X_DOMAIN[1]; lr += 0.5) {
    const lm = -lr + C_const;
    if (lm >= App.Y_DOMAIN[0] && lm <= App.Y_DOMAIN[1])
      cPts.push([xS(lr), yS(lm)]);
  }
  ca.append('polyline').attr('points', cPts.map(p => p.join(',')).join(' '))
    .attr('fill','none').attr('stroke','#666').attr('stroke-width', 2);

  // Planck mass horizontal dashed
  const pmLM = log10(m_planck);
  ca.append('line')
    .attr('x1', xS(App.X_DOMAIN[0])).attr('x2', xS(App.X_DOMAIN[1]))
    .attr('y1', yS(pmLM)).attr('y2', yS(pmLM))
    .attr('stroke','rgba(0,0,0,0.12)').attr('stroke-dasharray','4,4').attr('stroke-width',1);

  // Planck length vertical dashed
  const plLR = log10(l_planck);
  ca.append('line')
    .attr('x1', xS(plLR)).attr('x2', xS(plLR))
    .attr('y1', yS(App.Y_DOMAIN[0])).attr('y2', yS(App.Y_DOMAIN[1]))
    .attr('stroke','rgba(0,0,0,0.12)').attr('stroke-dasharray','4,4').attr('stroke-width',1);

  if (App.showLabels) {
    ca.append('text')
      .attr('x', xS(App.X_DOMAIN[0]) + 4).attr('y', yS(pmLM) - 3)
      .attr('fill','rgba(0,0,0,0.3)').style('font-size','9px').style('font-style','italic')
      .text('m_P');
    ca.append('text')
      .attr('x', xS(plLR) + 3).attr('y', yS(App.Y_DOMAIN[0]) + 12)
      .attr('fill','rgba(0,0,0,0.3)').style('font-size','9px').style('font-style','italic')
      .text('l_P');
  }
}

function drawSpecialAnnotations(xS, yS) {
  const ca = App.chartArea;
  if (!App.showLabels) return;

  const energyLabels = [
    {label:"E_P", y: log10(m_planck),
     desc:"Planck energy (~1.22 \u00D7 10\u00B9\u2079 GeV). The energy scale where quantum gravitational effects become important, corresponding to the Planck mass via E = mc\u00B2.",
     wiki:"Planck_energy"},
    {label:"E_GUT", y: log10(1e16 * GeV_g),
     desc:"Grand Unification energy (~10\u00B9\u2076 GeV). The energy at which the strong and electroweak forces are predicted to unify. Proton decay, if observed, would confirm GUT theories.",
     wiki:"Grand_Unified_Theory"},
    {label:"E_EW", y: log10(100 * GeV_g),
     desc:"Electroweak scale (~100 GeV). The energy at which the Higgs mechanism gives mass to W and Z bosons, separating electromagnetism from the weak force. Directly probed at the LHC.",
     wiki:"Electroweak_interaction"},
    {label:"CMB", y: log10(2.35e-4 * eV_g),
     desc:"Cosmic Microwave Background (~2.725 K, ~2.35 \u00D7 10\u207B\u2074 eV). Relic thermal radiation from recombination ~380,000 years after the Big Bang \u2014 the oldest light in the Universe.",
     wiki:"Cosmic_microwave_background"},
  ];

  energyLabels.forEach(e => {
    const yy = yS(e.y);
    if (yy > 0 && yy < App.height) {
      ca.append('line')
        .attr('x1', xS(App.X_DOMAIN[1]) - 30).attr('x2', xS(App.X_DOMAIN[1]))
        .attr('y1', yy).attr('y2', yy)
        .attr('stroke', '#c44').attr('stroke-width', 1).attr('stroke-dasharray', '2,2');
      const labelText = ca.append('text')
        .attr('x', xS(App.X_DOMAIN[1]) - 2).attr('y', yy - 4)
        .attr('fill', '#c44').style('font-size', '9px').style('font-weight','600')
        .attr('text-anchor', 'end')
        .text(e.label);
      addEraTooltip(labelText, e.label, e.desc, e.wiki);
    }
  });

  // NS/WD/BD rectangle
  const rectX1 = log10(5e5), rectX2 = log10(2e12);
  const rectY1 = log10(0.01 * M_sun), rectY2 = log10(5 * M_sun);
  ca.append('rect')
    .attr('x', xS(rectX1)).attr('y', yS(rectY2))
    .attr('width', xS(rectX2) - xS(rectX1))
    .attr('height', yS(rectY1) - yS(rectY2))
    .attr('fill', 'none').attr('stroke', 'rgba(0,100,0,0.4)')
    .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3');
}

function drawObjects(xS, yS) {
  const tooltip = d3.select('#tooltip');
  const ca = App.chartArea;

  objects.forEach(obj => {
    const cx = xS(obj.logR), cy = yS(obj.logM);
    if (cx < -20 || cx > App.width + 20 || cy < -20 || cy > App.height + 20) return;

    const col = catCol[obj.cat] || '#555';
    const isBH = obj.cat === 'blackhole';
    const isPlanck = obj.cat === 'planck';
    const r = isPlanck ? 7 : (isBH ? 6 : 4.5);

    const gr = ca.append('g').style('cursor','pointer');

    gr.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', r)
      .attr('fill', isBH ? '#111' : col)
      .attr('stroke', isPlanck ? '#cc9900' : (isBH ? '#c44' : d3.color(col).darker(0.5)))
      .attr('stroke-width', isPlanck ? 2.5 : 1.5)
      .attr('opacity', 0.9);

    if (App.showLabels) {
      let dx = 9, dy = -5, anchor = 'start';
      if (obj.name.includes('Hubble')) { dx = -9; anchor = 'end'; }
      if (obj.name.includes('Ton')) { dx = 9; dy = 12; }
      if (obj.name.includes('Sgr')) { dx = -9; dy = -2; anchor = 'end'; }
      if (obj.cat === 'particle') { dx = 6; dy = 10; }
      if (obj.name.includes('Instanton')) { dx = -8; dy = 10; anchor = 'end'; }
      if (obj.name.includes('3K')) { dx = -9; anchor = 'end'; }
      if (obj.name.includes('Red giant')) { dx = 9; dy = 2; }

      gr.append('text')
        .attr('x', cx + dx).attr('y', cy + dy)
        .attr('fill','#333').style('font-size','9px')
        .attr('text-anchor', anchor)
        .text(obj.name);
    }

    gr.on('mouseover', function(event) {
      App._tooltipStaleAfterZoom = false;
      const mG = 10 ** obj.logM;
      const rCm = 10 ** obj.logR;
      const mSun = mG / M_sun;
      let mStr = `10^${obj.logM.toFixed(1)} g`;
      if (mSun > 0.001 && mSun < 1e20) mStr += ` \u2248 ${mSun.toExponential(1)} M\u2609`;
      const rStr = `10^${obj.logR.toFixed(1)} cm`;
      const rho = mG / ((4/3) * Math.PI * rCm**3);

      const wd = wikiData[obj.name];
      const textHtml = `
        <div class="tt-body">
          <div class="tt-title">${obj.name}</div>
          <div class="tt-data">Mass: ${mStr}<br>Radius: ${rStr}<br>Density: ~10^${log10(rho).toFixed(0)} g/cm\u00B3</div>
          <div class="tt-desc">${obj.desc.substring(0, 180)}${obj.desc.length > 180 ? '\u2026' : ''}</div>
          ${wd ? '<div class="tt-wiki-link">Click to open Wikipedia \u2197</div>' : ''}
        </div>
      `;

      const tooltipEl = tooltip.node();
      tooltipEl.className = 'tooltip';

      if (wd && wd.img) {
        tooltipEl.classList.add(wd.layout === 'side' ? 'tt-layout-side' : 'tt-layout-top');
        if (wd.layout === 'side') {
          tooltip.html(`<img class="tt-wiki-img" src="${wd.img}" /><div class="tt-content">${textHtml}</div>`);
        } else {
          tooltip.html(`<img class="tt-wiki-img" src="${wd.img}" />${textHtml}`);
        }
      } else {
        tooltip.html(textHtml);
      }

      positionTooltip(event);
      tooltipEl.classList.add('tt-visible');

      // Track discovery
      if (typeof Journal !== 'undefined') Journal.discover(obj.name);

      // Hover ring
      d3.select(this).append('circle')
        .attr('class', 'hover-ring')
        .attr('cx', cx).attr('cy', cy)
        .attr('stroke', col);

      d3.select(this).select('circle').attr('r', r + 3).attr('stroke-width', 3).attr('filter','url(#glow)');
    })
    .on('mousemove', function(event) { positionTooltip(event); })
    .on('mouseout', function() {
      tooltip.node().className = 'tooltip';
      d3.select(this).selectAll('.hover-ring').remove();
      d3.select(this).select('circle').attr('r', r).attr('stroke-width', isPlanck ? 2.5 : 1.5).attr('filter', null);
    })
    .on('click', function() {
      const wd = wikiData[obj.name];
      if (wd) window.open(`https://en.wikipedia.org/wiki/${wd.wiki}`, '_blank');
    });
  });
}

// ============================================================
// ANIMATED SCALE TRANSITIONS
// ============================================================
// In linear mode we use a warped scale: positions are interpolated between
// log-space (uniform) and linear-space (exponential). Full linear (t=1) would
// collapse everything to one edge, so we cap at t=0.85 to keep it explorable
// while still dramatically showing the compression.

const WARP_MAX = 0.85; // how far toward true linear we go

// Get current scales respecting both zoom transform and warp state
function currentScales() {
  const xW = App._xWarp || 0;
  const yW = App._yWarp || 0;
  if (xW === 0 && yW === 0) {
    // Pure log mode — use standard D3 linear scales with zoom
    return [App.curT.rescaleX(makeX()), App.curT.rescaleY(makeY())];
  }
  // Warped mode — apply zoom transform to domain, then warp
  const zoomedX = App.curT.rescaleX(makeX());
  const zoomedY = App.curT.rescaleY(makeY());
  const xS = makeWarpedScale(zoomedX.domain(), zoomedX.range(), xW);
  const yS = makeWarpedScale(zoomedY.domain(), [App.height, 0], yW);
  return [xS, yS];
}

// Compute a warped position for a log-value given a warp factor t ∈ [0,1]
// t=0 → pure log (uniform spacing), t=1 → pure linear (exponential spacing)
function warpedPos(logVal, domain, range, t) {
  // Log position (uniform)
  const logFrac = (logVal - domain[0]) / (domain[1] - domain[0]);
  const logPos = range[0] + logFrac * (range[1] - range[0]);
  if (t === 0) return logPos;

  // Linear position: map 10^logVal into [10^domain[0], 10^domain[1]]
  // Use a log-interpolated version to avoid numerical overflow
  // We map the fraction of the value in linear space
  // Since the range is enormous, we use a softened version:
  // compress toward the high end (large values dominate in linear)
  const expFrac = (Math.pow(10, (logVal - domain[0]) * t) - 1) /
                  (Math.pow(10, (domain[1] - domain[0]) * t) - 1);
  const linPos = range[0] + expFrac * (range[1] - range[0]);

  return logPos * (1 - t) + linPos * t;
}

// Create a warped scale function for a given axis
function makeWarpedScale(domain, range, t) {
  const fn = (logVal) => warpedPos(logVal, domain, range, t);
  // Attach domain/range for axis compatibility
  fn.domain = () => domain;
  fn.range = () => range;
  fn.copy = () => makeWarpedScale([...domain], [...range], t);
  // Inverse for axis ticks
  fn.invert = (px) => {
    // Binary search for inverse
    let lo = domain[0], hi = domain[1];
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (fn(mid) < px) { if (range[1] > range[0]) lo = mid; else hi = mid; }
      else { if (range[1] > range[0]) hi = mid; else lo = mid; }
    }
    return (lo + hi) / 2;
  };
  fn.ticks = (count) => {
    const step = (domain[1] - domain[0]) / count;
    const ticks = [];
    for (let v = Math.ceil(domain[0] / step) * step; v <= domain[1]; v += step)
      ticks.push(Math.round(v * 10) / 10);
    return ticks;
  };
  return fn;
}

function animateScaleTransition() {
  const duration = 1200;
  const xTarget = App.xAxisFormat === 'linear' ? WARP_MAX : 0;
  const yTarget = App.yAxisFormat === 'linear' ? WARP_MAX : 0;
  const xStart = App._xWarp || 0;
  const yStart = App._yWarp || 0;

  if (xTarget === xStart && yTarget === yStart) return;

  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const rawT = Math.min(elapsed / duration, 1);
    // Ease in-out
    const t = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

    App._xWarp = xStart + (xTarget - xStart) * t;
    App._yWarp = yStart + (yTarget - yStart) * t;

    const xS = makeWarpedScale(App.X_DOMAIN, [0, App.width], App._xWarp);
    const yS = makeWarpedScale(App.Y_DOMAIN, [App.height, 0], App._yWarp);

    updateAxes(xS, yS);
    drawAll(xS, yS);

    if (rawT < 1) {
      requestAnimationFrame(step);
    } else {
      // Show annotation if we just went to linear
      if (xTarget > 0 || yTarget > 0) {
        showScaleAnnotation();
      }
    }
  }

  requestAnimationFrame(step);
}

function showScaleAnnotation() {
  const existing = App.chartArea.select('.scale-annotation');
  if (!existing.empty()) existing.remove();

  const ann = App.chartArea.append('text')
    .attr('class', 'scale-annotation')
    .attr('x', App.width / 2).attr('y', App.height / 2 - 20)
    .attr('text-anchor', 'middle')
    .attr('fill', 'rgba(180,50,50,0.5)')
    .style('font-size', '14px').style('font-style', 'italic')
    .style('pointer-events', 'none')
    .attr('opacity', 0)
    .text('This is why we use logarithmic scales.');

  ann.transition().duration(600).attr('opacity', 1)
    .transition().delay(2000).duration(800).attr('opacity', 0).remove();
}

// ============================================================
// INITIALIZATION
// ============================================================
function initChart() {
  getDims();

  App.svg = d3.select('#chart-container').append('svg')
    .attr('width', App.W).attr('height', App.H);

  const defs = App.svg.append('defs');
  defs.append('clipPath').attr('id','clip')
    .append('rect').attr('width', App.width).attr('height', App.height);

  // Glow filter
  const glow = defs.append('filter').attr('id','glow');
  glow.append('feGaussianBlur').attr('stdDeviation','3').attr('result','blur');
  const fm = glow.append('feMerge');
  fm.append('feMergeNode').attr('in','blur');
  fm.append('feMergeNode').attr('in','SourceGraphic');

  App.g = App.svg.append('g').attr('transform', `translate(${App.margin.left},${App.margin.top})`);

  // Background
  App.g.append('rect').attr('width', App.width).attr('height', App.height).attr('fill','#faf5f0');

  App.chartArea = App.g.append('g').attr('clip-path','url(#clip)');

  // Axis groups
  App.xAxisG = App.g.append('g').attr('transform', `translate(0,${App.height})`);
  App.yAxisG = App.g.append('g');
  App.xAxisTopG = App.g.append('g');
  App.yAxisRightG = App.g.append('g').attr('transform', `translate(${App.width},0)`);

  // Axis labels
  App.xLabelBottom = App.g.append('text').attr('x', App.width/2).attr('y', App.height+42)
    .attr('text-anchor','middle').attr('fill','#444').style('font-size','12px')
    .text('log (physical radius) [cm]');
  App.xLabelTop = App.g.append('text').attr('x', App.width/2).attr('y', -35)
    .attr('text-anchor','middle').attr('fill','#444').style('font-size','12px')
    .text('log (radius) [Mpc]');
  App.yLabelLeft = App.g.append('text').attr('transform','rotate(-90)')
    .attr('x', -App.height/2).attr('y', -48)
    .attr('text-anchor','middle').attr('fill','#444').style('font-size','12px')
    .text('log (mass) [g]');
  App.yLabelRight = App.g.append('text').attr('transform','rotate(90)')
    .attr('x', App.height/2).attr('y', -App.width-55)
    .attr('text-anchor','middle').attr('fill','#444').style('font-size','12px')
    .text('log (mass) [M\u2609]');

  App.baseX = makeX();
  App.baseY = makeY();

  // Zoom
  App.zoom = d3.zoom()
    .scaleExtent([0.3, 80])
    .on('zoom', function(event) {
      App.curT = event.transform;
      const [xS, yS] = currentScales();
      updateAxes(xS, yS);
      drawAll(xS, yS);
      // After redraw, old hover targets are gone so mouseout never fires.
      // Mark tooltip as stale so the next mousemove dismisses it.
      if (document.getElementById('tooltip').classList.contains('tt-visible')) {
        App._tooltipStaleAfterZoom = true;
      }
    });

  App.svg.call(App.zoom);

  // Dismiss stale tooltip after zoom when cursor moves
  App.container.addEventListener('mousemove', function() {
    if (App._tooltipStaleAfterZoom) {
      App._tooltipStaleAfterZoom = false;
      document.getElementById('tooltip').className = 'tooltip';
    }
  });

  // Controls
  document.getElementById('resetZoom').onclick = () => {
    App.svg.transition().duration(400).call(App.zoom.transform, d3.zoomIdentity);
  };

  document.getElementById('xScaleCtrl').onchange = function() {
    App.xAxisFormat = this.value;
    animateScaleTransition();
  };

  document.getElementById('yScaleCtrl').onchange = function() {
    App.yAxisFormat = this.value;
    animateScaleTransition();
  };

  document.getElementById('toggleLabels').onclick = () => {
    App.showLabels = !App.showLabels;
    const [xS, yS] = currentScales();
    drawAll(xS, yS);
  };

  document.getElementById('closeDetail').onclick = () => {
    document.getElementById('detailPanel').style.display = 'none';
  };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.getElementById('detailPanel').style.display = 'none';
  });

  // Resize
  window.addEventListener('resize', () => {
    getDims();
    App.svg.attr('width', App.W).attr('height', App.H);
    d3.select('#clip rect').attr('width', App.width).attr('height', App.height);
    App.g.select('rect').attr('width', App.width).attr('height', App.height);
    App.xAxisG.attr('transform', `translate(0,${App.height})`);
    App.yAxisRightG.attr('transform', `translate(${App.width},0)`);
    App.baseX = makeX(); App.baseY = makeY();
    const [xS, yS] = currentScales();
    updateAxes(xS, yS);
    drawAll(xS, yS);
  });

  // Initial draw
  updateAxes(App.baseX, App.baseY);
  drawAll(App.baseX, App.baseY);
}

// Boot
initChart();
