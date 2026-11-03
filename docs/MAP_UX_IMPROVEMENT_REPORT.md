# ChargeAtlas India — Map UX & GIS Interface Overhaul Report

**Project:** ChargeAtlas India  
**Competition:** IIT Bombay Techfest 2026–27 — EV Infrastructure Map India Challenge (MHI & ICAT)  
**Developer:** Single Developer (Pranav Jadhav, Team SuperNova)  
**Date of Audit & Upgrade:** 2 November 2026  
**Status:** COMPLETED & VERIFIED

---

## 1. Executive Summary

This report documents the end-to-end upgrade of the geospatial visualisation engine in ChargeAtlas India. The previous MapLibre implementation exhibited three primary deficiencies:
1. Limited basemap versatility and reliance on basic tile layers without genuine dark-mode cartography.
2. Inability to handle high-density station markers at lower zoom levels, resulting in visual clutter.
3. Minimal popup data that conflated individual charging nozzles/guns with physical station facilities and lacked comprehensive provenance metadata.

The overhauled `MapLibreMap` component (`frontend/src/components/common/MapLibreMap.jsx`) delivers high-performance client-side rendering with native MapLibre GeoJSON clustering, differentiated marker symbology, full map navigation controls, a live mouse coordinate monitor, a collapsible legend, and a 3-section interactive inspection drawer.

---

## 2. Basemap Architecture & Cartography

All map tiles are delivered using free, open, and authoritative cartographic endpoints without proprietary API keys or CSS inversion filters:

| Provider Key | Provider Name | Cartographic Type | Max Zoom | Primary Use Case |
|---|---|---|---|---|
| `esri_dark` *(Default)* | ESRI Dark Gray Canvas | Composite (Base + Reference) | 16 | High-contrast dashboard view; dark ocean/land masses with crisp white labels |
| `osm_standard` | OpenStreetMap Standard | Single Raster Tile Layer | 19 | Street-level urban exploration and landmark verification |
| `satellite` | ESRI World Imagery | Single Raster Tile Layer | 18 | Satellite terrain inspection, highway interchange siting & physical validation |

### Zero CSS Invert Guarantee
Previous prototypes of dark maps in web applications often inverted standard OSM light tiles with `filter: invert(100%) hue-rotate(180deg)`. This produced visually broken maps where water bodies appeared brown/orange and satellite imagery became inverted negatives. ChargeAtlas India employs genuine multi-layer raster styles from ESRI's ArcGIS World Dark Gray Canvas (`Canvas/World_Dark_Gray_Base` + `Canvas/World_Dark_Gray_Reference`), ensuring accurate cartography, natural water rendering, and sharp label typography.

---

## 3. Marker Symbology & Clustering Engine

To prevent UI lag and marker overlap at state and national zooms, the mapping engine now leverages native MapLibre vector clustering (`cluster: true, clusterRadius: 50, clusterMaxZoom: 13`).

### A. Cluster Symbology
When stations are clustered at zoom levels 0 through 13, circular cluster badges dynamically adjust their visual weight and color based on station density:

- **Small Cluster (< 10 stations):** 18px radius, Cyan (`#06b6d4`), 2.5px white border.
- **Medium Cluster (10–25 stations):** 24px radius, Blue (`#3b82f6`), 2.5px white border.
- **Large Cluster (> 25 stations):** 30px radius, Purple (`#8b5cf6`), 2.5px white border.
- **Click Interaction:** Clicking any cluster triggers `getClusterExpansionZoom()` and smoothly animates (`easeTo`) the camera directly into the constituent markers.

### B. Differentiated Station Pins (Zoom $\ge$ 14 or Unclustered)
Individual station locations are rendered with distinct semantic color assignments:

| Category | Visual Marker Color | Hex Code | Border & Halo | Semantics |
|---|---|---|---|---|
| **Operational Public Station** | Emerald Green | `#10b981` | 2px White Solid | Fully commissioned and active physical site (BEE EV Yatra) |
| **Planned / Sanctioned Site** | Sky Cyan | `#06b6d4` | 2px White Solid | Sanctioned under FAME-II / State Policy; in deployment |
| **Candidate / Recommended Site** | Royal Violet | `#8b5cf6` | 2px White Solid | Algorithmic siting recommendation from MCLP optimization |
| **Synthetic Demo Record** | Industrial Amber | `#f59e0b` | 2px White Solid | Isolated demonstration record (clearly flagged with `DEMO` badge) |

---

## 4. Rich Interactive Station Drawer

Clicking any individual station marker opens an on-map slide-over inspection drawer formatted into three mandatory sections:

```
+-------------------------------------------------------------+
| [OPERATIONAL / DEMO] BEE-MH-PUN-001                    [X]  |
| Tata Power - Vivanta Pune Hinjawadi                         |
+-------------------------------------------------------------+
| 1. STATION INFORMATION                                      |
|   • CPO / Operator:  Tata Power EZ Charge                   |
|   • Location:        Hinjawadi Phase 1, Pune, Maharashtra   |
|   • Coordinates:     18.5912, 73.7385  [Copy Coordinates]   |
+-------------------------------------------------------------+
| 2. CHARGING INFRASTRUCTURE                                  |
|   • Charging Points: 4 pedestals / guns                     |
|   • Total Power:     120.0 kW                               |
|   • Connectors:      CCS-2 / Type-2 AC                      |
|   • Access / Pricing: Public • Paid                         |
|   * Note: Connector count reflects guns; station is facility|
+-------------------------------------------------------------+
| 3. DATA PROVENANCE & AUDIT                                  |
|   • Source:          BEE EV Yatra National Directory        |
|   • Audit Status:    VERIFIED PHYSICAL SITE                 |
+-------------------------------------------------------------+
```

### Missing Data Rule
If any property (such as connector types or total power) is missing in the underlying registry, the interface explicitly displays `"Not available"` instead of empty strings, `null`, or invented estimates.

---

## 5. Map Controls & Geospatial Utilities

The map interface incorporates comprehensive interactive controls:

1. **Basemap Switcher:** One-click dropdown to toggle between Dark Canvas, OpenStreetMap, and ESRI Satellite.
2. **Layer Visibility Toggles:** Toggle buttons to show or hide the `Charging Stations` layer and `Administrative Boundaries` layer independently.
3. **Extent Reset Button:** Instantly restores the camera to the default geographic bounding box (India national view, Maharashtra state view, or district-specific bounding box).
4. **Fullscreen Toggle:** Enables immersive, distraction-free analysis using the HTML5 Fullscreen API.
5. **Zoom In / Zoom Out:** Smooth incremental navigation buttons (`+` and `-`).
6. **Live Coordinate Monitor:** Bottom status indicator reporting cursor latitude, longitude, and current zoom level (`Lat: 18.5204°, Lon: 73.8567° | Zoom: 6.2`).
7. **Metric Scale Bar:** MapLibre scale control calibrated in meters and kilometers.
8. **Collapsible Map Legend:** Explaining marker types, cluster badges, and boundary outlines with quick hide/show toggling.

---

## 6. Verification Status

| Feature | Requirement | Verified Result |
|---|---|---|
| Dark Canvas Basemap | Zero watermarks, zero CSS inversion | **PASSED** (ESRI Dark Gray composite) |
| Basemap Switching | Dynamic style update without crash | **PASSED** (Dark, OSM, Satellite) |
| Marker Clustering | Dynamic clusters at low zoom | **PASSED** (Radius 18–30px, step colors) |
| Cluster Click Zoom | Smooth expansion on click | **PASSED** (`easeTo` with target zoom) |
| Marker Discrimination | 4 distinct status colors | **PASSED** (Emerald, Cyan, Purple, Amber) |
| Station Detail Drawer | 3 structured audit sections | **PASSED** (Info, Hardware, Provenance) |
| Copy Coordinates | 1-click clipboard integration | **PASSED** (6-decimal precision) |
| Fullscreen & Reset | Reliable state management | **PASSED** (HTML5 Fullscreen + reset extent) |

