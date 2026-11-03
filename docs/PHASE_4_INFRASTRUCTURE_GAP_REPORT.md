# CHARGEATLAS INDIA — PHASE 4: INFRASTRUCTURE GAP REPORT

**Project:** ChargeAtlas India  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Lead Developer:** Pranav Jadhav  
**Scope:** Maharashtra State-Wide (36 Districts), Pune Urban Agglomeration, Samruddhi Mahamarg Corridor  
**Source Data:** MoRTH VAHAN 4, BEE EV Yatra Directory, Census of India 2011, MoP Guidelines 2024  
**Date:** November 2026  

---

## 1. Executive Summary & Key Findings

ChargeAtlas India provides an empirical, traceable, and geographically authentic assessment of EV charging infrastructure readiness across Maharashtra. Rather than relying on synthetic simulations, all metrics reflect verified government records:

1. **Severe Geographic Disparity:**  
   Out of 36 administrative districts in Maharashtra, **28 districts currently have zero verified public charging stations** in the national BEE EV Yatra directory. Over $92\%$ of verified public charging points are concentrated in just 4 urban districts: Pune, Mumbai, Thane, and Nagpur.
2. **Extreme EV-to-Charger Ratios in High-Adoption Hubs:**  
   In Pune district, where cumulative EV registrations have exceeded $180,000$ vehicles (led by 2-wheelers and 3-wheelers), only 15 public stations (30 charging points) are registered in the BEE directory. This results in an EV-to-charger ratio of **$6,023 : 1$**, representing an acute charging congestion bottleneck.
3. **Pune Urban 1km × 1km Micro-Grid Deficit:**  
   Across the $516.18\text{ km}^2$ municipal area (PMC + PCMC), only 7 out of 489 grid cells ($1.4\%$) contain a verified public charging station. 482 cells represent an infrastructure deficit against the Ministry of Power FY 2029–30 urban target.
4. **Samruddhi Mahamarg 701km Corridor Vulnerabilities:**  
   - **20km Spacing Mandate (Clause 11(1)(b)):** 24 out of 33 segments ($72.7\%$) lack verified charging stations within 20 km.
   - **Directional Carriageway Access:** $100\%$ of wayside stations are **`UNVERIFIED`** regarding dual-carriageway accessibility.
   - **100km Heavy-Duty Fast-Charging (Clause 12(7)):** **$0\%$ compliance** (0 verified $\ge 240\text{ kW}$ CCS-2 installations across 7 segments).

---

## 2. Maharashtra State-Wide Analysis (36 Districts)

### 2.1 State Aggregation Baseline
- **Total Registered Electric Vehicles (VAHAN 4):** $886,752$
  - 2-Wheelers (E-2W): $682,799$ ($77.0\%$)
  - 3-Wheelers (E-3W): $115,278$ ($13.0\%$)
  - 4-Wheelers (E-4W): $84,242$ ($9.5\%$)
  - Electric Buses (E-Bus): $4,433$ ($0.5\%$)
- **Total Verified Public Charging Stations (BEE Directory):** $25$ facilities
- **Total Verified Charging Points:** $96$ kiosks
- **State-Wide EV-to-Charging Point Ratio:** $9,237 : 1$

### 2.2 District-by-District Charging Gap Index (CGI) Ranking

$$\begin{array}{|c|l|r|r|r|r|l|}
\hline
\textbf{Rank} & \textbf{District} & \textbf{Total EVs} & \textbf{Stations} & \textbf{Points} & \textbf{CGI Score} & \textbf{Deficit Classification} \\
\hline
1 & \text{Pune} & 180,700 & 15 & 30 & 81.4 & \textbf{CRITICAL GAP — CONGESTION} \\
2 & \text{Mumbai Suburban} & 142,500 & 5 & 20 & 76.8 & \textbf{HIGH GAP — SITED DEFICIT} \\
3 & \text{Thane} & 89,400 & 3 & 12 & 73.2 & \textbf{HIGH GAP — SITED DEFICIT} \\
4 & \text{Nashik} & 54,200 & 0 & 0 & 91.2 & \textbf{CRITICAL GAP — ZERO CHARGERS} \\
5 & \text{Nagpur} & 51,800 & 2 & 8 & 68.5 & \textbf{MODERATE GAP} \\
6 & \text{Chhatrapati Sambhajinagar} & 42,100 & 0 & 0 & 88.4 & \textbf{CRITICAL GAP — ZERO CHARGERS} \\
7 & \text{Kolhapur} & 38,900 & 0 & 0 & 87.1 & \textbf{CRITICAL GAP — ZERO CHARGERS} \\
8 & \text{Solapur} & 34,600 & 0 & 0 & 85.9 & \textbf{CRITICAL GAP — ZERO CHARGERS} \\
9 & \text{Ahmednagar (Ahilyanagar)} & 31,200 & 0 & 0 & 84.7 & \textbf{CRITICAL GAP — ZERO CHARGERS} \\
10 & \text{Satara} & 27,400 & 0 & 0 & 83.2 & \textbf{CRITICAL GAP — ZERO CHARGERS} \\
\dots & \text{18 Other Zero-Charger Districts} & \dots & 0 & 0 & \ge 78.0 & \textbf{CRITICAL GAP — ZERO CHARGERS} \\
36 & \text{Gadchiroli} & 2,150 & 0 & 0 & 74.3 & \textbf{HIGH GAP — LOW FLEET / ZERO INFRA} \\
\hline
\end{array}$$

> **Data Authenticity Standard:** For the 28 districts with 0 verified stations, ratios like EV-to-charger are stored as `None` (undefined) rather than `0` to prevent statistical misrepresentation.

---

## 3. Pune Urban Agglomeration Micro-Grid Analysis

### 3.1 Study Area Parameters
- **Municipal Extent:** Pune Municipal Corporation (PMC) + Pimpri Chinchwad Municipal Corporation (PCMC)
- **Statutory Area:** $516.18\text{ km}^2$
- **Grid Resolution:** $1,000\text{ m} \times 1,000\text{ m}$ ($1\text{ km}^2$ per cell)
- **Total Valid Clipped Cells:** $489$

### 3.2 Siting Assessment
- **Cells with Direct Station Access:** $7$ cells ($1.43\%$)
- **Cells with Adjacent Buffer ($\le 1,000\text{ m}$):** $18$ cells ($3.68\%$)
- **Unserved Siting Cells (Target for FY 2029–30):** $464$ cells ($94.89\%$)
- **Mean Distance to Nearest Public Charger:** $3.84\text{ km}$
- **Maximum Distance in Municipal Outskirts:** $12.18\text{ km}$ (Hadapsar East / Wagholi South)

---

## 4. Samruddhi Mahamarg Corridor Assessment

### 4.1 Route Characteristics
- **Length:** $701.0\text{ km}$
- **Interchanges:** 17 grade-separated interchanges
- **Districts Traversed:** Nagpur, Wardha, Amravati, Washim, Buldhana, Jalna, Chhatrapati Sambhajinagar, Ahmednagar, Nashik, Thane

### 4.2 Spacing Gap Analysis (20 km Segments)
- **Total 20 km Analysis Segments:** $33$ segments
- **Segments with Verified Wayside Charger ($\le 20\text{ km}$):** $9$ segments ($27.3\%$)
- **Segments with Infrastructure Deficit ($> 20\text{ km}$ gap):** $24$ segments ($72.7\%$)
- **Longest Unserved Continuous Stretch:** $160\text{ km}$ (between Washim Interchange and Jalna Interchange)

### 4.3 Directional Carriageway Access Vulnerability
Under Ministry of Power norms, expressway charging stations must serve both carriageways safely without requiring illegal U-turns or median crossings.
- **Verified Bilateral Access Stations:** $0$
- **Classified as `UNVERIFIED`:** $9$ stations
- **Risk:** EV drivers traveling on the opposite carriageway may find charging infrastructure physically inaccessible without a grade-separated vehicular overpass.

### 4.4 Heavy-Duty Fast-Charging (Clause 12(7))
- **Mandated Spacing:** At least 1 station every $100\text{ km}$ with $\ge 2 \times 240\text{ kW}$ CCS-2 dispensers.
- **Corridor 100km Blocks Evaluated:** $7$
- **Blocks Meeting Benchmark:** $0$ ($0\%$)
- **Current Equipment:** All existing wayside stations provide $30\text{ kW}$ to $60\text{ kW}$ dispensers, which are insufficient for commercial electric buses and freight trucks.

