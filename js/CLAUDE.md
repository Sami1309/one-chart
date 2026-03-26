# js/ — Application JavaScript

## Purpose

Contains all JavaScript for the interactive chart application, split by concern. Files are loaded via `<script>` tags in order (no build step, no ES modules).

## Files

### constants.js
**Loaded first.** Pure data — no DOM interaction.
- CGS physical constants (G, c, ℏ, k_B, M☉, etc.)
- Derived constants (Planck mass/length, BH_const, C_const)
- Helper functions: `comptonR()`, `schwarzR()`, `toSuperscript()`
- The `objects` array (~35 entries, each with `{name, logR, logM, cat, desc}`)
- `isodensityLines` array with density epoch data + descriptions + Wikipedia links
- `wikiData` map: object name → `{img, layout, wiki}` for tooltip images
- `catCol` map: category → hex color

### tooltips.js
**Loaded second.** Depends on constants.js globals.
- `positionTooltip(event)` — clamps tooltip position within chart bounds
- `addEraTooltip(el, title, desc, wiki)` — attaches hover/click handlers to SVG text elements for isodensity/energy labels
- `showDetail(obj)` — populates and shows the detail panel (currently unused, kept for potential re-enabling)

### chart.js
**Loaded third.** Depends on constants.js + tooltips.js.
- `App` global state object (DOM refs, scales, zoom transform, axis format state, warp state)
- `getDims()`, `makeX()`, `makeY()` — responsive dimension helpers
- `currentScales()` — returns current D3 scales respecting zoom + warp state
- `makeWarpedScale()`, `animateScaleTransition()` — animated log↔linear transitions
- `updateAxes(xS, yS)` — redraws all 4 axes respecting log/linear format state
- Draw pipeline: `drawAll()` → `drawBackground()`, `drawForbidden()`, `drawIsodensity()`, `drawBoundaries()`, `drawSpecialAnnotations()`, `drawObjects()`
- `initChart()` — bootstraps SVG, axes, zoom, event listeners, initial draw
- Called immediately at load

### slideshow.js
**Loaded fourth.** Depends on chart.js (`App`, `zoomToRegion()`).
- `SLIDES` array — 5 slides with title, text, and optional viewport targets
- `initSlideshow()` — first-visit detection via localStorage, slide navigation, viewport animation
- `Journal` object — discovery tracking (localStorage), progress ring UI, category milestone toasts
- `showToast(message)` — temporary notification bar
- `zoomToRegion(x0, x1, y0, y1, duration)` — animates chart to a specific region

### keyboard.js
**Loaded fifth.** Depends on chart.js + slideshow.js.
- `initKeyboard()` — Tab cycles objects by mass, arrow keys pan, +/- zoom, 1-9/0 jump to categories, ? help overlay
- `initDeepLinks()` — reads URL hash on load to restore viewport, updates hash on zoom for shareable links
- `focusObject(obj)` — zooms to object and shows tooltip
- `jumpToCategory(cat)` — zooms to bounding box of all objects in a category

## Load Order

```html
<script src="js/constants.js"></script>
<script src="js/tooltips.js"></script>
<script src="js/chart.js"></script>
<script src="js/slideshow.js"></script>
<script src="js/keyboard.js"></script>
```

## Conventions

- All shared state lives on the `App` object
- Draw functions take `(xS, yS)` — the current D3 scales (possibly zoom-transformed)
- `App.chartArea` is cleared and fully redrawn on every zoom/pan event
- Axis groups and labels persist across redraws (only tick content changes)
