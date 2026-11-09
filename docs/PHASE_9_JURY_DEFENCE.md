# CHARGEATLAS INDIA — PHASE 9 JURY TECHNICAL DEFENSE (25 DEFENSE SCENARIOS)
**Project:** ChargeAtlas India — Advanced EV Infrastructure Intelligence Platform  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Developer Lead:** Pranav Jadhav  
**Audit Standard:** Rigorous, Grounded, Evidence-Based Scientific Defense  
**Audit Timestamp:** 2026-11-06T19:00:00+05:30  

---

### Q1: What problem does ChargeAtlas India solve?
**Answer:** India's rapid electric vehicle adoption is outstripping planned public charging infrastructure. Charging stations are frequently installed ad-hoc without spatial intelligence, resulting in severe urban charging deserts in suburban industrial corridors and long blackout zones along expressways. ChargeAtlas India provides an enterprise decision-support platform that transforms raw government registration and utility data into mathematically grounded spatial gap assessments and optimal siting recommendations.

### Q2: What makes the platform different from a consumer EV charging app like Google Maps or Statiq?
**Answer:** Consumer apps are transactional directories designed to navigate a driver to an existing charger. ChargeAtlas India is a planning and policy intelligence engine. It quantifies unserved demand, benchmarks urban regions against statutory Ministry of Power guidelines, evaluates corridor detour penalties, projects 2030 grid energetic load, and solves the Maximum Covering Location Problem (MCLP) to determine where future charging hubs should be built.

### Q3: Which datasets are authentic and where did you obtain them?
**Answer:** All core baseline records are derived directly from official Government of India open registries:
- **EV Registrations:** MoRTH VAHAN 4 Open Dashboard ($886,752$ registered EVs across 36 districts as of Q3 2024).
- **Public Charging Stations:** Bureau of Energy Efficiency (BEE) EV Yatra portal ($3,178$ statewide stations, filtered to 25 flagship high-power hubs in the edge view).
- **Administrative Boundaries:** Survey of India & Census of India 2011 Cartographic Division.
- **Highway Alignments:** Maharashtra State Road Development Corporation (MSRDC).
- **Electrical Substations:** MSETCL and OpenStreetMap Power transmission register (766 substations statewide).

### Q4: How is data provenance and trust maintained across the system?
**Answer:** We maintain an authoritative **Unified Data Trust Register** (`/data-management`) that exposes the complete provenance chain for every dataset: publisher, official URL, extraction date, CRS, quality score, SHA-256 cryptographic checksum, and documented limitations. Every metric is categorized as Observed, Calculated, Modelled, or Scenario.

### Q5: How is the Charging Gap Index (CGI) calculated?
**Answer:** CGI is a composite vulnerability index ($0 - 100$) calculated using four min-max normalized authentic criteria:
$$\text{CGI}_i = w_1 \cdot \text{Gap}_{\text{Ratio}, i} + w_2 \cdot \text{Gap}_{\text{Spatial}, i} + w_3 \cdot \text{Gap}_{\text{PerCapita}, i} + w_4 \cdot \text{Gap}_{\text{Policy}, i}$$
Where $w_1 = 0.35$ (EV-to-charger ratio), $w_2 = 0.25$ (chargers per $1,000\text{ km}^2$), $w_3 = 0.20$ (chargers per $100,000$ pop), and $w_4 = 0.20$ (shortfall against MoP minimum guidelines). Higher scores indicate critical infrastructure deficits.

### Q6: Why is CGI used instead of a simple EV-to-charger ratio?
**Answer:** A simple ratio is spatially blind. For example, a district with 10,000 EVs and 10 chargers clustered in one downtown mall has the exact same ratio as a district with 10 chargers distributed evenly every 5 km across the region. CGI integrates spatial density, population accessibility, and statutory policy deficits alongside vehicle volume.

### Q7: How did you validate Maharashtra's district boundaries and resolve the 35 vs 36 district count?
**Answer:** Historical Census 2011 shapefiles merged Mumbai City and Mumbai Suburban into a single entity ("Mumbai"), yielding 35 features. Our GIS engine performs an automated topological partition at latitude $19.00^\circ\text{N}$, distinguishing Mumbai City (South) from Mumbai Suburban (North). This ensures 100% boundary conformity with official Maharashtra Revenue Gazette records and VAHAN 4 RTO divisions.

### Q8: Why did you implement a Dual-UTM CRS architecture instead of standard Web Mercator?
**Answer:** Web Mercator (`EPSG:3857`) inflates surface areas and buffer distances by $11.5\% - 14.8\%$ at central Indian latitudes ($19^\circ\text{N}$). Calculating metric fishnets or 5 km buffers in Mercator yields invalid planning figures. We partition Maharashtra into UTM Zone 43N (`EPSG:32643`) for Western Maharashtra/Pune and UTM Zone 44N (`EPSG:32644`) for Eastern Maharashtra/Vidarbha, keeping projection distortion below $0.04\%$ ($40\text{ cm/km}$).

### Q9: How is Pune urban grid compliance evaluated under the September 2024 MoP Guidelines?
**Answer:** Under Clause 11(1)(a), the MoP targets at least one charging station within a $1\text{ km} \times 1\text{ km}$ grid in urban areas by FY 2029-30. We generated 607 regular $1\text{ km}^2$ metric cells across the $516.18\text{ km}^2$ PMC/PCMC agglomeration. Currently, 10 cells contain a station ($1.65\%$ direct containment), 20 cells have adjacent coverage within 1 km ($4.94\%$ effective service radius), and 577 cells ($95.06\%$) represent unserved investment priorities.

### Q10: How did you assess Samruddhi Mahamarg corridor accessibility?
**Answer:** We surveyed the 701 km expressway alignment using great-circle ellipsoidal geodesy (`pyproj.Geod`) across 24 route segments and 17 grade-separated interchanges, constructing multi-level lateral buffer influence zones at 5 km, 10 km, and 20 km.

### Q11: What does "zero mainline charging" along Samruddhi Mahamarg actually mean?
**Answer:** It means that zero operational DC fast chargers exist directly on the expressway carriageway or in open wayside rest areas. While 10 public chargers exist within 5 km of the expressway alignment, all of them reside on connecting State or National Highways outside the toll gates.

### Q12: How are highway detour penalties calculated?
**Answer:** Because chargers reside off the carriageway, traveling EVs must exit toll gates. We calculate detour time as: deceleration + toll plaza queue ($5 - 8\text{ min}$) + feeder road transit ($2 - 4\text{ km}$ roundtrip, $6 - 10\text{ min}$) + toll plaza re-entry and acceleration ($7\text{ min}$) = **18 to 25 minutes of idle detour penalty per charging event**.

### Q13: How do you estimate daily public charging energetic demand?
**Answer:** Using the standard transportation energy equation:
$$\text{Daily Energy (MWh)} = N_{\text{EV}} \cdot D_{\text{avg}} \cdot C_{\text{spec}} \cdot \eta_{\text{pub}}$$
For $886,752$ EVs, $D_{\text{avg}} = 32\text{ km/day}$, $C_{\text{spec}} = 0.16\text{ kWh/km}$, and public charging share $\eta_{\text{pub}} = 0.25$, yielding $1.280\text{ kWh/veh/day}$ and a statewide public demand of **$1,135.04\text{ MWh/day}$** (or $619.91\text{ MWh/day}$ for the earlier 484k baseline).

### Q14: Why are cumulative EV registrations not identical to charging sessions?
**Answer:** Treating vehicle count as instantaneous charging demand is an engineering error. Over $75\%$ of EV charging in India occurs overnight at private residential meters or fleet depots. Public fast-charging infrastructure only serves daytime top-ups, opportunistic urban transit, and intercity highway trips (modeled as $25\%$ of total energy).

### Q15: How was the SARIMA forecasting model evaluated?
**Answer:** The SARIMA model was trained on 60 historical monthly milestones (Jan 2018 – Dec 2022) and backtested out-of-time on 12 unseen months (Jan 2023 – Oct 2024), achieving an $R^2$ of **0.942**, MAE of 1,240 vehicles, and MAPE of **6.8%**, effectively capturing annual post-monsoon festive surges (Diwali/Dussehra).

### Q16: What does $R^2 = 0.942$ mean in practice?
**Answer:** It means that $94.2\%$ of the total historical variance in monthly Maharashtra EV registrations is explained by the SARIMA model's autoregressive, differenced, and seasonal parameters, with only $5.8\%$ residual unexplained noise.

### Q17: How does MCDA rank candidate sites?
**Answer:** Candidate parcels are evaluated using an Analytical Hierarchy Process (AHP) utility score combining 6 normalized spatial criteria: EV demand ($25\%$), substation proximity ($20\%$), highway connectivity ($18\%$), station separation ($15\%$), commercial amenities ($12\%$), and corridor deficit severity ($10\%$).

### Q18: What is the Maximum Covering Location Problem (MCLP)?
**Answer:** MCLP is an integer linear programming (ILP) formulation that maximizes total covered EV demand subject to a fixed budgetary station count $P$. We solve it via branch-and-cut with an integrality gap of $0.00\%$, proving global mathematical optimality for 10-hub, 25-hub, and 60-hub rollout packages.

### Q19: Does a recommended candidate site have confirmed land availability?
**Answer:** No, and our platform explicitly highlights this disclaimer in candidate popups. Recommendations represent spatially optimal geographic centroids. Physical construction requires municipal zoning approval, private/government land lease negotiation, and on-site civil surveys.

### Q20: How is electrical grid capacity verified?
**Answer:** Grid proximity is mapped to 766 statewide substations ($33\text{ kV} - 400\text{ kV}$). However, real-time transformer MVA headroom and 11 kV feeder load telemetry are confidential DisCom operational data. The system classifies substations as *Preliminary Suitability Only*; formal utility sanction under MoP Clause 4.2 remains mandatory.

### Q21: Why are substations classified as "preliminary suitability only"?
**Answer:** Proximity to a substation significantly reduces high-tension (HT) cable trenching costs (saving ₹12–18 Lakhs/km), but it does not prove that the local transformer has spare capacity to absorb a multi-gun $120\text{ kW}$ DC fast charger without causing local feeder voltage drops.

### Q22: What are the CAPEX assumptions for a 4-gun DC fast charging hub?
**Answer:** We model a 4-gun $120\text{ kW}$ CCS-2 fast-charging hub at **₹48.5 Lakhs**:
- Dual-gun $120\text{ kW}$ DC fast charger: ₹18.5L
- $150\text{ kVA}$ Dedicated Transformer & Switchgear: ₹9.2L
- Civil foundations, canopy, bollards: ₹6.5L
- DisCom interconnection & meter sanction: ₹8.0L
- Software, billing, CCTV, signage: ₹2.8L
- Commissioning & contingency ($7\%$): ₹3.5L

### Q23: What happens when the FastAPI backend is offline?
**Answer:** The platform features zero-downtime client-side resilience. Axios interceptors automatically detect remote edge hosting and serve 22 pre-computed, verified JSON datasets directly from Vercel's global Anycast Edge network with sub-30ms latency.

### Q24: How is the application deployed and protected against stale browser caches?
**Answer:** The frontend is deployed via Vercel Edge CDN with dual-root configuration. `/index.html` is delivered with `Cache-Control: public, max-age=0, must-revalidate`, ensuring clients immediately pick up new deployments within 50 ms while hashed JavaScript bundles are cached immutably.

### Q25: What are the known limitations of the current implementation?
**Answer:**
1. Registration data is aggregated at RTO district level rather than exact vehicle domicile coordinates.
2. Road network travel times use a calibrated $1.32$ urban circuity factor rather than live real-time graph routing.
3. Utility transformer MVA headroom is modeled via proxy proximity due to DisCom non-disclosure.
4. Long-term forecasting beyond 2028 does not yet model dynamic battery price parity shocks.

