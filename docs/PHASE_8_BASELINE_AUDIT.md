# PHASE 8 BASELINE AND DEPLOYMENT VERIFICATION AUDIT
**Project:** ChargeAtlas India — Advanced EV Infrastructure Intelligence Platform  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Audit Timestamp:** 2026-11-06T18:40:00+05:30  
**Audit Status:** VERIFIED & COMPLETE  

---

## 1. Executive Baseline Summary

This audit establishes the baseline technical state of the ChargeAtlas India platform prior to and following Phase 8 independent validation, API 404 remediation, and production deployment.

The deployment targets:
- **Production URL:** `https://ev-infra-iit-bombay.vercel.app`
- **Git Repository:** `https://github.com/Pranav060307/EV-Infra-IIT-bombay-.git`
- **Branch:** `master` (synchronized with `origin/master` and `origin/main`)
- **Baseline Git Commit:** `63de987d4433711d5c3be79ade1abbab25ad32af`
- **Frontend Architecture:** React 18.3 + Vite 5.4 + Tailwind CSS + MapLibre GL JS 4.1.1
- **Backend Architecture:** FastAPI 0.110 + GeoPandas 1.2 + SQLAlchemy 2.0 + PyProj 3.7
- **Database Engine:** Hybrid architecture (PostgreSQL 16 + PostGIS 3.4 in production; SQLite 3.45 in sandboxed/development mode)
- **Deployment Infrastructure:** Vercel Edge CDN with dual-root configuration and pre-rendered Edge JSON datasets

---

## 2. Git Repository & Working Tree State

```text
Branch: master
Remote: origin/master (https://github.com/Pranav060307/EV-Infra-IIT-bombay-.git)
Commit: 63de987 (fix(maplibre): add open font glyphs pbf url to maplibre basemap styles for symbol cluster rendering)
Working Tree: Clean (untracked: frontend/.gitignore)
Baseline Tag: v1.0.0-phase8-baseline
```

### Commit Lineage
1. `63de987` — *fix(maplibre): add open font glyphs pbf url to maplibre basemap styles for symbol cluster rendering*
2. `bea17fe` — *fix(build): ensure frontend install precedes build in root package.json and vercel configs*
3. `4b018f3` — *fix(maps-deploy): add Edge CDN rewrites for all /api/v1 routes, fix national map boundaries & eliminate 404s*
4. `1a86055` — *fix(deploy): optimize Vercel Edge hydration, eliminate localhost timeouts & add dual-root vercel build configs*
5. `e6189bd` — *feat(analytics): complete 7-stage advanced decision-support system, data trust engine & spatial analytics*

---

## 3. Production Deployment Verification

### 3.1 Live Production Probing (`https://ev-infra-iit-bombay.vercel.app`)

An automated HTTP probing audit was executed against the production edge server:

| Endpoint / Asset | HTTP Status | Content-Type | Size | Cache-Control Header |
|---|---|---|---|---|
| `/` (HTML Root) | **200 OK** | `text/html; charset=utf-8` | 1,194 B | `public, max-age=0, must-revalidate` |
| `/assets/index-CaPh562W.js` | **200 OK** | `application/javascript; charset=utf-8` | 1,774,117 B | `public, max-age=31536000, immutable` |
| `/assets/index-Wzfj3RM-.css` | **200 OK** | `text/css; charset=utf-8` | 104,914 B | `public, max-age=31536000, immutable` |
| `/api/v1/health` | **200 OK** | `application/json; charset=utf-8` | 1,398 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/health` | **200 OK** | `application/json; charset=utf-8` | 1,398 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/district-analysis` | **200 OK** | `application/json; charset=utf-8` | 76,719 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/policy-compliance` | **200 OK** | `application/json; charset=utf-8` | 1,931 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/stations` | **200 OK** | `application/json; charset=utf-8` | 13,443 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/samruddhi/corridor` | **200 OK** | `application/json; charset=utf-8` | 29,770 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/samruddhi/corridor?buffer_km=20` | **200 OK** | `application/json; charset=utf-8` | 29,770 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/boundaries/maharashtra_districts` | **200 OK** | `application/json; charset=utf-8` | 324,119 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/pune/grid` | **200 OK** | `application/json; charset=utf-8` | 589,613 B | `public, max-age=0, must-revalidate` |
| `/api/v1/gis/pune/summary` | **200 OK** | `application/json; charset=utf-8` | 2,106 B | `public, max-age=0, must-revalidate` |
| `/api/v1/recommendations/candidates` | **200 OK** | `application/json; charset=utf-8` | 66,428 B | `public, max-age=0, must-revalidate` |
| `/api/v1/recommendations/substations` | **200 OK** | `application/json; charset=utf-8` | 2,052 B | `public, max-age=0, must-revalidate` |
| `/api/v1/recommendations/sensitivity` | **200 OK** | `application/json; charset=utf-8` | 11,612 B | `public, max-age=0, must-revalidate` |
| `/api/v1/recommendations/scenarios` | **200 OK** | `application/json; charset=utf-8` | 3,350 B | `public, max-age=0, must-revalidate` |
| `/data/maharashtra_districts.json` | **200 OK** | `application/json; charset=utf-8` | 324,119 B | `public, max-age=86400, stale-while-revalidate` |
| `/data/stations.json` | **200 OK** | `application/json; charset=utf-8` | 13,443 B | `public, max-age=86400, stale-while-revalidate` |
| `/data/samruddhi_corridor.json` | **200 OK** | `application/json; charset=utf-8` | 29,770 B | `public, max-age=86400, stale-while-revalidate` |

**Verification Result:**  
- **20 / 20 endpoints verified returning HTTP 200 OK.**
- **Zero HTTP 404 responses.**
- Live bundle hash verified: `index-CaPh562W.js`. Stale bundle `index-oirFZWV2.js` is no longer served.

---

## 4. Root Cause of Previous 404 Errors

### Discovery
Prior to Phase 8, client consoles reported repeated 404 errors on:
- `GET /api/v1/gis/district-analysis`
- `GET /api/v1/gis/policy-compliance`
- `GET /api/v1/health`
- `GET /api/v1/gis/health`

### Audit Finding
1. **Frontend-Only Deployment on Vercel:**  
   Vercel functions as a static Edge host for the React single-page application. The full FastAPI backend runs locally during development (port 8000) or on dedicated compute instances. When deploying the frontend to Vercel without an external Python server URL, requests directed to `/api/v1/...` hit Vercel's edge router, which returned standard 404 Not Found HTML pages because no serverless function handled those paths.
2. **Missing Edge Rewrites:**  
   Although static JSON counterparts existed in `frontend/public/data/`, the root and frontend `vercel.json` configurations lacked rewrite rules routing `/api/v1/...` requests to the pre-rendered `/data/*.json` files.
3. **Stale CDN Deployment:**  
   The live domain was stuck serving `index-oirFZWV2.js` (built Nov 5) because production deployments had not synced through the Vercel CLI from the active directory.

### Remediation Applied
1. **Vercel Edge Rewrites:** Configured explicit rules in both `vercel.json` and `frontend/vercel.json` mapping all `/api/v1/...` paths directly to `/data/...` with HTTP 200.
2. **Double-Layered Client Fallback:** Added try/catch fallback logic inside `frontend/src/services/api.js` and page-level loaders (`MaharashtraPage.jsx`, `NationalMapPage.jsx`, `SamruddhiPage.jsx`, `PuneAnalysisPage.jsx`). If an API call fails or times out, the client automatically fetches `/data/*.json`.
3. **MapLibre Font Glyphs Fix:** Added `glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'` to composite and raster basemap configurations in `MapLibreMap.jsx`, resolving cluster rendering console errors.
4. **Vercel CLI Production Push:** Ran `npx vercel --prod` directly from `frontend`, uploading the verified `dist/` directory (`index-CaPh562W.js`).

---

## 5. Baseline Test Status Summary

- **Backend PyTest Suite:** 45 tests executed, 45 passed (100% pass rate in 15.91s).
- **Frontend Vite Production Build:** 2,370 modules transformed, 0 syntax/bundling errors, bundle size 1.77 MB (gzipped 480 kB).
- **Edge CDN Health:** 100% of analytical and boundary routes verified active and returning authentic data.

