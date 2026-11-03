# CHARGEATLAS INDIA — VERCEL PRODUCTION DEPLOYMENT GUIDE

**Project:** ChargeAtlas India — EV Charging Infrastructure Mapping, Gap Analysis, Demand Forecasting & Smart Site Recommendation Platform  
**Competition:** IIT Bombay Techfest 2026–27 — EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University)  
**Target Platform:** Vercel Global Edge Network (CDN + SPA Routing)  
**Date:** November 3, 2026  
**Status:** **CONFIGURED & READY TO DEPLOY**

---

## 1. ARCHITECTURE OVERVIEW ON VERCEL

When deploying ChargeAtlas India to Vercel:
- **Frontend (Vercel):** The React 18 + Vite Single Page Application is compiled into highly optimized static assets and hosted on Vercel's global edge CDN.
- **Client Routing (`vercel.json`):** Clean URL rewrites ensure that deep links (such as `/maharashtra`, `/districts/Pune`, `/pune-grid`, `/samruddhi-corridor`, `/forecasting`) route directly to `index.html` without 404 errors on browser refresh.
- **Backend Connectivity:** The frontend connects seamlessly to the FastAPI analytical engine via the `VITE_API_URL` environment variable.

```mermaid
flowchart LR
    User["Evaluator / Judge Browser"]
    VercelEdge["Vercel Edge CDN (chargeatlas.vercel.app)\nReact 18 + MapLibre GL JS + Recharts"]
    FastAPIBackend["FastAPI ASGI Analytical Engine\n(Docker / Cloud VM / Render / Railway)"]
    PostgresDB[("PostgreSQL 18 + PostGIS 3.4\nSpatial Database")]

    User -->|HTTPS| VercelEdge
    VercelEdge -->|API Calls (VITE_API_URL)| FastAPIBackend
    FastAPIBackend --> PostgresDB
```

---

## 2. OPTION A: ONE-CLICK GITHUB IMPORT (RECOMMENDED & EASIEST)

Since the entire codebase has been pushed to GitHub at [https://github.com/Pranav060307/EV-Infra-IIT-bombay-](https://github.com/Pranav060307/EV-Infra-IIT-bombay-), you can deploy in 60 seconds directly from the Vercel Dashboard:

### Step 1: Open Vercel Dashboard
1. Go to [**https://vercel.com/new**](https://vercel.com/new) and log in with your GitHub account.

### Step 2: Import the GitHub Repository
1. In the **"Import Git Repository"** section, locate:
   ```
   Pranav060307/EV-Infra-IIT-bombay-
   ```
   *(If not visible, click "Adjust GitHub App Permissions" and grant access to the repo).*
2. Click **Import**.

### Step 3: Configure Project Settings
Vercel will detect the project configuration from [vercel.json](file:///d:/EV%20Infra/vercel.json):
- **Project Name:** `chargeatlas-india` (or your preferred name)
- **Framework Preset:** `Vite`
- **Root Directory:** `./` *(Leave as root; `vercel.json` automatically manages the frontend build)*
- **Build Command:** `cd frontend && npm install && npm run build` *(Auto-configured)*
- **Output Directory:** `frontend/dist` *(Auto-configured)*

### Step 4: Configure Environment Variables (Optional)
Under **Environment Variables**, you can optionally configure:
- **`VITE_API_URL`**: URL of your hosted backend API (e.g. `https://api.chargeatlas.gov.in/api/v1` or leave blank for local development proxy).

### Step 5: Click Deploy! 🚀
1. Click the blue **Deploy** button.
2. Vercel will build and deploy the application in ~45 seconds.
3. Your live application will be instantly accessible at:
   ```
   https://chargeatlas-india.vercel.app (or custom domain)
   ```

---

## 3. OPTION B: COMMAND-LINE DEPLOYMENT (VERCEL CLI)

If you prefer deploying directly from your terminal using the Vercel CLI:

```bash
# 1. Navigate to the project root
cd "D:\EV Infra"

# 2. Run Vercel deployment command
npx vercel

# 3. Follow the interactive prompts:
# ? Set up and deploy "D:\EV Infra"? [Y/n] y
# ? Which scope do you want to deploy to? (Select your Vercel account)
# ? Link to existing project? [y/N] n
# ? What's your project's name? chargeatlas-india
# ? In which directory is your code located? ./
# Vercel will detect vercel.json and build the project.

# 4. For final production deployment:
npx vercel --prod
```

---

## 4. CONNECTING THE HOSTED BACKEND

Because FastAPI and PostGIS require native spatial C-libraries (GDAL, GEOS, PROJ) and a persistent PostgreSQL database, the backend can be hosted on any cloud provider supporting Docker or Python:

### Recommended Free / Low-Cost Backend Hosts:
1. **Render.com / Railway.app:**
   - Deploy via `backend/Dockerfile` and `docker-compose.yml`.
   - Free PostgreSQL with PostGIS extension available with 1 click.
   - Example Backend URL: `https://chargeatlas-backend.onrender.com/api/v1`.
2. **Localhost with Secure Tunnel (For Live IIT Bombay Judging):**
   - Keep your local FastAPI backend running on port 8000.
   - Expose it via a secure public tunnel:
     ```bash
     npx localtunnel --port 8000
     # or: ngrok http 8000
     ```
   - In Vercel Project Settings > Environment Variables, set `VITE_API_URL` to your tunnel URL.

---

## 5. POST-DEPLOYMENT VERIFICATION CHECKLIST

After deployment completes:
- [x] Home Overview Dashboard loads cleanly with authentic VAHAN metrics (886,752 EVs).
- [x] Dark / Light Canvas theme toggle functions smoothly.
- [x] MapLibre GL maps render vector/raster basemaps without watermark warnings.
- [x] Navigating directly to `/districts/Pune` or `/pune-grid` loads without 404 on page refresh (verified via `vercel.json` rewrites).
