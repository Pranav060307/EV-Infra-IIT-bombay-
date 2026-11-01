# ChargeAtlas India — Data Sources & Acquisition Registry

## 1. Overview & Data Acquisition Philosophy
ChargeAtlas India is designed around **open, public, and verifiable data sources**. As transport planners and engineers, we adhere to strict data provenance rules:
1. Every dataset must have its license, endpoint, ingestion timestamp, and confidence rating explicitly logged.
2. In Phase 1 and early Phase 2, prior to full manual extraction of government portals, the platform provides **downloadable CSV templates** and **clearly labelled synthetic demonstration datasets**.
3. **No Fake Claims:** Synthetic datasets are never misrepresented as real government statistics. They carry explicit UI flags (`[SYNTHETIC DEMO DATA]`). When real VAHAN or BEE extracts are uploaded, the application seamlessly processes them through identical pipelines without code modifications.

---

## 2. Comprehensive Data Source Matrix

| Layer | Primary Source | Access Method | Format | Status | Primary Use in ChargeAtlas | Fallback Strategy |
|---|---|---|---|---|---|---|
| **EV Registrations** | **VAHAN 4 Dashboard** (MoRTH) | Web export / RTO queries | CSV / XLSX | Active Scouting | Historical growth rate, cumulative EV stock, vehicle segment breakdown (2W/3W/4W/Bus) | India Data Portal VAHAN extracts; State Transport Dept. annual reports |
| **Existing EV Chargers** | **BEE EV Yatra** (Bureau of Energy Efficiency) | Web locator / Open API (MoP 2024 mandate) | JSON / CSV | Active Scouting | Ground-truth public charging stations, connector types, and capacities across India | OpenChargeMap API & OpenStreetMap bulk extracts |
| **Crowdsourced Chargers** | **OpenChargeMap (OCM)** | Public REST API (`v3/poi`) | JSON | Ready | Geocoded stations, multi-connector listings, operator tagging | Manual verification against CPO apps (Tata Power, Statiq) |
| **Roads & Built-up Land** | **OpenStreetMap (OSM) via Geofabrik** | Overpass API & PBF dumps | GeoJSON / PBF | Ready | Highway network (Samruddhi Mahamarg, NH-48), major arterials, urban built-up centroids | Natural Earth Roads dataset; PMGSY GIS portal |
| **Admin Boundaries** | **Local Government Directory (LGD)** | Official Downloads / Survey of India | GeoJSON / Shapefile | Ready | Standardized 3-tier boundary hierarchy: National, States (36), Districts (760+) with LGD codes | Open Data Handshake / Survey of India boundaries |
| **Population & Density** | **Census of India (Projected) & WorldPop** | 100m raster & District tables | GeoJSON / CSV | Ready | Urban grid density, 1km² cell filtering, population per charger | District-level 2024 Census office projections |
| **Electrical Substations** | **DISCOMs (MSEDCL/MSETCL) & OpenStreetMap** | Power GIS layers & OSM power=substation | GeoJSON | Ready | Proximity analysis for site recommendations, voltage level estimation | OSM substation points with explicit disclaimer |

---

## 3. Data Source Deep Dives & Acquisition Procedures

### 3.1 VAHAN 4 Dashboard (Ministry of Road Transport and Highways)
- **URL:** [https://vahan.parivahan.gov.in/vahan4dashboard/](https://vahan.parivahan.gov.in/vahan4dashboard/)
- **Target Fields:** `State`, `RTO Name / Code`, `Fuel: Electric`, `Vehicle Category` (Two Wheeler, Three Wheeler, Four Wheeler / Light Motor Vehicle, Heavy Passenger Vehicle / Bus), `Registration Month & Year`.
- **Key Technical Nuance:** VAHAN reports by **RTO Office**, not by administrative district. ChargeAtlas provides a cross-reference lookup table mapping RTO codes to official LGD district codes. Where an RTO spans multiple districts, EV population is allocated using population proportions.
- **Handling Telangana & Special UTs:** Historically, Telangana and Lakshadweep were outside central VAHAN. ChargeAtlas detects missing coverage and marks these regions as `[INSUFFICIENT DATA / STATE PORTAL REQUIRED]`.

### 3.2 BEE EV Yatra & National Charging Station Database
- **URL:** [https://evyatra.beeindia.gov.in/](https://evyatra.beeindia.gov.in/)
- **Context:** MoP's 2024 Guidelines mandate a unified central repository of public charging stations maintained by BEE.
- **Target Fields:** `Station Name`, `CPO / Operator`, `Latitude`, `Longitude`, `Connector Standards` (CCS-2, Type-2, Bharat AC-001, Bharat DC-001), `Rated Power (kW)`, `Operational Status`.

### 3.3 OpenChargeMap (OCM)
- **API Endpoint:** `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN`
- **Rate Limits & API Key:** Free developer API key required.
- **Deduplication Requirement:** Stations from OCM often duplicate BEE listings. ChargeAtlas applies a spatial distance threshold (<100m) combined with RapidFuzz name and operator string matching before merging.

### 3.4 OpenStreetMap (Overpass API)
- **Queries:**
  - Highway Corridors: `[out:json]; way["highway"~"motorway|trunk"](bbox); (._;>;); out body;`
  - Substations: `[out:json]; node["power"="substation"](bbox); out body;`
  - Candidate Amenities: `[out:json]; node["amenity"~"fuel|parking|bus_station"](bbox); out body;`

---

## 4. Synthetic Data Strategy & Integrity Guarantees
During initial development, before production ingestion of government portals, ChargeAtlas supplies:
1. **Realistic Synthetic Demo Records:**
   - 36 States with representative EV adoption distributions.
   - Maharashtra all 36 districts with realistic historical growth rates (2020-2024).
   - Pune urban district with a 1km × 1km synthetic grid showing clustered stations and underserved pockets.
   - Samruddhi Mahamarg (701 km corridor) with waypoints, existing wayside amenities, and identified spacing gaps.
2. **Downloadable Standard Templates:**
   - Pre-formatted CSV files (`ev_registrations_template.csv`, `charging_stations_template.csv`, `candidate_locations_template.csv`).
3. **Audit Flag:**
   - Every synthetic row in PostgreSQL has `is_synthetic = TRUE`.
   - The UI displays a persistent amber badge `[DEMO MODE / SYNTHETIC DATA]` when demonstrating with sample data.

