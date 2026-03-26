# Ideas

## A. Guided Tours

Predefined animated journeys through the chart. Examples:

- **"The Condensation Sequence"** — follows objects from Planck epoch → hadrons → atoms → stars, zooming to each in turn with narration
- **"The Black Hole Line"** — sweeps along the Schwarzschild boundary from instanton to Ton 618
- **"You Are Here"** — zooms from the Hubble radius down to the human dot, showing scale context

Each tour is a sequence of `{center, zoom, object, narration}` keyframes with smooth D3 transitions.

## D. Keyboard Navigation

- **Tab** cycles through objects (sorted by mass)
- **Arrow keys** pan the viewport
- **+/−** zoom in/out
- **Number keys 1–9** jump to categories (1=particles, 2=life, ...)
- **?** opens help overlay

## E. Deep-link Sharing

URL hash encodes viewport and selected object:

```
#x=-10,20&y=25,40&obj=Sun
```

A teacher can share a link that opens zoomed into the stellar region. The hash updates live as the user pans/zooms so copying the URL at any point captures the current view.

## F. Cosmic Timeline Strip

A thin horizontal bar below the header showing the age of the Universe on a log scale (10⁻⁴³ s → 13.8 Gyr).

- Hovering a point on the timeline highlights objects that condensed at that epoch
- Clicking snaps the main chart to the corresponding density region
- Epoch labels (Planck, GUT, EW, QCD, BBN, recombination, now) are marked along the bar

Dark mode