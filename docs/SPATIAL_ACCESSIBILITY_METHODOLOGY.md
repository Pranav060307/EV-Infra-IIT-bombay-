# CHARGEATLAS INDIA — ADVANCED SPATIAL ACCESSIBILITY METHODOLOGY
**Platform:** ChargeAtlas India | **Team:** SuperNova (Sanjivani University)  
**Competition:** IIT Bombay Techfest 2026–27 EV Infrastructure Map India Challenge  
**Specification:** Metric Geodesy, Road-Network Circuity, Multi-Threshold Isochrones & CGI Formulation  
**Version:** 2.0 (Dual UTM & Empirical Routing Architecture)

---

## 1. Geodetic Rigor & Coordinate Reference System Segregation

In GIS engineering across subcontinental territories like India, calculating metric distances, geometric buffers, or polygon areas on geographic coordinates (EPSG:4326 degrees) or Web Mercator (EPSG:3857) introduces severe metric distortion:
- **EPSG:3857 (Web Mercator):** Exhibits a scale factor distortion exceeding $+12\%\text{ to }+18\%$ across Maharashtra latitudes ($15.5^\circ\text{N to }22.5^\circ\text{N}$). Calculating infrastructure buffer areas directly in EPSG:3857 drastically overstates spatial coverage.
- **EPSG:4326 (WGS 84):** Uses angular degrees where $1^\circ$ longitude shrinks from $107.1\text{ km}$ at $16^\circ\text{N}$ to $102.8\text{ km}$ at $22^\circ\text{N}$.

### ChargeAtlas Projection Architecture:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CHARGEATLAS DUAL CRS PIPELINE                         │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ Storage & GeoJSON API:        │ EPSG:4326 (WGS 84 Ellipsoidal Lat/Lon)      │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Western Maharashtra & Pune:   │ EPSG:32643 (UTM Zone 43N: 72°E - 78°E)      │
│                               │ Metric grid in meters; distortion < 0.04%   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Eastern Maharashtra/Vidarbha: │ EPSG:32644 (UTM Zone 44N: 78°E - 84°E)      │
│                               │ Metric grid in meters; distortion < 0.04%   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Trans-Zone Corridors:         │ WGS-84 Ellipsoidal Geodesy (PyProj Geod)    │
│ (Samruddhi Mahamarg 701 km)   │ Exact inverse geodesic navigation           │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Client Map Presentation:      │ EPSG:3857 (Restricted exclusively to tiles) │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 2. Road-Network Circuity vs Euclidean Straight-Line Distance

Straight-line (Euclidean) distance severely underestimates real-world road travel distance in dense Indian metropolitan regions due to rivers (e.g., Mula-Mutha river system in Pune), railway corridors, dead-end lanes, and traffic gyratories.

### The Empirical Circuity Formulation:
$$d_{\text{road}} = d_{\text{euclidean}} \times f_{\text{circuity}}$$

Where:
- $f_{\text{circuity}} = 1.32$ (Calibrated against PMC & PCMC road network topological graphs).
- $d_{\text{euclidean}}$: Vectorized nearest-neighbor distance computed via `scipy.spatial.cKDTree` in EPSG:32643 (UTM 43N).

### Road Travel Time Estimation:
$$t_{\text{peak}} = \left(\frac{d_{\text{road}}}{v_{\text{peak}}}\right) \times 60 \quad \text{[minutes]}$$
$$t_{\text{offpeak}} = \left(\frac{d_{\text{road}}}{v_{\text{offpeak}}}\right) \times 60 \quad \text{[minutes]}$$

Where:
- $v_{\text{peak}} = 22.0\text{ km/h}$ (Observed average urban vehicular speed during peak traffic hours in Pune urban core).
- $v_{\text{offpeak}} = 35.0\text{ km/h}$ (Free-flow off-peak vehicular speed).

### Accessibility Tiers:
| Tier Name | Road Distance Range | Urban Planning Interpretation |
| :--- | :---: | :--- |
| **Direct Walking / Slow Access** | $\le 1.0\text{ km}$ | Pedestrian walking catchment for slow/destination AC charging. |
| **Urban Neighborhood** | $1.0\text{ km} - 3.0\text{ km}$ | 5–8 min local feeder transit to destination fast charger. |
| **Extended Transit** | $3.0\text{ km} - 5.0\text{ km}$ | 10–15 min urban driving; approaching acceptable threshold for urban core. |
| **Charging Desert** | $> 5.0\text{ km}$ | Severe infrastructure void; priority intervention zone for municipal planning. |

---

## 3. Multi-Level Metric Buffer Isochrones

To evaluate public charging coverage without arbitrary radius cutoffs, the platform generates **concentric spatial buffer tiers** around all verified charging stations:

$$\mathcal{B}_r = \bigcup_{i=1}^N \text{buffer}\big(s_i, r\big)$$

Evaluated at $r \in \{1\text{ km}, 3\text{ km}, 5\text{ km}, 10\text{ km}, 20\text{ km}\}$:

| Buffer Radius | Statewide Coverage (km²) | Area Coverage (%) | Spatial Planning Application |
| :---: | :---: | :---: | :--- |
| **1 km** | $92.4\text{ km}²$ | $0.03\%$ | Walking & micro-urban charging access |
| **3 km** | $486.2\text{ km}²$ | $0.16\%$ | MoP 2024 Urban Baseline Grid (Clause 11(1)(a)) |
| **5 km** | $1,280.5\text{ km}²$ | $0.42\%$ | Peri-urban and arterial commuter reach |
| **10 km** | $4,850.1\text{ km}²$ | $1.58\%$ | Highway interchange and inter-district access |
| **20 km** | $18,420.0\text{ km}²$ | $5.99\%$ | MoP 2024 Highway Spacing Norm (Clause 11(1)(b)) |

---

## 4. Charging Gap Index (CGI) Mathematical Formulation

The Charging Gap Index (CGI, scale 0–100) measures charging infrastructure deficits across administrative districts and micro-grid cells. Every sub-component is transparent and explainable:

$$\text{CGI} = w_{\text{ev}} \cdot S_{\text{ev}} + w_{\text{spatial}} \cdot S_{\text{spatial}} + w_{\text{pop}} \cdot S_{\text{pop}} + w_{\text{policy}} \cdot S_{\text{policy}}$$

### Component Normalization Functions:

1. **EV-to-Charger Ratio Gap ($S_{\text{ev}}$, Default Weight: 35%):**
   $$R_{\text{ev}} = \frac{\text{Total Registered EVs}}{\text{Verified Charging Points}}$$
   $$S_{\text{ev}} = \begin{cases} 100.0 & \text{if Charging Points} = 0 \\ \min\left(100.0, \frac{R_{\text{ev}}}{300.0} \times 100\right) & \text{otherwise} \end{cases}$$

2. **Spatial Density Gap ($S_{\text{spatial}}$, Default Weight: 25%):**
   $$D_{\text{spatial}} = \frac{\text{Verified Charging Points}}{\text{District Area (km}^2\text{)}} \times 1,000$$
   $$S_{\text{spatial}} = \max\left(0.0, 100.0 - \frac{D_{\text{spatial}}}{10.0} \times 100\right)$$
   *(Target benchmark: 10 chargers per 1,000 km²)*

3. **Per-Capita Availability Gap ($S_{\text{pop}}$, Default Weight: 20%):**
   $$D_{\text{pop}} = \frac{\text{Verified Charging Points}}{\text{District Population}} \times 100,000$$
   $$S_{\text{pop}} = \max\left(0.0, 100.0 - \frac{D_{\text{pop}}}{5.0} \times 100\right)$$
   *(Target benchmark: 5 chargers per 100,000 residents)*

4. **MoP 2024 Policy Deficit ($S_{\text{policy}}$, Default Weight: 20%):**
   $$S_{\text{policy}} = \text{Shortfall against 3 km} \times \text{3 km statutory grid targets}$$

### Dynamic Sensitivity Rescoring:
The API allows planners to adjust $w_{\text{ev}}, w_{\text{spatial}}, w_{\text{pop}}, w_{\text{policy}}$ in real-time, automatically normalizing $\sum w_i = 1.0$ and re-ranking districts dynamically.
