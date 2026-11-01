# ChargeAtlas India ⚡🗺️

**EV Charging Infrastructure Mapping, Gap Analysis, Demand Forecasting & Smart Site Recommendation Platform**

[![Techfest 2026-27](https://img.shields.io/badge/IIT%20Bombay%20Techfest-2026--27-orange.svg)](https://techfest.org)
[![Challenge](https://img.shields.io/badge/Challenge-EV%20Infra%20Map%20India%20(MHI%20%26%20ICAT)-blue.svg)]()
[![Team SuperNova](https://img.shields.io/badge/Team-SuperNova-purple.svg)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB.svg)](https://vitejs.dev)
[![PostGIS](https://img.shields.io/badge/Spatial%20DB-PostgreSQL%20%2B%20PostGIS-336791.svg)](https://postgis.net)

---

## 1. Project Background
India’s electric vehicle transition is surging, yet public charging infrastructure suffers from acute spatial imbalance, data fragmentation, and uncoordinated siting. 

**ChargeAtlas India** is an enterprise-grade, GIS-based analytical and decision-support platform designed to empower government ministries (MHI), testing agencies (ICAT), state transport departments, urban local bodies (ULBs), highway authorities (NHAI), and utilities (DISCOMs) to make mathematically defensible infrastructure investments.

### Key Capabilities
- **Unified De-duplicated Charger Layer:** Consolidates public chargers across networks (BEE EV Yatra, OpenChargeMap, OSM, CPO apps) into an auditable spatial schema.
- **Charging Gap Index (CGI):** Benchmarks charging adequacy against **Ministry of Power (MoP) 2024 Guidelines** (1km² urban grid norm and 20km highway corridor spacing).
- **Segment-Aware Demand Forecasting:** Projects 2027 and 2030 EV stock and daily charging energy (kWh) for 2W, 3W, 4W, and electric buses across Low, Base, and High adoption scenarios.
- **Smart Site Recommendations (MCLP):** Solves the Maximal Covering Location Problem to rank candidate sites (petrol pumps, bus depots, malls, toll plazas) with explicit justifications and proximity to electrical substations.
- **Three-Tier Spatial Depth:**
  1. *National:* State-wise EV adoption and charging gap choropleths across India.
  2. *State:* In-depth 36-district analysis of Maharashtra.
  3. *Micro Study Areas:* Pune urban 1km² grid analysis and the 701km Samruddhi Mahamarg expressway corridor.

---

## 2. Team Information
- **Team Name:** SuperNova (Team ID: `TM-939736284D2`)
- **Institution:** Sanjivani University, Kopargaon, Maharashtra
- **Team Lead & Full-Stack Developer:** Pranav Jadhav (`jadhavpranav880@gmail.com`)
- **Core Team Members:** Samruddhi Sarode, Parth Gade, Krushna Thakur, Sanskruti Bhavsar

---

## 3. Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Spatial Processing:** GeoPandas, Shapely, PyProj
- **Analytics & ML:** Pandas, NumPy, Scikit-learn, Statsmodels
- **Optimization:** PuLP / Google OR-Tools (MCLP solver)
- **Database Driver:** SQLAlchemy 2.0, GeoAlchemy2, Psycopg2

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Mapping:** MapLibre GL JS, deck.gl
- **Visualizations:** Recharts, Lucide React Icons
- **HTTP Client:** Axios

### Database
- **Primary:** PostgreSQL 18 with PostGIS 3.x
- **Development Fallback:** In-memory spatial SQLite / GeoPandas engine for offline development.

---

## 4. Documentation Directory
Detailed engineering and methodology documentation is provided in [`/docs`](file:///d:/EV%20Infra/docs):
- [`PROJECT_ARCHITECTURE.md`](file:///d:/EV%20Infra/docs/PROJECT_ARCHITECTURE.md) — 5-module system architecture & data flow.
- [`DATABASE_SCHEMA.md`](file:///d:/EV%20Infra/docs/DATABASE_SCHEMA.md) — Relational & PostGIS table definitions.
- [`DATA_SOURCES.md`](file:///d:/EV%20Infra/docs/DATA_SOURCES.md) — Public source matrix, access methods & fallback paths.
- [`DATA_DICTIONARY.md`](file:///d:/EV%20Infra/docs/DATA_DICTIONARY.md) — Standardized field names, types & CSV schemas.
- [`METHODOLOGY.md`](file:///d:/EV%20Infra/docs/METHODOLOGY.md) — Mathematical formulations (CGI, Demand, MCLP).
- [`ASSUMPTIONS_AND_LIMITATIONS.md`](file:///d:/EV%20Infra/docs/ASSUMPTIONS_AND_LIMITATIONS.md) — Research parameters & engineering boundaries.
- [`API_DOCUMENTATION.md`](file:///d:/EV%20Infra/docs/API_DOCUMENTATION.md) — REST API specifications.
- [`DEVELOPMENT_PROGRESS.md`](file:///d:/EV%20Infra/docs/DEVELOPMENT_PROGRESS.md) — Phase-by-phase implementation tracker.

---

## 5. Quick Start & Setup Instructions

### Backend Setup
```powershell
# 1. Navigate to backend directory
cd "d:\EV Infra\backend"

# 2. Activate virtual environment
..\.venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
FastAPI interactive docs will be available at: `http://localhost:8000/docs`

### Frontend Setup
```powershell
# 1. Navigate to frontend directory
cd "d:\EV Infra\frontend"

# 2. Install Node packages
npm install

# 3. Start the Vite development server
npm run dev
```
ChargeAtlas web platform will be available at: `http://localhost:5173`

