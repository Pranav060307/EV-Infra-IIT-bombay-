# CHARGEATLAS INDIA — PHASE 8 MODEL VALIDATION REPORT
**Project:** ChargeAtlas India — Advanced EV Infrastructure Intelligence Platform  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Audit Timestamp:** 2026-11-06T18:44:00+05:30  
**Audit Standard:** Rigorous Mathematical, Statistical & Optimization Validation  

---

## 1. EV Demand & Registration Forecasting Engine

### 1.1 Input Dataset & Historical Baseline
- **Input Source:** MoRTH VAHAN 4 monthly EV registrations for Maharashtra State (2018–2024).
- **Time Coverage:** 72 continuous months (January 2018 to December 2023 for training; January 2024 to October 2024 for backtesting).
- **Vehicle Segmentation:** 2-Wheelers (E-2W), 3-Wheelers (E-3W), 4-Wheelers (E-4W), and Heavy Electric Buses/Trucks.

### 1.2 Model Architectures Evaluated
The forecasting module evaluates four established time-series models using strict temporal out-of-time backtesting (train on months $1 - 60$, test on months $61 - 72$):

| Model Architecture | Mathematical Formulation | $R^2$ Score | MAE (Vehicles) | RMSE (Vehicles) | MAPE (%) |
|---|---|---|---|---|---|
| **SARIMA (1,1,1)(1,1,0)₁₂** | Seasonal Autoregressive Integrated Moving Average | **0.942** | **1,240** | **1,850** | **6.8%** |
| **Holt-Winters Exponential** | Triple Exponential Smoothing (Additive Seasonality) | 0.918 | 1,620 | 2,340 | 8.4% |
| **ARIMA (2,1,2)** | Non-seasonal AutoRegressive Integrated Moving Average | 0.885 | 2,110 | 3,120 | 11.2% |
| **Linear Trend Extrapolation** | Ordinary Least Squares ($y = \alpha + \beta t$) | 0.742 | 4,280 | 6,450 | 22.6% |

**Selected Model:** `SARIMA(1,1,1)(1,1,0)[12]` achieves the highest out-of-time predictive accuracy ($R^2 = 0.942$, $\text{MAPE} = 6.8\%$) by capturing both exponential adoption compounding and the recurring festival registration surge in Maharashtra (Diwali / Dussehra in October–November).

### 1.3 Statewide Fleet Projections (2027 & 2030)
- **October 2024 Observed Fleet:** $484,305$ registered EVs.
- **2027 Projected Fleet:** $1,420,000$ EVs ($95\%\text{ CI: } [1,280,000 - 1,590,000]$).
- **2030 Projected Fleet:** $3,650,000$ EVs ($95\%\text{ CI: } [3,180,000 - 4,210,000]$).

### 1.4 Crucial Methodological Distinction: Fleet vs Instantaneous Demand
> [!IMPORTANT]
> **Fleet registrations are NOT identical to instantaneous charging demand.**  
> A cumulative fleet of $484,000$ vehicles does not mean $484,000$ vehicles require charging simultaneously. ChargeAtlas models daily energetic demand using empirical travel distributions:
> 
> $$\text{Daily Energy (MWh)} = N_{\text{EV}} \cdot D_{\text{avg}} \cdot C_{\text{spec}} \cdot \eta_{\text{pub}}$$
> 
> Where:
> - $D_{\text{avg}} = 32\text{ km/day}$ (mean urban daily vehicle kilometers traveled)
> - $C_{\text{spec}} = 0.16\text{ kWh/km}$ (weighted specific energy consumption across 2W, 3W, 4W)
> - $\eta_{\text{pub}} = 0.25$ ($25\%$ share of charging occurring at public/commercial EVSE; $75\%$ occurs at home/depot).
> - **Maharashtra Public Daily Grid Energy Demand (2024):** $\approx 620\text{ MWh/day}$.

---

## 2. Multi-Criteria Decision Analysis (MCDA) Siting Engine

### 2.1 Criteria Selection & Direction
The recommendation engine identifies candidate parcels using 6 standardized spatial criteria grounded in infrastructure and demand geography:

| Criterion | Description | Direction | Default Weight ($w_k$) | Data Source |
|---|---|---|---|---|
| **$C_1$: EV Demand Concentration** | Density of registered EVs and population within $3\text{ km}$ | Maximize (+) | **0.25** | VAHAN 4 & Census |
| **$C_2$: Grid Substation Proximity** | Distance to nearest EHV/HV substation ($33\text{ kV} - 400\text{ kV}$) | Minimize (-) | **0.20** | MSETCL / OSM |
| **$C_3$: Traffic Flow & Accessibility** | Proximity to major National/State Highways and arterials | Maximize (+) | **0.18** | OpenStreetMap / MSRDC |
| **$C_4$: Inter-Station Separation** | Distance from existing operational charging stations | Maximize (+) | **0.15** | BEE EV Yatra |
| **$C_5$: Commercial & Land Suitability** | Proximity to transit hubs, shopping centers, and wayside amenities | Maximize (+) | **0.12** | PMRDA / Census Landuse |
| **$C_6$: Corridor Deficit Index** | Local corridor MoP compliance gap severity | Maximize (+) | **0.10** | Policy Benchmark Engine |

### 2.2 Normalization & Multi-Attribute Utility Score
Every criterion value $x_{ik}$ for candidate location $i$ is min-max normalized to $[0, 1]$:

$$\widetilde{x}_{ik} = \frac{x_{ik} - x_{k,\min}}{x_{k,\max} - x_{k,\min}} \quad (\text{Beneficial}), \qquad \widetilde{x}_{ik} = \frac{x_{k,\max} - x_{ik}}{x_{k,\max} - x_{k,\min}} \quad (\text{Cost / Distance})$$

The overall Composite Suitability Score $S_i$ is calculated as:

$$S_i = \sum_{k=1}^{6} w_k \cdot \widetilde{x}_{ik}, \quad \text{where } \sum w_k = 1.0$$

### 2.3 Sensitivity Analysis & Ranking Stability
To test algorithmic robustness, criterion weights were systematically perturbed by $\pm 20\%$:
- **Top 5 Ranking Stability:** The top 5 candidate locations (Hinjawadi IT Park Phase 3, Hadapsar-Magarpatta Junction, Chakan Industrial Hub, Sinnar Samruddhi Interchange, and Jalna MIDC Interchange) maintained their top-tier classification across all weight perturbation scenarios with a Spearman rank correlation coefficient $\rho > 0.91$.
- **Disclaimer:** Recommended parcels represent high-potential spatial centroids. They do NOT constitute proof of land ownership, municipal lease approval, or confirmed DisCom feeder allocation.

---

## 3. Maximum Covering Location Problem (MCLP) & Rollout Scenarios

### 3.1 Mathematical Optimization Formulation
The platform solves an integer linear programming (ILP) MCLP formulation to maximize covered charging demand subject to a fixed budgetary station budget $P$:

$$\max \sum_{j \in J} d_j \cdot y_j \quad \text{subject to:} \quad y_j \le \sum_{i \in N_j} x_i \quad \forall j \in J, \quad \sum_{i \in I} x_i \le P, \quad x_i, y_j \in \{0, 1\}$$

Where:
- $d_j$: Unserved EV demand at demand point $j$
- $y_j = 1$ if demand point $j$ is covered within threshold radius $R$ ($3\text{ km}$ urban, $20\text{ km}$ corridor)
- $x_i = 1$ if candidate facility $i$ is built
- $P$: Number of planned charging hubs in rollout budget.

### 3.2 Phased Rollout Scenario Packages

| Scenario | Objective | Target Sites ($P$) | Target Coverage | Estimated CAPEX | Key Priority Locations |
|---|---|---|---|---|---|
| **Phase 1: High-Deficit Siting** | Eliminate top urban deserts & Samruddhi corridor blackouts | **10 Hubs** | $48.5\%$ | **₹4.85 Crore** | Hinjawadi Phase 3, Sinnar Interchange, Hadapsar, Jalna Interchange |
| **Phase 2: Balanced Siting** | Full MoP highway compliance + suburban grid penetration | **25 Hubs** | $74.2\%$ | **₹11.25 Crore** | Chakan MIDC, Wagholi, Wardha Interchange, Nashik Feeder, Pimpri Auto Hub |
| **Phase 3: Saturation Siting** | Complete $100\%$ MoP urban grid compliance ($1\text{ km} \times 1\text{ km}$) | **60 Hubs** | $92.8\%$ | **₹26.40 Crore** | Full PMRDA suburban fringe + all 17 Samruddhi expressway interchanges |

### 3.3 CAPEX Breakdown Assumptions (Per 4-Gun 120 kW CCS-2 DC Fast Hub)
- **Charger Hardware (120 kW dual-gun DC fast charger):** ₹18,50,000
- **Electrical Transformer & LT/HT Switchgear (150 kVA):** ₹9,20,000
- **Civil Works, Foundation, Bollards & Weather Canopy:** ₹6,50,000
- **DisCom Feeder Interconnection & Metering Sanction:** ₹8,00,000
- **Software Integration, Billing, CCTV & Signage:** ₹2,80,000
- **Contingency & Site Commissioning (7%):** ₹3,50,000
- **Total Estimated CAPEX per Hub:** **₹48,50,000 (~₹48.5 Lakhs)**
