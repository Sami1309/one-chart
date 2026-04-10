// ============================================================
// KEYBOARD NAVIGATION
// ============================================================

// Objects sorted by mass for tab-cycling
const sortedObjects = [...objects].sort((a, b) => a.logM - b.logM);

const catKeys = {
  '1': 'particle', '2': 'atomic', '3': 'life', '4': 'solar_system',
  '5': 'star', '6': 'compact', '7': 'blackhole', '8': 'galaxy',
  '9': 'largescale', '0': 'universe',
};

let selectedIdx = -1;
let helpVisible = false;

function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Don't capture when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    // Don't capture when slideshow is open
    const modal = document.getElementById('info-modal');
    if (modal && modal.style.display !== 'none') return;

    const PAN_STEP = 50;
    const ZOOM_FACTOR = 1.3;

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          selectedIdx = selectedIdx <= 0 ? sortedObjects.length - 1 : selectedIdx - 1;
        } else {
          selectedIdx = (selectedIdx + 1) % sortedObjects.length;
        }
        focusObject(sortedObjects[selectedIdx]);
        break;

      case 'ArrowLeft':
        e.preventDefault();
        panBy(PAN_STEP, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        panBy(-PAN_STEP, 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        panBy(0, PAN_STEP);
        break;
      case 'ArrowDown':
        e.preventDefault();
        panBy(0, -PAN_STEP);
        break;

      case '+':
      case '=':
        e.preventDefault();
        zoomBy(ZOOM_FACTOR);
        break;
      case '-':
      case '_':
        e.preventDefault();
        zoomBy(1 / ZOOM_FACTOR);
        break;

      case '?':
        e.preventDefault();
        toggleHelp();
        break;

      case 'Escape':
        if (helpVisible) toggleHelp();
        break;

      default:
        // Number keys for category jumps
        if (catKeys[e.key]) {
          e.preventDefault();
          jumpToCategory(catKeys[e.key]);
        }
        break;
    }
  });
}

function panBy(dx, dy) {
  const t = App.curT;
  const newT = d3.zoomIdentity.translate(t.x + dx, t.y + dy).scale(t.k);
  App.svg.transition().duration(150).call(App.zoom.transform, newT);
}

function zoomBy(factor) {
  const t = App.curT;
  const cx = App.width / 2;
  const cy = App.height / 2;
  const newT = d3.zoomIdentity
    .translate(cx - (cx - t.x) * factor, cy - (cy - t.y) * factor)
    .scale(t.k * factor);
  App.svg.transition().duration(200).call(App.zoom.transform, newT);
}

function focusObject(obj) {
  if (!obj) return;
  zoomToRegion(obj.logR - 8, obj.logR + 8, obj.logM - 8, obj.logM + 8, 500);

  // Show tooltip briefly
  const tooltip = d3.select('#tooltip');
  const tooltipEl = tooltip.node();
  const wd = wikiData[obj.name];
  tooltipEl.className = 'tooltip';
  const textHtml = `
    <div class="tt-body">
      <div class="tt-title">${obj.name}</div>
      <div class="tt-desc">${obj.desc.substring(0, 150)}${obj.desc.length > 150 ? '\u2026' : ''}</div>
    </div>
  `;
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
  // Position in center
  const tt = document.getElementById('tooltip');
  tt.style.left = (App.width / 2 + App.margin.left - 150) + 'px';
  tt.style.top = (App.height / 2 + App.margin.top + 30) + 'px';
  tooltipEl.classList.add('tt-visible');


  // Auto-hide after 3s
  clearTimeout(App._kbTooltipTimer);
  App._kbTooltipTimer = setTimeout(() => {
    tooltipEl.className = 'tooltip';
  }, 3000);
}

function jumpToCategory(cat) {
  const catObjs = sortedObjects.filter(o => o.cat === cat);
  if (catObjs.length === 0) return;
  // Find bounding box
  const x0 = Math.min(...catObjs.map(o => o.logR)) - 3;
  const x1 = Math.max(...catObjs.map(o => o.logR)) + 3;
  const y0 = Math.min(...catObjs.map(o => o.logM)) - 3;
  const y1 = Math.max(...catObjs.map(o => o.logM)) + 3;
  zoomToRegion(x0, x1, y0, y1, 600);
}

function toggleHelp() {
  helpVisible = !helpVisible;
  let overlay = document.getElementById('help-overlay');

  if (helpVisible) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'help-overlay';
      overlay.className = 'fixed inset-0 z-[260] bg-black/50 backdrop-blur-sm flex items-center justify-center';
      overlay.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-sm w-[90%] p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Keyboard Shortcuts</h2>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between"><span class="text-gray-400">Tab / Shift+Tab</span><span>Cycle objects</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Arrow keys</span><span>Pan</span></div>
            <div class="flex justify-between"><span class="text-gray-400">+ / \u2212</span><span>Zoom in / out</span></div>
            <div class="flex justify-between"><span class="text-gray-400">1\u20139, 0</span><span>Jump to category</span></div>
            <div class="flex justify-between"><span class="text-gray-400">?</span><span>This help</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Esc</span><span>Close</span></div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
            <div class="mb-1">Categories: 1=particles 2=atoms 3=life 4=solar system</div>
            <div>5=stars 6=compact 7=black holes 8=galaxies 9=large-scale 0=universe</div>
          </div>
        </div>
      `;
      overlay.onclick = (e) => { if (e.target === overlay) toggleHelp(); };
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
}

// ============================================================
// DEEP-LINK SHARING
// ============================================================
function initDeepLinks() {
  // Read hash on load
  if (window.location.hash) {
    try {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const x = params.get('x');
      const y = params.get('y');
      if (x && y) {
        const [x0, x1] = x.split(',').map(Number);
        const [y0, y1] = y.split(',').map(Number);
        if (!isNaN(x0) && !isNaN(x1) && !isNaN(y0) && !isNaN(y1)) {
          zoomToRegion(x0, x1, y0, y1, 0);
        }
      }
    } catch (e) { /* ignore bad hashes */ }
  }

  // Update hash on zoom
  let hashTimer = null;
  const origZoom = App.zoom.on('zoom');
  App.zoom.on('zoom', function(event) {
    origZoom.call(this, event);
    // Debounce hash update
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      const xS = App.curT.rescaleX(makeX());
      const yS = App.curT.rescaleY(makeY());
      const xd = xS.domain().map(d => Math.round(d));
      const yd = yS.domain().map(d => Math.round(d));
      const hash = `x=${xd[0]},${xd[1]}&y=${yd[0]},${yd[1]}`;
      history.replaceState(null, '', '#' + hash);
    }, 300);
  });
}
