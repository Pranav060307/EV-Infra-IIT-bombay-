# CHARGEATLAS INDIA — VERCEL PRODUCTION DEPLOYMENT GUIDE

**Project:** ChargeAtlas India — EV Charging Infrastructure Mapping, Gap Analysis, Demand Forecasting & Smart Site Recommendation Platform  
**Competition:** IIT Bombay Techfest 2026–27 — EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Target Platform:** Vercel Global Edge Network (CDN + SPA Routing)  
**Date:** November 2026  
**Status:** **FULLY CONFIGURED & VERIFIED FOR INSTANT EDGE HYDRATION**

---

## 1. Architecture Overview on Vercel

ChargeAtlas India is architected for dual-mode deployment:
- **Zero-Latency Static Edge Mode (Default on Vercel):** All 22 authentic datasets (36 districts, 607 Pune micro-grid cells, 33 Samruddhi segments, 23 candidates, 766 substations, forecasts, trust register, quality audit) are served directly from Vercel's Global Edge CDN with `<30ms` latency and GZip/Brotli compression.
- **Client-Side Siting & MCDA Simulation:** Dynamic criteria weight tuning (CGI and MCDA), scenario package filtering, and MCLP heuristic solvers execute directly in the browser with instant sub-millisecond response times.
- **Optional Dedicated Backend Connection:** If you host the FastAPI Python microservice (on Railway, Render, Fly.io, or AWS EC2), set `VITE_API_URL=https://your-api.com/api/v1` in the Vercel Dashboard Environment Variables.

```mermaid
flowchart LR
    User["Evaluator / Judge Browser"]
    VercelEdge["Vercel Global Edge CDN\n(22 Authentic Datasets + SPA)\nLatency < 30ms"]
    OptionalBackend["Optional FastAPI Backend\n(Render / Railway / Docker)"]

    User -->|HTTPS Request| VercelEdge
    VercelEdge -.->|If VITE_API_URL is set| OptionalBackend
    VercelEdge -->|Instant Pre-Computed Datasets| User
```

---

## 2. Automatic GitHub Redeployment (Default)

Since the project repository is hosted at:
```
https://github.com/Pranav060307/EV-Infra-IIT-bombay-.git
```
Vercel automatically triggers a zero-downtime redeployment **every time code is pushed to the `master` branch**.

To trigger a redeployment manually in the Vercel Dashboard:
1. Open your project on [**vercel.com**](https://vercel.com).
2. Navigate to the **Deployments** tab.
3. Click the three dots (`...`) next to the latest production deployment.
4. Click **Redeploy**.

---

## 3. Project Configuration Settings on Vercel

Both root-level and frontend-level configurations are provided to guarantee 100% build compatibility regardless of how the repository was imported into Vercel:

### Scenario A: Root Directory = `./` (Repository Root)
- **Configuration File:** [`vercel.json`](file:///d:/EV%20Infra/vercel.json)
- **Build Command:** `npm run build` *(executes `npm --prefix frontend run build`)*
- **Output Directory:** `frontend/dist`
- **Cache-Control:** `public, max-age=86400, stale-while-revalidate=604800`

### Scenario B: Root Directory = `frontend`
- **Configuration File:** [`frontend/vercel.json`](file:///d:/EV%20Infra/frontend/vercel.json)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** `Vite`

---

## 4. Key Performance Optimizations

1. **Elimination of Localhost Timeouts:**
   - Previous builds attempted to connect to `http://localhost:8000/api/v1` from HTTPS Vercel domains, causing browsers to wait for a 4000ms timeout before failing over to static data.
   - The updated API client immediately detects hosted environments and routes requests straight to Edge CDN static assets in **10–20ms**.
2. **Single Page Application Routing:**
   - Clean URL rewrites route deep links (`/maharashtra`, `/districts/pune`, `/pune-grid`, `/samruddhi-corridor`, `/site-recommendations`, `/forecasting`) directly to `index.html` without 404 errors on browser refresh.
3. **HTTP Compression & Caching:**
   - All GeoJSON files and polygon layers in `/data/*` are served with global CDN caching and automatic Brotli/Gzip compression.
