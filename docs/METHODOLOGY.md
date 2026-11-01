# ChargeAtlas India — Analytical Methodology & Algorithmic Formulations

## 1. Overview
The analytical core of **ChargeAtlas India** translates fragmented vehicle registrations and spatial charger points into defensible planning metrics. Every formula is explainable, parameters are user-configurable, and outputs are traceable.

---

## 2. Module 2: Charging Gap Assessment & Index (CGI)

### 2.1 Ministry of Power (MoP) 2024 Norms
MoP's *Guidelines for Installation and Operation of Electric Vehicle Charging Infrastructure-2024* establish concrete spatial benchmarks:
1. **Urban Built-up Grid:** At least one public charging station in every **1 km × 1 km** built-up urban cell by 2030.
2. **Highway Corridors:** A charging station at least every **20 km** on both sides of national highways and expressways.
3. **Heavy-Duty Fast Charging:** Dedicated fast charging every **100 km** on both sides for electric buses and heavy commercial vehicles.

### 2.2 Charging Gap Index (CGI) Formulation
For any spatial unit $d$ (district, urban grid, or corridor segment), the Charging Gap Index is computed as a weighted sum of normalized percentile indicators:

$$\text{CGI}(d) = 100 \times \sum_{i=1}^{m} w_i \times s_i(d)$$

Where:
- $\text{CGI}(d) \in [0, 100]$: Higher score represents a more severe infrastructure deficit.
- $w_i$: Configurable weight assigned to indicator $i$, subject to $\sum_{i=1}^m w_i = 1.0$. (Default equal weights $w_i = 1/m$).
- $s_i(d) \in [0, 1]$: Percentile rank of indicator $i$ in area $d$, oriented so that unfavorable conditions (e.g., high EV-to-charger ratio, long distance to chargers) yield higher values.

#### Key Indicators:
1. **EV-to-Charger Ratio ($s_1$):** Total circulating EVs divided by public charging points.
2. **Installed Power Deficit ($s_2$):** Total installed charging kW per 1,000 EVs compared against national benchmark.
3. **Spatial Coverage Deficit ($s_3$):** Percentage of populated 1km² urban cells devoid of a charging station.
4. **Distance to Nearest Charger ($s_4$):** Average population-weighted distance to the nearest operational fast charger.
5. **Registration Growth Velocity ($s_5$):** 12-month EV growth rate, flagging districts where demand is outpacing infrastructure.

---

## 3. Module 3: EV Demand & Infrastructure Forecasting

### 3.1 EV Fleet Stock Modeling
To project circulating EV stock $N(d, s, t)$ in district $d$, vehicle segment $s \in \{2W, 3W, 4W, \text{Bus}\}$, and target year $t \in \{2027, 2030\}$:
- **Compound Annual Growth Rate (CAGR Baseline):**
  $$N(t) = N_0 \times (1 + g)^{(t - t_0)}$$
- **Logistic S-Curve Adoption Model:**
  $$N(t) = \frac{K}{1 + \exp(-\beta (t - t_m))}$$
  Where $K$ is the market saturation ceiling (aligned with national PM E-DRIVE targets), $\beta$ is adoption steepness, and $t_m$ is the inflection year.
- **Scenarios:**
  - *Low Adoption:* Conservative growth rate ($g_{low} = 0.75 \times g_{base}$).
  - *Base Adoption:* Historical trend line continuation.
  - *High Adoption:* Accelerated PM E-DRIVE target adoption ($g_{high} = 1.30 \times g_{base}$).

### 3.2 Daily Public Charging Energy Demand ($E$)
$$E(d, s, t) = N(d, s, t) \times D(s) \times e(s) \times p(s)$$

Where:
- $N(d, s, t)$: Circulating EV population in year $t$.
- $D(s)$: Average daily distance travelled per vehicle (km/day).
- $e(s)$: Specific energy consumption (kWh/km).
- $p(s)$: Share of daily energy drawn from public charging (as opposed to private home/depot charging).

### 3.3 Required Charge Points ($C_{demand}$)
$$C_{\text{demand}}(d, s, t) = \left\lceil \frac{k(s) \times E(d, s, t)}{P(s) \times H(s) \times \eta} \right\rceil$$

Where:
- $k(s)$: Peak demand factor ($\ge 1.0$), accounting for diurnal charging spikes.
- $P(s)$: Effective rated power of charge points serving segment $s$ (kW).
- $H(s)$: Effective operating hours per day delivering energy.
- $\eta$: Grid-to-battery charging efficiency ($\approx 0.90$).

### 3.4 Net Additional Chargers Required
$$C_{\text{add}}(d, s, t) = \max\left(0, \max(C_{\text{demand}}(d, s, t), C_{\text{coverage}}(d, s)) - C_{\text{exist}}(d, s)\right)$$
Where $C_{\text{exist}}$ only counts functioning, compatible chargers.

---

## 4. Module 4: Smart Site Recommendation (MCLP)

### 4.1 Maximal Covering Location Problem (MCLP)
To determine the optimal $k$ candidate sites that maximize coverage of unserved EV demand within a service radius $R$:

$$\max \sum_{i \in I} a_i y_i$$

Subject to:
$$y_i \le \sum_{j \in N_i} x_j \quad \forall i \in I$$
$$\sum_{j \in J} x_j = k$$
$$x_j \in \{0, 1\} \quad \forall j \in J$$
$$y_i \in \{0, 1\} \quad \forall i \in I$$

Where:
- $I$: Set of demand cells (urban 1km² centroids or corridor highway waypoints).
- $a_i$: Unserved EV demand weight in cell $i$.
- $J$: Set of candidate installation locations (petrol pumps, malls, highway transit points).
- $N_i = \{j \in J \mid \text{dist}(i, j) \le R\}$: Candidate sites within service distance $R$ of demand point $i$.
- $x_j = 1$ if candidate site $j$ is selected; $0$ otherwise.
- $y_i = 1$ if demand point $i$ is covered by at least one selected site; $0$ otherwise.

### 4.2 Multi-Criteria Attractiveness Scoring
Each candidate site is also assigned a multi-criteria score (0-100) combining:
- Surrounding unserved EV demand (35%)
- Distance to nearest existing charger (25% — rewards closing spatial voids)
- Proximity to 11kV/33kV electrical substation (20% — proxy for connection ease)
- Road hierarchy & accessibility (20%)

