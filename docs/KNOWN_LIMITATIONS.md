# CHARGEATLAS INDIA — KNOWN LIMITATIONS & ENGINEERING ASSUMPTIONS

**Project:** ChargeAtlas India — EV Charging Infrastructure Mapping, Gap Analysis, Demand Forecasting & Smart Site Recommendation Platform  
**Competition:** IIT Bombay Techfest 2026–27 — EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Standard:** **SCIENTIFIC HONESTY & TRANSPARENCY**  
**Date:** November 3, 2026  
**Status:** **DISCLOSED & FORMALLY DOCUMENTED**

---

## 1. PREAMBLE

In strict accordance with the IIT Bombay Techfest competition guidelines, ChargeAtlas India rejects unsubstantiated claims of infallible future prediction or engineering approvals. The platform provides evidence-based decision-support intelligence for infrastructure planners, transport departments, and energy utilities. 

The following known limitations and operational assumptions are explicitly documented to preserve scientific integrity:

---

## 2. DATASET BOUNDARIES & COVERAGE CONSTRAINTS

### 2.1 VAHAN 4 RTO Registration Disaggregation
- **Observed Scope:** Cumulative registration figures represent official Regional Transport Office (RTO) jurisdictions through October 2024 (886,752 vehicles).
- **Limitation:** While RTO boundaries closely match revenue district boundaries across Maharashtra, individual vehicle owners may reside in adjacent districts or commute daily across district borders (e.g. Pune–Pimpri-Chinchwad or Mumbai–Thane). VAHAN public statistics do not capture micro-level GPS home parking locations.

### 2.2 BEE EV Yatra Verified Station Completeness
- **Observed Scope:** 25 physical public charging stations and 96 charging points verified through the official BEE EV Yatra portal and audited OpenStreetMap nodes.
- **Limitation:** Private wallbox sockets (residential 3.3 kW AC), captive bus depot chargers (e.g. PMPML / BEST internal depots), and non-standard hotel/resort guest chargers without public CPO roaming are intentionally excluded. The 28 zero-charger districts reflect open public directory records; rural or semi-urban informal charging points may exist unlisted.

### 2.3 Samruddhi Mahamarg Directional Access
- **Observed Scope:** 701 km expressway alignment, 17 interchanges, and wayside fuel stations.
- **Limitation:** Access to physical charging facilities on expressways is directional. Without physical grade-separated turnaround ramps or verified median crossovers, a charger on the westbound carriageway may be inaccessible to eastbound travelers. Until physical CPO site audits confirm bi-directional access, all wayside facilities carry an explicit `UNVERIFIED` directional access flag.

---

## 3. ELECTRICAL GRID PROXIMITY ASSUMPTIONS

### 3.1 Substation Spare Capacity
- **Methodology:** The platform identifies distribution substations (11 kV, 22 kV, 33 kV) within a 0.5–5.0 km radius of candidate charging sites to minimize high-tension (HT) line extension costs.
- **Limitation:** Proximity to a substation indicates preliminary spatial suitability only. It does **not** constitute an approved technical feasibility clearance or power sanction from MSEDCL/MSETCL. Actual transformer head-room, short-circuit levels, thermal limits, and feeder peak loading must be evaluated through on-site utility load-flow studies.

---

## 4. LAND TENURE & SITE ACCESS ASSUMPTIONS

### 4.1 Candidate Site Parcel Siting
- **Methodology:** Candidate locations are identified from verified institutional land parcels (existing oil company petrol pumps, MSRDC rest stops, MSRTC bus terminals).
- **Limitation:** Physical installation feasibility requires local municipal clearances, structural fire safety approvals, and commercial lease agreements with land-holding entities. ChargeAtlas identifies optimal spatial demand hubs, not legal title deeds.

---

## 5. DEMAND FORECASTING SENSITIVITY

### 5.1 Long-Term Technological Shifts
- **Methodology:** Scenarios are modeled using compound annual growth rates (18%, 28%, 38%) grounded in historical adoption trends.
- **Limitation:** Unforeseen macroeconomic shifts (e.g., abrupt changes in government subsidies, sudden breakthroughs in solid-state battery chemistry, or global raw material supply disruptions) cannot be predicted with mathematical certainty. Scenarios should be treated as dynamic planning envelopes rather than guaranteed futures.

