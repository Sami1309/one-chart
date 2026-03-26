// ============================================================
// INTRODUCTORY SLIDESHOW
// ============================================================
const SLIDES = [
  {
    title: "Every object in the Universe",
    text: "From quantum particles to the cosmic horizon \u2014 all known objects plotted by their mass and physical radius. This single chart spans over 60 orders of magnitude in size and 120 in mass.",
    viewport: null, // default view
  },
  {
    title: "Mass vs. Size",
    text: "The horizontal axis shows physical radius (in cm), the vertical axis shows mass (in grams). Both use logarithmic scales \u2014 each step is a factor of 10. Without log scales, everything would be invisible next to the Hubble radius.",
    viewport: null,
  },
  {
    title: "Two fundamental boundaries",
    text: "General relativity says nothing can be smaller than its Schwarzschild radius (the black hole line, slope +1). Quantum mechanics says you can't localize a particle below its Compton wavelength (slope \u22121). These carve out the forbidden regions.",
    viewport: {x: [-40, 10], y: [-45, 20]},
  },
  {
    title: "The smallest possible object",
    text: "Where the two boundaries cross sits the Planck-mass instanton \u2014 a black hole whose Compton wavelength equals its Schwarzschild radius. Mass \u2248 2.18\u00D710\u207B\u2075 g, radius \u2248 1.62\u00D710\u207B\u00B3\u00B3 cm. It may represent the initial conditions of the Universe.",
    viewport: {x: [-38, -28], y: [-10, 2]},
  },
  {
    title: "Explore",
    text: "Hover any object for details. Click to visit its Wikipedia page. Use the scroll wheel to zoom, drag to pan. See how everything from neutrinos to superclusters finds its place in this cosmic map.",
    viewport: null,
  },
];

function initSlideshow() {
  // Check first visit
  const hasVisited = localStorage.getItem('allObjects_visited');

  const overlay = document.getElementById('slideshow-overlay');
  const titleEl = document.getElementById('slide-title');
  const textEl = document.getElementById('slide-text');
  const dotsEl = document.getElementById('slide-dots');
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');
  const skipBtn = document.getElementById('slide-skip');
  const tourBtn = document.getElementById('tour-btn');

  let current = 0;

  function showSlide(i) {
    current = i;
    titleEl.textContent = SLIDES[i].title;
    textEl.textContent = SLIDES[i].text;

    // Dots
    dotsEl.innerHTML = SLIDES.map((_, idx) =>
      `<button class="w-2 h-2 rounded-full transition-all duration-300 ${idx === i ? 'bg-red-800 w-4' : 'bg-gray-300 hover:bg-gray-400'}" data-idx="${idx}"></button>`
    ).join('');
    dotsEl.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => showSlide(parseInt(btn.dataset.idx));
    });

    prevBtn.style.visibility = i === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = i === SLIDES.length - 1 ? 'Start Exploring' : 'Next';

    // Animate viewport if specified
    if (SLIDES[i].viewport) {
      const vp = SLIDES[i].viewport;
      zoomToRegion(vp.x[0], vp.x[1], vp.y[0], vp.y[1], 800);
    } else if (i === 0 || i === SLIDES.length - 1) {
      // Reset to default
      App.svg.transition().duration(800).call(App.zoom.transform, d3.zoomIdentity);
    }
  }

  function close() {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
    localStorage.setItem('allObjects_visited', 'true');
  }

  prevBtn.onclick = () => { if (current > 0) showSlide(current - 1); };
  nextBtn.onclick = () => {
    if (current < SLIDES.length - 1) showSlide(current + 1);
    else close();
  };
  skipBtn.onclick = close;

  tourBtn.onclick = () => {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    showSlide(0);
  };

  // Auto-show on first visit
  if (!hasVisited) {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    showSlide(0);
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
  App.svg.transition().duration(duration || 600).call(App.zoom.transform, transform);
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
