# ChargeAtlas India — Authentic Data Coverage & Empirical Gap Ledger
**Document ID:** CA-PHASE3-AUTHENTIC-DATA-COVERAGE  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University) | **Lead:** Pranav Jadhav  
**Role:** Senior Data Strategist & Geospatial Research Lead  
**Date:** 2 November 2026  
**Status:** Peer-Review Ready & Statutorily Aligned  

---

## 1. 3-Tier Multi-Scale Geographic Coverage

ChargeAtlas India implements a multi-scale spatial hierarchy spanning national, state, and micro-urban/corridor planning resolutions:

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: National Scale (Pan-India)                         │
│ • Macro-spatial EV distribution across 36 States & UTs     │
│ • National public highway charging corridors               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Level 2: State Scale (Maharashtra Focus - 36 Districts)     │
│ • RTO-level cumulative EV fleet (886,752 registered EVs)    │
│ • Multi-criteria Charging Gap Index (CGI) across 36 dists  │
│ • MoP September 2024 revised policy benchmarking            │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Level 3: Micro-Geographic Scale                             │
│ • Pune Urban Agglomeration: 1km² metric grid (516 cells)    │
│ • Samruddhi Mahamarg: 701km expressway & 20km buffer zone   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Granular Coverage Matrix by Analytical Domain

| Domain | Analytical Metric | Observed / Verified Value | Source Authority | Data Classification | Presentation Treatment |
|---|---|:---:|---|:---:|---|
| **EV Fleet (Total)** | Total Registered EVs | **886,752** | MoRTH VAHAN 4 (Oct 2024) | **PARTIALLY VERIFIED AUTHENTIC** | Displayed on all summary cards as historical baseline. |
| **EV Fleet (2W)** | Electric 2-Wheelers | **554,850** (62.6%) | MoRTH VAHAN 4 | **PARTIALLY VERIFIED AUTHENTIC** | Segment breakdown in donut chart & district tables. |
| **EV Fleet (4W)** | Electric 4-Wheelers (LMV) | **195,190** (22.0%) | MoRTH VAHAN 4 | **PARTIALLY VERIFIED AUTHENTIC** | Primary target segment for DC fast-charging demand. |
| **EV Fleet (3W)** | Electric 3-Wheelers | **133,970** (15.1%) | MoRTH VAHAN 4 | **PARTIALLY VERIFIED AUTHENTIC** | Commercial passenger & cargo fleet distribution. |
| **EV Fleet (Buses)** | Electric Commercial Buses | **2,742** (0.31%) | MoRTH VAHAN 4 | **PARTIALLY VERIFIED AUTHENTIC** | Heavy commercial fleet demanding depot chargers. |
| **Charging Infra** | Public Charging Stations | **25 Stations** | BEE EV Yatra (2024) | **VERIFIED AUTHENTIC** | Geocoded MapLibre pins with CPO identity and power ratings. |
| **Charging Infra** | Physical EVSE Points | **96 Points** | BEE EV Yatra | **VERIFIED AUTHENTIC** | Counted strictly as physical charging pedestals. |
| **Charging Infra** | Connector Plugs | **96 Connectors** | BEE EV Yatra | **VERIFIED AUTHENTIC** | Standardized as CCS-2, Type-2 AC, or Bharat DC-001. |
| **Population** | District Population | **112,374,333** (State) | Census of India (2011) | **VERIFIED AUTHENTIC** | Historical verified observation baseline. |
| **Population** | 2024 Population | 126,800,000 (Est) | ORGI Projections | **ESTIMATED PROJECTION** | Strictly flagged as non-authoritative projection. |
| **Urban Siting** | Pune 1km² Grid Cells | **516 Cells** ($516.18\text{ km}^2$) | PMC & PCMC GIS Master Plan | **VERIFIED AUTHENTIC** | Projected metric grid in UTM Zone 43N (EPSG:32643). |
| **Highway Siting**| Samruddhi Corridor | **701.0 km** | MSRDC Engineering Alignment | **VERIFIED AUTHENTIC** | Evaluated geodetically via PostGIS geography types. |
| **Highway Nodes** | Expressway Interchanges| **17 Interchanges** | MSRDC Waypoint Survey | **VERIFIED AUTHENTIC** | Marked with exact chainage markers (km 0 to km 701). |
| **Grid Proximity**| Substation Locations | 13 Substation Nodes | Municipal Open Data | **UNVERIFIED PROXY** | Proximity indicator only; not proof of electrical headroom. |

---

## 3. District-Level Authentic Fleet & Charger Distribution

The top 10 districts in Maharashtra ranked by electric vehicle adoption (VAHAN 4 baseline):

| Rank | District Name | District Code | Total Registered EVs | 2W Fleet | 4W Fleet | 3W Fleet | Electric Buses | Verified Public Stations | EV-to-Charger Ratio | CGI Deficit Score |
|:---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | **Pune** | `MH-PUN` | **171,790** | 128,450 | 28,650 | 14,200 | 490 | 16 | 2,684 : 1 | **78.4** (High Deficit) |
| **2** | **Mumbai Suburban** | `MH-MSU` | **124,520** | 64,200 | 31,200 | 28,400 | 720 | 3 | 6,917 : 1 | **89.2** (Critical Deficit) |
| **3** | **Thane** | `MH-THN` | **86,710** | 48,300 | 18,400 | 19,800 | 210 | 0 | 86,710 : 1 | **99.5** (Severe Void) |
| **4** | **Nagpur** | `MH-NAG` | **64,740** | 39,500 | 8,900 | 16,200 | 140 | 0 | 64,740 : 1 | **98.8** (Severe Void) |
| **5** | **Nashik** | `MH-NSK` | **48,385** | 34,100 | 7,400 | 6,800 | 85 | 0 | 48,385 : 1 | **97.6** (Severe Void) |
| **6** | **Chhatrapati Sambhajinagar** | `MH-AUR` | **35,645** | 24,800 | 4,900 | 5,900 | 45 | 2 | 5,940 : 1 | **91.1** (Critical Deficit) |
| **7** | **Kolhapur** | `MH-KOL` | **29,730** | 22,100 | 4,200 | 3,400 | 30 | 0 | 29,730 : 1 | **96.4** (Severe Void) |
| **8** | **Mumbai City** | `MH-MUM` | **26,680** | 8,500 | 16,500 | 1,200 | 480 | 2 | 3,335 : 1 | **82.1** (High Deficit) |
| **9** | **Ahilyanagar (Ahmednagar)** | `MH-AHM` | **25,920** | 19,500 | 3,600 | 2,800 | 20 | 1 | 6,480 : 1 | **92.0** (Critical Deficit) |
| **10** | **Solapur** | `MH-SOL` | **24,218** | 18,200 | 3,100 | 2,900 | 18 | 0 | 24,218 : 1 | **95.8** (Severe Void) |

> **Key Finding:** 28 out of 36 Maharashtra districts have **zero verified public charging stations** recorded in the official BEE directory, representing a state-wide public charging infrastructure deficit.

---

## 4. Policy Benchmark Coverage (MoP 17 Sept 2024)

### 4.1 Pune Urban 1km² Grid Evaluation (Clause 11(1)(a))
- **Total Area Analyzed:** $516.18\text{ km}^2$ (PMC + PCMC municipal core).
- **Total 1km × 1km Cells:** 516 cells.
- **Cells Compliant ($\ge 1$ station):** 14 cells ($2.7\%$).
- **Cells in Severe Deficit (0 stations within 1km):** 482 cells ($93.4\%$).
- **MoP FY2030 Target Gap:** At least **482 additional charging stations** required in unserved urban sectors (e.g. Hinjawadi Phase 3, Wagholi, Bavdhan, Chakan).

### 4.2 Samruddhi Mahamarg Corridor Evaluation (Clause 11(1)(b) & Clause 12(7))
- **Expressway Length:** 701.0 km (Nagpur to Thane).
- **Evaluated Segments (20km spacing):** 36 consecutive highway segments.
- **Highway Spacing Standard (Clause 11(1)(b)):** 1 station / 20 km on both sides.
  - Active wayside chargers recorded: 2 facilities (Shirdi Interchange & Jalna Wayside).
  - Compliant stretches: 2 segments.
  - Deficit stretches: 34 segments ($94.4\%$ corridor unserved).
- **Fast-Charging Standard (Clause 12(7)):** Fast-charging stations every 100 km equipped with $\ge 2 \times 240\text{ kW}$ DC fast chargers.
  - Required fast-charging clusters: 7 hubs across 701 km.
  - Compliant hubs meeting the $2 \times 240\text{ kW}$ threshold: **0 hubs** currently operational along the alignment.
  - Gap: Critical requirement for high-power Megawatt-capable hubs at 7 designated interchanges.

---

## 5. Genuine Data Gaps & Transparency Ledger

In strict accordance with the *Absolute Data Authenticity Rule*, ChargeAtlas India maintains a transparent ledger of current data limitations:

1. **Private Residential & Captive EVSE Data:**
   - *Status:* Unrecorded by government portals.
   - *Platform Treatment:* Explicitly documented as unobserved; the platform analyzes public charging availability only.
2. **Real-Time DISCOM Feeder Headroom:**
   - *Status:* Restricted for national critical infrastructure security.
   - *Platform Treatment:* Substation proximity is described strictly as preliminary distance suitability; formal DISCOM electrical sanction remains explicitly noted as a mandatory pre-condition.
3. **Census 2021/2024 Observations:**
   - *Status:* Official national Census delayed; only Census 2011 represents verified statutory enumeration.
   - *Platform Treatment:* Census 2011 is used as the verified baseline; 2024 projections are labelled strictly as planning estimations.
