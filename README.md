# ChargeAtlas India ⚡🗺️

**Advanced EV Infrastructure Intelligence, Spatial Analytics & Decision Support System**

[![Production Live](https://img.shields.io/badge/Production%20Live-ev--infra--iit--bombay.vercel.app-emerald.svg)](https://ev-infra-iit-bombay.vercel.app)
[![IIT Bombay Techfest](https://img.shields.io/badge/IIT%20Bombay%20Techfest-2026--27-orange.svg)](https://techfest.org)
[![Challenge](https://img.shields.io/badge/Challenge-EV%20Infra%20Map%20India%20(MHI%20%26%20ICAT)-blue.svg)]()
[![Team SuperNova](https://img.shields.io/badge/Team-SuperNova-purple.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20GeoPandas-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%205%20%2B%20Tailwind-61DAFB.svg)](https://vitejs.dev)
[![Spatial DB](https://img.shields.io/badge/Spatial%20DB-PostgreSQL%20%2B%20PostGIS%20(Dual%20UTM)-336791.svg)](https://postgis.net)
[![Tests Passed](https://img.shields.io/badge/Tests-45%2F45%20Passed%20(100%25)-brightgreen.svg)]()

🌐 **Live Production Web Platform:** [https://ev-infra-iit-bombay.vercel.app](https://ev-infra-iit-bombay.vercel.app)

---

## 1. Project Overview & Advanced Capabilities

**ChargeAtlas India** is an enterprise-grade, evidence-backed spatial analytics and decision-support platform engineered by Team SuperNova (Sanjivani University) for the **IIT Bombay Techfest 2026–27 EV Infrastructure Map India Challenge**.

The system moves beyond passive visualization by providing mathematical, physical, and econometric optimization models for government authorities (Ministry of Power, MHI, ICAT), highway agencies (MSRDC, NHAI), urban local bodies (PMC, PCMC), and Charge Point Operators (CPOs).

### Core Analytical & Decision Engines
1. **Highway EV Trip, Elevation & Charging Simulator (`/route-planner`):** Physics-based consumption modeling incorporating Western Ghats topographical gradients ($m \cdot g \cdot \Delta h$), regenerative braking recovery ($\eta = 0.65$), ambient summer heat derating ($18^\circ\text{C}$ to $45^\circ\text{C}$), vehicle profiles (Nexon EV, MG ZS EV, BYD Atto 3, e-Bus), and the statutory $+18\text{ min}$ toll plaza detour penalty.
2. **Station Queuing Congestion Engine ($M/M/c/K$ Erlang-C):** Solves Kendall's queuing theory to model EV arrival rates ($\lambda$), gun power, and parallel dispensers ($c$), proving why 2-gun stations lock up under peak loads and calculating required gun sizing for $<10\text{ min}$ wait times.
3. **Solar PV Canopy + BESS Clean Energy Modeler:** Models on-site rooftop/canopy solar and battery storage under MNRE Maharashtra benchmarks ($5.4\text{ kWh/m}^2\text{/day}$ insolation), delivering clean power at $\text{LCOE} = ₹3.45/\text{kWh}$ vs. MSEDCL's $₹9.50/\text{kWh}$ commercial tariff ($4.2\text{-year}$ payback).
4. **Vehicle-to-Grid (V2G) & Virtual Power Plant (VPP):** Simulates evening peak shaving ($6:00\text{ PM} - 9:30\text{ PM}$) under the Draft National Electricity Policy 2026, injecting up to $35\text{ MW}$ of green power to avoid expensive DisCom spot power purchases.
5. **Heavy-Duty Commercial Freight & Megawatt Charging (MCS):** Models $1.2\text{ MW}$ MCS chargers for 40-tonne electric trucks under MoP Clause 3.1(c) ($100\text{ km}$ spacing), $3.5\text{ MVA}$ substation interconnections, and freight fuel savings of $₹14.8\text{ Lakhs/truck/year}$.
6. **Dual-UTM Geodetic Architecture:** Eliminates $14.8\%$ Web Mercator surface distortion at central Indian latitudes ($19^\circ\text{N}$) by projecting Western Maharashtra in UTM Zone 43N (`EPSG:32643`) and Eastern Vidarbha in UTM Zone 44N (`EPSG:32644`), keeping spatial error below $0.04\%$ ($40\text{ cm/km}$).
7. **Pune 1km² Micro-Grid Analysis:** Generates 607 metric $1\text{ km}^2$ cells across Pune/PCMC ($516.18\text{ km}^2$) auditing Ministry of Power Clause 11(1)(a) compliance and exposing $293$ severe charging deserts ($>5\text{ km}$ from nearest station).
8. **Samruddhi Mahamarg 701km Corridor Audit:** Surveys 17 interchanges across 10 districts with 5km, 10km, and 20km lateral catchment buffers, proving zero mainline operational chargers exist on the carriageway.
9. **Multi-Model Demand Forecasting:** Backtested SARIMA ($R^2 = 0.942$, MAPE $6.4\%$), Bass Diffusion, and Polynomial models projecting 2027 and 2030 vehicle stocks and MWh/day grid loads.
10. **Integer Linear Programming Site Optimizer (MCLP):** Branch-and-cut optimization with $0.00\%$ integrality gap selecting optimal parcels from 23 candidates linked to 766 distribution substations.
11. **Unified Data Trust & Cryptographic Provenance:** Authoritative registry of all 22 datasets with SHA-256 cryptographic checksums, official URLs, and temporal validity tags.
12. **Interactive Jury Pitch Companion (`✨ Jury Pitch`):** Built-in 6-scene competition walkthrough with automated module navigation, 5-minute competition timer, and speaker teleprompter.
13. **1-Click Official Executive Feasibility Dossier (`📄 Dossier`):** Printable publication-grade whitepaper generator with `@media print` CSS, MoP 2024 compliance scorecards, and cryptographic verification seals.

---

## 2. Team Information
- **Team Name:** SuperNova (Team ID: `TM-939736284D2`)
- **Institution:** Sanjivani University, Kopargaon, Maharashtra
- **Team Lead & Full-Stack Developer:** Pranav Jadhav (`jadhavpranav880@gmail.com`)
- **Core Team Members:** Samruddhi Sarode, Parth Gade, Krushna Thakur, Sanskruti Bhavsar
- **Competition Repository:** `https://github.com/Pranav060307/EV-Infra-IIT-bombay-.git`

---

## 3. Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.11 / 3.15)
- **Spatial Processing:** GeoPandas, Shapely, PyProj (Dual UTM Zone 43N / 44N)
- **Analytics & ML:** Pandas, NumPy, Scikit-learn, Statsmodels
- **Optimization:** Mixed-Integer Programming MCLP Solver & AHP MCDA Engine
- **Database Driver:** SQLAlchemy 2.0, GeoAlchemy2, Psycopg2 / SQLite Testing Isolation

### Frontend
- **Framework:** React 18, Vite 5, Tailwind CSS
- **Mapping Engine:** MapLibre GL JS (Canvas hardware acceleration)
- **Visualizations:** Recharts, Lucide React Icons
- **HTTP Client:** Axios (Dual Hybrid: API Microservice + Vercel Static Edge CDN)

### Database & Cloud
- **Production Database:** PostgreSQL 16 with PostGIS 3.x
- **Edge CDN Delivery:** Vercel Global Edge Network with pre-computed Brotli/Gzip GeoJSON

---

## 4. Comprehensive Documentation Index

All engineering methodology, mathematical proofs, and architectural reports are cataloged in [`/docs`](file:///d:/EV%20Infra/docs):

### Core Architecture & System Verification
- [`ADVANCED_PLATFORM_ARCHITECTURE.md`](file:///d:/EV%20Infra/docs/ADVANCED_PLATFORM_ARCHITECTURE.md) — Complete 5-subsystem architecture & data flow diagrams.
- [`ADVANCED_TEST_REPORT.md`](file:///d:/EV%20Infra/docs/ADVANCED_TEST_REPORT.md) — Full PyTest report confirming 45/45 passing unit & integration tests.
- [`ADVANCED_DEVELOPMENT_PROGRESS.md`](file:///d:/EV%20Infra/docs/ADVANCED_DEVELOPMENT_PROGRESS.md) — Comprehensive milestone report across all 7 stages.
- [`ADVANCED_DEVELOPMENT_AUDIT.md`](file:///d:/EV%20Infra/docs/ADVANCED_DEVELOPMENT_AUDIT.md) — Initial 5-tier audit baseline.

### Data Trust, Provenance & Quality
- [`DATA_TRUST_AND_PROVENANCE.md`](file:///d:/EV%20Infra/docs/DATA_TRUST_AND_PROVENANCE.md) — Cryptographic metadata register, SHA-256 signatures, and quality audits.
- [`GRID_FEASIBILITY_LIMITATIONS.md`](file:///d:/EV%20Infra/docs/GRID_FEASIBILITY_LIMITATIONS.md) — Distribution substation analysis, DisCom feeder headroom constraints, and statutory disclosures.

### Spatial Analytics & Policy Benchmarking
- [`SPATIAL_ACCESSIBILITY_METHODOLOGY.md`](file:///d:/EV%20Infra/docs/SPATIAL_ACCESSIBILITY_METHODOLOGY.md) — 1.32x circuity factor, travel time modeling, and concentric isochrones.
- [`PUNE_URBAN_ANALYSIS.md`](file:///d:/EV%20Infra/docs/PUNE_URBAN_ANALYSIS.md) — 607-cell 1km² micro-grid analysis benchmarking MoP Clause 11(1)(a).
- [`SAMRUDDHI_CORRIDOR_ANALYSIS.md`](file:///d:/EV%20Infra/docs/SAMRUDDHI_CORRIDOR_ANALYSIS.md) — 701km expressway corridor audit, interchange spacing, and 240kW heavy-duty voids.

### Decision Intelligence & Planning
- [`ADVANCED_FORECASTING_METHODOLOGY.md`](file:///d:/EV%20Infra/docs/ADVANCED_FORECASTING_METHODOLOGY.md) — Backtesting error metrics (MAE, RMSE, MAPE, $R^2$) and 80%/95% prediction intervals.
- [`MCDA_AND_NETWORK_OPTIMIZATION.md`](file:///d:/EV%20Infra/docs/MCDA_AND_NETWORK_OPTIMIZATION.md) — AHP criteria weighting, sensitivity matrix, and packaged rollout scenarios.

---

## 5. Quick Start Instructions

### Backend (FastAPI Microservice)
```powershell
# 1. Navigate to backend directory
cd "d:\EV Infra\backend"

# 2. Activate virtual environment
..\.venv\Scripts\Activate.ps1

# 3. Run automated test suite (45 tests)
python -m pytest tests -v

# 4. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation: `http://localhost:8000/docs`

### Frontend (React + Vite)
```powershell
# 1. Navigate to frontend directory
cd "d:\EV Infra\frontend"

# 2. Install dependencies
npm install

# 3. Production build verification
npm run build

# 4. Start Vite development server
npm run dev
```
Web platform interface: `http://localhost:5173`
