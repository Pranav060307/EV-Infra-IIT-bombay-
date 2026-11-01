# ChargeAtlas India — Assumptions, Limitations & Default Parameters

## 1. Baseline Assumptions Register
All parameters below are configurable in the analytical engine and can be adjusted interactively on the platform dashboard:

| Parameter | Symbol | Unit | 2W (Two-Wheeler) | 3W (Three-Wheeler) | 4W (Four-Wheeler / Car) | Bus (e-Bus) | Rationale / Citation |
|---|---|---|---|---|---|---|---|
| **Daily Distance** | $D$ | km/day | 30 | 90 | 40 | 200 | NITI Aayog / WRI India urban transit studies |
| **Energy Consumption** | $e$ | kWh/km | 0.030 | 0.080 | 0.150 | 1.200 | ARAI certified / OEM vehicle specifications |
| **Public Charging Share** | $p$ | Ratio (0-1) | 0.10 (10%) | 0.45 (45%) | 0.25 (25%) | 0.15 (intercity only) | Majority 2W/4W charge at home; 3Ws rely heavily on public hubs |
| **Charge Point Power** | $P$ | kW | 3.3 (AC Type-2/Slow) | 7.4 (AC/Fast) | 50.0 (DC CCS-2) | 240.0 (High-Power DC) | MoP 2024 charging guidelines standard ratings |
| **Effective Daily Hours**| $H$ | hours/day | 6.0 | 8.0 | 6.0 | 5.0 | Realistic asset utilization factor |
| **Peak Factor** | $k$ | Ratio ($\ge 1$) | 1.6 | 1.8 | 1.7 | 1.5 | Morning/evening charging concurrency |
| **Charging Efficiency** | $\eta$ | Ratio (0-1) | 0.90 (90%) | 0.90 (90%) | 0.92 (92%) | 0.93 (93%) | Grid transformer to battery inverter losses |
| **Vehicle Lifetime** | — | years | 10 | 8 | 15 | 12 | Scrappage curve assumption |

---

## 2. Technical Disclosures & Known Limitations

### 2.1 Substation Proximity != Grid Feasibility
- **Limitation:** Proximity to an 11kV, 22kV, or 33kV distribution substation indicates theoretical spatial accessibility to the distribution grid.
- **Critical Notice:** Spatial distance **does not verify spare transformer capacity (MVA), feeder loading, short-circuit levels, or interconnection approval from the DISCOM (e.g., MSEDCL)**.
- **Mitigation:** Every candidate recommendation displays an explicit badge: `[PRELIMINARY SUITABILITY ONLY — DISCOM TECHNICAL FEASIBILITY STUDY MANDATORY]`.

### 2.2 VAHAN RTO vs. Administrative District Allocation
- **Limitation:** VAHAN 4 dashboard records vehicle registrations by **RTO Office**, whereas infrastructure planning requires administrative **District** units.
- **Mitigation:** ChargeAtlas maintains an auditable RTO-to-District mapping matrix. Where one RTO serves multiple districts, registration volumes are proportioned based on census population weights, clearly labeled as `[ESTIMATED PROPORTIONAL ALLOCATION]`.

### 2.3 Synthetic Demonstration Data
- **Limitation:** National and state real datasets require continuous automated ETL pipelines and government credentialing.
- **Mitigation:** Until production data is fully uploaded, all demonstrations use realistic synthetic distributions generated strictly to match national aggregates (e.g., ~10M registered EVs, ~52k public charging points). All mock data carries `is_synthetic = TRUE` and cannot be conflated with real statistics.

### 2.4 Urban 1km² Grid Exclusion Masks
- **Limitation:** Siting norms call for 1 station per 1km² urban grid.
- **Mitigation:** Water bodies, reserved forests, defense land, and airports are filtered out using OSM land-use masks so that uninhabitable zones are not penalised as "infrastructure gaps".

