// ============================================================
// INFO MODAL
// ============================================================
function initInfoModal() {
  const hasVisited = localStorage.getItem('allObjects_visited');

  const modal = document.getElementById('info-modal');
  const closeBtn = document.getElementById('info-close');
  const startBtn = document.getElementById('info-start');
  const tourBtn = document.getElementById('tour-btn');

  function openModal() {
    modal.style.display = 'flex';
    requestAnimationFrame(() => { modal.style.opacity = '1'; });
  }

  function closeModal() {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 400);
    localStorage.setItem('allObjects_visited', 'true');
  }

  closeBtn.onclick = closeModal;
  startBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (tourBtn) {
    tourBtn.onclick = openModal;
  }

  // Auto-show on first visit
  if (!hasVisited) {
    openModal();
  }
}

function zoomToRegion(x0, x1, y0, y1, duration) {
  const xScale = App.width / (makeX()(x1) - makeX()(x0));
  const yScale = App.height / (makeY()(y0) - makeY()(y1));
  const k = Math.min(xScale, yScale) * 0.9;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const tx = App.width / 2 - makeX()(cx) * k;
  const ty = App.height / 2 - makeY()(cy) * k;
  const transform = d3.zoomIdentity.translate(tx, ty).scale(k);
  if (duration > 0) {
    App.svg.transition().duration(duration).call(App.zoom.transform, transform);
  } else {
    App.svg.call(App.zoom.transform, transform);
  }
}

// ============================================================
// DISCOVERY JOURNAL
// ============================================================
const Journal = {
  discovered: new Set(JSON.parse(localStorage.getItem('allObjects_discovered') || '[]')),

  discover(name) {
    if (this.discovered.has(name)) return false;
    this.discovered.add(name);
    localStorage.setItem('allObjects_discovered', JSON.stringify([...this.discovered]));
    this.updateUI();
    this.checkMilestones(name);
    return true;
  },

  count() { return this.discovered.size; },
  total() { return objects.length; },

  updateUI() {
    const ring = document.getElementById('discovery-ring');
    const count = document.getElementById('discovery-count');
    if (!ring || !count) return;

    const pct = this.count() / this.total();
    const circumference = 2 * Math.PI * 10;
    const offset = circumference * (1 - pct);

    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
    count.textContent = `${this.count()}/${this.total()}`;
  },

  checkMilestones(name) {
    const obj = objects.find(o => o.name === name);
    if (!obj) return;

    // Check category completion
    const catObjs = objects.filter(o => o.cat === obj.cat);
    const catDiscovered = catObjs.filter(o => this.discovered.has(o.name));
    if (catDiscovered.length === catObjs.length) {
      const catNames = {
        particle: 'particles', atomic: 'atoms', life: 'life forms',
        solar_system: 'solar system objects', star: 'stars', compact: 'compact objects',
        blackhole: 'black holes', planck: 'Planck-scale objects',
        galaxy: 'galaxies', largescale: 'large-scale structures', universe: 'the Universe'
      };
      showToast(`All ${catNames[obj.cat] || obj.cat} discovered!`);
    }

    // Full completion
    if (this.count() === this.total()) {
      showToast('You\'ve discovered every object in the Universe!');
    }
  },

  init() {
    this.updateUI();
  }
};

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-[300] opacity-0 transition-opacity duration-300';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
