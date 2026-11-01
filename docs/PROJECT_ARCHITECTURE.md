# ChargeAtlas India — System Architecture Document

## 1. System Vision & Overview
**ChargeAtlas India** is an enterprise-grade, GIS-based analytical and decision-support platform engineered to address the critical spatial imbalances in India's EV charging infrastructure. Designed specifically for transport planners (MHI, ICAT, State Nodal Agencies, Urban Local Bodies, DISCOMs, and NHAI), ChargeAtlas moves beyond simple "charger locator" apps to deliver rigorous, traceable, data-driven planning intelligence.

```
                              DATA LAYER
┌────────────────────────────────────────────────────────────────────────┐
│  Public Data Sources (VAHAN, BEE EV Yatra, OpenChargeMap, OSM, LGD)    │
│  Uploaded Datasets (CSV, GeoJSON, Excel) & Synthetic Demo Datasets      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       MODULE 1: DATA PIPELINE
┌───────────────────────────────────▼────────────────────────────────────┐
│  - File Parsers & Format Normalizers (CSV, GeoJSON)                   │
│  - Data Cleaning & Validation (Coordinate checks, Schema typing)       │
│  - De-duplication Engine (RapidFuzz + Spatial Distance Clustered)      │
│  - Data Confidence Scorer & Quality Reporter (0-100 scale)             │
│  - Data Status Registry (NOT_COLLECTED -> VALIDATED -> IMPORTED)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         STORAGE & SPATIAL ENGINE
┌───────────────────────────────────▼────────────────────────────────────┐
│  PostgreSQL 18 + PostGIS 3.x Spatial Database (EPSG:4326 & EPSG:3857)  │
│  (Graceful Spatial SQLite/GeoPandas fallback for local portability)    │
│  - Entities: Stations, Points, Connectors, Registrations, Substations │
│  - Spatial Units: National, State, District, 1km² Grid, 20km Corridor  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         ANALYTICAL ENGINES
┌───────────────────────────────────┼────────────────────────────────────┐
│ MODULE 2: GAP ASSESSMENT          │ MODULE 3: DEMAND FORECASTING       │
│ - Charging Gap Index (CGI)        │ - Compound Annual Growth Rate      │
│ - MoP 2024 Norm Evaluation        │ - Logistic S-Curve Model           │
│ - 1km² Built-up Urban Coverage    │ - Segment-wise (2W/3W/4W/Bus)      │
│ - 20km Highway Spacing Gap Check  │ - Daily kWh & Charger Demand       │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
                        MODULE 4: SITE RECOMMENDER
┌───────────────────────────────────▼────────────────────────────────────┐
│ - Maximal Covering Location Problem (MCLP) Optimization               │
│ - Multi-Criteria Weighted Attractiveness Scoring                       │
│ - Distance to Electrical Substations (Feasibility proxy)               │
│ - Traceable Justification Engine for every candidate site             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        FASTAPI BACKEND (REST API)
┌───────────────────────────────────▼────────────────────────────────────┐
│ - OpenAPI 3.0 documented endpoints (/api/v1/...)                       │
│ - High-performance GeoJSON streaming & aggregation                   │
│ - Configurable simulation & sensitivity parameters                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                   MODULE 5: INTERACTIVE WEB PLATFORM
┌───────────────────────────────────▼────────────────────────────────────┐
│ React (Vite) + Tailwind CSS + MapLibre GL JS + Recharts + Lucide      │
│ - National Map Layer (India overview, state-level choropleths)         │
│ - Maharashtra Regional Deep Dive (36 districts gap ranking)            │
│ - Pune Urban Region Deep Dive (1km² grid coverage analysis)            │
│ - Samruddhi Mahamarg Corridor Deep Dive (20km spacing gap flags)       │
│ - Interactive Scenario Simulator & Downloadable Validation Reports     │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Core Architectural Principles
1. **Separation of Concerns:** All analytical and GIS computation resides in backend Python services (FastAPI/GeoPandas/PostGIS). Frontend components never perform heavy spatial math; they consume pre-processed, performant GeoJSON and JSON payloads.
2. **Every Number is Traceable:** Every data point retains its source URL, download/import timestamp, confidence score, and clear flags denoting whether it is verified or synthetic.
3. **Decoupled 3-Tier Hierarchy for Chargers:**
   - **Station (`charging_stations`)**: Physical location / facility (geocoded lat/long, amenities, operator).
   - **Point / EVSE (`charging_points`)**: Individual physical charger box/pedestal.
   - **Connector (`charging_connectors`)**: Individual plug interface (CCS-2, Type 2, Bharat AC-001, CHAdeMO) with specific power ratings (kW).
4. **Segment-Specific Planning:** PM E-DRIVE mandates differentiate infrastructure by vehicle segment. ChargeAtlas models slow AC charging (2W/3W), high-power DC fast charging (4W), and ultra-high-power depot charging (Bus) separately.
5. **Portability & Graceful Degradation:** The backend dynamically detects database capabilities. If PostgreSQL/PostGIS is running, it leverages native spatial indexes (`GIST`). If developing in an offline or sandboxed environment, it executes seamlessly via GeoPandas and spatial SQLite.

