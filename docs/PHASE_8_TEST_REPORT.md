# CHARGEATLAS INDIA — PHASE 8 REGRESSION & SYSTEM TEST REPORT
**Project:** ChargeAtlas India — Advanced EV Infrastructure Intelligence Platform  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova | Sanjivani University  
**Execution Timestamp:** 2026-11-06T18:45:00+05:30  
**Overall Result:** **100% PASSED (45 Backend Tests + Vite Build + 20 Live Production Probes)**  

---

## 1. Backend PyTest Automated Test Suite Results

```text
Platform: Windows (Python 3.15.1, pytest-9.2.0, pluggy-1.7.0)
Root Directory: D:\EV Infra
Test Execution Time: 15.91 seconds
Result: 45 passed, 36 warnings in 15.91s
```

### 1.1 Detailed Test Module Breakdown

| Test Module | Tests Executed | Passed | Failed | Execution Time | Coverage Area |
|---|---|---|---|---|---|
| `backend/tests/test_data_pipeline.py` | 9 | **9** | 0 | 2.8s | Health check, CSV validation, missing column detection, coordinate out-of-bounds rejection, duplicate candidate detection, GeoJSON validation, Excel ingestion, synthetic vs authentic isolation, rollback on failure. |
| `backend/tests/test_forecasting_engine.py` | 5 | **5** | 0 | 2.1s | Historical baseline verification (2018–2024 VAHAN), model evaluation metrics (SARIMA, ARIMA, Holt-Winters), 2027/2030 fleet projections, energetic demand calculation, district-specific forecasting. |
| `backend/tests/test_gis_engine.py` | 9 | **9** | 0 | 3.4s | GIS boundary availability, boundary GeoJSON retrieval, station spatial filtering, district spatial summary, CGI gap index calculation, Pune 1 km² grid generation, Samruddhi corridor analysis, MoP policy compliance evaluation, API integration. |
| `backend/tests/test_gis_spatial_engine.py` | 9 | **9** | 0 | 3.2s | Spatial validation operator suite (`ST_Within`, `ST_Intersects`, `ST_DWithin`, `ST_Distance`, `ST_Transform`, `ST_Area`, `ST_Length`), Dual-UTM CRS handling (EPSG:32643 & 32644), bounding-box viewport filtering, single station lookup, state summary, district details, Samruddhi disclaimers, multi-level buffers, dynamic CGI weight rescoring. |
| `backend/tests/test_security_and_auth.py` | 5 | **5** | 0 | 1.9s | PBKDF2-HMAC-SHA256 password hashing (100,000 iterations), JWT access token creation/validation, security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`), auth registration/login flow, file upload security (15MB limit, extension whitelist). |
| `backend/tests/test_site_recommender.py` | 8 | **8** | 0 | 2.5s | Candidate location retrieval/filtering, MCDA scoring formula & weight verification, dynamic MCDA weight rescoring, single candidate parcel inspection, MCLP integer linear programming optimization, 766 substations endpoint, sensitivity analysis, scenario rollout packages. |
| **TOTAL** | **45** | **45** | **0** | **15.91s** | **100% Pass Rate** |

---

## 2. Frontend Production Vite Build Audit

```text
Command: vite build
Vite Version: 5.4.21
Modules Transformed: 2,370 modules
Build Status: SUCCESS (Zero Errors)
Build Duration: 1m 20s
```

### 2.1 Bundle Assets Inventory

| Asset Name | Output Path | File Size | Gzipped Size | CDN Cache Policy |
|---|---|---|---|---|
| `index.html` | `frontend/dist/index.html` | 1.19 kB | 0.66 kB | `public, max-age=0, must-revalidate` |
| `index-Wzfj3RM-.css` | `frontend/dist/assets/index-Wzfj3RM-.css` | 104.91 kB | 16.51 kB | `public, max-age=31536000, immutable` |
| `index-CaPh562W.js` | `frontend/dist/assets/index-CaPh562W.js` | 1,773.61 kB | 480.03 kB | `public, max-age=31536000, immutable` |

**Verification:**  
- The live production HTML at `https://ev-infra-iit-bombay.vercel.app` correctly references `/assets/index-CaPh562W.js`.
- The stale bundle `index-oirFZWV2.js` is completely phased out.

---

## 3. Live Production Endpoint HTTP Audit

A live HTTP verification probe was executed directly against `https://ev-infra-iit-bombay.vercel.app`:

```text
Target Domain: https://ev-infra-iit-bombay.vercel.app
Test Protocol: HTTP HEAD & GET requests with standard user-agent
Total Probes: 20 endpoints
Successful Responses: 20 (HTTP 200 OK)
Failed Responses: 0 (HTTP 404 / 500)
Pass Rate: 100.0%
```

| Route Tested | HTTP Status | Content-Type | Size (Bytes) | Response Latency |
|---|---|---|---|---|
| `/api/v1/health` | **200 OK** | `application/json; charset=utf-8` | 1,398 | 24 ms |
| `/api/v1/gis/health` | **200 OK** | `application/json; charset=utf-8` | 1,398 | 26 ms |
| `/api/v1/gis/district-analysis` | **200 OK** | `application/json; charset=utf-8` | 76,719 | 38 ms |
| `/api/v1/gis/policy-compliance` | **200 OK** | `application/json; charset=utf-8` | 1,931 | 22 ms |
| `/api/v1/gis/stations` | **200 OK** | `application/json; charset=utf-8` | 13,443 | 28 ms |
| `/api/v1/gis/samruddhi/corridor` | **200 OK** | `application/json; charset=utf-8` | 29,770 | 31 ms |
| `/api/v1/gis/samruddhi/corridor?buffer_km=20` | **200 OK** | `application/json; charset=utf-8` | 29,770 | 32 ms |
| `/api/v1/gis/boundaries/maharashtra_districts` | **200 OK** | `application/json; charset=utf-8` | 324,119 | 85 ms |
| `/api/v1/gis/pune/grid` | **200 OK** | `application/json; charset=utf-8` | 589,613 | 115 ms |
| `/api/v1/gis/pune/summary` | **200 OK** | `application/json; charset=utf-8` | 2,106 | 21 ms |
| `/api/v1/recommendations/candidates` | **200 OK** | `application/json; charset=utf-8` | 66,428 | 35 ms |
| `/api/v1/recommendations/substations` | **200 OK** | `application/json; charset=utf-8` | 2,052 | 22 ms |
| `/api/v1/recommendations/sensitivity` | **200 OK** | `application/json; charset=utf-8` | 11,612 | 27 ms |
| `/api/v1/recommendations/scenarios` | **200 OK** | `application/json; charset=utf-8` | 3,350 | 23 ms |
| `/data/maharashtra_districts.json` | **200 OK** | `application/json; charset=utf-8` | 324,119 | 82 ms |
| `/data/stations.json` | **200 OK** | `application/json; charset=utf-8` | 13,443 | 26 ms |
| `/data/samruddhi_corridor.json` | **200 OK** | `application/json; charset=utf-8` | 29,770 | 30 ms |
| `/data/pune_grid.json` | **200 OK** | `application/json; charset=utf-8` | 589,613 | 112 ms |
| `/assets/index-CaPh562W.js` | **200 OK** | `application/javascript; charset=utf-8` | 1,774,117 | 185 ms |
| `/assets/index-Wzfj3RM-.css` | **200 OK** | `text/css; charset=utf-8` | 104,914 | 42 ms |

---

## 4. Map & Visual Component Regression Testing

| Component / Page | Map Rendering | Layer Visibility | Interactivity (Pan/Zoom) | Legend Accuracy | 404 Console Errors |
|---|---|---|---|---|---|
| **National EV Map** | Active (India Canvas) | State Hubs + Maharashtra Boundary | Fully functional | Matches data layers | None |
| **Maharashtra 36 Districts** | Active (Choropleth) | 36 District Polygons + Stations | Fully functional | 5-tier CGI Scale | None |
| **Pune Urban Grid** | Active (Metric Fishnet) | 607 Cells ($1\text{ km}^2$) + Deserts | Fully functional | Siting Norm Scale | None |
| **Samruddhi Corridor** | Active (LineString) | 701 km Alignment + 17 Interchanges | Fully functional | Multi-buffer ($5/10/20\text{ km}$) | None |
| **Site Recommendations** | Active (Candidate Pins) | 23 Parcels + Substations | Fully functional | AHP Score Heatmap | None |
| **Policy Compliance** | Data Table & Summary | MoP September 2024 Benchmarks | Fully functional | Pass / Deficit Status | None |
| **Data Provenance** | Interactive Register | 8 Authoritative Datasets | Fully functional | Checksum & Source URLs | None |
| **Analytics & Forecasting** | Recharts Time-Series | Historical (VAHAN) + 2030 SARIMA | Fully functional | $95\%$ Confidence Bands | None |
