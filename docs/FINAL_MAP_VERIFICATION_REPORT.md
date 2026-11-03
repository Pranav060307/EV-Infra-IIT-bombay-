# ChargeAtlas India — Final Map Rendering & Cartography Verification Report
**Date:** November 2026 | **Test Environment:** MapLibre GL JS 4.x / WebGL2  
**Lead Developer:** Pranav Jadhav | **Team:** SuperNova  

---

## 1. Basemap Cartography Audit

### A. Carto Watermark Root Cause Analysis
During initial testing, map canvases rendered with diagonal semi-transparent red watermarks reading `API KEY REQUIRED — carto.com/basemaps/apikey`. 
- **Cause:** Carto updated their public raster and vector tile endpoint terms, injecting watermarks onto unauthenticated sessions.
- **Resolution:** Replaced Carto Voyager with verified, open cartographic tile providers.

### B. High-Performance Dark Cartography Architecture
Rather than applying visual CSS inversion hacks (`filter: invert(...)`) that invert font colors, shields, and symbols, ChargeAtlas India now implements a **dual-layer native dark cartographic stack**:
1. **ESRI Dark Gray Canvas Base:**
   - Tile URL: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
   - Renders deep charcoal landmasses, dark slate water bodies, and muted highway corridors natively.
2. **ESRI Dark Gray Reference Layer:**
   - Tile URL: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`
   - Renders crisp, transparent English typography for cities, districts, highways, and landmarks directly above the base layer without color distortion.

### C. Multi-Basemap Selection
The user can switch between three verified tile providers in the top-right corner of any map:
- **Cartographic Dark Canvas (ESRI):** Default dark theme, optimized for glowing vector overlays.
- **OpenStreetMap Standard (OSMF):** Fully compliant with OSMF usage policies (custom browser referrers, standard interactive caching, no bulk downloads, ODbL attribution).
- **ESRI World Imagery (Satellite):** High-resolution photographic satellite imagery for verifying terrain, toll plazas, and interchange layouts.

---

## 2. Spatial Layers & Interactive Feature Audit

| Map Component | Layers Verified | Interactive Capabilities | Zoom Presets | Test Verdict |
| :--- | :--- | :--- | :--- | :---: |
| **National Map** | Verified stations, operator filters | Station click drawer, hover tooltips, status badges | *All India* (`zoom 4.8`) / *Focus Maharashtra* (`zoom 6.4`) | **PASS** |
| **Maharashtra Regional** | 35 Census boundary polygons, 68 charging points | District choropleth hover, station markers, district selection | Centered on Maharashtra (`zoom 6.0`) | **PASS** |
| **Pune Urban Grid** | 607 metric 1km² polygons, PMC boundary | Cell click inspector, distance-to-station meter, status filter | Centered on Pune (`zoom 10.5`) | **PASS** |
| **Samruddhi Corridor** | 701km route centerline, 20km buffer, 17 interchanges | Interchange fly-to buttons, buffer toggle, 20km segment audit | Centered on Corridor (`zoom 7.2`) | **PASS** |
| **Site Recommender** | Candidate siting pins (urban vs highway) | Candidate detail card sync, priority badge inspection | Centered on Maharashtra (`zoom 6.8`) | **PASS** |

---

## 3. Resilience & Performance Verification

- **ResizeObserver Integration:** Automatically fires `map.resize()` upon container dimension shifts or tab changes, eliminating grey canvas rendering bugs.
- **React Error Boundary:** Catches tile timeout exceptions gracefully and presents an in-card reload button without crashing the host dashboard.
- **Marker Pin Harmonization:** Updated parser supports both `{ lat, lng }` and `{ latitude, longitude }`, ensuring 100% of markers bind properly.

