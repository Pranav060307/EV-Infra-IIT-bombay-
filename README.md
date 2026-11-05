# ChargeAtlas India ⚡🗺️

**Advanced EV Infrastructure Intelligence, Spatial Analytics & Decision Support System**

[![Techfest 2026-27](https://img.shields.io/badge/IIT%20Bombay%20Techfest-2026--27-orange.svg)](https://techfest.org)
[![Challenge](https://img.shields.io/badge/Challenge-EV%20Infra%20Map%20India%20(MHI%20%26%20ICAT)-blue.svg)]()
[![Team SuperNova](https://img.shields.io/badge/Team-SuperNova-purple.svg)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB.svg)](https://vitejs.dev)
[![PostGIS](https://img.shields.io/badge/Spatial%20DB-PostgreSQL%20%2B%20PostGIS-336791.svg)](https://postgis.net)
[![Tests Passed](https://img.shields.io/badge/Tests-45%2F45%20Passed-brightgreen.svg)]()

---

## 1. Project Overview & Advanced Capabilities

**ChargeAtlas India** is an enterprise-grade, evidence-backed spatial analytics and decision-support platform engineered by Team SuperNova (Sanjivani University) for the **IIT Bombay Techfest 2026–27 EV Infrastructure Map India Challenge**.

The system moves beyond passive visualization by providing mathematical and econometric optimization models for government authorities (MHI, ICAT), highway agencies (MSRDC, NHAI), urban local bodies (PMC, PCMC), and Charge Point Operators (CPOs).

### Core Advanced Capabilities
1. **Unified Data Trust & Provenance Engine:** Cryptographic SHA-256 signatures, temporal validity dates, CRS provenance, and authentic source citations (MoRTH VAHAN, BEE EV Yatra, MSRDC, Census of India) across 5 confidence tiers (`VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`, `MODELLED`, `SCENARIO`).
2. **Road-Network Transit Modeling:** Incorporates empirical 1.32x circuity factor over straight-line distances and dynamic peak (22 km/h) vs off-peak (35 km/h) urban transit speeds across 607 Pune 1km² micro-grid cells.
3. **Multi-Level Concentric Isochrones:** Computes metric polygon coverage at 1 km, 3 km, 5 km, 10 km, and 20 km thresholds to evaluate urban walking, neighborhood transit, and rural charging deserts.
4. **Corridor Void & Spacing Analysis:** Audits 33 consecutive 20 km segments along the 701 km Samruddhi Mahamarg expressway, proving an unserved mainline void (0 operational mainline chargers; facilities accessible only by exiting via interchanges).
5. **Multi-Model Demand Forecasting with Backtesting:** Evaluates Linear, Exponential, and CAGR models with backtested error metrics (MAE, RMSE, MAPE, $R^2$), accompanied by 80% and 95% statistical prediction intervals for 2027 and 2030.
6. **MCDA Sensitivity Analysis & Packaged Rollout Scenarios:** Stress-tests candidate rankings against Balanced, Highway Priority, and Grid Priority profiles (identifying 13 invariant ROBUST candidate sites) and packages modular rollout phases (+5, +10, +20 hubs with estimated CAPEX and fleet coverage).
7. **Electrical Grid Feasibility:** Maps 766 distribution substations (11kV/33kV) with physical proximity scoring and explicit statutory disclaimers on undisclosed utility feeder headroom.
8. **Editorial GIS UX & Data Exports:** Clean, cartographic palette (Slate Blue, Muted Teal, Forest Green, Warm Amber) with instant CSV downloads across districts, grid cells, corridor segments, and candidate sites.

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
