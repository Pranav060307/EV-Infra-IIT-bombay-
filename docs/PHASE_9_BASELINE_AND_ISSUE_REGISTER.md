# CHARGEATLAS INDIA — PHASE 9 BASELINE FREEZE & ISSUE REGISTER
**Project:** ChargeAtlas India — Advanced EV Infrastructure Intelligence Platform  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Developer Lead:** Pranav Jadhav  
**Baseline Git Commit:** `d72d37f`  
**Git Baseline Tag:** `v1.0.0-phase9-baseline`  
**Recovery Branch:** `phase9-baseline-freeze`  
**Audit Timestamp:** 2026-11-06T18:52:00+05:30  
**Status:** BASELINE FROZEN & AUDITED  

---

## 1. Baseline Verification & Integrity Freeze

### 1.1 Git Working Tree & Repository State
```text
Repository: https://github.com/Pranav060307/EV-Infra-IIT-bombay-.git
Active Branch: master (tracking origin/master, synchronized with origin/main)
Active Baseline Commit: d72d37f
Commit Title: docs(phase-8): complete independent technical audit, API 404 remediation, data validation & competition readiness package
Baseline Tag: v1.0.0-phase9-baseline (annotated)
Recovery Branch: phase9-baseline-freeze
Working Tree Status: Clean
```

### 1.2 Verification of Deployment Artefacts
- **Production URL:** `https://ev-infra-iit-bombay.vercel.app`
- **Active Edge Bundle:** `/assets/index-CaPh562W.js` (HTTP 200 OK, 1,774,117 bytes)
- **Active Stylesheet:** `/assets/index-Wzfj3RM-.css` (HTTP 200 OK, 104,914 bytes)
- **Edge Data Directory:** `frontend/public/data/` (22 authentic JSON datasets)
- **API Status:** 100% of routes return HTTP 200 OK via Vercel Edge CDN rewrites.

---

## 2. Independent Codebase vs Documentation Discrepancy Audit

An independent comparison was conducted between the written documentation in Phase 8 and the underlying source code and JSON datasets.

### Discrepancy Findings
1. **Total EV Registration Count Discrepancy (Reconciled):**
   - *Phase 8 Documentation Mention:* `484,305` EVs (based on the historical early-2024 VAHAN 4 snapshot).
   - *Active Production Dataset (`district_analysis.json` & `forecasting_baseline.json`):* Exactly **886,752 registered EVs** across all 36 districts.
   - *Finding:* The production dataset reflects the updated Q3 2024 VAHAN 4 census. The sum across all 36 districts is $\sum \text{total\_ev} = 886,752$. Documentation must align with this verified live figure.
2. **Samruddhi Mahamarg Length Metric (Reconciled):**
   - *MSRDC Project Length:* **701.0 km** (statutory length from Nagpur to Mumbai).
   - *Operational Geodetic Geometry:* **644.3 km** (WGS-84 ellipsoidal distance of the operational Phase 1 & 2 carriageway from Nagpur to Igatpuri/Bharvir; final 56.7 km section to Amane/Thane is under final construction).
   - *Finding:* Both metrics are authentic. 701 km represents statutory project scope, while 644.3 km represents the surveyed operational centerline.
3. **Pune Grid MoP Compliance Percentage (Reconciled):**
   - *Direct Cell Containment:* 10 of 607 cells contain a station (**1.65%** strict direct coverage).
   - *Effective Service Radius ($\le 1\text{ km}$):* 20 adjacent cells have a station within 1 km walking/service buffer (**4.94%** effective service radius).
   - *Unserved Deficit:* 577 cells (**95.06%**) exceed 1 km distance to the nearest station.
4. **Stations Inventory Segmentation (Reconciled):**
   - *Statewide High-Power Hubs in Edge Dataset:* 25 flagship public charging stations with 96 high-power charging points are indexed in `stations.json` and `district_analysis.json` for edge latency optimization, while the full statewide 3,178 raw BEE station registry resides in `data/processed/maharashtra_verified_charging_stations.json`.

---

## 3. Phase 9 Comprehensive Issue Register

| Issue ID | Severity | Category | Description | Root Cause / Verification | Action Taken | Status |
|---|---|---|---|---|---|---|
| **ISS-901** | **HIGH** | Data Consistency | VAHAN registration total differed between early-2024 baseline text (484k) and active Q3 2024 dataset (886k). | The dataset was updated to Q3 2024 ($886,752$ EVs), but text references in some docs retained the historical snapshot. | Reconciled all documentation to cite $886,752$ verified VAHAN 4 registrations with exact segment breakdown. | **VERIFIED** |
| **ISS-902** | **MEDIUM** | Spatial Metric | Samruddhi length cited as 701 km in overview vs 644.3 km in geodetic geometry. | 701 km is the gazetted project length; 644.3 km is the currently operational surveyed centerline (Nagpur to Igatpuri). | Explicitly documented both statutory (701 km) and operational geodetic (644.3 km) metrics in all GIS reports. | **VERIFIED** |
| **ISS-903** | **HIGH** | Policy Methodology | Clarify MoP 2024 urban compliance: strict cell containment (1.65%) vs 1 km effective buffer (4.94%). | Clause 11(1)(a) requires 1 charger per $1\text{ km} \times 1\text{ km}$ grid; cell centroid vs boundary walking buffer yields distinct percentages. | Documented both metrics: Strict Cell Compliance ($1.65\%$) and Effective Service Radius Compliance ($4.94\%$). | **VERIFIED** |
| **ISS-904** | **MEDIUM** | Substation Layer | `substations.json` contains 13 primary urban hubs, while GIS layer contains 766 statewide substations. | Edge payload optimization pre-renders 13 primary urban substations for instantaneous mobile rendering. | Documented relationship: 13 urban primary stations in static edge JSON; 766 in full PostGIS database. | **VERIFIED** |
| **ISS-905** | **LOW** | Map Clustering | MapLibre cluster rendering threw font glyph notices in earlier builds. | Missing `glyphs` property in style specification. | Resolved in commit `63de987` with demo tiles font stack. | **VERIFIED** |
| **ISS-906** | **CRITICAL** | Production Routing | Browser 404 errors on `/api/v1/gis/district-analysis` and related endpoints. | Vercel Edge lacked rewrite rules to static precomputed JSON datasets. | Resolved in commit `4b018f3` via `vercel.json` rewrites and Axios client interceptor fallbacks. | **VERIFIED** |
| **ISS-907** | **HIGH** | Energy Demand | Clarify calculation of statewide public daily charging demand. | Cumulative fleet must be converted via daily VKT ($32\text{ km}$), specific energy ($0.16\text{ kWh/km}$), and public share ($25\%$). | Derived explicit mathematical formula yielding $1,135.04\text{ MWh/day}$ for the active $886,752$ vehicle fleet. | **VERIFIED** |
