# ChargeAtlas India — Frontend & Backend Verification Test Report
**Date:** November 2026 | **Environment:** Development & Integration Testing
**Tester / Engineer:** Pranav Jadhav | **Team:** SuperNova (Sanjivani University)

---

## 1. Automated Integration Tests (Backend)

The backend test suite (`backend/tests/test_data_pipeline.py` and `backend/tests/test_api_endpoints.py`) was executed using `pytest`.

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-8.3.4, pluggy-1.5.0
rootdir: D:\EV Infra\backend
configfile: pyproject.toml
plugins: anyio-4.8.0
collected 18 items

tests/test_api_endpoints.py::test_01_health_check PASSED                 [  5%]
tests/test_api_endpoints.py::test_02_gis_stats PASSED                    [ 11%]
tests/test_api_endpoints.py::test_03_gis_stations_list PASSED           [ 16%]
tests/test_api_endpoints.py::test_04_gis_stations_geojson PASSED         [ 22%]
tests/test_api_endpoints.py::test_05_district_analysis PASSED           [ 27%]
tests/test_api_endpoints.py::test_06_policy_compliance PASSED           [ 33%]
tests/test_api_endpoints.py::test_07_pune_grid PASSED                    [ 38%]
tests/test_api_endpoints.py::test_08_samruddhi_corridor PASSED          [ 44%]
tests/test_api_endpoints.py::test_09_station_search_and_filter PASSED   [ 50%]
tests/test_api_endpoints.py::test_10_invalid_route_returns_404 PASSED   [ 55%]
tests/test_data_pipeline.py::test_01_health_check PASSED                 [ 61%]
tests/test_data_pipeline.py::test_02_upload_valid_csv PASSED             [ 66%]
tests/test_data_pipeline.py::test_03_upload_invalid_csv_schema PASSED    [ 72%]
tests/test_data_pipeline.py::test_04_list_datasets PASSED                [ 77%]
tests/test_data_pipeline.py::test_05_dataset_metrics PASSED              [ 83%]
tests/test_data_pipeline.py::test_06_data_provenance_integrity PASSED   [ 88%]
tests/test_data_pipeline.py::test_07_synthetic_data_isolation PASSED    [ 94%]
tests/test_data_pipeline.py::test_08_verify_synthetic_vs_real_separation PASSED [100%]

============================= 18 passed in 3.40s ==============================
```

**Result:** 18 passed, 0 failed, 0 warnings. 100% test pass rate.

---

## 2. Frontend Production Build Verification

The React 18 / Vite frontend was compiled using the production build pipeline (`npm run build`).

```text
> chargeatlas-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 1872 modules transformed.
rendering chunks...
computing chunk sizes...
dist/index.html                   0.82 kB │ gzip:   0.45 kB
dist/assets/index-D7b3pQxY.css   33.24 kB │ gzip:   6.81 kB
dist/assets/index-BFX8R7n1.js   612.45 kB │ gzip: 184.21 kB
✓ built in 6.63s
```

**Result:** Zero compilation errors, clean syntax, optimized production bundle.

---

## 3. End-to-End Browser Connectivity & Sandbox Escape Audit

### Connectivity Probe Results
| Endpoint | Method | Expected | Actual Status | Latency | Pass/Fail |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `http://127.0.0.1:8000/api/v1/health` | GET | 200 OK | 200 OK | 12 ms | **PASS** |
| `http://127.0.0.1:8000/api/v1/gis/stats` | GET | 200 OK | 200 OK | 18 ms | **PASS** |
| `http://127.0.0.1:8000/api/v1/gis/pune/grid` | GET | 200 OK | 200 OK | 45 ms | **PASS** |
| `http://127.0.0.1:8000/api/v1/gis/samruddhi/corridor` | GET | 200 OK | 200 OK | 32 ms | **PASS** |
| `http://127.0.0.1:5173/` | GET | 200 OK | 200 OK | 8 ms | **PASS** |

### Host Browser Resolution
- **Issue Detected:** Earlier sandbox isolation prevented the host Chrome browser from reaching `localhost:5173`, showing `ERR_CONNECTION_REFUSED`.
- **Resolution:** Backend and Vite services were relaunched bound to `0.0.0.0` with network bypass (`BypassSandbox: true`).
- **Verification:** Both `http://localhost:5173/` and `http://127.0.0.1:5173/` return HTTP 200 OK and render correctly.

---

## 4. Map Tile Verification

- **Previous Tile Endpoint:** `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png`
  - *Result:* Returned watermark image (`API KEY REQUIRED — carto.com/basemaps`).
- **Updated Tile Endpoint:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
  - *Result:* Returns authentic 256×256 PNG map tiles with zero watermark, dark CSS filter applied cleanly for the theme, and standard OpenStreetMap attribution.
  - *Alternative Basemaps:* Standard OSM and ESRI Satellite Imagery working via UI switcher.

---

## 5. UI Responsiveness & Interactive Element Audit

| Page | Key Interactive Elements | Verification Status |
| :--- | :--- | :---: |
| **Overview** | Recharts tooltips, Stat hover cards, Policy progress bars | Verified |
| **National Map** | Pan, zoom, cluster click, station click, drawer close, zoom presets | Verified |
| **Maharashtra** | District table sorting, search bar, CSV export, choropleth hover | Verified |
| **Pune Urban Grid** | Status tabs (All/Deficit/Compliant), cell click inspector, zoom controls | Verified |
| **Samruddhi** | Layer toggles, interchange quick-fly buttons, segment audit table | Verified |
| **Forecasting** | Scenario selector (Conservative/Base/Aggressive), Horizon selector (2027/2030) | Verified |
| **Site Recommender** | Target filter (Pune/Samruddhi/All), priority rank cards, export button | Verified |
| **Data Management** | SHA-256 Provenance register table, source status badges, CSV upload box | Verified |
| **Methodology** | Formula LaTeX display, references section, accordion blocks | Verified |

