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


Feelings it should give you
    "I am peering into the grand world we almost stepped into during the space race but gave up on

    I am in awe of the elegance (it is just a graph, what makes it more elegant?)

    

Meta ideas

    Use voice mode

    Skills
    Different hooks/tools/agent swarms for design
    Get inspired, how to find the best of the best reliably

    Thesis that every second has to probabilistacally convert to the next second, though there is an "attention" mechanism

    WHat is the best chrome dev tools equivalent, give the agent the power to use the browser, navigate, report findings

    Gabe newell point about narcissitic injury


Fixes

    tooltips freeze when you open then zoom in/out
    proportion for wider images isn't good, perhaps comprimise between preserving width and crop, add some bars or shit on the side

    Color is boring, I hope dark mode is better


Small fixes
    Critical density doesn't link to the critical density part

Design improvements
    Make text larger, text clusters that elegantly fade out on zoom, while the specific text fills in
        Easy change, just make opacity a function of zoom amount

        Increase size of text/objects on a delayed axis in proportion to zoom

        The human tooltip is almost kino, actually the GEIST of it is almost kino
    Better shaping for the images, earth should have a grand entrance
    weird drop shadow
    The lines on the outside should go forever
    Nothing should be "dead lines", what does the square around
        stars mean?

    Explain forbidden by gravity and quantum uncertainty (perhaps more than a tooltop, why is the swarzchild radius)

    Explanation/tooltips for the legend (tooltips are gross, perhaps there is a button on the left of it, a vertical bar, expanding it reveals more detail)

    Nice animations and sheet

    It has to be good enough that you would think better of a place if you knew I was born there, that you would be proud to show the mythologized steve jobs and he took a 400IQ pill before taking it so he couldn't be diffused of clarity by any of his lampoonable biases

