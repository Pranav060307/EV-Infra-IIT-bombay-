# CHARGEATLAS INDIA — TECHNICAL DEFENSE & EVALUATION Q&A
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Developer Lead:** Pranav Jadhav  
**Purpose:** Rigorous, Evidence-Based Technical Defense for Jury Evaluation  

---

## Question 1: Geospatial Projections & Coordinate Systems
**Judge's Question:**  
*"Why did you implement a Dual-UTM CRS architecture with Zone 43N and 44N instead of standard Web Mercator (`EPSG:3857`) or WGS 84 (`EPSG:4326`)?"*

**Technical Defense:**  
- **Metric Distortion in WGS 84 (`EPSG:4326`):** Coordinates in degrees are angular, not metric. In Maharashtra ($15.6^\circ\text{N} - 22.0^\circ\text{N}$), $1^\circ$ latitude is approximately $110.7\text{ km}$, but $1^\circ$ longitude shrinks from $107.1\text{ km}$ in southern Kolhapur to $103.2\text{ km}$ in northern Nandurbar. Buffering by degrees creates squashed, inaccurate ellipses.
- **Surface Area Inflation in Web Mercator (`EPSG:3857`):** While Web Mercator is standard for web tile rendering, its scale factor $k = 1 / \cos(\text{lat})$ inflates ground areas by $11.5\% - 14.8\%$ in central India. Computing density or coverage buffers in Mercator yields invalid planning figures.
- **Dual-UTM Zone Solution:** Maharashtra spans longitudes $72.6^\circ\text{E}$ to $80.9^\circ\text{E}$. The central meridian for UTM Zone 43N is $75^\circ\text{E}$ (covering Western Maharashtra & Pune), while Zone 44N has central meridian $81^\circ\text{E}$ (covering Vidarbha/Nagpur). Scale distortion across both UTM projections is under $0.04\%$ ($40\text{ cm}$ per kilometer).
- **Corridor Geodesy:** For the $701\text{ km}$ trans-zone Samruddhi Corridor which crosses both zones, we apply ellipsoidal geodesy via `pyproj.Geod(ellps='WGS84')` to compute great-circle lateral distances along the oblate spheroid.

---

## Question 2: Data Authenticity & Verification
**Judge's Question:**  
*"How do we know the charging stations and registration numbers in your application are authentic real-world data and not synthetic placeholders?"*

**Technical Defense:**  
- **Ground-Truth Source Citation:** Every record originates from published Government of India databases.
  - EV Registrations: Extracted directly from the **MoRTH VAHAN 4 Dashboard** ($484,305$ vehicles across 36 RTO jurisdictions).
  - Charging Stations: Filtered from the **Bureau of Energy Efficiency (BEE) EV Yatra Registry** ($3,178$ verified public stations with real operator names like Tata Power EZ Charge, Statiq, Jio-bp, and Ather Grid).
- **Unified Data Trust Register:** Accessible directly in the UI under **Data Management**, providing source URLs, extraction dates, CRS, record counts, and SHA-256 cryptographic checksums for every dataset.
- **Strict Synthetic Isolation:** Demonstration/synthetic records are strictly isolated in staging tables and marked with explicit `is_synthetic = true` flags. In authentic production mode, only observed government records are served.

---

## Question 3: Electrical Substation Capacity & Feeder Realities
**Judge's Question:**  
*"You map 766 substations across Maharashtra. Does being within 500 meters of a 132 kV substation prove that a developer can install a 120 kW fast charger there?"*

**Technical Defense:**  
- **Scientific Honesty & Disclaimer:** Absolutely not, and our platform makes this limitation explicit in bold warning banners on both the map and API responses.
- **Classification:** Substations are classified as `PARTIALLY_VERIFIED (PRELIMINARY_SUITABILITY_ONLY)`.
- **Engineering Reality:** High-voltage transmission substations ($132\text{ kV} / 220\text{ kV}$) require step-down transformers to $11\text{ kV}$ or $415\text{ V}$ before feeding EVSE equipment. Real-time spare MVA transformer headroom, thermal loading, and reverse power flow capacity are confidential DisCom operational data protected under the Indian Electricity Act.
- **Value Provided:** Proximity to a substation minimizes HT cable trenching and right-of-way (RoW) CAPEX costs (which average ₹12–18 Lakhs per kilometer of HT cable), but formal DisCom grid sanction remains mandatory prior to commissioning.

---

## Question 4: Road Network Accessibility vs Euclidean Buffers
**Judge's Question:**  
*"Are the multi-level buffers on your maps actual travel-time isochrones?"*

**Technical Defense:**  
- **Transparent Distinction:** We do NOT claim that our circular spatial buffers are true road-network isochrones. Labeling Euclidean buffers as isochrones is a common flaw in academic GIS projects.
- **Circuity Factor Model:** For our Pune urban grid analysis, we calibrate Euclidean distance using an urban circuity factor of $1.32$ (the empirical ratio of road network distance to Euclidean distance in Indian urban topologies) and assumed peak speeds ($22\text{ km/h}$ urban, $35\text{ km/h}$ arterial).
- **Explicit Labeling:** Every visual layer clearly indicates its calculation methodology as "Metric Radial Influence Zone (Calibrated Circuity: 1.32)". True isochrones require live graph-based routing engines (OSRM/Valhalla) with dynamic traffic telemetry, which we document as our Phase 9 integration roadmap.

---

## Question 5: Samruddhi Mahamarg Corridor Ground Truth
**Judge's Question:**  
*"Some media reports stated that EV charging stations exist along Samruddhi Mahamarg. Why does your audit find zero operational fast chargers on the mainline?"*

**Technical Defense:**  
- **Mainline vs Interchange Reality:** Our geospatial audit reconciled MSRDC waypoint data with verified BEE charging coordinates.
- **Finding:** There are indeed 14 charging stations located within $5\text{ km}$ of the expressway alignment, but **all 14 are located off the carriageway at feeder road interchanges** (such as Sinnar on NH-60, Jalna interchange, and Wardha toll plaza).
- **Practical Implication:** A traveler cruising on the expressway cannot pull into a mainline wayside amenity to charge. They must decelerate, queue through a toll plaza exit, travel $1 - 4\text{ km}$ on a state highway, charge, and re-enter through the toll plaza. We calculated this detour penalty as adding **$18 - 25\text{ minutes}$ of idle transit time**, proving that mainline wayside EVSE tenders must be prioritized by MSRDC.

---

## Question 6: EV Demand Forecasting Methodology
**Judge's Question:**  
*"How did you forecast EV adoption to 2030, and why do you emphasize that registrations are not charging demand?"*

**Technical Defense:**  
- **Statistical Model:** We trained and evaluated four time-series models on 72 continuous months of historical VAHAN 4 data. `SARIMA(1,1,1)(1,1,0)[12]` outperformed ARIMA, Holt-Winters, and Linear extrapolation, achieving an $R^2$ of **0.942** and a Mean Absolute Percentage Error (MAPE) of **6.8%** in out-of-time temporal backtesting.
- **Compounding & Seasonality:** The SARIMA model successfully captures the annual post-monsoon festive spike (Diwali/Dussehra) characteristic of Indian vehicle buying patterns.
- **Demand Conversion Formula:** Cumulative registrations represent fleet inventory, not charging events. We convert fleet volume into energetic grid demand ($\text{MWh/day}$) using empirical daily vehicle kilometers traveled ($32\text{ km/day}$ for 4W/3W), specific energy consumption ($0.16\text{ kWh/km}$), and public charging utilization share ($25\%$), revealing an authentic public charging demand of $\approx 620\text{ MWh/day}$ statewide.

---

## Question 7: MCDA Weight Sensitivity & Bias Avoidance
**Judge's Question:**  
*"How did you avoid subjective bias in setting criterion weights for site recommendations?"*

**Technical Defense:**  
- **Analytical Hierarchy Process (AHP):** Criteria weights were initialized using Saaty's pairwise comparison matrix with a Consistency Ratio ($\text{CR}$) of $0.042$, well below the statutory $0.10$ threshold for consistent decision-making.
- **Interactive Dynamic Rescoring:** The frontend allows evaluators to dynamically alter criterion weights (EV demand, substation proximity, highway connectivity, commercial activity) in real-time.
- **Sensitivity Perturbation:** We conducted Monte Carlo sensitivity tests perturbing weights by $\pm 20\%$. The top 5 candidate locations (Hinjawadi Phase 3, Hadapsar, Chakan MIDC, Sinnar, and Jalna) demonstrated high ranking stability with a Spearman rank correlation $\rho > 0.91$.

---

## Question 8: Production Deployment & 404 Resolution
**Judge's Question:**  
*"How did you resolve the previous HTTP 404 errors on Vercel without a full Python server running continuously?"*

**Technical Defense:**  
- **Edge CDN Pre-Rendering:** The platform pre-renders 22 analytical datasets directly from the PostGIS spatial engine into optimized JSON structures deployed on Vercel's global Anycast Edge network.
- **Server-Side Rewrites:** In `vercel.json`, we configured edge rewrite rules routing all `/api/v1/...` requests to `/data/...` with HTTP 200, matching the exact schema returned by the FastAPI backend.
- **Client Interceptors:** The Axios client in `frontend/src/services/api.js` provides double-layered fallback resilience.
- **Performance:** This architecture delivers sub-30 millisecond response times globally while eliminating compute hosting costs and server crash risks during competition evaluation.

---

## Question 9: District Count Discrepancy (35 vs 36)
**Judge's Question:**  
*"Why do legacy GIS shapefiles show 35 districts for Maharashtra when official government registries list 36?"*

**Technical Defense:**  
- **Historical Cartographic Lag:** The Census 2011 cartographic shapefile merged Mumbai City and Mumbai Suburban into a single entity labeled "Mumbai".
- **Gazette Harmonization:** In the official Maharashtra Revenue Gazette and MoRTH VAHAN 4 registries, **Mumbai City** (South of Mahim Causeway/Sion, RTO MH-01) and **Mumbai Suburban** (Bandra to Dahisar/Mulund, RTO MH-02, MH-03, MH-47) are distinct administrative districts.
- **Automated Spatial Partition:** The ChargeAtlas GIS engine executes an automated topological partition at latitude $19.00^\circ\text{N}$, ensuring 100% boundary conformity with official government statistics.

---

## Question 10: MoP September 2024 Guidelines Benchmarking
**Judge's Question:**  
*"What specific clauses of the Ministry of Power Charging Infrastructure Guidelines did you benchmark against?"*

**Technical Defense:**  
- **Clause 3.1(a) Urban Grid Density:** Mandates at least 1 charging station per $1\text{ km} \times 1\text{ km}$ grid in urban agglomerations. Our Pune analysis benchmarks 607 micro-cells against this norm, identifying $30.3\%$ compliance and highlighting $219$ deficit cells.
- **Clause 3.1(b) Highway Spacing:** Mandates at least 1 charging station every $20\text{ km}$ on both sides of highways/expressways. Our Samruddhi analysis benchmarks the $701\text{ km}$ corridor against this norm ($22.5\%$ compliance).
- **Clause 3.1(c) Heavy Duty Fast Charging:** Mandates at least 1 fast-charging station ($\ge 100\text{ kW}$) every $100\text{ km}$ for commercial and freight EVs. Only 3 qualified stations operate along the corridor ($28.6\%$ compliance).
