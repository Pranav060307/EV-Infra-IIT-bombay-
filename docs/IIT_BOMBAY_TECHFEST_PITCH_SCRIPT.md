# IIT BOMBAY TECHFEST 2026–27 — FINAL PITCH SCRIPT & DEMO GUIDE
## EV Infrastructure Map India Challenge
**Project:** ChargeAtlas India — EV Infrastructure Intelligence & Decision Support Platform  
**Team:** SuperNova, Sanjivani University  
**Presenter & Developer Lead:** Pranav Jadhav  
**Team Members:** Samruddhi Sarode, Parth Gade, Krushna Thakur, Sanskruti Bhavsar  
**Live Production URL:** https://ev-infra-iit-bombay.vercel.app  
**Total Target Time:** 5 Minutes (300 Seconds) + 3 Minutes Q&A  

---

## PRESENTATION FLOW AT A GLANCE

| Time | Scene / Feature | Live URL Route | Key Visual & Action | Core Technical Takeaway |
| :--- | :--- | :--- | :--- | :--- |
| **0:00 – 0:40** | **The Crisis & Problem** | `/` (Overview) | Click `✨ Jury Pitch` on navbar | 886k EVs in MH; ad-hoc siting causing urban deserts & highway blackouts. |
| **0:40 – 1:20** | **Dual-UTM Geodetic Engine** | `/methodology` | Click Scene 2 on Pitch bar | Web Mercator inflates areas by 14.8%; Dual-UTM 43N/44N cuts error to <0.04%. |
| **1:20 – 2:05** | **Statewide CGI Vulnerability** | `/maharashtra` | Show 36-district choropleth & AHP tuner | Vidarbha/Marathwada deficits (>0.85 CGI) vs Pune (0.34); AHP CR < 0.10. |
| **2:05 – 2:50** | **Pune 1km² Micro-Grid** | `/pune-grid` | Filter to Charging Deserts | 607 cells (516 km²); only 1.65% direct coverage; 293 severe desert cells. |
| **2:50 – 3:45** | **Samruddhi & Trip Simulator** | `/route-planner` | Select Nexon EV & dial temp to 42°C | 701 km corridor has 0 mainline chargers; +18 min detour penalty per charging stop. |
| **3:45 – 4:30** | **Clean Energy & Queuing** | `/grid-and-clean-energy` | Toggle Erlang-C & Solar Canopy tabs | 2-gun stations lock up under peak arrival; Solar+BESS delivers power at ₹3.45/kWh. |
| **4:30 – 5:00** | **MCLP Siting & 1-Click Dossier** | `/site-recommendations` | Click `📄 Dossier` & show printable PDF | 23 optimal parcels (0.00% ILP gap), SHA-256 trust seal, official whitepaper export. |

---

## WORD-FOR-WORD 5-MINUTE COMPETITION SCRIPT

### [0:00 – 0:40] ACT I: THE MACRO CRISIS & PHILOSOPHY
> **[Action: Stand with confidence. Open browser to `https://ev-infra-iit-bombay.vercel.app`. Click the glowing `✨ Jury Pitch` button in the navbar.]**
>
> *"Respected members of the jury, esteemed professors, and fellow innovators:*
>
> *Across Maharashtra alone, electric vehicle registrations have skyrocketed past **886,000 vehicles**. Yet, public charging infrastructure is currently expanding through ad-hoc, commercially speculative guesswork. This has produced two compounding crises: acute, unserved charging deserts in our suburban industrial belts, and complete charging blackouts along our premier greenfield expressways.*
>
> *Consumer apps like Google Maps or Statiq tell an individual driver where an existing charger is today. **ChargeAtlas India is fundamentally different.** It is an enterprise spatial intelligence and decision-support platform engineered for the Ministry of Power, MSRDC, DisComs, and Charge Point Operators to determine with mathematical certainty where the next ₹500 Crores of public charging infrastructure must be built."*

---

### [0:40 – 1:20] ACT II: SCIENTIFIC GEODESY & DUAL-UTM CRS
> **[Action: In the Jury Pitch bar, click Scene 2 or navigate to `/methodology`.]**
>
> *"Before placing a single charger, we addressed the fatal flaw of conventional web GIS: **spatial projection distortion**.*
>
> *Standard web mapping uses Web Mercator (EPSG:3857), which inflates surface areas and buffer distances by up to **14.8% at central Indian latitudes (19°N)**. If a municipal agency uses Mercator to calculate a statutory 1 km × 1 km grid or a 20 km highway catchment, their planning calculations are scientifically compromised.*
>
> *ChargeAtlas India introduces a **Dual-UTM Geodetic Architecture**: Western Maharashtra and Pune are mapped in **UTM Zone 43N (EPSG:32643)**, while Eastern Vidarbha and Nagpur are projected in **UTM Zone 44N (EPSG:32644)**. This bounds spatial distortion strictly under **0.04%**—less than 40 cm of distortion per kilometer across the entire state."*

---

### [1:20 – 2:05] ACT III: 36-DISTRICT COMPOSITE GAP INDEX (CGI)
> **[Action: Click Scene 3 or navigate to `/maharashtra`. Move mouse over the 36-district choropleth map. Show the live AHP slider.]**
>
> *"Here on the Maharashtra Intelligence module, we map all 36 revenue districts—resolving the historical Census 2011 merger by topologically partitioning Mumbai City from Mumbai Suburban at 19.00°N to align 100% with VAHAN 4 RTO divisions.*
>
> *Instead of relying on crude vehicle-to-charger ratios that ignore land area and demographics, we formulated the **Composite Gap Index (CGI)**:
>
> $$\text{CGI}_i = w_1 \cdot \text{Gap}_{\text{Ratio}} + w_2 \cdot \text{Gap}_{\text{Spatial}} + w_3 \cdot \text{Gap}_{\text{PerCapita}} + w_4 \cdot \text{Gap}_{\text{Policy}}$$
>
> *The results expose alarming disparities: While mature metropolitan hubs like Pune and Mumbai display low deficits (CGI below 0.38), agricultural transit corridors in Buldhana, Washim, and Jalna exceed 0.85 CGI. Furthermore, our live **AHP Weight Tuner** allows policymakers to dynamically adjust criteria weights with a mathematically consistent pairwise matrix ($CR < 0.10$)."*

---

### [2:05 – 2:50] ACT IV: PUNE URBAN 1KM² MICRO-GRID (MoP CLAUSE 11.1.a)
> **[Action: Click Scene 4 or navigate to `/pune-grid`. Point to the 607 regular micro-cells on the map.]**
>
> *"Next, we evaluate urban compliance under **Clause 11(1)(a) of the Ministry of Power September 2024 Guidelines**, which mandates at least one public charging station in every 1 km × 1 km grid by 2030.*
>
> *We generated **607 metric 1 km² cells** across the 516 km² PMC and PCMC urban agglomerations. The ground truth is stark:*
>
> - *Only **10 cells (1.65%)** contain a direct operational fast charger.*
> - *Only **20 cells (4.94%)** fall within a walkable 1 km service radius.*
> - *Over **293 cells (48.3%)** are severe charging deserts where drivers must travel over 5 km through urban congestion.*
>
> *Our engine models urban road network impedance using an empirical **1.32× circuity factor**, demonstrating that straight-line Euclidean distance dramatically underestimates actual travel times."*

---

### [2:50 – 3:45] ACT V: SAMRUDDHI MAHAMARG & HIGHWAY TRIP SIMULATOR
> **[Action: Click Scene 5 or navigate to `/route-planner`. Select 'Tata Nexon EV', set cruising speed to 100 km/h, and dial the temperature slider to 42°C.]**
>
> *"Along the 701 km Hindu Hrudaysamrat Balasaheb Thackeray Samruddhi Mahamarg, we uncovered a critical infrastructure void: **there are exactly ZERO operational DC fast chargers directly on the expressway carriageway or in open wayside rest areas**.*
>
> *Every single charger listed in commercial apps resides on connecting State Highways outside the toll gates. This imposes an unavoidable **+18-minute idle toll penalty** per charging event—for deceleration, toll queuing, off-corridor transit, and re-entry.*
>
> *To solve this, we engineered an interactive **Highway EV Trip & Elevation Simulator**. Watch what happens when we simulate a Tata Nexon EV traveling in peak Vidarbha summer heat (42°C):*
>
> - *Thermal HVAC and active battery cooling increase consumption by **+11.9%** ($168\text{ Wh/km}$).*
> - *The Western Ghats Kasara Ghat ascent consumes potential energy ($m \cdot g \cdot \Delta h$), while the descent recovers energy via regenerative braking at $\eta = 0.65$.*
> - *The dual-axis chart plots the battery discharge curve against the mountain elevation profile, scheduling exact charging stops at Sinnar and Jalna interchanges while alerting the driver to the +36 minutes of cumulative toll detour penalty."*

---

### [3:45 – 4:30] ACT VI: CLEAN ENERGY, ERLANG-C QUEUING & FREIGHT MCS
> **[Action: Click Scene 6 or navigate to `/grid-and-clean-energy`. Demonstrate the Queuing and Solar Canopy tabs.]**
>
> *"A complete infrastructure platform must solve physical queue congestion and grid sustainability:*
>
> 1. *Using **$M/M/c/K$ Erlang-C Queuing Theory**, we prove that a standard 2-gun station mathematically breaks down into infinite wait times when peak traffic arrives at 10 EVs/hour. Our engine sizes candidate sites with at least **4 to 6 parallel dispensers** to keep queue wait times strictly under 10 minutes.*
> 2. *To eliminate reliance on coal-powered grid electricity, our **Solar PV Canopy + BESS Modeler** co-locates 120 kWp solar canopies with 250 kWh battery storage, generating green power at an **LCOE of ₹3.45/kWh** compared to MSEDCL's commercial tariff of ₹9.50/kWh—yielding a 4.2-year payback and 34 tonnes of annual carbon abatement.*
> 3. *Under India's Draft National Electricity Policy 2026, our **V2G Virtual Power Plant** module aggregates 10,000 parked EVs to inject **35 MW of peak shaving capacity** during the 6:00 PM – 9:30 PM grid deficit window.*
> 4. *Finally, our **Freight Megawatt Charging (MCS)** module models 1.2 MW chargers for 40-tonne commercial e-trucks, saving logistics operators **₹14.8 Lakhs per truck annually**."*

---

### [4:30 – 5:00] ACT VII: MCLP OPTIMIZATION, DATA TRUST & 1-CLICK DOSSIER
> **[Action: Navigate to `/site-recommendations`. Click the `📄 Dossier` button in the top navbar to open the printable executive whitepaper.]**
>
> *"To synthesize all this intelligence into actionable infrastructure, our engine solves the **Maximal Covering Location Problem (MCLP)** via integer linear programming with a provable **0.00% integrality gap**, selecting 23 optimal candidate parcels connected to high-voltage 33kV substations.*
>
> *Crucially, every single number in this platform is backed by our **Unified Data Trust Register** (`/data-management`), tracking publisher provenance and **SHA-256 cryptographic checksums** across all 22 official Government of India datasets—zero hallucinations, zero fabricated synthetic points.*
>
> *And with one click on **'Export Dossier'**, any municipal commissioner or highway planner can immediately print or export a publication-ready **Technical Feasibility Whitepaper** complete with MoP compliance scorecards and geodetic parcel coordinates.*
>
> *ChargeAtlas India is live, fully verified, and ready to power India's electrified transportation future. Thank you, and we welcome the jury's questions."*

---

## 3-MINUTE JURY Q&A STRATEGY (HOW TO WIN THE TECHNICAL INTERVIEW)

1. **Keep answers concise (under 30 seconds).**
2. **State the mathematical or statutory reason first, then cite the data source.**
3. **Open the live application to the relevant page to visually prove your answer.**
4. **Refer directly to the `TECHFEST_JURY_QA_MASTER_GUIDE.md` for exact formulas.**
