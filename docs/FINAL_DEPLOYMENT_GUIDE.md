# CHARGEATLAS INDIA — PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

**Project:** ChargeAtlas India — EV Charging Infrastructure Mapping, Gap Analysis, Demand Forecasting & Smart Site Recommendation Platform  
**Competition:** IIT Bombay Techfest 2026–27 — EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Target Environments:** Linux Server (Ubuntu 22.04 LTS / Debian 12), Windows Server, Docker Container Stack  
**Date:** November 3, 2026  
**Status:** **OPERATIONAL & PRODUCTION-READY**

---

## 1. PREREQUISITES & SYSTEM REQUIREMENTS

### Hardware Requirements:
- **CPU:** Minimum 2 vCPUs (4 vCPUs recommended for multi-worker GIS spatial indexing).
- **RAM:** Minimum 4 GB RAM (8 GB recommended for large GeoJSON geometry operations).
- **Disk Storage:** Minimum 20 GB SSD storage.

### Software Requirements:
- **Operating System:** Linux (Ubuntu 22.04 LTS recommended) or Windows 10/11 / Windows Server.
- **Python:** Python 3.11, 3.12, or 3.15 with pip and virtualenv.
- **Node.js:** Node.js 18.x or 20.x LTS with npm 9+.
- **Database:** PostgreSQL 16, 17, or 18 with PostGIS 3.3+ spatial extension.
- **Optional Containerization:** Docker Engine 24+ and Docker Compose v2.

---

## 2. DEPLOYMENT OPTION A: DOCKER COMPOSE (RECOMMENDED PRODUCTION ARCHITECTURE)

The simplest and most resilient deployment method utilizes the multi-container Docker Compose stack:

### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/supernova-techfest/chargeatlas-india.git
cd chargeatlas-india

# Copy production environment template
cp .env.example .env

# Edit .env with strong production credentials
nano .env
```
Ensure the following variables are configured:
```ini
APP_ENV="production"
DEBUG=false
SECRET_KEY="generate-strong-64-character-hex-key"
ADMIN_API_KEY="generate-strong-admin-token"
DB_PASSWORD="your-strong-production-db-password"
```

### Step 2: Build and Launch Containers
```bash
docker compose up -d --build
```
This builds and orchestrates:
1. `chargeatlas_db`: Official PostGIS PostgreSQL container with persistent volume `pgdata`.
2. `chargeatlas_backend`: Hardened FastAPI ASGI container with 4 uvicorn workers.
3. `chargeatlas_frontend`: Nginx static server with SPA route fallback and API proxy on port 80.

### Step 3: Run Database Migrations & Ingest Authentic Data
```bash
# Run Alembic migrations inside backend container
docker compose exec backend alembic upgrade head

# Ingest authentic government records into PostgreSQL
docker compose exec backend python scripts/ingest_authentic_data.py
```

### Step 4: Verify Container Health
```bash
docker compose ps
curl http://localhost/health
```

---

## 3. DEPLOYMENT OPTION B: STANDALONE SERVER DEPLOYMENT (BARE METAL / VM)

### Step 1: Database Setup (PostgreSQL 18 + PostGIS)
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Execute SQL commands:
CREATE DATABASE chargeatlas_db;
CREATE USER chargeatlas_app WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE chargeatlas_db TO chargeatlas_app;
\c chargeatlas_db
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### Step 2: Backend ASGI Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run migrations and seed baseline
alembic upgrade head
python scripts/ingest_authentic_data.py

# Launch backend with Uvicorn or Gunicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Step 3: Frontend Static Build & Web Server
```bash
cd frontend
npm ci
npm run build

# Deploy the generated dist/ directory to Nginx or Apache
# Ensure client-side fallback: try_files $uri $uri/ /index.html;
```

---

## 4. LOCAL COMPETITION EVALUATION LAUNCH (WINDOWS)

For offline judge evaluation or local development on Windows:
```bat
:: Double-click or execute from PowerShell/CMD:
run_chargeatlas.bat
```
The script automatically:
1. Verifies Python virtual environment and Node.js installation.
2. Checks port availability.
3. Starts the FastAPI backend with hot-reload on `http://127.0.0.1:8000/`.
4. Starts the Vite frontend on `http://localhost:5173/` with dual-stack listening.
5. Performs live polling probes until both services return `200 OK`.
6. Launches the default browser directly to the ChargeAtlas Dashboard.

To terminate all services cleanly:
```bat
stop_chargeatlas.bat
```

---

## 5. OBSERVABILITY & OPERATIONAL HEALTH PROBES

| Check Type | URL / Command | Expected Result | Action on Failure |
|:---|:---|:---:|:---|
| **Liveness Probe** | `GET /health` | `HTTP 200 {"status": "healthy"}` | Restart ASGI process |
| **Readiness Probe** | `GET /api/v1/health` | `HTTP 200 {"database": {"status": "connected"}}` | Verify DB credentials & network |
| **Spatial Engine Check** | `GET /api/v1/gis/state-analysis` | `HTTP 200 {"state": "Maharashtra", ...}` | Verify boundary GeoJSON files |
| **API Reverse Proxy** | `GET http://localhost:5173/api/v1/health` | `HTTP 200` | Verify Vite/Nginx proxy config |

