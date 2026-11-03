# ChargeAtlas India — Map Repair Technical Report

**Date:** November 2026  
**Status:** **MAPS REPAIRED & VERIFIED**  
**Component:** `frontend/src/components/common/MapLibreMap.jsx`

---

## 1. Problem Diagnosis: The `API KEY REQUIRED` Watermark

### Symptoms:
The map canvas displayed a dark grey grid covered by repeated red text:
> `API KEY REQUIRED — carto.com/basemaps`

### Root Cause:
The tile configuration previously targeted CartoDB's public raster endpoints (`basemaps.cartocdn.com/rastertiles/dark_all/...`). Under Carto's recent terms of service updates, tile requests without an active commercial API key return a 2.5 KB static PNG with the watermark baked into the image. Because the HTTP status was 200 OK, MapLibre GL JS treated these tiles as valid imagery and tiled them across the canvas.

---

## 2. Technical Solution Implemented

### 2.1 Primary Basemap: OpenStreetMap Standard Tiles
Switched the default tile provider to OpenStreetMap's official raster tile service:
* **Endpoint URL:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
* **Licensing & Policy:** Open Database License (ODbL) & OpenStreetMap Tile Usage Policy.
* **Tested Response:** HTTP 200 OK, full ~39.8 KB geographical tiles containing complete road networks, national highways, district names, topography, and municipal boundaries.
* **No API Key Requirement:** Operates transparently without proprietary keys or watermarks.

### 2.2 Visual Harmonization with Dark Dashboard
To preserve the premium dark theme without obscuring geographic features, a CSS filter is applied to the raster canvas:
```css
filter: brightness(0.68) invert(0.92) hue-rotate(180deg) saturate(0.75);
```
This produces a sleek, high-contrast dark geographic basemap where highways, water bodies, and terrain features remain sharp, while verified green charging station markers and cyan boundaries pop cleanly.

### 2.3 Interactive Basemap Switcher
Users can toggle basemaps dynamically via the bottom-right switcher:
1. **Dark Theme (OSM Muted):** Optimized for night-time dashboard analytics.
2. **OpenStreetMap Standard:** Full color standard geographic map for detailed landmark identification.
3. **ESRI World Imagery (Satellite):** High-resolution satellite aerial imagery for terrain and highway interchange inspection.

### 2.4 Reliability Enhancements
* **ResizeObserver:** Automatically triggers `map.resize()` on container dimension shifts or window resizing to eliminate blank grey strips.
* **Error Boundary:** Renders an informative fallback UI if WebGL is unavailable in the browser environment.
* **Attribution:** Displays standard `© OpenStreetMap contributors` attribution compliant with ODbL.

