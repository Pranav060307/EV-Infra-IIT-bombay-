# CHARGEATLAS INDIA — PHASE 5: EV DEMAND FORECASTING METHODOLOGY

**Project:** ChargeAtlas India  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Lead Developer:** Pranav Jadhav  
**Platform Version:** 5.0.0 (Demand Forecasting & Infrastructure Sizing Engine)  
**Date:** November 2026  

---

## 1. Executive Summary

Phase 5 establishes an explainable, multi-segment mathematical forecasting engine to model future EV fleet expansion and translate projected vehicles into grid energy (MWh/day), peak charging capacity (MW), and public EVSE dispenser requirements. Rather than asserting black-box machine learning predictions, all projections are framed as transparent planning scenarios for the **2027** (medium-term) and **2030** (Ministry of Power FY 2029–30 milestone) horizons.

---

## 2. Historical Baseline & Data Governance

### 2.1 Authentic MoRTH VAHAN 4 Baseline
All forecasts originate from authentic historical registrations published by the Ministry of Road Transport and Highways (MoRTH) through the VAHAN 4 Open Dashboard:
- **Baseline Year:** 2024 (Cumulative registrations recorded through October 2024)
- **Geographic Coverage:** 36 / 36 Maharashtra Districts ($100\%$ completeness)
- **Baseline Fleet Total:** $886,752$ Electric Vehicles

$$\begin{array}{|l|r|r|l|}
\hline
\textbf{Vehicle Segment} & \textbf{Observed Count (2024)} & \textbf{Fleet Share (\%)} & \textbf{Primary Operational Characteristics} \\
\hline
\text{Electric 2-Wheelers (E-2W)} & 682,799 & 77.0\% & \text{High home-charging share; low daily range (30 km/day).} \\
\text{Electric 3-Wheelers (E-3W)} & 115,278 & 13.0\% & \text{Commercial auto/cargo fleet; high daily dwell time (90 km/day).} \\
\text{Electric 4-Wheelers (E-4W)} & 84,242 & 9.5\% & \text{Private cars \& fleet taxis; moderate public DC fast charging.} \\
\text{Electric Commercial Buses (E-Bus)} & 4,433 & 0.5\% & \text{Heavy public transit; depot-based \& opportunity DC megawatt charging.} \\
\hline
\textbf{State Total} & \mathbf{886,752} & \mathbf{100.0\%} & \text{MoRTH VAHAN 4 Cumulative Directory} \\
\hline
\end{array}$$

### 2.2 Historical Time-Series Disclosure & Limitations
- **Documented Milestones:**
  - 2021: $78,500$ EVs
  - 2022: $189,400$ EVs
  - 2023: $445,200$ EVs
  - 2024: $886,752$ EVs
- **Disclosure:** Official public VAHAN portals provide annual milestone exports and static cumulative totals without continuous daily or hourly telemetric timestamps. High-dimensional time-series models (e.g., ARIMA or deep recurrent networks) require continuous multi-year monthly disaggregation to prevent severe overfitting. Consequently, ChargeAtlas India utilizes parametric compounding models, linear trends, and exponential growth models with exposed parameters.

---

## 3. Mathematical Forecast Formulations

### 3.1 Model 1: Parametric Multi-Segment CAGR Modeler
The primary planning model projects fleet expansion by applying segment-specific compound annual growth rates ($r_v$) compounded over $\Delta t = (t - 2024)$ years:

$$N_{v, t} = N_{v, 2024} \cdot (1 + r_v)^{\Delta t}$$

$$\text{Total Fleet } N_t = \sum_{v \in \{\text{2W, 3W, 4W, BUS}\}} N_{v, t}$$

$$\begin{array}{|l|c|c|c|c|c|}
\hline
\textbf{Planning Scenario} & \textbf{Composite } r & r_{\text{2W}} & r_{\text{3W}} & r_{\text{4W}} & r_{\text{BUS}} \\
\hline
\text{Conservative Trajectory} & 18.0\% & 18.0\% & 16.0\% & 20.0\% & 12.0\% \\
\text{Base Analytical Scenario} & 28.0\% & 28.0\% & 25.0\% & 30.0\% & 20.0\% \\
\text{Aggressive (NITI Aayog EV30)} & 38.0\% & 38.0\% & 35.0\% & 42.0\% & 28.0\% \\
\text{Custom Planner Slider} & r_{\text{custom}} & r_{\text{custom}} & 0.90 \cdot r & 1.10 \cdot r & 0.75 \cdot r \\
\hline
\end{array}$$

### 3.2 Model 2: Linear Ordinary Least Squares (OLS) Trend
Serves as an empirical conservative baseline reflecting constant arithmetic annual growth:

$$N_t = \alpha + \beta \cdot (t - 2021) = 65,000 + 265,000 \cdot (t - 2021)$$

### 3.3 Model 3: Exponential Growth Curve
Models early-stage S-curve acceleration prior to market saturation:

$$N_t = N_0 \cdot \exp(k \cdot (t - 2021)) = 78,500 \cdot \exp(0.81 \cdot (t - 2021))$$

---

## 4. Charging Demand & Grid Capacity Estimation

To translate vehicle fleet projections into physical infrastructure specifications, ChargeAtlas India implements the analytical guidelines of the NITI Aayog *Handbook for Electric Vehicle Charging Infrastructure Implementation* and Central Electricity Authority (CEA) parameters.

### 4.1 Segment Operational Assumptions

$$\begin{array}{|l|c|c|c|c|}
\hline
\textbf{Vehicle Category } (v) & \textbf{Daily Travel } (KM_v) & \textbf{Energy Consumption } (EC_v) & \textbf{Public Charging Share } (f_{\text{pub}, v}) & \textbf{Avg Charger Power } (P_{\text{avg}}) \\
\hline
\text{Electric 2-Wheelers (E-2W)} & 30.0\text{ km/day} & 0.035\text{ kWh/km (35 Wh/km)} & 15.0\%\text{ (85\% home AC)} & 3.3\text{ kW AC} \\
\text{Electric 3-Wheelers (E-3W)} & 90.0\text{ km/day} & 0.080\text{ kWh/km (80 Wh/km)} & 45.0\%\text{ (Commercial fleet)} & 7.4\text{ kW AC / 15 kW DC} \\
\text{Electric 4-Wheelers (E-4W)} & 45.0\text{ km/day} & 0.160\text{ kWh/km (160 Wh/km)} & 30.0\%\text{ (70\% home/office)} & 30.0\text{ kW / 60 kW DC} \\
\text{Electric Buses (E-Bus)} & 180.0\text{ km/day} & 1.200\text{ kWh/km (1,200 Wh/km)} & 85.0\%\text{ (Depot/public hub)} & 180.0\text{ kW DC Fast} \\
\hline
\end{array}$$

### 4.2 Daily Public Grid Energy Demand ($E_{\text{daily, public}}$)
Energy required daily from the public distribution grid accounts for round-trip electrical efficiency ($\eta = 0.90$):

$$E_{\text{daily, public}} = \sum_{v} \frac{N_{v, t} \cdot KM_v \cdot EC_v \cdot f_{\text{pub}, v}}{\eta} \quad (\text{kWh/day})$$

$$\text{Public Energy (MWh/day)} = \frac{E_{\text{daily, public}}}{1,000}$$

### 4.3 Peak Coincident Power Demand ($P_{\text{peak}}$)
Peak electrical draw is evaluated assuming an effective daily charging window of $H_{\text{eff}} = 14.0\text{ hours}$ and a coincidence factor $C_f = 1.25$:

$$P_{\text{peak}} = \left(\frac{E_{\text{daily, public}}}{H_{\text{eff}}}\right) \cdot C_f \quad (\text{MW})$$

### 4.4 Sizing Required Public Charging Points ($CP_{\text{required}}$)
Calculated using the dual-constraint method:
1. **Energy Throughput Capacity Model:**
   $$CP_{\text{energy}} = \left\lceil \frac{E_{\text{daily, public}}}{P_{\text{dispenser}} \cdot H_{\text{op}} \cdot U_f} \right\rceil$$
   where $P_{\text{dispenser}} = 30.0\text{ kW}$ average rated power, $H_{\text{op}} = 16.0\text{ operating hours/day}$, and $U_f = 0.35$ (35% daily utilization factor, yielding $168\text{ kWh/day}$ per charging point).
2. **MoP Policy Planning Ratio Model:**
   $$CP_{\text{ratio}} = \left\lceil \frac{N_t}{28} \right\rceil$$
   (1 public charging point per 28 registered electric vehicles).
3. **Recommended Public Charging Points:**
   $$CP_{\text{recommended}} = \max(CP_{\text{energy}}, CP_{\text{ratio}})$$

### 4.5 Infrastructure Deficit & Capital Expenditure
$$\Delta CP = \max(0, CP_{\text{recommended}} - CP_{\text{existing, verified}})$$

$$\text{Estimated Capital Expenditure} = \Delta CP \times \text{\rupee} 800,000 \quad (\text{Equipment, civil works \& HT grid connection})$$

