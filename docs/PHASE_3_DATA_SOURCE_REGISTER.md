# ChargeAtlas India — Official Data Source Register & Provenance Ledger
**Document ID:** CA-PHASE3-DATA-SOURCE-REGISTER  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University) | **Lead:** Pranav Jadhav  
**Role:** Lead Full-Stack Developer & GIS Engineer  
**Date:** 2 November 2026  
**Status:** Ingested & Verified  

---

## 1. Official Dataset Inventory & Status Summary

| Dataset ID | Domain | Official Dataset Name | Publishing Authority | Access Method | Status | Records | Cryptographic Hash (SHA-256) |
|---|---|---|---|---|:---:|:---:|---|
| **DS-VAHAN-01** | EV Fleet | VAHAN 4 Maharashtra EV Registrations | MoRTH (Govt of India) | Official Dashboard Export | **IMPORTED** | 144 | `e3721297e4a4b6b7e44f87fe9fe6ccaac6b11c3150b31c5bda97b3b0ab017910` |
| **DS-BEE-01** | Charging Infra | BEE EV Yatra Verified Public Charging Stations | BEE (Ministry of Power) | Portal GeoJSON Verification | **IMPORTED** | 25 | `2bffe98eb5491037ca917da6879cbb36c913513316141607a85cfdc0c2b3a5f3` |
| **DS-BEE-02** | Charging Infra | BEE EV Yatra Station Tabular Register | BEE (Ministry of Power) | Tabular CSV Normalization | **AVAILABLE** | 25 | `c90ba3d34e8c782c3ce10f604b39e2f4035a97cfcf892015e249bec5ba1257d2` |
| **DS-CENSUS-01** | Demographics | Census 2011 District Population & Density | ORGI (Census of India) | Primary Census Abstract | **IMPORTED** | 36 | `f8bbfa737b6b376dee25d8637f368261c710e9f78634c56d22fa9151b75944cb` |
| **DS-BOUND-01** | GIS Geometry | Maharashtra Administrative District Boundaries | Survey of India / LGD | Official Vector Boundary | **IMPORTED** | 35 | `7adfbe315dfc17055a3a2c8688b0243d80661ce8a9edd5215098878b70433078` |
| **DS-BOUND-02** | GIS Geometry | Pune Urban Agglomeration Boundary | PMC & PCMC Town Planning | Statutory Master Plan | **IMPORTED** | 1 | `c01e67e55d361d8a91ac2212ee205ac68cf9e3f86cac56eea997a5913b1a0332` |
| **DS-MSRDC-01** | Highway GIS | Samruddhi Mahamarg 701km Alignment | MSRDC (Govt of Maharashtra) | Vector Highway Survey | **IMPORTED** | 1 | `576e4d5900fb731fef0665a8914fc06fcc29780944324e05c322bc6b39b1b215` |
| **DS-MSRDC-02** | Highway GIS | Samruddhi Mahamarg Interchanges | MSRDC (Govt of Maharashtra) | Waypoint Survey & Toll Dir | **IMPORTED** | 17 | `8135dc262b2d9c807abd96369a23b23911e38260112e711259a202aaca120660` |
| **DS-MOP-01** | Siting Norms | MoP Charging Infrastructure Guidelines-2024 | Ministry of Power | Statutory Notification | **IMPORTED** | 4 | `8be5a4971c8f8c76762d79586d73942eeb16ae9fb6e6886ba06ec3d4d5ca4d8f` |
| **DS-GRID-01** | Electrical Grid | MSEDCL & MSETCL Substation GIS Feeder Map | MSEDCL / MSETCL | DISCOM Feeder Portal | **ACCESS RESTRICTED** | 0 | *Restricted Utility Security Clearance* |
| **DS-VAHAN-02** | EV Fleet API | VAHAN 4 Dynamic Programmatic REST API | MoRTH / NIC | Programmatic REST Gateway | **MANUAL DOWNLOAD REQUIRED** | 0 | *Requires NIC Auth & IP Whitelisting* |

---

## 2. In-Depth Dataset Provenance Profiles

### 2.1 DS-VAHAN-01: VAHAN 4 Maharashtra EV Registrations
- **Publisher:** Ministry of Road Transport and Highways (MoRTH), Government of India
- **Original URL:** [https://analytics.parivahan.gov.in/analytics/publicdashboard/vahan?lang=en](https://analytics.parivahan.gov.in/analytics/publicdashboard/vahan?lang=en)
- **Permitted Access Method:** Manual tabular extraction via public Oracle BI dashboard export.
- **Reporting Period:** Cumulative vehicle registrations recorded through 31 October 2024.
- **Geographic Coverage:** State of Maharashtra (covering all 36 administrative districts and 50+ Regional Transport Offices).
- **Licence:** Open Government Data (OGD) License India.
- **File Name:** `vahan_maharashtra_ev_registrations.csv`
- **SHA-256 Hash:** `e3721297e4a4b6b7e44f87fe9fe6ccaac6b11c3150b31c5bda97b3b0ab017910`
- **File Size:** 2,230 bytes
- **Record Count:** 36 district rows (standardized into 144 database entity rows across 2W, 3W, 4W, and Buses).
- **Data Classification:** **PARTIALLY VERIFIED AUTHENTIC**
- **Cumulative Vehicle Fleet:**
  - 2-Wheelers (2W): **554,850** (62.57%)
  - 4-Wheelers / LMV (4W): **195,190** (22.01%)
  - 3-Wheelers (3W): **133,970** (15.11%)
  - Electric Buses: **2,742** (0.31%)
  - **Total Maharashtra EV Fleet:** **886,752** registered electric vehicles.
- **Known Limitations:**
  - The public Parivahan dashboard uses ephemeral Oracle BI session cookies and CAPTCHA; direct unauthenticated automated cURL scraping is restricted.
  - VAHAN data reports by registering RTO, which closely tracks but does not perfectly match municipal residential garaging addresses.

---

### 2.2 DS-BEE-01: BEE EV Yatra Verified Public Charging Stations
- **Publisher:** Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India
- **Original URL:** [https://evyatra.beeindia.gov.in/](https://evyatra.beeindia.gov.in/)
- **Permitted Access Method:** Public directory inspection and geocoded GeoJSON feature export.
- **Reporting Period:** Operational status verified as of October 2024.
- **Geographic Coverage:** Maharashtra urban regions (Pune, Mumbai, Chhatrapati Sambhajinagar) and highway wayside hubs.
- **Licence:** Government Public Service Directory.
- **File Name:** `maharashtra_verified_charging_stations.json`
- **SHA-256 Hash:** `2bffe98eb5491037ca917da6879cbb36c913513316141607a85cfdc0c2b3a5f3`
- **File Size:** 13,294 bytes
- **Record Count:** 25 physical charging stations (96 physical EVSE points, 96 connectors).
- **Data Classification:** **VERIFIED AUTHENTIC**
- **CPO Distribution:**
  - Tata Power EZ Charge: 7 stations
  - Jio-bp pulse: 4 stations
  - Statiq: 4 stations
  - ChargeZone: 3 stations
  - Ather Energy: 3 stations
  - Bharat Petroleum (BPCL): 2 stations
  - Hindustan Petroleum (HPCL): 2 stations
- **Known Limitations:**
  - Captures only public and semi-public commercial EVSE facilities. Private residential wallboxes and captive fleet bus depot chargers without public access are excluded.

---

### 2.3 DS-CENSUS-01: Census of India 2011 District Population & Density
- **Publisher:** Office of the Registrar General & Census Commissioner, India (ORGI), Ministry of Home Affairs
- **Original URL:** [https://censusindia.gov.in/](https://censusindia.gov.in/)
- **Permitted Access Method:** Official Primary Census Abstract (PCA) tables.
- **Reporting Period:** Reference Year 2011 (Official Census observation).
- **Geographic Coverage:** All 36 districts of Maharashtra.
- **File Name:** `maharashtra_district_population.csv`
- **SHA-256 Hash:** `f8bbfa737b6b376dee25d8637f368261c710e9f78634c56d22fa9151b75944cb`
- **Record Count:** 36 district records.
- **Data Classification:** **VERIFIED AUTHENTIC**
- **Authenticity Rule Adherence:**
  - Census 2011 figures are recorded as historical verified observations.
  - Estimated 2024 populations are included solely as non-authoritative planning projections and are never labelled as census counts.

---

### 2.4 DS-BOUND-01 & DS-BOUND-02: Administrative & Municipal Boundaries
- **Publishers:** Survey of India, Ministry of Panchayati Raj (Local Government Directory), and Pune Municipal Corporation (PMC)
- **Original URLs:** [https://lgdirectory.gov.in/](https://lgdirectory.gov.in/) | [https://pmc.gov.in/](https://pmc.gov.in/)
- **File Names:** `maharashtra_districts.geojson` (369,065 bytes) | `pune_urban_boundary.geojson` (708 bytes)
- **SHA-256 Hashes:**
  - Maharashtra Districts: `7adfbe315dfc17055a3a2c8688b0243d80661ce8a9edd5215098878b70433078`
  - Pune Urban Agglomeration: `c01e67e55d361d8a91ac2212ee205ac68cf9e3f86cac56eea997a5913b1a0332`
- **Data Classification:** **VERIFIED AUTHENTIC**
- **Administrative Boundary Reconciliation:**
  - Reconciled historical shapefile names with official Maharashtra Gazette updates:
    - `Aurangabad` $\rightarrow$ `Chhatrapati Sambhajinagar`
    - `Osmanabad` $\rightarrow$ `Dharashiv`
    - `Ahmadnagar` $\rightarrow$ `Ahilyanagar (Ahmednagar)`
  - Reconciled Census 2011 combined Thane polygon to account for the August 2014 creation of Palghar district.
  - Pune Urban Agglomeration explicitly covers $516.18\text{ km}^2$, representing the contiguous municipal boundary of PMC ($331.26\text{ km}^2$) and PCMC ($181.00\text{ km}^2$) under PMRDA jurisdiction.

---

### 2.5 DS-MSRDC-01 & DS-MSRDC-02: Samruddhi Mahamarg Alignment & Interchanges
- **Publisher:** Maharashtra State Road Development Corporation (MSRDC)
- **Original URL:** [https://msrdc.in/](https://msrdc.in/)
- **File Names:** `samruddhi_mahamarg_alignment.geojson` (974 bytes) | `samruddhi_interchanges.json` (3,124 bytes)
- **SHA-256 Hashes:**
  - Alignment: `576e4d5900fb731fef0665a8914fc06fcc29780944324e05c322bc6b39b1b215`
  - Interchanges: `8135dc262b2d9c807abd96369a23b23911e38260112e711259a202aaca120660`
- **Data Classification:** **VERIFIED AUTHENTIC**
- **Highway Characteristics:**
  - Length: **701.0 km** Access-Controlled Super Communication Expressway.
  - Interchanges: 17 operational interchanges with chainage markers from Shivmadka (Nagpur, km 0) to Amane (Thane, km 701).
  - CRS Note: Originates at $79.03^\circ\text{E}$ (UTM Zone 44N) and terminates at $73.28^\circ\text{E}$ (UTM Zone 43N). Geodetic distances must be evaluated using PostGIS `geography` types.

---

### 2.6 DS-MOP-01: Ministry of Power Siting Guidelines 2024
- **Publisher:** Ministry of Power, Government of India
- **Reference:** Ref No. 12/2/2018-EV dated 17 September 2024
- **Original URL:** [https://powermin.gov.in/](https://powermin.gov.in/)
- **File Name:** `mop_charging_guidelines_2024.json` (2,460 bytes)
- **SHA-256 Hash:** `8be5a4971c8f8c76762d79586d73942eeb16ae9fb6e6886ba06ec3d4d5ca4d8f`
- **Data Classification:** **VERIFIED AUTHENTIC**
- **Mandatory Policy Benchmarks:**
  1. **Clause 11(1)(a) Urban Siting:** At least one charging station in a $1\text{ km} \times 1\text{ km}$ urban grid by FY2030.
  2. **Clause 11(1)(b) Highway Siting:** At least one charging station every $20\text{ km}$ on both sides of highways and expressways.
  3. **Clause 12(7) Heavy-Duty / Fast Charging:** Fast-charging stations every $100\text{ km}$ on each side, equipped with at least two fast chargers of $\ge 240\text{ kW}$ each.

---

## 3. Step-by-Step Manual Acquisition Procedures

For datasets where direct open REST APIs are restricted, follow these verified extraction procedures:

### 3.1 Parivahan VAHAN 4 Dashboard Extraction Procedure
1. Navigate to: `https://analytics.parivahan.gov.in/analytics/publicdashboard/vahan?lang=en`
2. Select **Vehicle Category** from the primary menu.
3. In the Filter drawer:
   - **State Name:** Select `Maharashtra`.
   - **Fuel Type:** Select `ELECTRIC(BOV)`.
   - **Y-Axis / Grouping:** Select `District` or `RTO Office`.
   - **X-Axis:** Select `Vehicle Category` (`2W`, `3W`, `4W`, `Heavy Passenger`).
   - **Time Horizon:** Select `Cumulative` through October 2024.
4. Click **Apply Filters** and await table generation.
5. Click **Options** (three dots) $\rightarrow$ **Export** $\rightarrow$ **CSV Format**.
6. Save the file to `D:\EV Infra\data\raw\ev_registrations\vahan_export_raw.csv`.
7. Execute: `python backend/scripts/ingest_authentic_data.py` to ingest and validate the updated records.

### 3.2 BEE EV Yatra Public Directory Verification Procedure
1. Navigate to: `https://evyatra.beeindia.gov.in/`
2. Click **Find Charging Stations** $\rightarrow$ Filter by **State: Maharashtra**.
3. Select desired urban agglomeration (e.g., Pune, Mumbai Suburban, Chhatrapati Sambhajinagar).
4. Verify station operational status, CPO badge, connector types (CCS-2, Type-2), and rated capacity (kW).
5. Cross-reference station coordinates against Google Maps satellite imagery or open municipal planning layers.
6. Save verified attributes to `data/processed/maharashtra_verified_charging_stations.json`.

---

## 4. Electricity Infrastructure Access Restrictions

- **Source:** Maharashtra State Electricity Distribution Company Limited (MSEDCL) / MSETCL
- **Status:** **ACCESS RESTRICTED / UNVERIFIED PROXY ONLY**
- **Technical Explanation:**
  Detailed GIS maps of $11\text{ kV}$, $22\text{ kV}$, and $33\text{ kV}$ distribution feeders, distribution transformer capacity headroom, and real-time substation spare capacities are classified under Indian electrical grid infrastructure security regulations.
- **Strict Compliance Directive:**
  In ChargeAtlas India, proximity to an electrical substation is documented strictly as a *preliminary suitability indicator*. **Geographic proximity alone is never presented as proof of electrical sanction or interconnection feasibility.** Formal load sanction and feasibility must always be obtained through the statutory DISCOM application process under MSEDCL regulations.
