# CHARGEATLAS INDIA — PHASE 4: GIS METHODOLOGY SPECIFICATION

**Project:** ChargeAtlas India  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Lead Developer:** Pranav Jadhav  
**Platform Version:** 4.0.0 (PostGIS / GeoPandas / Shapely Spatial Engine)  
**Verification Date:** November 2026  

---

## 1. Executive Summary

Phase 4 establishes the spatial mathematics, geographic coordinate systems, computational pipelines, and explainable multi-criteria algorithms that power ChargeAtlas India. This document details the exact mathematical formulas, geometric transformations, and spatial standards implemented across the state of Maharashtra, the Pune urban micro-grid, and the trans-zone Samruddhi Mahamarg corridor.

---

## 2. Coordinate Reference System (CRS) Architecture

A fundamental flaw in naive GIS implementations across Maharashtra is assuming a single planar projection (such as UTM Zone 43N) across the entire state. Maharashtra spans approximately $72.6^\circ\text{E}$ to $80.9^\circ\text{E}$ in longitude and $15.6^\circ\text{N}$ to $22.1^\circ\text{N}$ in latitude. The $78.0^\circ\text{E}$ meridian divides the state into two distinct Universal Transverse Mercator (UTM) zones.

```
       72.6°E                      78.0°E                      80.9°E
         |                           |                           |
         |<---- UTM Zone 43N ------->|<------ UTM Zone 44N ----->|
         |    (EPSG:32643)           |     (EPSG:32644)          |
         |  Mumbai, Pune, Nashik     |   Nagpur, Chandrapur      |
         |  Scale distortion < 0.04% |  Scale distortion < 0.04% |
         +---------------------------+---------------------------+
         |                                                       |
         |<==== Samruddhi Mahamarg (701 km Trans-Zone) =========>|
         |        Evaluated via WGS-84 Ellipsoidal Geodesy       |
```

### 2.1 Canonical Coordinate Standards
1. **Primary Spatial Storage (`EPSG:4326` — WGS 84):**  
   All raw spatial coordinates (station locations, district polygons, municipal boundaries, corridor alignments) are canonically persisted in geographic longitude/latitude using the WGS 84 ellipsoid.
2. **Western Maharashtra Projected Metric Grid (`EPSG:32643` — UTM Zone 43N):**  
   Used for metric operations within Western and Central Maharashtra (including Pune Municipal Corporation and Pimpri-Chinchwad). Scale distortion remains below $0.04\%$.
3. **Eastern Maharashtra Projected Metric Grid (`EPSG:32644` — UTM Zone 44N):**  
   Used for metric operations in the Vidarbha region (including Nagpur, Wardha, and Amravati).
4. **Trans-Zone Expressway Geodesic Engine (`pyproj.Geod(ellps="WGS84")`):**  
   Because the Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg extends 701.0 km from Nagpur ($79.03^\circ\text{E}$, Zone 44N) to Thane ($73.28^\circ\text{E}$, Zone 43N), projecting the entire corridor into a single planar UTM zone introduces $>0.2\%$ distortion. Corridor chainages and distance calculations use ellipsoidal geodesy (Vincenty/Karney formulations).

---

## 3. Spatial Operators & Ground Truth Validation

ChargeAtlas India implements formal testing and runtime verification for the fundamental OpenGIS / PostGIS spatial operators:

$$\begin{array}{|l|l|l|}
\hline
\textbf{Operator} & \textbf{Mathematical Definition} & \textbf{Benchmark Application} \\
\hline
\text{ST\_Within}(P, A) & P \in \operatorname{int}(A) \cup \operatorname{bd}(A) & \text{Assigning stations to administrative districts and urban grid cells.} \\
\text{ST\_Intersects}(G_1, G_2) & G_1 \cap G_2 \ne \emptyset & \text{Corridor buffer overlap and state boundary alignment.} \\
\text{ST\_DWithin}(G_1, G_2, d) & \operatorname{dist}(G_1, G_2) \le d & \text{MoP 20 km corridor spacing and 1 km urban adjacency checks.} \\
\text{ST\_Distance}(P_1, P_2) & \min \|x - y\|_2 & \text{Euclidean metric distance in projected UTM meters.} \\
\text{ST\_Transform}(G, \text{srid}) & f_{\text{proj}}(G) & \text{Dynamic transformation between EPSG:4326 and EPSG:32643.} \\
\text{ST\_Area}(A) & \iint_A dx\,dy & \text{Surface area calculation of municipal boundaries and grid cells.} \\
\text{ST\_Length}(L) & \int_L \sqrt{\dot{x}^2 + \dot{y}^2}\,dt & \text{Geodetic alignment length across expressway route.} \\
\hline
\end{array}$$

### 3.1 Dual-CRS Distance Verification
The Euclidean distance between Vivanta Pune Hinjawadi ($73.7380^\circ\text{E}, 18.5912^\circ\text{N}$) and Shaniwar Wada ($73.8553^\circ\text{E}, 18.5196^\circ\text{N}$) was measured under both projections:
- **UTM Zone 43N Planar Distance:** $14,731.94\text{ m}$
- **WGS-84 Ellipsoidal Geodetic Distance:** $14,734.90\text{ m}$
- **Absolute Delta:** $2.96\text{ m}$ ($\Delta < 0.02\%$), validating high precision within the projected domain.

---

## 4. Pune Urban 1km × 1km Micro-Grid Analysis

### 4.1 Boundary Clipping & Tessellation
The study area encompasses the conurbation of Pune Municipal Corporation (PMC) and Pimpri Chinchwad Municipal Corporation (PCMC), covering a statutory boundary of $516.18\text{ km}^2$.

1. The boundary polygon is projected into UTM Zone 43N (`EPSG:32643`).
2. A regular bounding tessellation is generated with spacing $\Delta x = 1,000\text{ m}$, $\Delta y = 1,000\text{ m}$.
3. Each rectangular cell is spatially clipped to the exact statutory municipal boundary:
   $$C_i = (B_{x_i, y_i} \cap \Omega_{\text{pune}}), \quad \text{where } \operatorname{Area}(C_i) \ge 0.05\text{ km}^2$$
4. A total of $489$ discrete spatial cells cover the urban agglomeration.

### 4.2 Ministry of Power (MoP) Clause 11(1)(a) Benchmark
The Ministry of Power Charging Infrastructure Guidelines (dated 17 September 2024, Ref No. 12/2/2018-EV) state:
> *"In urban areas, at least one charging station shall be set up in a grid of 1 km × 1 km by the year 2030."*

ChargeAtlas India categorizes each cell into three planning tiers:
- **Tier 1 — Benchmark Met:** Stations located directly inside cell polygon ($\text{station\_count} \ge 1$).
- **Tier 2 — Adjacent Buffer Coverage:** Station within $1,000\text{ m}$ of cell centroid ($\text{dist} \le 1,000\text{ m}$).
- **Tier 3 — Unserved Planning Cell:** Nearest verified station $>1,000\text{ m}$. Represents a strategic deployment target for the FY 2029–30 planning horizon.

---

## 5. Samruddhi Mahamarg Corridor Spacing & Directional Access

The Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg spans $701.0\text{ km}$ connecting Nagpur to Mumbai/Thane across 10 districts and 17 grade-separated interchanges.

### 5.1 Geodesic Chainage & Station Assignment
Each verified public charging station within a $20\text{ km}$ buffer is projected orthogonally onto the expressway centerline:
$$s_{\text{station}} = \arg\min_{s \in [0, L]} \operatorname{GeodDist}(P_{\text{station}}, \Gamma_{\text{corridor}}(s))$$

Stations with lateral offset $d_{\perp} \le 1.0\text{ km}$ are classified as direct wayside facilities. Stations with $1.0\text{ km} < d_{\perp} \le 20.0\text{ km}$ are feeder stations accessible via interchanges.

### 5.2 Directional Carriageway Audit Standard
Ministry of Power Clause 11(1)(b) mandates charging stations every $20\text{ km}$ *on both sides* of expressways.
> **Standard:** Because the national BEE EV Yatra directory does not record directional carriageway side (Nagpur-bound vs. Mumbai-bound), ChargeAtlas India strictly marks directional carriageway compliance as **`UNVERIFIED`**. Proximity to the expressway centerline is never assumed to represent dual-carriageway physical access.

### 5.3 Heavy-Duty Fast-Charging (Clause 12(7))
Clause 12(7) mandates dedicated fast-charging stations every $100\text{ km}$ equipped with $\ge 2 \times 240\text{ kW}$ CCS-2 dispensers for commercial and long-range vehicles.
The corridor is partitioned into 7 consecutive $100\text{ km}$ segments ($0\text{–}100\text{ km}, \dots, 600\text{–}701\text{ km}$). Compliance requires $\ge 1$ operational $\ge 240\text{ kW}$ installation per block. Currently, $0$ stations meet this criteria ($0\%$ compliance).

---

## 6. Charging Gap Index (CGI) Formula

The Charging Gap Index is an audited multi-criteria metric in the range $[0.0, 100.0]$ designed to prioritize capital allocation and public land concessions across all 36 Maharashtra districts.

$$\text{CGI}_i = \sum_{k=1}^4 w_k \cdot G_{k, i}$$

$$\begin{array}{|l|c|l|l|}
\hline
\textbf{Sub-Component} & \textbf{Weight } (w_k) & \textbf{Raw Input} & \textbf{Normalization Function } (G_{k}) \\
\hline
\text{EV-to-Charger Ratio Gap} & 0.35 & R_i = \frac{\text{EV}_i}{\text{CP}_i} & G_1 = \min\left(100.0, \frac{R_i}{300.0} \times 100.0\right) \quad (\text{if } \text{CP}_i = 0, G_1 = 100.0) \\
\text{Spatial Density Gap} & 0.25 & D_i = \frac{\text{CP}_i \times 1000}{A_i} & G_2 = \max\left(0.0, 100.0 - \frac{D_i}{10.0} \times 100.0\right) \\
\text{Per-Capita Shortfall} & 0.20 & C_i = \frac{\text{CP}_i \times 100000}{P_{2024, i}} & G_3 = \max\left(0.0, 100.0 - \frac{C_i}{25.0} \times 100.0\right) \\
\text{MoP Policy Deficit} & 0.20 & S_i = \frac{\max(5, U_i/20000) - \text{CP}_i}{\max(5, U_i/20000)} & G_4 = \min(100.0, \max(0.0, S_i \times 100.0)) \\
\hline
\end{array}$$

### 6.1 Explainability Guarantee
Every API response exposing CGI scores breaks down:
1. Raw observed values ($R_i, D_i, C_i, S_i$)
2. Normalized deficit scores ($G_1, G_2, G_3, G_4 \in [0, 100]$)
3. Component weightings ($w_k$)
4. Weighted point contributions ($w_k \cdot G_k$)

*The CGI indicator does not constitute a statutory finding, but serves as an algorithmic decision-support tool for EV charging network expansion.*

