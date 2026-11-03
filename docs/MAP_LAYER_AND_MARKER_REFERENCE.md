# ChargeAtlas India — Map Layer & Marker Symbology Reference

**Project:** ChargeAtlas India  
**Competition:** IIT Bombay Techfest 2026–27 — EV Infrastructure Map India Challenge (MHI & ICAT)  
**Standardisation Target:** Cartographic Consistency, High-Contrast Visualization & Mathematical Rigor  
**Date of Publication:** 2 November 2026  
**Status:** SPECIFICATION COMPLETE

---

## 1. Coordinate Reference Systems (CRS) Standards

To ensure strict geographic fidelity, distance preservation, and compliance with Survey of India norms, ChargeAtlas India operates on a dual-CRS architecture:

```
+--------------------------------------------------------------------------+
| GEODETIC STORAGE & VISUALIZATION (EPSG:4326)                             |
| • Standard: WGS 84 Geographic Ellipsoidal Coordinates                    |
| • Units: Decimal Degrees (Latitude, Longitude)                           |
| • Scope: Vector GeoJSON transmission, MapLibre GL rendering canvas       |
+--------------------------------------------------------------------------+
                                  │
                                  ▼ (pyproj / GeoPandas transformation)
+--------------------------------------------------------------------------+
| PROJECTED METRIC CALCULATIONS (EPSG:32643)                               |
| • Standard: WGS 84 / UTM Zone 43N (Transverse Mercator)                  |
| • Units: Meters                                                          |
| • Scope: Pune 1000m x 1000m grid generation, 20 km Samruddhi buffer,    |
|          Euclidean nearest-neighbor distance metrics, Voronoi polygons   |
+--------------------------------------------------------------------------+
```

> [!IMPORTANT]
> Geodesic calculations performed directly on EPSG:4326 coordinates introduce latitude-dependent longitudinal distortion in Maharashtra (~$1^\circ \approx 105.4\text{ km}$ latitude vs $99.8\text{ km}$ longitude at $19^\circ\text{ N}$). All buffering, grid partitioning, and Euclidean distance measurements in the backend GIS engine MUST project to **EPSG:32643 (UTM Zone 43N)** prior to spatial analysis.

---

## 2. Basemap Tile Services & Attributions

ChargeAtlas India uses three verified raster tile endpoints with zero proprietary token constraints and zero CSS inversion filters:

### 1. ESRI Dark Gray Canvas (Default Theme)
- **Base Tile URL:** `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
- **Reference Tile URL:** `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`
- **Tile Format:** PNG (256 $\times$ 256 px)
- **Max Zoom:** 16
- **Attribution:** `&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community`
- **Characteristics:** Neutral dark gray landmass, deep charcoal marine zones, low-contrast political boundaries, and high-contrast white text overlays.

### 2. OpenStreetMap Standard
- **Tile URL:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Tile Format:** PNG (256 $\times$ 256 px)
- **Max Zoom:** 19
- **Attribution:** `&copy; OpenStreetMap contributors`
- **Characteristics:** Standard cartographic daylight rendering suitable for urban street identification and road network tracing.

### 3. ESRI World Imagery (Satellite)
- **Tile URL:** `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
- **Tile Format:** JPEG (256 $\times$ 256 px)
- **Max Zoom:** 18
- **Attribution:** `Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP`
- **Characteristics:** High-resolution optical satellite orthomosaics for verifying highway rest stops, toll plazas, and physical charging site surroundings.

---

## 3. Marker Clustering Symbology

Cluster circles are computed natively by MapLibre GL JS at zoom levels $z \in [0, 13]$ using a 50px spatial aggregation radius:

| Cluster Size | Radius | Fill Color | Hex Code | Border Stroke | Typography |
|---|---|---|---|---|---|
| **Small (< 10 stations)** | 18 px | Electric Cyan | `#06b6d4` | 2.5px Solid White (`#ffffff`), 90% opacity | 12px Bold White |
| **Medium (10–25 stations)** | 24 px | Sapphire Blue | `#3b82f6` | 2.5px Solid White (`#ffffff`), 90% opacity | 12px Bold White |
| **Large (> 25 stations)** | 30 px | Amethyst Violet | `#8b5cf6` | 2.5px Solid White (`#ffffff`), 90% opacity | 13px Bold White |

**Cluster Interaction:** Clicking any cluster triggers MapLibre's `getClusterExpansionZoom()` and smoothly eases the viewport to zoom in until the cluster dissolves into individual station markers.

---

## 4. Differentiated Station Pin Symbology (Unclustered Points)

When zoomed in to $z \ge 14$ or for unclustered points, markers render with rigorous status differentiation:

| Category | Visual Marker Color | Hex Code | Marker Radius | Border Stroke | Provenance / Verification Status |
|---|---|---|---|---|---|
| **Operational Public Station** | Emerald Green | `#10b981` | 7 px | 2.0px Solid White (`#ffffff`) | Verified physical public facility (BEE EV Yatra / OCM) |
| **Planned / Sanctioned Station** | Sky Cyan | `#06b6d4` | 7 px | 2.0px Solid White (`#ffffff`) | Sanctioned under FAME-II / State Policy pipeline |
| **Candidate Siting Location** | Royal Violet | `#8b5cf6` | 7 px | 2.0px Solid White (`#ffffff`) | Derived from Phase 3 GIS MCLP optimization solver |
| **Synthetic Demo Record** | Industrial Amber | `#f59e0b` | 7 px | 2.0px Solid White (`#ffffff`) | Development demo data (clearly flagged as `SYNTHETIC`) |

---

## 5. Vector Geographic Boundaries & Choropleth Styling

| Layer ID | Geometry Type | Fill Color & Opacity | Stroke Color & Width | Source Provenance |
|---|---|---|---|---|
| `maharashtra_districts` | MultiPolygon (35 features) | `#0ea5e9` @ 12% opacity | `#38bdf8` @ 1.5px (70% opacity) | Census 2011 / Survey of India (LGD 2024 aligned) |
| `pune_urban` | Polygon (1 feature) | `#8b5cf6` @ 15% opacity | `#a855f7` @ 2.0px (80% opacity) | Pune Municipal Corp (PMC) & PCMC Agglomeration |
| `pune_1km_grid` | Polygon (516 cells) | CGI Choropleth: Green ($\le 30$), Amber ($31-60$), Rose ($>60$) | `#334155` @ 0.8px (40% opacity) | Metric 1km $\times$ 1km EPSG:32643 analytical grid |
| `samruddhi_corridor` | MultiLineString (701 km) | N/A (Linear Alignment) | `#10b981` @ 3.0px (90% opacity) | MSRDC Official Expressway Alignment Vector |
| `samruddhi_buffer_20km` | Polygon (Corridor Envelope) | `#f59e0b` @ 8% opacity | `#f59e0b` @ 1.5px dashed (60% opacity) | 20 km statutory buffer envelope (Clause 11(1)(b)) |

---

## 6. Census 2011 Thane-Palghar Boundary Reconciliation Standard

- **Administrative Context:** Palghar district was bifurcated from Thane on 1 August 2014.
- **Geospatial Boundary:** Census 2011 official shapefiles contain 35 polygons, mapping the combined Thane-Palghar landmass as a contiguous unit.
- **Analytical Rule:** In the ChargeAtlas database:
  1. VAHAN 4 EV fleet registration records are individually tabulated across all 36 districts (Thane: 84,210 EVs; Palghar: 19,450 EVs).
  2. Population totals are individually tabulated (Thane: 11.06M; Palghar: 3.19M).
  3. Point-in-polygon queries for spatial station allocation evaluate against the shared geographic polygon with physical coordinate geocoding.

---

## 7. Station Facility vs Connector Gun Terminology Standard

To maintain data authenticity and avoid misleading metrics:
- **Charging Station (Site):** Represents a physical premises or geospatial facility equipped with EV supply equipment (EVSE).
- **Charging Point / Gun (EVSE Connector):** Represents an individual charging cable/nozzle capable of dispensing electrical power to one vehicle at a time.
- **Strict Rule:** A single physical station with 2 dual-gun 60 kW DC fast chargers possesses **1 Station** and **4 Charging Points (Guns)**. The ChargeAtlas India interface strictly segregates these two values and NEVER conflates them.

