# CHARGEATLAS INDIA — PHASE 4: GIS API REFERENCE MANUAL

**Project:** ChargeAtlas India  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Lead Developer:** Pranav Jadhav  
**Base URL:** `http://localhost:8000/api/v1/gis`  
**OpenAPI / Swagger Spec:** `http://localhost:8000/docs`  
**Date:** November 2026  

---

## 1. Overview

The ChargeAtlas India GIS API exposes endpoints for spatial queries, administrative boundary GeoJSON, single-district deep-dives, single-station facility inspection, viewport bounding-box station filtering, micro-grid analysis, highway corridor buffering, and automated spatial operator testing.

All responses are serialized in standard JSON / GeoJSON (RFC 7946) with `Content-Type: application/json`.

---

## 2. API Endpoints Catalog

$$\begin{array}{|l|l|l|}
\hline
\textbf{HTTP Method} & \textbf{Path} & \textbf{Description} \\
\hline
\text{GET} & \text{/api/v1/gis/health} & \text{GIS engine status, projection systems, and layer counts.} \\
\text{GET} & \text{/api/v1/gis/spatial-validation} & \text{Executes OpenGIS / PostGIS operator test suite with ground truths.} \\
\text{GET} & \text{/api/v1/gis/boundaries} & \text{Lists all registered administrative and corridor boundaries.} \\
\text{GET} & \text{/api/v1/gis/boundaries/\{name\}} & \text{Retrieves official boundary GeoJSON by ID.} \\
\text{GET} & \text{/api/v1/gis/state-analysis} & \text{Aggregated state-level fleet and charging infrastructure indicators.} \\
\text{GET} & \text{/api/v1/gis/district-analysis} & \text{36-district point-in-polygon join and multi-criteria CGI scoring.} \\
\text{GET} & \text{/api/v1/gis/districts/\{name\}} & \text{Single-district deep-dive profile with station list and fleet breakdown.} \\
\text{GET} & \text{/api/v1/gis/stations} & \text{Query stations with bounding-box clipping and pagination.} \\
\text{GET} & \text{/api/v1/gis/stations/\{id\}} & \text{Single-station facility specs, EVSE kiosks, and connector types.} \\
\text{GET} & \text{/api/v1/gis/pune/grid} & \text{Pune 1km} \times \text{1km micro-grid and MoP 2030 benchmark evaluation.} \\
\text{GET} & \text{/api/v1/gis/samruddhi/corridor} & \text{701km Samruddhi Mahamarg corridor buffering and spacing audit.} \\
\text{GET} & \text{/api/v1/gis/policy-compliance} & \text{Consolidated MoP September 2024 compliance report.} \\
\hline
\end{array}$$

---

## 3. Endpoint Specifications

### 3.1 Health & Engine Metadata
- **URL:** `GET /api/v1/gis/health`
- **Response Format:**
```json
{
  "status": "HEALTHY",
  "engine": "GeoPandas 1.2.0 + Shapely 2.0 + PyProj 3.7",
  "crs_storage": "EPSG:4326 (WGS 84 Ellipsoid)",
  "crs_projected_western": "EPSG:32643 (UTM Zone 43N - Pune & Western Maharashtra)",
  "crs_projected_eastern": "EPSG:32644 (UTM Zone 44N - Vidarbha / Eastern Maharashtra)",
  "geodesy_engine": "WGS-84 Ellipsoidal Geodesy for Trans-Zone Corridors (Samruddhi)",
  "available_boundaries": [
    {"id": "maharashtra_districts", "name": "Official 36 Maharashtra Districts", "geometry_type": "MultiPolygon"},
    {"id": "pune_urban", "name": "Pune Urban Agglomeration (PMC + PCMC)", "geometry_type": "Polygon"},
    {"id": "samruddhi_corridor", "name": "Samruddhi Mahamarg (701 km Alignment)", "geometry_type": "LineString"}
  ],
  "verified_stations_count": 25,
  "is_synthetic": false,
  "data_mode": "authentic"
}
```

---

### 3.2 Spatial Operator Validation Test Suite
- **URL:** `GET /api/v1/gis/spatial-validation`
- **Response Format:**
```json
{
  "timestamp": "2026-11-02T16:00:00Z",
  "crs_evaluated": [
    "EPSG:4326 (Storage)",
    "EPSG:32643 (UTM 43N)",
    "WGS-84 Ellipsoidal Geodesy"
  ],
  "operators_tested": [
    "ST_Within",
    "ST_Intersects",
    "ST_DWithin",
    "ST_Distance",
    "ST_Transform",
    "ST_Area",
    "ST_Length"
  ],
  "all_tests_passed": true,
  "test_results": {
    "ST_Within": {"status": "PASSED", "result_1": true, "result_2": false},
    "ST_Transform_and_ST_Distance": {"utm43n_distance_meters": 14731.94, "geodetic_wgs84_distance_meters": 14734.9, "status": "PASSED"},
    "ST_DWithin": {"dwithin_20000m": true, "dwithin_5000m": false, "status": "PASSED"},
    "ST_Area": {"calculated_area_sqkm": 565.97, "statutory_area_sqkm": 516.18, "status": "PASSED"},
    "ST_Length": {"geodetic_length_km": 701.0, "status": "PASSED"},
    "ST_Intersects": {"result": true, "status": "PASSED"}
  }
}
```

---

### 3.3 State Analysis & Aggregate Indicators
- **URL:** `GET /api/v1/gis/state-analysis`
- **Response Format:**
```json
{
  "region": "Maharashtra",
  "state_code": "IN-MH",
  "state_area_sqkm": 307713.0,
  "census_2011_population": 112374333,
  "projected_2024_population": 128450000,
  "total_districts": 36,
  "districts_with_public_chargers": 8,
  "districts_without_public_chargers": 28,
  "fleet_summary": {
    "total_ev": 886752,
    "ev_2w": 682799,
    "ev_3w": 115278,
    "ev_4w": 84242,
    "ev_bus": 4433,
    "tw_percentage": 77.0,
    "fw_percentage": 9.5
  },
  "infrastructure_summary": {
    "verified_charging_stations": 25,
    "verified_charging_points": 96,
    "total_rated_power_kw": 2840.0,
    "ev_to_charging_point_ratio": 9237.0,
    "source": "BEE EV Yatra National Directory"
  }
}
```

---

### 3.4 Charging Stations with Viewport Bounding Box & Pagination
- **URL:** `GET /api/v1/gis/stations`
- **Query Parameters:**
  - `bbox` (string, optional): Viewport bounding box `minLon,minLat,maxLon,maxLat` (e.g. `73.75,18.45,74.00,18.65`).
  - `district` (string, optional): Administrative district name.
  - `operator` (string, optional): Charge Point Operator name (e.g. `Tata Power`, `Jio-bp pulse`, `Statiq`).
  - `min_power` (float, optional): Minimum station rated capacity in kW.
  - `limit` (int, default `100`): Maximum features to return.
  - `offset` (int, default `0`): Pagination offset.

---

### 3.5 Single Station Specification
- **URL:** `GET /api/v1/gis/stations/{station_id}`
- **Path Parameter:** `station_id` (e.g. `BEE-MH-PUN-001`).
- **Response Format:** Returns full station metadata, coordinates, operator, address, and detailed list of EVSE kiosks and connectors.

---

### 3.6 Single District Profile
- **URL:** `GET /api/v1/gis/districts/{district_name}`
- **Path Parameter:** `district_name` (e.g. `Pune`, `Mumbai Suburban`, `Gadchiroli`).
- **Response Format:** Returns district fleet breakdown, verified stations, CGI score, component breakdowns, and stations list.

