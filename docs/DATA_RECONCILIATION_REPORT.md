# ChargeAtlas India — Data Reconciliation Report
**IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge**
**Team:** SuperNova (Sanjivani University) | **Lead:** Pranav Jadhav

---

## Executive Summary

To ensure scientific integrity, peer-review defensibility, and compliance with the **Absolute Data Authenticity Rule**, this document transparently records four critical data reconciliation decisions implemented in ChargeAtlas India. In real-world urban and transport planning, administrative boundaries evolve, survey data varies from statutory declarations, and policy targets require rigorous geospatial definitions.

---

## 1. Maharashtra District Boundary Reconciliation (35 vs 36 Districts)

### The Discrepancy
- **Census 2011 Spatial Polygons:** 35 administrative districts.
- **Current Official Maharashtra Administration & VAHAN 4 Portal:** 36 districts.

### Root Cause Analysis
On **August 1, 2014**, the Government of Maharashtra bifurcated Thane district to create **Palghar** (the 36th district of Maharashtra) comprising talukas Palghar, Vada, Vikramgad, Jawhar, Mokhada, Dahanu, Talasari, and Vasai-Virar. Because the official Survey of India / Census 2011 district shapefiles predate August 2014, the vector geometry represents a unified Thane-Palghar geographical envelope.

### Reconciliation Strategy
1. **Statistical Reporting:** Tabular analytics (VAHAN EV registrations, Bureau of Energy Efficiency charging station audits, and projected populations) maintain separate, authentic records for both **Thane** and **Palghar** (totaling 36 administrative entries).
2. **Geospatial Mapping:** In the district choropleth map, charging stations located within Palghar talukas are mapped using their exact WGS-84 coordinates within the unified boundary polygon, accompanied by an explicit in-app UI badge:
   > *"Census 2011 shapefile maps Palghar within unified Thane boundary (bifurcated August 2014). Tabular stats reflect authentic 36-district reporting."*
3. **Traceability:** No dummy polygon was fabricated or approximated; geometry provenance is strictly preserved to standard Survey of India Census boundaries.

---

## 2. Samruddhi Mahamarg Expressway Length Reconciliation (701.0 km vs 644.4 km)

### The Discrepancy
- **Statutory Declared Highway Length (MSRDC):** 701.0 km.
- **Computed Vector Centerline Length in GIS:** 644.4 km.

### Root Cause Analysis
The statutory declaration by the Maharashtra State Road Development Corporation (MSRDC) represents the cumulative surface mileage of the Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg (including horizontal curves, elevation profile gradients, elevated viaduct approaches, and interchange connector loops). 

The GIS vector centerline connects the primary interchange nodes via planar chord geometries (EPSG:4326 projected to EPSG:32643 UTM Zone 43N). Geodesic line simplification across long inter-nodal stretches yields 644.4 km of direct alignment.

### Reconciliation Strategy
1. **Statutory Reference:** All policy compliance metrics and corridor overview headers cite the official statutory figure of **701.0 km**.
2. **GIS Spacing Audit:** The corridor is segmented into thirty-three (33) 20 km linear bins across the route alignment.
3. **Engineering Transparency:** The Samruddhi corridor UI explicitly annotates:
   > *"Statutory project length: 701.0 km (MSRDC). GIS vector centerline alignment: 644.4 km. Buffer analysis: 20 km bilateral influence zone."*

---

## 3. Operational Toll Interchanges vs Planned Waypoints (17 vs 24)

### The Discrepancy
- **Planned Waypoint Facilities / Interchanges:** 24 locations.
- **Currently Operational Surveyed Major Interchanges:** 17 grade-separated toll plazas.

### Root Cause Analysis
The master project blueprint for the Nagpur–Mumbai Expressway includes 24 planned access points and wayside amenities. However, as of the latest field survey and MSRDC commissioning phase, 17 major grade-separated toll interchanges are fully operational and open to regular vehicular traffic. The remaining 7 sites are in planning or phased commissioning.

### Reconciliation Strategy
1. **Active Routing:** The spatial buffer, nearest-interchange calculations, and operational wayside charging audits use the **17 verified operational interchange coordinates**.
2. **Planned Sites:** The remaining 7 planned interchanges are cataloged as candidate siting nodes for future Phase 4 deployment rather than counted as operational infrastructure.

---

## 4. Ministry of Power (MoP) September 2024 Guidelines Alignment

### Regulatory Framework
The Ministry of Power revised its *Guidelines for Installation and Operation of Electric Vehicle Charging Infrastructure* in **September 2024**, superceding previous iterations.

### Core Mandates & ChargeAtlas Implementation:
1. **Urban Coverage (Section 3.1(a)):**
   - *Clause:* At least one public charging station per $1\text{ km} \times 1\text{ km}$ grid in urban municipal areas.
   - *ChargeAtlas Metric:* Implemented via 607 discrete 1 km² metric grid polygons across the 516.18 km² Pune PMC boundary. Cells containing $\ge 1$ verified station are marked **Compliant**; cells with 0 are marked **Deficit**. Currently, 30 cells (4.94%) meet the target.
2. **Highway Spacing (Section 3.1(b)):**
   - *Clause:* At least one public charging station every 20 km on both sides of highways/expressways.
   - *ChargeAtlas Metric:* Evaluated across the 701 km corridor using 33 contiguous 20 km segments within a 20 km bilateral buffer. 9 segments meet the requirement; 24 segments exhibit an active charging deficit.
3. **Heavy Commercial & Long-Range EVs (Section 3.1(c)):**
   - *Clause:* At least one fast charging station ($\ge 100\text{ kW}$) every 100 km on high-density freight corridors.
   - *ChargeAtlas Metric:* Evaluated as a specialized high-power filter along the expressway, informing the Priority 1 recommendations for heavy-duty CCS-2 chargers at intermediate wayside hubs.

---

## Verification & Audit Sign-Off
- **Data Architect:** Pranav Jadhav (SuperNova)
- **Status:** Fully reconciled in backend GIS engine and frontend UI
- **Timestamp:** November 2026

