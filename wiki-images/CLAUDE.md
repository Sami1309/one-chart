# wiki-images/ — Wikipedia Thumbnail Images

## Purpose

Stores locally-cached Wikipedia thumbnail images for all ~35 objects on the chart. Images are served from disk for instant tooltip loading (no network requests).

## Naming Convention

Files are named `{key}.jpg` where key is a lowercase slug derived from the Wikipedia article title:
- `neutrino.jpg` ← Neutrino
- `sgr_a.jpg` ← Sagittarius_A*
- `observable_universe.jpg` ← Observable_universe

## Image Properties

- All thumbnails are ~330px wide (a few are 320px)
- Format: JPEG
- Source: Wikipedia REST API (`/api/rest_v1/page/summary/{title}` → `thumbnail.source`)
- Two layout categories based on aspect ratio:
  - **Landscape/square** (width ≥ height): displayed above tooltip text (`layout: "top"`)
  - **Portrait** (height > width × 1.15): displayed beside tooltip text (`layout: "side"`)

## Mapping

The `wikiData` object in `js/constants.js` maps each object name to its image file, layout mode, and Wikipedia article slug. To add a new object:
1. Download its Wikipedia thumbnail to this directory
2. Add an entry to `wikiData` in `js/constants.js`
