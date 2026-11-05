# CHARGEATLAS INDIA — ELECTRICAL GRID FEASIBILITY & LIMITATIONS REPORT
**Platform:** ChargeAtlas India | **Team:** SuperNova (Sanjivani University)  
**Competition:** IIT Bombay Techfest 2026–27 EV Infrastructure Map India Challenge  
**Specification:** DisCom Grid Infrastructure, Substation Proximity & Telemetry Transparency  
**Version:** 2.0 (Engineering Integrity Protocol)

---

## 1. Electrical Grid Context in Maharashtra

Electric Vehicle charging hubs—especially high-power DC fast-charging plazas ($\ge 50\text{ kW to }240\text{ kW}$)—impose concentrated, instantaneous loads on the local medium-voltage (11kV / 22kV) and extra-high-voltage (33kV / 132kV) distribution networks.

In Maharashtra, electrical transmission and distribution are operated by:
1. **MSETCL (Maharashtra State Electricity Transmission Co. Ltd.):** Extra High Voltage (EHV) transmission (400kV, 220kV, 132kV, 66kV).
2. **MSEDCL (Mahavitaran):** Distribution across 33 districts (excluding Mumbai licensed areas).
3. **Brihanmumbai Electric Supply and Transport (BEST), Tata Power-D, and Adani Electricity Mumbai Ltd. (AEML):** Islanded distribution across Mumbai City and Mumbai Suburban.

---

## 2. Authentic Substation Geographies & Proximity Modeling

ChargeAtlas integrates **766 verified MSETCL and MSEDCL substation centroids** across Maharashtra:
- **Spatial Indexing:** Substation coordinates are projected into UTM Zone 43N (EPSG:32643) and UTM Zone 44N (EPSG:32644) for exact Euclidean metric distance calculations.
- **Proximity Metric ($S_5$):** For candidate charging sites, distance to the nearest substation is calculated:
  $$S_5 = \max\left(0, 100 - \frac{d_{\text{substation}}}{3.0\text{ km}} \times 100\right)$$
  - Candidates $< 500\text{ m}$ from an 11kV/33kV substation score $>83.3$, indicating low capital expenditure for high-tension (HT) dedicated cable trenching.
  - Candidates $> 3.0\text{ km}$ score $0.0$, reflecting severe interconnection costs.

---

## 3. Crucial Engineering Limitation: DisCom Feeder Headroom Non-Disclosure

In compliance with IIT Bombay Techfest guidelines prohibiting fabricated data or false engineering claims:

### The Operational Reality:
> **UTILITY TELEMETRY IS NOT OPEN DATA:** Real-time transformer spare capacities (MVA headroom), peak thermal loading limits, and 11kV distribution feeder loadings are **confidential, proprietary operational assets** of DisComs (MSEDCL/Tata Power). They are **NOT** published in open government portals, VAHAN, or the BEE EV Yatra directory.

### ChargeAtlas Transparency Mandate:
1. **No Synthetic Feeder Claims:** The platform **NEVER** fabricates a "verified available transformer capacity" or claims a candidate site has guaranteed grid headroom.
2. **Mandatory UI Disclaimer:** Every candidate recommendation and grid card displays the explicit notice:
   ```
   PRELIMINARY_SUITABILITY_ONLY - MSEDCL/MSETCL FEASIBILITY APPLICATION REQUIRED
   ```
3. **Planning Interpretation:** Proximity to a substation proves only **spatial feasibility** (lower cable laying costs), **NOT** guaranteed electrical interconnection capacity.

---

## 4. Statutory Interconnection Procedure for Charge Point Operators (CPOs)

Under the **Maharashtra Electricity Regulatory Commission (MERC) Grid Code and MoP 2024 Guidelines (Clause 7)**, establishing an EV charging station requires the following non-spatial statutory approvals:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STATUTORY GRID CONNECTION PIPELINE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Feeder Feasibility Application to MSEDCL Sub-Divisional Office          │
│    - Submission of single-line diagram (SLD) and requested contract demand   │
│    - Load flow analysis by MSEDCL Executive Engineer (Testing & Quality)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Technical Feasibility Report (TFR) Issuance                              │
│    - Determination of interconnection voltage (11kV vs 22kV vs 33kV)        │
│    - Estimation of Dedicated Distribution Facility (DDF) capital charges     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Electrical Inspectorate NOC (Chief Electrical Inspector to Govt - CEIG)  │
│    - Statutory safety inspection of step-down transformer and switchgear     │
│    - Earth resistance verification (< 1.0 Ohm) and lightning protection     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. EV Specific Time-of-Day (ToD) Tariff Metering Sanction                   │
│    - Installation of bidirectional ABT-compliant electronic TOD meter       │
│    - Concessional MERC EV tariff application (off-peak solar rebates)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Candidate Site Electrical Summary Table

| Candidate Site ID | Location / Landmark | District | Substation Name | Est. Dist (km) | Voltage Class | Feasibility Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `CAND-PUN-001` | Vivanta Hinjawadi Phase 1 | Pune | Hinjawadi Phase 1 22kV Feeder | **0.42 km** | 22 kV | Preliminary Proximity Verified |
| `CAND-PUN-002` | PMC Swargate Bus Station | Pune | Shivajinagar 33kV GIS | **0.85 km** | 33 kV | Preliminary Proximity Verified |
| `CAND-SAM-001` | Igatpuri Interchange Wayside | Nashik | Igatpuri Interchange 33kV | **0.65 km** | 33 kV | Preliminary Proximity Verified |
| `CAND-SAM-003` | Aurangabad West Expressway | Chh. Sambhajinagar | Aurangabad West 33kV Substation | **0.90 km** | 33 kV | Preliminary Proximity Verified |
| `CAND-DIS-001` | Nagpur Central Railway Station | Nagpur | MIHAN Terminal 33kV Substation | **1.20 km** | 33 kV | Preliminary Proximity Verified |

*All installations require formal MSEDCL commercial load sanction.*

