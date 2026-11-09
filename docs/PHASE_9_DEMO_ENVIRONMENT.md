# CHARGEATLAS INDIA — PHASE 9 COMPETITION DEMO ENVIRONMENT & READINESS
**Project:** ChargeAtlas India — Advanced EV Infrastructure Intelligence Platform  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Developer Lead:** Pranav Jadhav  
**Primary Live URL:** https://ev-infra-iit-bombay.vercel.app  
**Local Backup URL:** http://localhost:5173  
**Audit Timestamp:** 2026-11-06T18:59:00+05:30  
**Readiness Status:** **100% PREPARED WITH DUAL-LAYER FALLBACK**  

---

## 1. Primary Live Demonstration Setup

### 1.1 Live Production Environment Checklist
- [x] **Production Domain Live:** `https://ev-infra-iit-bombay.vercel.app` verified active globally.
- [x] **Active Production Bundle:** `index-CaPh562W.js` verified serving HTTP 200 with zero 404 errors.
- [x] **Basemap Vector Tiles:** MapLibre style loads CartoDB Dark Matter tiles with font glyphs stack.
- [x] **No Debug Banners:** Development test banners, console logs, and temporary alerts removed.
- [x] **Zero Authentication Blockers:** Analytical views, maps, and MCDA site recommendations are fully accessible to evaluators without mandatory login walls.
- [x] **Browser Compatibility:** Tested and verified on Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari.

### 1.2 Recommended Browser Configuration for Evaluation
1. Open a clean browser window in **Incognito / Private Mode** to prevent browser extension interference.
2. Set display zoom to **100%** on a $1920 \times 1080$ or $1440 \times 900$ display.
3. Keep DevTools closed during initial presentation, opening it only if judges ask to inspect network requests or JSON payloads.

---

## 2. Zero-Downtime Offline / Network-Severed Fallback Architecture

If venue Wi-Fi becomes unstable or is blocked during the presentation, ChargeAtlas India includes a complete offline demonstration capability.

### 2.1 Starting the Local Backup Environment
In a local terminal (PowerShell or Bash):
```powershell
# Navigate to the project root
cd "D:\EV Infra\frontend"

# Start the Vite development preview server (bound to local loopback)
npm run preview
```
- **Local Fallback URL:** `http://localhost:4173` (or `http://localhost:5173` via `npm run dev`).
- **Data Source:** Serves the exact same 22 pre-rendered JSON datasets from `frontend/public/data/` with sub-10ms response times.
- **Map Behavior:** MapLibre GL JS caches basemap vector tiles in IndexedDB; once loaded, pan and zoom remain fully functional even if internet access is disconnected.

---

## 3. Pre-Demo Readiness Checklist

| Item | Requirement | Verification Command / URL | Status |
|---|---|---|---|
| **Production Health** | `/api/v1/health` returns `healthy` | `curl -s https://ev-infra-iit-bombay.vercel.app/api/v1/health` | **PASS** |
| **District Analysis** | 36 districts data returns HTTP 200 | `curl -sI https://ev-infra-iit-bombay.vercel.app/api/v1/gis/district-analysis` | **PASS** |
| **Pune Grid** | 607 cells GeoJSON returns HTTP 200 | `curl -sI https://ev-infra-iit-bombay.vercel.app/api/v1/gis/pune/grid` | **PASS** |
| **Samruddhi Corridor** | 701 km corridor returns HTTP 200 | `curl -sI https://ev-infra-iit-bombay.vercel.app/api/v1/gis/samruddhi/corridor` | **PASS** |
| **Candidate Parcels** | 23 MCDA candidates return HTTP 200 | `curl -sI https://ev-infra-iit-bombay.vercel.app/api/v1/recommendations/candidates` | **PASS** |
| **Data Trust Register** | Authoritative checksums return HTTP 200 | `curl -sI https://ev-infra-iit-bombay.vercel.app/api/v1/datasets/trust-register` | **PASS** |
| **Console Errors** | Browser console shows 0 red errors | Inspected via Chrome DevTools Console | **PASS** |
| **CSV Export** | Export buttons download valid CSV | Clicked 'Export CSV' on Maharashtra & Pune tabs | **PASS** |

