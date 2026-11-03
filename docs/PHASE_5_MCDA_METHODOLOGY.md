# CHARGEATLAS INDIA — PHASE 5: MULTI-CRITERIA DECISION ANALYSIS (MCDA) METHODOLOGY

**Project:** ChargeAtlas India  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Lead Developer:** Pranav Jadhav  
**Platform Version:** 5.0.0 (MCDA & MCLP Location Optimization)  
**Date:** November 2026  

---

## 1. Executive Summary

Site selection for public EV charging infrastructure involves competing technical, economic, and urban constraints. Placing chargers solely where EV adoption is highest risks worsening spatial inequality and leaves transit highways unserved. Conversely, placing chargers purely based on geographic spacing ignores local demand and risks creating stranded assets.

Phase 5 implements a transparent, reproducible **Multi-Criteria Decision Analysis (MCDA)** scoring engine combined with a **Maximum Covering Location Problem (MCLP)** facility location optimization model.

---

## 2. MCDA Mathematical Formulation

The MCDA composite score for any candidate location $i$ is formulated as a Weighted Linear Combination (WLC):

$$\text{Score}_i = \sum_{j=1}^6 w_j \cdot S_{j, i}$$

$$\text{Subject to: } \sum_{j=1}^6 w_j = 1.0, \quad w_j \ge 0, \quad S_{j, i} \in [0.0, 100.0]$$

$$\begin{array}{|c|l|c|l|l|}
\hline
\textbf{Index} & \textbf{Criterion} & \textbf{Default Weight } (w_j) & \textbf{Raw Indicator} & \textbf{Normalization Function } (S_j) \\
\hline
C_1 & \text{EV Demand Potential} & 0.25 & \text{Catchment EV volume } (D_i) & S_1 = \min\left(100.0, \frac{D_i}{25,000} \times 100.0\right) \\
C_2 & \text{Spacing / Void Filling} & 0.20 & \text{Distance to nearest charger } (d_{\text{chg}, i}) & S_2 = \min\left(100.0, \frac{d_{\text{chg}, i}}{20.0} \times 100.0\right) \\
C_3 & \text{CGI Gap Severity} & 0.15 & \text{District/Corridor CGI deficit} & S_3 = \text{CGI}_{\text{region}} \in [0.0, 100.0] \\
C_4 & \text{Road Hierarchy} & 0.15 & \text{Arterial network class} & S_4 = \text{Lookup}(\text{RoadClass}) \in [40, 100] \\
C_5 & \text{Substation Proximity} & 0.15 & \text{Distance to 11/33kV sub } (d_{\text{sub}, i}) & S_5 = \max\left(0.0, 100.0 - \frac{d_{\text{sub}, i}}{3.0} \times 100.0\right) \\
C_6 & \text{Land Suitability} & 0.10 & \text{Parcel dwell-time \& category} & S_6 = \text{Lookup}(\text{SiteCategory}) \in [70, 95] \\
\hline
\end{array}$$

---

## 3. Road Hierarchy & Land Suitability Scoring

### 3.1 Road Network Hierarchy ($C_4$)
- **Expressway (e.g. Samruddhi Mahamarg):** $100.0$ points (Highest volume intercity traffic; critical long-distance corridor).
- **National Highway (NH):** $90.0$ points (Heavy interstate freight and commuter traffic).
- **State Highway (SH):** $80.0$ points (Regional transit corridor).
- **Major Urban Arterial:** $70.0$ points (High municipal daily volume).
- **Municipal Connector:** $55.0$ points (Secondary connector road).
- **Feeder / Local Road:** $40.0$ points (Lower throughput).

### 3.2 Land Suitability & Intermodal Utility ($C_6$)
- **MSRDC Wayside Amenity (WSA):** $95.0$ points (Dedicated rest oasis with parking, dining, and restroom amenities).
- **MSRTC / Municipal Bus Depot:** $90.0$ points (Intermodal transit node with long dwell times and high 2W/3W/Bus convergence).
- **Railway Station Public Parking:** $85.0$ points (Park-and-charge commuter node).
- **Commercial Retail Mall:** $80.0$ points (High dwell times of 1 to 3 hours).
- **Highway Petrol Pump:** $75.0$ points (Familiar refueling destination; existing commercial power).
- **Municipal Public Parking:** $70.0$ points (Publicly accessible land parcel).

---

## 4. Missing Data & Penalty Rules

To prevent artificial inflation of scores for unverified sites:
1. **Missing Substation Proximity:** If the distance to an electrical substation is unverified or unavailable, a conservative penalty score of $S_5 = 20.0$ is enforced rather than assuming zero-distance feasibility.
2. **Missing Coordinates:** Candidates lacking verified geospatial coordinates are excluded from scoring and flagged as `INSUFFICIENT_DATA`.
3. **Weight Normalization:** If a user configures custom weights via the interactive slider, weights are automatically normalized:
   $$w_j' = \frac{w_j}{\sum_{k=1}^6 w_k}$$

---

## 5. Candidate Priority Classification

Candidates are categorized based on their total MCDA score:
- **`HIGH_PRIORITY_CANDIDATE` ($\text{Score} \ge 75.0$):** Immediate candidate for public EVSE concession tenders. High unserved fleet demand, strong road access, and nearby electrical infrastructure.
- **`MEDIUM_PRIORITY_CANDIDATE` ($50.0 \le \text{Score} < 75.0$):** Recommended secondary site; viable with targeted grid augmentation or municipal land allocation.
- **`LOW_PRIORITY_CANDIDATE` ($\text{Score} < 50.0$):** Lower strategic priority; limited demand or significant distance from electrical infrastructure.
- **`INSUFFICIENT_DATA`:** Lacks required spatial or electrical attributes.

---

## 6. Facility Location Optimization: Maximum Covering Location Problem (MCLP)

While MCDA ranks individual candidate sites, deploying an entire charging network requires minimizing redundancy (i.e. preventing two high-scoring candidates from competing for the same localized catchment).

ChargeAtlas India implements the classic **Maximum Covering Location Problem (MCLP)**:

$$\max \quad Z = \sum_{i \in I} w_i \cdot y_i$$

$$\text{Subject to:}$$
$$y_i \le \sum_{j \in N_i} x_j \quad \forall i \in I$$
$$\sum_{j \in J} x_j \le p \quad (\text{Budget constraint: select at most } p \text{ facilities})$$
$$x_j \in \{0, 1\} \quad \forall j \in J$$
$$y_i \in \{0, 1\} \quad \forall i \in I$$

Where:
- $J$: Set of candidate charging locations ($|J| = 23$).
- $I$: Set of demand clusters (unserved urban cells, highway deficit segments, and zero-charger district centroids).
- $w_i$: Unserved EV fleet demand associated with cluster $i$.
- $N_i = \{j \in J : \operatorname{dist}(i, j) \le R_c\}$: Set of candidates within service radius $R_c$ (e.g. $3.0\text{ km}$ urban, $25.0\text{ km}$ corridor).
- $p$: Planner-specified station budget limit.

### 6.1 Solver Implementation & Performance Guarantee
The solver utilizes a Greedy Heuristic with Coverage Saturation Tracking. At each step, the algorithm selects the candidate yielding the largest marginal increase in newly covered EV demand plus weighted MCDA utility. Covered demand is dynamically subtracted to prevent double-counting.
- **Worst-Case Bound:** Provable $(1 - 1/e) \approx 63.2\%$ worst-case approximation bound relative to global integer linear programming (ILP) optimality.
- **Execution Time:** Sub-millisecond ($< 5\text{ ms}$) in pure Python / NumPy.

