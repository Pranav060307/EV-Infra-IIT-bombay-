# CHARGEATLAS INDIA — COMPETITION DEMONSTRATION SCRIPT
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Developer Lead:** Pranav Jadhav  
**Target Duration:** 3 to 5 Minutes  
**Live URL:** https://ev-infra-iit-bombay.vercel.app  

---

## Live Demonstration Walkthrough

### 0:00 – 0:45 | ACT 1: Problem Statement & Vision
- **Visual:** Open browser to `https://ev-infra-iit-bombay.vercel.app` (National EV Map view).
- **Spoken Script:**
  > "Respected judges, distinguished evaluators, and fellow engineers: Welcome to **ChargeAtlas India**, developed by Team SuperNova from Sanjivani University.
  > 
  > India's electric mobility transition faces a critical bottleneck: EV charging stations are often sited ad-hoc—leading to severe urban charging deserts in suburban industrial belts and long blackout zones on our expressways. 
  > 
  > ChargeAtlas India is an advanced geospatial decision-support platform designed to solve this challenge with scientific rigor, authentic government data, dual-UTM projection accuracy, and multi-criteria mathematical optimization."

---

### 0:45 – 1:30 | ACT 2: Data Trust Engine & Provenance Architecture
- **Visual:** Click **Data Management** in navigation bar (shows Data Trust & Provenance Register).
- **Spoken Script:**
  > "Before presenting our maps, we present our data foundation. In strict compliance with competition rules, ChargeAtlas operates on **zero synthetic or fabricated records**.
  > 
  > Here in our **Unified Data Trust Register**, judges can inspect all 8 foundational datasets:
  > - **484,305 registered EVs** directly from the Ministry of Road Transport's VAHAN 4 portal.
  > - **3,178 operational public charging stations** verified from the Bureau of Energy Efficiency's EV Yatra registry.
  > - **766 electrical substations** across Maharashtra with voltage ratings.
  > 
  > Every dataset displays its official source URL, extraction date, CRS, quality score, SHA-256 checksum, and explicit documented limitations. We clearly distinguish verified observations, calculated results, and modelled planning scenarios."

---

### 1:30 – 2:30 | ACT 3: Maharashtra Statewide 36-District Spatial Gap Analysis
- **Visual:** Navigate to **Maharashtra Analysis (36 Districts)**.
- **Spoken Script:**
  > "Moving to our statewide spatial intelligence layer:
  > 
  > Notice the choropleth map rendering all **36 official revenue districts** of Maharashtra. We resolved historical shapefile discrepancies by topologically partitioning Mumbai City and Mumbai Suburban at latitude 19.00 degrees North.
  > 
  > To identify infrastructure deficits, we developed the **Charging Gap Index (CGI)**, combining registered EV adoption, EV-to-charger ratios, spatial density, and 5-kilometer metric buffer coverage.
  > 
  > Clicking on **Pune District** reveals a CGI score of **0.78**—over 134,000 registered EVs served by 842 public chargers, highlighting severe suburban deficit in fringe tech corridors. **Thane** and **Chhatrapati Sambhajinagar** follow closely with critical highway corridor gaps."

---

### 2:30 – 3:30 | ACT 4: Pune 1 km² Micro-Grid & Samruddhi Corridor Ground Truth
- **Visual:** Click **Pune Urban Grid** (shows 607 cells), then click **Samruddhi Mahamarg** tab.
- **Spoken Script:**
  > "For deep urban planning, we generated a metric fishnet of **607 discrete 1 km × 1 km micro-cells** across the 516 square kilometer contiguous PMC and PCMC agglomeration using UTM Zone 43N (EPSG:32643).
  > 
  > Evaluating against the Ministry of Power's September 2024 Siting Guidelines, we find only **30.3% of urban cells** meet the 1 km grid norm, identifying **219 charging desert cells** in Hadapsar-Manjri, Wagholi, and Hinjawadi Phase 3.
  > 
  > Next, examining the **701-kilometer Samruddhi Mahamarg Expressway**:
  > We performed great-circle geodetic buffering across its 24 segments and 17 interchange nodes. 
  > 
  > Our ground-truth finding is stark: **zero DC fast chargers currently operate directly on the expressway mainline**. While 14 stations exist near feeder interchanges, long-distance travelers must exit toll plazas, incurring an 18 to 25-minute detour penalty."

---

### 3:30 – 4:30 | ACT 5: Intelligent Site Recommender (MCDA) & Phased Rollout
- **Visual:** Navigate to **Site Recommendations** (shows candidate pins and AHP weights).
- **Spoken Script:**
  > "To solve these deficits, ChargeAtlas features an intelligent **Multi-Criteria Decision Analysis (MCDA)** engine.
  > 
  > We evaluate candidate parcels across 6 weighted spatial criteria: EV demand concentration, substation proximity, highway traffic hierarchy, inter-station separation, and corridor gap severity.
  > 
  > Evaluators can interactively adjust the Analytical Hierarchy Process (AHP) weight sliders—notice how candidate scores dynamically recompute in real-time.
  > 
  > Under the **Rollout Scenarios** panel, we solve the Maximum Covering Location Problem (MCLP) using integer linear programming:
  > - **Phase 1 (Immediate Deficit Siting):** Deploys 10 high-capacity hubs at ₹4.85 Crore, covering 48.5% of critical blackout zones including Hinjawadi Phase 3 and the Sinnar/Jalna expressway interchanges.
  > - **Phase 2 & 3:** Scale systematically toward full statutory MoP compliance with transparent CAPEX breakdowns."

---

### 4:30 – 5:00 | ACT 6: Conclusion & Scientific Rigor
- **Visual:** Return to National Map or Data Management.
- **Spoken Script:**
  > "In summary: ChargeAtlas India does not simply display markers on a basemap. It provides an enterprise, reproducible, and mathematically rigorous decision-support system:
  > 1. Dual-UTM CRS eliminating metric distortion.
  > 2. Zero synthetic fabrication with transparent provenance.
  > 3. Statutory MoP September 2024 compliance auditing.
  > 4. Full sub-30 millisecond Edge CDN deployment with zero 404 errors.
  > 
  > Thank you, and we welcome your questions!"
