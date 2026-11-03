# ChargeAtlas India — PostGIS Configuration & Spatial Coordinate System Analysis
**Phase 4:** Database Foundation & PostGIS Integration  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University) | **Lead:** Pranav Jadhav  

---

## 1. PostGIS Availability Audit

### Current Status
- **PostgreSQL 18 Extensions Directory:** `C:\Program Files\PostgreSQL\18\share\extension`
- **Audit Result:** PostGIS is **NOT YET INSTALLED** in this PostgreSQL 18 instance. `postgis.control` is absent.
- **Root Cause:** Standard EnterpriseDB base installers do not bundle PostGIS directly in the core engine package; it must be selected via EnterpriseDB Stack Builder or installed via the PostGIS Windows binary bundle.

### Compatible Installation Package
To install PostGIS for PostgreSQL 18 on Windows 64-bit:

1. **Option 1 (Official Stack Builder):**
   - Run: `C:\Program Files\PostgreSQL\18\bin\stackbuilder.exe`
   - Select: `PostgreSQL 18 on port 5432`
   - Under **Spatial Extensions**, check **PostGIS 3.5 Bundle for PostgreSQL 18 (64 bit)**
   - Complete the wizard to copy extension libraries and SQL scripts.

2. **Option 2 (Direct PostGIS Windows Archive):**
   - Download the official win64 PostGIS build for PostgreSQL 18 from:
     `https://download.osgeo.org/postgis/windows/pg18/`
   - Extract `bin`, `lib`, and `share/extension` files into `C:\Program Files\PostgreSQL\18`.

### Activation & Verification Commands
Once installed, execute the following SQL in `chargeatlas_db`:
```sql
-- Enable PostGIS spatial extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable PostGIS topology & raster (optional)
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify version and build flags
SELECT PostGIS_Full_Version();

-- Test spatial point construction for Pune (WGS-84)
SELECT ST_AsText(ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326));
-- Expected Output: POINT(73.8567 18.5204)
```

---

## 2. Rigorous CRS Suitability Analysis

In GIS engineering, choosing an inappropriate Coordinate Reference System (CRS) introduces scale errors, angular distortions, and erroneous distance measurements.

### The Misconception: "Use EPSG:32643 Everywhere in Maharashtra"
A common mistake in Indian GIS projects is assuming that `EPSG:32643` (UTM Zone 43N) is universally valid across all of Maharashtra. 

### Mathematical Reality of UTM Zones in Maharashtra:
- **UTM Zone 43N (EPSG:32643):**
  - Central Meridian: **75°E**
  - Standard Longitude Bounds: **72°E to 78°E**
  - Scale factor at central meridian: $0.9996$
  - Scale distortion increases rapidly as distance from 75°E exceeds $\pm 3^\circ$.
- **UTM Zone 44N (EPSG:32644):**
  - Central Meridian: **81°E**
  - Standard Longitude Bounds: **78°E to 84°E**
- **Geographical Extent of Maharashtra:**
  - Longitude Range: **72.6°E** (Dahanu/Palghar coast) to **80.9°E** (Bhamragad/Gadchiroli border).
  - The $78^\circ\text{E}$ meridian bifurcates Maharashtra into two distinct UTM zones!

### Study Area CRS Suitability Matrix:

| Study Area | Geographic Extent | UTM Zone 43N Suitability | Recommended Technical CRS / Approach |
| :--- | :---: | :---: | :--- |
| **Pune Urban Grid (Level 3)** | $73.70^\circ\text{E} - 74.05^\circ\text{E}$ | **OPTIMAL** ($<0.04\%$ distortion) | `EPSG:32643` (UTM Zone 43N metric grid in meters) |
| **Western Maharashtra** (Mumbai, Thane, Pune, Satara, Kolhapur) | $72.6^\circ\text{E} - 76.5^\circ\text{E}$ | **HIGHLY SUITABLE** | `EPSG:32643` (UTM Zone 43N) |
| **Eastern Maharashtra / Vidarbha** (Nagpur, Bhandara, Gondia, Chandrapur, Gadchiroli) | $78.0^\circ\text{E} - 80.9^\circ\text{E}$ | **UNSUITABLE** (Exceeds Zone 43N boundary; elongation distortion $>0.2\%$) | `EPSG:32644` (UTM Zone 44N) or PostGIS `geography` |
| **Samruddhi Mahamarg (701 km Corridor)** | Nagpur ($79.03^\circ\text{E}$) to Thane ($73.28^\circ\text{E}$) | **CROSSES ZONE BOUNDARY** ($78^\circ\text{E}$) | **PostGIS `geography(LineString, 4326)`** for exact WGS-84 ellipsoidal distance, or **Lambert Conformal Conic (LCC India)** |
| **Storage & Presentation** | Pan-India | N/A | **`EPSG:4326` (WGS-84)** for spatial storage; `EPSG:3857` restricted strictly to raster web-map display |

---

## 3. PostGIS Spatial Column Architecture (GeoAlchemy2)

```python
from geoalchemy2 import Geometry

# Charging Stations: Point geometry
geom = Column(Geometry(geometry_type="POINT", srid=4326, spatial_index=True))

# District Boundaries: MultiPolygon geometry
geom = Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326, spatial_index=True))

# Urban Grid Cells: Polygon geometry
geom = Column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True))

# Expressway Corridor: MultiLineString geometry
geom = Column(Geometry(geometry_type="MULTILINESTRING", srid=4326, spatial_index=True))
```

### Spatial Indexing Rules
1. **GiST Spatial Indexes:** Every geometry column must feature an explicit Generalized Search Tree (`GIST`) index for R-tree bounding box search.
2. **PostGIS Measurement:**
   - Use `ST_DWithin(geom::geography, target::geography, distance_meters)` for exact geodetic distance searches without projection distortion.
   - Use `ST_Intersects` and `ST_Contains` for point-in-polygon queries against administrative district and grid polygons.

