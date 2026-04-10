# All Objects in the Universe — Interactive Visualization

## What This Is

An interactive web app plotting every known object in the Universe on a single log-log chart of mass vs. physical radius, based on "All Objects and Some Questions" by Lineweaver & Patel (*Am. J. Phys.* 91, 819–825, 2023). Licensed CC BY 4.0. DOI: [10.1119/5.0150209](https://doi.org/10.1119/5.0150209).

## Guidelines

Optimize for ease of use, visual quality, and user experience. Use the chrome devtools MCP (`.mcp.json`) to validate changes in the browser.

---

## File Structure

```
graph/
├── index.html                  Main chart page (HTML shell, Tailwind layout, chart-specific CSS)
├── about.html                  Minimalist about page (paper, physics, creator)
├── js/
│   ├── constants.js            Physics constants, object data, wiki mappings, colors
│   ├── tooltips.js             Tooltip positioning, era tooltips, detail panel
│   ├── chart.js                App state, D3 chart, draw pipeline, zoom, axis transitions
│   ├── slideshow.js            Intro slideshow, discovery journal, toast notifications
│   └── keyboard.js             Keyboard navigation, deep-link URL sharing
├── wiki-images/                35 locally-cached Wikipedia thumbnails (instant load)
│   └── CLAUDE.md               Image naming conventions and how to add new objects
├── graphic.jpeg                Original Figure 2 from the paper (reference image)
├── IDEAS.md                    Backlog of future feature ideas (guided tours, timeline, etc.)
└── CLAUDE.md                   This file
```

## Tech Stack

- **D3.js v7** (CDN) — SVG rendering, axes, zoom/pan behavior
- **Tailwind CSS** (CDN, runtime) — layout and component styling
- **Vanilla JS** — no framework, no build step, no bundler
- Scripts loaded via `<script>` tags in dependency order (see below)
- Chart-specific CSS (tooltips, detail panel, hover ring) lives in `<style>` in `index.html`

## Architecture

### Script Load Order (matters — each depends on the previous)

```html
<script src="js/constants.js"></script>   <!-- 1. Pure data, no DOM -->
<script src="js/tooltips.js"></script>    <!-- 2. Uses: App.container (via getElementById) -->
<script src="js/chart.js"></script>       <!-- 3. Uses: everything above. Creates App, calls initChart() -->
<script src="js/slideshow.js"></script>   <!-- 4. Uses: App, zoomToRegion, objects -->
<script src="js/keyboard.js"></script>    <!-- 5. Uses: App, zoomToRegion, wikiData, Journal -->
<script>                                  <!-- 6. Boot supplementary systems -->
  Journal.init();
  initSlideshow();
  initKeyboard();
  initDeepLinks();
</script>
```

### Global State

All shared state lives on the **`App` object** (defined in `chart.js`):

| Key | Type | Purpose |
|---|---|---|
| `App.svg` | D3 selection | Root `<svg>` element |
| `App.g` | D3 selection | Main `<g>` with margin transform |
| `App.chartArea` | D3 selection | Clipped `<g>` — cleared and fully redrawn on every zoom/pan |
| `App.zoom` | d3.zoom | Zoom behavior instance |
| `App.curT` | d3.zoomIdentity | Current zoom transform |
| `App.xAxisFormat` / `App.yAxisFormat` | `'log'` \| `'linear'` | Current axis mode |
| `App._xWarp` / `App._yWarp` | number (0–0.85) | Current warp interpolation factor for log↔linear animation |
| `App.showLabels` | boolean | Whether text labels are visible |
| `App.width` / `App.height` | number | Chart area dimensions (excluding margins) |
| `App.margin` | object | `{top, right, bottom, left}` |
| `App.X_DOMAIN` / `App.Y_DOMAIN` | [number, number] | Default log-space domains: `[-42, 58]` and `[-58, 68]` |

### Draw Pipeline

`drawAll(xS, yS)` clears `App.chartArea` and calls these in order:

1. `drawBackground(xS, yS)` — epoch-colored background bands (inflation, radiation, matter, dark energy)
2. `drawForbidden(xS, yS)` — shaded forbidden regions + region labels
3. `drawIsodensity(xS, yS)` — dashed density lines with interactive labels
4. `drawBoundaries(xS, yS)` — Schwarzschild line, Compton line, Planck reference lines
5. `drawSpecialAnnotations(xS, yS)` — energy scale labels (E_P, E_GUT, E_EW, CMB), NS/WD/BD rectangle
6. `drawObjects(xS, yS)` — object dots, text labels, hover/click handlers

All draw functions take `(xS, yS)` — the current D3 scale functions (possibly zoom-transformed or warped).

### Scale System

Two modes, switchable per-axis:

- **Log mode** (`warp=0`): standard `d3.scaleLinear` mapping log₁₀ values to pixel positions. Tick labels show exponents.
- **Linear mode** (`warp=0.85`): `makeWarpedScale()` creates a custom scale that interpolates between log-uniform and exponential spacing. Objects visibly cluster, demonstrating why log scales are necessary. Tick labels show `10ˣ` with unicode superscripts.

`animateScaleTransition()` smoothly interpolates the warp factor over 1.2s with ease-in-out. `currentScales()` returns the correct scale pair for the current warp + zoom state.

The `updateAxes(xS, yS)` function wraps warped scales into D3-axis-compatible objects via `axisScale()`, handling all 4 axes (bottom cm, top Mpc, left g, right M☉) and updating axis title labels dynamically.

---

## Features

### Core Chart
- ~35 objects from neutrinos to the Hubble radius on a log-log mass vs. radius plot
- Forbidden regions: pink (gravity), brown (quantum uncertainty), purple (doubly-forbidden QG)
- Schwarzschild and Compton boundary lines
- 7 isodensity lines labeled by epoch (Planck, GUT, EW, nuclear, atomic, SMBH, now)
- Energy scale annotations on right margin
- 4 axes: bottom (cm), top (Mpc), left (g), right (M☉)

### Interactivity
- **Zoom/Pan**: d3.zoom, scroll wheel, drag. Scale extent [0.3, 80].
- **Tooltips**: Hover any object dot to see Wikipedia image + mass/radius/density + description. Images are local (instant). Layout adapts: landscape images above text, portrait images beside text.
- **Era tooltips**: Hover isodensity labels or energy labels for epoch descriptions + Wikipedia links.
- **Click**: Opens the object's Wikipedia article in a new tab.
- **Axis toggle**: Log ↔ Linear per-axis with animated warped-scale transition.
- **Label toggle**: Show/hide all text annotations.
- **Reset view**: Returns to default zoom.

### Intro Slideshow
- 5-slide overlay on first visit (detected via `localStorage.allObjects_visited`)
- Each slide can animate the chart viewport to a relevant region
- Re-accessible via "Tour" button in nav bar
- Skip button always visible

### Discovery Journal
- Tracks which objects the user has hovered (persisted in `localStorage.allObjects_discovered`)
- Category completion triggers toast notifications ("All black holes discovered!")
- Full completion triggers a special toast

### Keyboard Navigation
- **Tab / Shift+Tab**: cycle through objects sorted by mass
- **Arrow keys**: pan
- **+ / −**: zoom in/out
- **1–9, 0**: jump to category (1=particles, 2=atoms, 3=life, 4=solar system, 5=stars, 6=compact, 7=black holes, 8=galaxies, 9=large-scale, 0=universe)
- **?**: help overlay
- **Esc**: close overlays

### Deep-link Sharing
- URL hash updates on zoom: `#x=-10,20&y=25,40`
- Loading a URL with a hash restores that viewport
- Shareable: copy URL to share a specific view of the chart

### About Page
- `about.html` — minimalist, Tailwind-styled
- Sections: hero, paper citation + DOI, key physics (Schwarzschild, Compton, instanton, isodensity), creator blurb, technical note
- Shared nav bar with chart page

---

## Key Physics (for getting data right)

All data is in **CGS units**. The two boundary lines are:

| Boundary | Equation | Log-space | Constant |
|---|---|---|---|
| Schwarzschild (BH) | r = 2Gm/c² | logR = logM + log(2G/c²) | `BH_const ≈ -28.07` |
| Compton | λ = ℏ/(mc) | logR = −logM + log(ℏ/c) | `C_const ≈ -37.52` |

Objects on the BH line: all black holes (instanton through Ton 618, Hubble radius).
Objects on the Compton line: all fundamental particles (neutrinos through top quark).

Isodensity: `ρ = 3m/(4πr³)` → `logM = 3·logR + log(4πρ/3)`. Slope 3 in log-log.

### Constants (CGS)

| Symbol | Value | Name |
|---|---|---|
| G | 6.674 × 10⁻⁸ cm³ g⁻¹ s⁻² | Gravitational constant |
| c | 2.998 × 10¹⁰ cm/s | Speed of light |
| ℏ | 1.055 × 10⁻²⁷ erg·s | Reduced Planck constant |
| m_P | 2.176 × 10⁻⁵ g | Planck mass |
| l_P | 1.616 × 10⁻³³ cm | Planck length |
| M☉ | 1.989 × 10³³ g | Solar mass |
| Mpc | 3.086 × 10²⁴ cm | Megaparsec |

---

## How To

### Add a new object

1. Add an entry to the `objects` array in `js/constants.js`:
   ```js
   {name:"Name", logR: log10(radius_cm), logM: log10(mass_g), cat:"category",
    desc:"Description text."},
   ```
2. Download its Wikipedia thumbnail to `wiki-images/name.jpg`
3. Add a mapping in `wikiData` in `js/constants.js`:
   ```js
   "Name": { img: "wiki-images/name.jpg", layout: "top", wiki: "Wikipedia_Article_Title" },
   ```
   Use `layout: "top"` for landscape/square images, `"side"` for portrait.
4. Categories: `particle`, `atomic`, `life`, `solar_system`, `star`, `compact`, `blackhole`, `planck`, `galaxy`, `largescale`, `universe`

### Modify tooltip appearance

Tooltip CSS is in `index.html` `<style>` block. Key classes:
- `.tooltip` — base (hidden by default, `opacity: 0`)
- `.tooltip.tt-visible` — shown (`opacity: 1`)
- `.tooltip.tt-layout-top` — landscape image above text
- `.tooltip.tt-layout-side` — portrait image beside text (flexbox)
- `.tt-body` — padding wrapper for text content
- `.tt-title`, `.tt-data`, `.tt-desc`, `.tt-wiki-link` — text elements

### Modify the axis transition

The warp system is in `chart.js`. Key parameters:
- `WARP_MAX = 0.85` — how far toward true linear (1.0 = full linear, unusable)
- Animation duration: 1200ms in `animateScaleTransition()`
- `warpedPos()` computes interpolated positions between log and exponential spacing

### Add a new page

1. Create `newpage.html` with the same `<nav>` block as `index.html` / `about.html`
2. Add a link in the nav bars of existing pages
3. Include Tailwind CDN + the same `tailwind.config` block

---

## Known Constraints

- **No build step**: everything runs from static files. CDN dependencies (D3, Tailwind) require internet on first load (Tailwind is cached aggressively).
- **Full redraw on zoom**: `App.chartArea` is cleared and redrawn every zoom frame. This is simple but could become a bottleneck with many more objects. If perf becomes an issue, consider rendering static layers (background, boundaries) to a separate non-cleared group.
- **Warped scales are not true D3 scales**: they're plain functions with `.domain()`, `.range()`, `.ticks()` attached. They work with `d3.axis` via the `axisScale()` wrapper in `updateAxes()`, but can't be used with `d3.scaleLinear` methods like `.nice()` or `.clamp()`.
- **localStorage keys**: `allObjects_visited` (boolean), `allObjects_discovered` (JSON array of names). Clearing these resets the slideshow and discovery journal.

## Reference

Lineweaver, C. H. & Patel, V. M. "All objects and some questions." *Am. J. Phys.* **91**, 819–825 (2023). https://doi.org/10.1119/5.0150209
