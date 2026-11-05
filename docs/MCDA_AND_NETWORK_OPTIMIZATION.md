# CHARGEATLAS INDIA — MCDA SITING & NETWORK OPTIMIZATION METHODOLOGY
**Platform:** ChargeAtlas India | **Team:** SuperNova (Sanjivani University)  
**Competition:** IIT Bombay Techfest 2026–27 EV Infrastructure Map India Challenge  
**Specification:** 6-Criteria AHP-MCDA, Sensitivity Analysis & Greedy MCLP Solver  
**Version:** 2.0 (Explainable Siting Architecture)

---

## 1. 6-Criteria Analytical Hierarchy Process (AHP) MCDA Engine

ChargeAtlas evaluates **23 geospatially authentic candidate parcels** across Pune Urban, Samruddhi Mahamarg Interchanges, and District Headquarters against six orthogonal spatial criteria:

$$\text{Score}_j = \sum_{k=1}^6 w_k \cdot S_{jk} \quad \in [0, 100]$$

| Criterion ($k$) | Metric Name | Weight ($w_k$) | Measurement Methodology | Normalization Function |
| :---: | :--- | :---: | :--- | :--- |
| **1** | EV Demand Potential | **0.25** | Local registered EV fleet catchment in 3 km radius | Min-Max scaling of localized fleet volume to 0–100 |
| **2** | Distance from Chargers | **0.20** | Distance to nearest existing station (Anti-clustering) | Direct linear scaling (Cap at 5 km = 100 score) |
| **3** | Gap Severity | **0.15** | Regional Charging Gap Index (CGI) | Direct 1:1 reflection of District/Grid CGI score |
| **4** | Road Accessibility | **0.15** | Road network functional classification | Expressway (100), NH (90), SH (80), Arterial (70), Feeder (40) |
| **5** | Electrical Proximity | **0.15** | Distance to nearest 11kV/33kV substation | $100 - (\text{dist\_m} / 5000) \times 100$; capped at $\le 0$ |
| **6** | Land Suitability | **0.10** | Intermodal dwell utility & land zoning | Wayside (95), Bus Depot (90), Rail (85), Mall (80), Petrol (75) |

---

## 2. MCDA Sensitivity Analysis & Ranking Stability

A frequent deficiency in municipal decision-support platforms is hyper-sensitivity: minor tweaks to weights cause radical shifts in recommendations. ChargeAtlas evaluates candidate rank stability across three contrasting policy regimes:

### 2.1 Policy Weighting Profiles:
1. **Balanced Baseline (Default AHP):** $w = [0.25, 0.20, 0.15, 0.15, 0.15, 0.10]$
2. **Highway & Corridor Priority:** Road Accessibility weighted at **40%**, Demand at 25%, Electrical at 15%.
3. **Electrical Grid Feasibility Priority:** Substation Proximity weighted at **40%**, Demand at 25%, Road at 15%.

### 2.2 Stability Classification:
- **High Stability ($\Delta \text{rank} \le 2$):** Site maintains top recommendation status across all policy scenarios.
- **Moderate Sensitivity ($3 \le \Delta \text{rank} \le 5$):** Site ranking shifts slightly with policy changes.
- **High Sensitivity ($\Delta \text{rank} > 5$):** Highly dependent on a single criterion (e.g. adjacent to substation but on a minor feeder road).

### Top Robust Siting Candidates (Maharashtra):
1. **Vivanta Hinjawadi Tech Hub (CAND-PUN-001):** Rank 1 across all 3 profiles ($\Delta \text{rank} = 0$).
2. **PMC Swargate Intermodal Terminal (CAND-PUN-002):** Rank 2–3 across all profiles ($\Delta \text{rank} \le 1$).
3. **Igatpuri Expressway Wayside Interchange (CAND-SAM-001):** Rank 2 in Highway Priority, Rank 4 in Default.
4. **Chhatrapati Sambhajinagar West Interchange (CAND-SAM-003):** High stability corridor hub.

---

## 3. Maximal Covering Location Problem (MCLP)

To select an optimal package of $p$ stations under a budget constraint, ChargeAtlas implements a **greedy heuristic solver** for the Maximal Covering Location Problem:

### Mathematical Formulation:
$$\max_{X, Y} Z = \sum_{i \in \mathcal{I}} d_i \cdot y_i$$

**Subject to:**
$$y_i \le \sum_{j \in \mathcal{N}_i} x_j \quad \forall i \in \mathcal{I}$$
$$\sum_{j \in \mathcal{J}} x_j \le p$$
$$x_j \in \{0, 1\} \quad \forall j \in \mathcal{J},\quad y_i \in \{0, 1\} \quad \forall i \in \mathcal{I}$$

Where:
- $\mathcal{I}$: Set of unserved EV demand clusters.
- $\mathcal{J}$: Set of candidate siting parcels ($|\mathcal{J}| = 23$).
- $\mathcal{N}_i = \{j \in \mathcal{J} \mid \text{dist}(i, j) \le R_{\text{service}}\}$: Candidate sites within service radius $R_{\text{service}} = 3.0\text{ km}$.
- $p$: Budget constraint on number of stations deployed ($p \in \{5, 10, 20\}$).

### Theoretical Optimality Guarantee:
The greedy coverage heuristic with saturation achieves the provable Nemhauser-Wolsey-Fisher approximation bound:
$$\alpha = 1 - \frac{1}{e} \approx 63.2\%$$
Guaranteeing that the selected package captures at least $63.2\%$ of the mathematically optimal integer program objective value under all network topologies.

---

## 4. Packaged Deployment Scenarios

| Scenario Package | Station Count ($p$) | Estimated Capital Budget | Unserved Demand Saturation | Primary Strategic Target |
| :--- | :---: | :---: | :---: | :--- |
| **Phase 1: Rapid Impact** | **5 Stations** | **₹2.50 Cr** | **64.2%** | High-density urban bottlenecks (Hinjawadi, Swargate, Baner) |
| **Phase 2: Balanced Network** | **10 Stations** | **₹5.20 Cr** | **83.8%** | Urban cores + critical Samruddhi Interchanges (Igatpuri, Shirdi) |
| **Phase 3: Comprehensive Grid** | **20 Stations** | **₹10.80 Cr** | **96.5%** | Complete statewide network eliminating all regional voids |
