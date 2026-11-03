# ChargeAtlas India — Final Data Accuracy & Provenance Audit Report
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University) | **Developer Lead:** Pranav Jadhav  

---

## 1. Cryptographic Source Register Audit

Every active processed dataset file in `d:\EV Infra\data\processed` was audited for existence, size, SHA-256 cryptographic digest, and source provenance.

| File Name | File Size | Calculated SHA-256 Digest | Authoritative Source | Verification Status |
| :--- | :---: | :---: | :---: | :---: |
| `maharashtra_districts.geojson` | 369,065 B | `7adfbe315dfc17055a3a2c8688b0243d80661ce8a9edd5215098878b70433078` | Survey of India / LGD / Census 2011 | **VERIFIED** |
| `pune_urban_boundary.geojson` | 708 B | `c01e67e55d361d8a91ac2212ee205ac68cf9e3f86cac56eea997a5913b1a0332` | Pune Municipal Corp & PCMC Town Planning | **VERIFIED** |
| `samruddhi_mahamarg_alignment.geojson` | 974 B | `576e4d5900fb731fef0665a8914fc06fcc29780944324e05c322bc6b39b1b215` | MSRDC (Maharashtra State Road Dev Corp) | **VERIFIED** (Chord Model) |
| `samruddhi_interchanges.json` | 3,124 B | `8135dc262b2d9c807abd96369a23b23911e38260112e711259a202aaca120660` | MSRDC Operational Interchange Survey | **VERIFIED** (17 Plazas) |
| `maharashtra_verified_charging_stations.json` | 13,294 B | `2bffe98eb5491037ca917da6879cbb36c913513316141607a85cfdc0c2b3a5f3` | BEE EV Yatra (BEE, MoP) & OSM Directory | **VERIFIED** (25 Sites / 68 Points) |
| `vahan_maharashtra_ev_registrations.csv` | 2,230 B | `e3721297e4a4b6b7e44f87fe9fe6ccaac6b11c3150b31c5bda97b3b0ab017910` | MoRTH Parivahan VAHAN 4 Open Portal | **PARTIALLY VERIFIED** |
| `maharashtra_district_population.csv` | 1,368 B | `f8bbfa737b6b376dee25d8637f368261c710e9f78634c56d22fa9151b75944cb` | Census of India (ORGI Projections) | **VERIFIED** |
| `mop_charging_guidelines_2024.json` | 2,339 B | `8be5a4971c8f8c76762d79586d73942eeb16ae9fb6e68846c4f90111d4eb0766` | Ministry of Power (17 Sept 2024 Guidelines) | **VERIFIED** |

---

## 2. Mathematical Consistency & Geometrical Verification

### A. Pune Urban Agglomeration & 607 Grid Polygons
- **Spatial Envelope:** Pune Municipal Corporation (PMC) and Pimpri Chinchwad Municipal Corporation (PCMC) covering 516.18 km².
- **Grid Generation Method:** Projected to `EPSG:32643` (UTM Zone 43N metric grid in meters). A regular 1000m × 1000m mesh was intersected with the municipal boundary.
- **Sliver Removal:** Filtered boundary fragments $< 50,000\text{ m}^2$ (5% of 1 km²).
- **Result:** Exactly 607 valid polygon cells.
- **Coverage Status:** 30 cells contain verified public charging stations or adjacent access ($<1\text{ km}$), yielding a **4.94% compliance rate** against the Clause 11(1)(a) target for FY 2029-30.

### B. Samruddhi Mahamarg Corridor
- **Statutory Length:** 701.0 km (MSRDC official project road chainage).
- **Modeled GIS Centerline:** 644.4 km (17-point piecewise linear chord geometry connecting the 17 operational interchanges from Shivmadka to Amane).
- **Buffer Geometry:** 20.0 km bilateral geodesic buffer enclosing 13,100 km² of highway catchment area.
- **Wayside Charging Stations:** 8 operational stations within the 20 km corridor influence zone (2 additional sites planned).
- **Spacing Compliance:** 9 of 33 segments are compliant with the 20 km spacing benchmark (Clause 11(1)(b)), yielding a **27.3% compliance level**.
- **Heavy-Duty Fast Chargers (Clause 12(7)):** 0 operational stations currently feature $\ge 2 \times 240\text{ kW}$ chargers, highlighting the critical national investment opportunity.

### C. 35 Boundaries vs 36 Administrative Districts
- **Palghar Bifurcation:** Palghar was carved out of Thane district on 1 August 2014.
- **Spatial Alignment:** Census 2011 Survey of India boundary files reflect the pre-2014 unified Thane-Palghar geometry.
- **Data Treatment:** Tabular statistics track 36 separate administrative records for VAHAN EV registrations and Census populations. Spatial point-in-polygon assignment maps Palghar stations within the unified envelope, transparently documented in UI banners.

---

## 3. Data Gaps and Future Pipeline Requirements

1. **VAHAN Reproduction Log:** Future data refresh should log the exact HTTP POST parameters and session cookies from `vahan.parivahan.gov.in` to elevate the VAHAN registration dataset from *Partially Verified* to *Verified*.
2. **Real-Time Dynamic Telemetry:** Live OCPI (Open Charge Point Interface) telemetry integration is recommended for Phase 4 to track real-time socket availability, downtime, and tariff pricing.

