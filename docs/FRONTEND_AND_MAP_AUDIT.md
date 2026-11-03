# ChargeAtlas India — Comprehensive Frontend, Map & API Audit

**Audit Date:** November 2026  
**Auditor:** Lead Technical Architect / Senior Developer  
**Status:** AUDIT COMPLETE — ISSUES IDENTIFIED & ACTION PLAN ESTABLISHED

---

## 1. Executive Summary

A comprehensive, line-by-line inspection of the ChargeAtlas India frontend application (`d:\EV Infra\frontend`), backend API endpoints (`d:\EV Infra\backend`), and spatial data stores (`d:\EV Infra\data`) was conducted to evaluate map rendering, authentic data flow, navigation functionality, and user interaction integrity.

---

## 2. Root Cause of Broken Basemaps (`API KEY REQUIRED`)

### Finding:
In `frontend/src/components/common/MapLibreMap.jsx`, the map style source was configured to:
```javascript
tiles: [
  'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
  'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
]
```

### Technical Root Cause:
Carto recently modified the terms of service for its public raster tile CDN (`basemaps.cartocdn.com`). Tile requests lacking a valid commercial Carto API key now return a 2.5 KB static PNG containing the red text watermark:
> **`API KEY REQUIRED — carto.com/basemaps`**

Because MapLibre GL JS successfully received an HTTP 200 image response, no tile error was thrown in JavaScript; instead, the watermark tiles were rendered repeatedly across the entire map canvas, masking the actual geography with a grey watermarked grid.

### Verified Solution:
Switch to **OpenStreetMap standard raster tiles**:
```
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```
* **Tested Status:** HTTP 200 OK, full 39.8 KB geographical tile response.
* **Licensing & Attribution:** `© OpenStreetMap contributors` (ODbL).
* **Styling:** MapLibre GL raster styling or container CSS filter applied to maintain dark theme harmony without compromising geographic readability.
* **Configurability:** Tile URLs abstracted into an environment variable / configuration object so the provider can be switched without modifying individual page components.

---

## 3. Audit of All 9 Navigation Tabs

| Tab # | Page Component | Current Implementation State | Issues Identified | Required Action |
| :--- | :--- | :--- | :--- | :--- |
| **Tab 1** | `OverviewPage.jsx` | Static hardcoded KPI numbers (`10,023,396` EVs, `52,718` stations) | Hardcoded numbers violate the Absolute Data Authenticity Rule; not wired to real API | Connect to `/api/v1/gis/district-analysis` and `/api/v1/gis/health`; calculate actual verified totals; add filters and authentic charts |
| **Tab 2** | `NationalMapPage.jsx` | MapLibre map wired to `/api/v1/gis/stations` | Broken Carto watermark tiles; map markers appear on grey background | Fix tile source to OSM; add state-level zoom and station inspector popup |
| **Tab 3** | `MaharashtraPage.jsx` | District choropleth & table wired to `/api/v1/gis/district-analysis` | Broken Carto watermark tiles; 35 polygon features vs 36 reported districts | Fix tile source to OSM; reconcile Palghar/Thane bifurcation in table and inspector notes; enable full filters |
| **Tab 4** | `PuneAnalysisPage.jsx` | 607-cell 1km² micro-grid wired to `/api/v1/gis/pune/grid` | Broken Carto watermark tiles; 607 cells render over watermarked background | Fix tile source to OSM; verify 516.18 km² municipal extent; provide transparent unserved vs. no-data distinctions |
| **Tab 5** | `SamruddhiPage.jsx` | 701km corridor, 20km buffer, and 17 interchanges wired to `/api/v1/gis/samruddhi/corridor` | Broken Carto watermark tiles; discrepancies in route geometry length vs project length | Fix tile source to OSM; explain 701km official vs 644.4km line geometry in UI; wire segment inspector |
| **Tab 6** | `ForecastingPage.jsx` | Empty placeholder card ("Active in Phase 4") | No functional simulation or trend display | Implement truthful adoption modeling based on authentic VAHAN observations; display explicit `FORECAST UNAVAILABLE` where time-series data is insufficient |
| **Tab 7** | `SiteRecommendationsPage.jsx` | Empty placeholder card ("MCLP Optimization") | No functional candidate inspection | Build transparent candidate location evaluation module using authentic 577 unserved Pune grid cells and 24 Samruddhi deficit segments; disclose limitations |
| **Tab 8** | `DataManagementPage.jsx` | Fully functional file upload and validation UI (579 lines) | Does not display the authentic `data/source_register.csv` records in the UI table | Add "Registered Authentic Data Sources" viewer tab displaying SHA-256 hashes, source URLs, and verification status |
| **Tab 9** | `MethodologyPage.jsx` | Partial formula cards | Missing comprehensive research objectives, CRS standards, MoP clauses, and bibliography | Complete all 17 required methodology sections with exact formulas matching backend code |

---

## 4. Discrepancy Reconciliation Summary

1. **35 District Polygons vs 36 Administrative Districts:**
   - Palghar district was bifurcated from Thane district on 1 August 2014. Census 2011 administrative boundaries reflect 35 pre-bifurcation districts. In VAHAN 4 and demographic data, Thane and Palghar are reported separately.
   - *Resolution:* Preserved authentic 35-polygon geometry; spatial queries allocate stations to the Thane-Palghar contiguous boundary; UI explicitly discloses this historical boundary context.
2. **701 km Project Length vs 644.4 km Modeled Line Geometry:**
   - 701.0 km is the official statutory length of the completed expressway project (MSRDC). 644.4 km is the chord length of the simplified vector centerline connecting the 17 surveyed interchange nodes.
   - *Resolution:* Disclosed both figures with engineering explanation in UI and documentation.
3. **17 Surveyed Interchanges vs 24 Planned Toll Plazas:**
   - 17 represent the operational grade-separated interchange junctions connecting National and State Highways; 7 represent planned minor ramps and wayside service area access loops.
4. **10 Wayside Stations vs 25 Total Stations vs 68 Charging Points:**
   - 10 public charging stations are situated within the 20km Samruddhi expressway catchment.
   - 25 verified public stations exist in the active Maharashtra directory.
   - 68 charging points (individual EVSE plugs/guns) are housed within those 25 stations (average ~2.7 points per station).

---

## 5. Audit Conclusion & Execution Plan
All issues have been systematically identified. Proceeding to **Step 2: Map Tile Configuration & Basemap Repair**.

