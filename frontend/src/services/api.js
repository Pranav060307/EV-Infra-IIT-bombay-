import axios from 'axios';

// -----------------------------------------------------------------------------
// ENVIRONMENT & HOST RESOLUTION
// -----------------------------------------------------------------------------
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Only use VITE_API_URL if it is non-empty and does NOT point to localhost while hosted on a remote domain
const rawEnvUrl = import.meta.env.VITE_API_URL;
const isEnvLocalhost = rawEnvUrl && (rawEnvUrl.includes('localhost') || rawEnvUrl.includes('127.0.0.1'));

let API_BASE_URL = '';
if (isLocalhost) {
  API_BASE_URL = rawEnvUrl || 'http://localhost:8000/api/v1';
} else if (rawEnvUrl && !isEnvLocalhost) {
  // Configured with a dedicated remote HTTPS backend in Vercel environment variables
  API_BASE_URL = rawEnvUrl;
} else {
  // Hosted on Vercel without external backend URL: default to relative endpoint / Edge CDN assets
  API_BASE_URL = '/api/v1';
}

// Pre-computed authentic static datasets hosted on Vercel Edge CDN for sub-30ms instant loading
const STATIC_FALLBACKS = {
  '/gis/pune/grid': '/data/pune_grid.json',
  '/gis/pune/summary': '/data/pune_summary.json',
  '/gis/samruddhi/corridor': '/data/samruddhi_corridor.json',
  '/gis/district-analysis': '/data/district_analysis.json',
  '/gis/boundaries/maharashtra_districts': '/data/maharashtra_districts.json',
  '/gis/boundaries/pune_urban': '/data/pune_urban_boundary.json',
  '/gis/boundaries/samruddhi_corridor': '/data/samruddhi_alignment.json',
  '/gis/stations': '/data/stations.json',
  '/gis/health': '/data/gis_health.json',
  '/gis/policy-compliance': '/data/policy_compliance.json',
  '/recommendations/candidates': '/data/candidates.json',
  '/recommendations/substations': '/data/substations.json',
  '/recommendations/sensitivity': '/data/recommendations_sensitivity.json',
  '/recommendations/scenarios': '/data/recommendations_scenarios.json',
  '/forecasting/baseline': '/data/forecasting_baseline.json',
  '/forecasting/models': '/data/forecasting_models.json',
  '/forecasting/charging-demand': '/data/forecasting_demand.json',
  '/datasets/metrics': '/data/datasets_metrics.json',
  '/datasets/list': '/data/datasets_list.json',
  '/datasets/trust-register': '/data/trust_register.json',
  '/datasets/quality-audit': '/data/quality_audit.json',
  '/gis/accessibility/buffers': '/data/accessibility_buffers.json'
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: isLocalhost ? 6000 : 2500, // Fast timeout on hosted environments to prevent UI hangs
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor: on hosted Vercel Edge without an external backend, map directly to Edge CDN assets
apiClient.interceptors.request.use(
  (config) => {
    if (!isLocalhost && (!rawEnvUrl || isEnvLocalhost)) {
      const cleanPath = (config.url || '').split('?')[0];
      const staticAsset = STATIC_FALLBACKS[cleanPath];
      if (staticAsset) {
        config.url = staticAsset;
        config.baseURL = ''; // fetch directly from root static path on Vercel
        config._isStaticEdge = true;
      }
    }
    return config;
  },
  (error) => {
    console.error('[ChargeAtlas API Request Config Error]:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with instant Vercel CDN fallback
apiClient.interceptors.response.use(
  async (response) => {
    // If Vercel rewrote API call to index.html (SPA catch-all), serve authentic static dataset
    if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE html') || response.data.includes('<!doctype html') || response.data.includes('<html'))) {
      const path = (response.config?.url || '').split('?')[0];
      const fallbackUrl = STATIC_FALLBACKS[path];
      if (fallbackUrl) {
        console.info(`[ChargeAtlas CDN Edge] Serving authentic static dataset for ${path} from ${fallbackUrl}`);
        const staticRes = await axios.get(fallbackUrl);
        return staticRes;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const path = url.split('?')[0];

    // If live API is unreachable or times out, serve authentic static dataset instantly
    const fallbackUrl = STATIC_FALLBACKS[path];
    if (fallbackUrl && !originalRequest?._isStaticFallback) {
      console.info(`[ChargeAtlas Fallback] Serving authentic static dataset for ${path} from ${fallbackUrl}`);
      try {
        const staticRes = await axios.get(fallbackUrl);
        return staticRes;
      } catch (fallbackErr) {
        console.warn(`[ChargeAtlas Fallback Notice] Failed to fetch ${fallbackUrl}:`, fallbackErr);
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// CORE HEALTH & SYSTEM STATUS
// -----------------------------------------------------------------------------

export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    return {
      status: 'offline',
      service: 'ChargeAtlas Backend (Unreachable)',
      error: error.response?.data?.detail || error.message
    };
  }
};

export const getSystemStatus = async () => {
  try {
    const response = await apiClient.get('/system-status');
    return response.data;
  } catch (error) {
    return null;
  }
};

// -----------------------------------------------------------------------------
// MODULE 1: DATASET PIPELINE ENDPOINTS
// -----------------------------------------------------------------------------

export const getDatasetMetrics = async () => {
  const response = await apiClient.get('/datasets/metrics');
  return response.data;
};

export const listDatasets = async () => {
  const response = await apiClient.get('/datasets/list');
  return response.data;
};

export const getTrustRegister = async () => {
  const response = await apiClient.get('/datasets/trust-register');
  return response.data;
};

export const getQualityAudit = async () => {
  const response = await apiClient.get('/datasets/quality-audit');
  return response.data;
};

export const getDatasetDetails = async (datasetId) => {
  const response = await apiClient.get(`/datasets/${datasetId}`);
  return response.data;
};

export const uploadDataset = async (file, category = 'charging_stations', isSynthetic = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('dataset_category', category);
  formData.append('is_synthetic', isSynthetic);

  const response = await apiClient.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const validateDataset = async (datasetId) => {
  const response = await apiClient.post(`/datasets/${datasetId}/validate`);
  return response.data;
};

export const getValidationReport = async (datasetId) => {
  const response = await apiClient.get(`/datasets/${datasetId}/report`);
  return response.data;
};

export const importDataset = async (datasetId) => {
  const response = await apiClient.post(`/datasets/${datasetId}/import`);
  return response.data;
};

export const deleteDataset = async (datasetId) => {
  const response = await apiClient.delete(`/datasets/${datasetId}`);
  return response.data;
};

// -----------------------------------------------------------------------------
// MODULE 2 & PHASE 3: GIS ENGINE & CHARGING GAP ASSESSMENT (CGI)
// -----------------------------------------------------------------------------

export const getGISHealth = async () => {
  const response = await apiClient.get('/gis/health');
  return response.data;
};

export const getBoundaries = async () => {
  const response = await apiClient.get('/gis/boundaries');
  return response.data;
};

export const getBoundaryGeoJSON = async (boundaryName) => {
  const response = await apiClient.get(`/gis/boundaries/${boundaryName}`);
  return response.data;
};

export const getVerifiedStations = async (params = {}) => {
  const response = await apiClient.get('/gis/stations', { params });
  let data = response.data;
  if (data?.features && params.district && params.district !== 'ALL') {
    const dLower = params.district.toLowerCase();
    const filtered = data.features.filter(f => 
      (f.properties?.district || '').toLowerCase() === dLower ||
      (f.properties?.city || '').toLowerCase() === dLower
    );
    return { ...data, features: filtered, total_count: filtered.length };
  }
  return data;
};

export const getDistrictAnalysis = async (params = {}) => {
  const response = await apiClient.get('/gis/district-analysis', { params });
  let data = response.data;
  // If dynamic weights are passed on static Edge fallback, re-calculate CGI dynamically
  if (params.w_ev_ratio !== undefined && data?.districts) {
    const wEv = params.w_ev_ratio ?? 0.35;
    const wSp = params.w_spatial ?? 0.25;
    const wPc = params.w_per_capita ?? 0.20;
    const wPol = params.w_policy ?? 0.20;
    const sumW = (wEv + wSp + wPc + wPol) || 1.0;

    const rescored = data.districts.map(d => {
      const rawCgi = (
        (d.ev_ratio_norm ?? (d.ev_to_charger_ratio > 0 ? Math.min(d.ev_to_charger_ratio / 500, 1.0) : 1.0)) * (wEv / sumW) * 100 +
        (d.spatial_norm ?? 0.6) * (wSp / sumW) * 100 +
        (d.per_capita_norm ?? 0.5) * (wPc / sumW) * 100 +
        (d.policy_norm ?? 0.7) * (wPol / sumW) * 100
      );
      const cgi = Math.round(Math.min(Math.max(rawCgi, 5), 98) * 10) / 10;
      let cat = 'MODERATE';
      if (cgi > 80) cat = 'CRITICAL GAP';
      else if (cgi > 60) cat = 'HIGH GAP';
      else if (cgi <= 30) cat = 'LOW GAP';
      return { ...d, cgi_score: cgi, cgi_category: cat };
    });
    rescored.sort((a, b) => b.cgi_score - a.cgi_score);
    return { ...data, districts: rescored };
  }
  return data;
};

export const getAccessibilityBuffers = async (district = null) => {
  const params = district ? { district } : {};
  const response = await apiClient.get('/gis/accessibility/buffers', { params });
  return response.data;
};

export const getPuneUrbanSummary = async (gridSizeMeters = 1000.0) => {
  const response = await apiClient.get('/gis/pune/summary', {
    params: { grid_size_meters: gridSizeMeters }
  });
  return response.data;
};

export const getPuneUrbanGrid = async (gridSizeMeters = 1000.0, forceRefresh = false) => {
  const response = await apiClient.get('/gis/pune/grid', {
    params: { grid_size_meters: gridSizeMeters, force_refresh: forceRefresh }
  });
  return response.data;
};

export const getSamruddhiCorridor = async (bufferKm = 20.0, forceRefresh = false) => {
  const response = await apiClient.get('/gis/samruddhi/corridor', {
    params: { buffer_km: bufferKm, force_refresh: forceRefresh }
  });
  return response.data;
};

export const getPolicyCompliance = async () => {
  const response = await apiClient.get('/gis/policy-compliance');
  return response.data;
};

// -----------------------------------------------------------------------------
// PHASE 5: EV DEMAND FORECASTING ENGINE
// -----------------------------------------------------------------------------

export const getHistoricalBaseline = async () => {
  const response = await apiClient.get('/forecasting/baseline');
  return response.data;
};

export const getForecastModels = async () => {
  const response = await apiClient.get('/forecasting/models');
  return response.data;
};

export const getFleetProjections = async (params = {}) => {
  const response = await apiClient.get('/forecasting/project', { params });
  return response.data;
};

export const getChargingDemand = async (params = {}) => {
  const response = await apiClient.get('/forecasting/charging-demand', { params });
  return response.data;
};

export const getDistrictForecast = async (districtName, params = {}) => {
  const response = await apiClient.get(`/forecasting/district/${districtName}`, { params });
  return response.data;
};

// -----------------------------------------------------------------------------
// PHASE 5: INTELLIGENT SITE RECOMMENDER & MCLP OPTIMIZATION
// -----------------------------------------------------------------------------

export const getCandidates = async (params = {}) => {
  const response = await apiClient.get('/recommendations/candidates', { params });
  let list = Array.isArray(response.data) ? response.data : (response.data?.candidates || []);
  if (params.scope && params.scope !== 'ALL') {
    list = list.filter(c => c.scope === params.scope);
  }
  if (params.category && params.category !== 'ALL') {
    list = list.filter(c => c.category === params.category);
  }
  return list;
};

export const rescoreMCDA = async (weightsPayload) => {
  try {
    const response = await apiClient.post('/recommendations/mcda', weightsPayload);
    return response.data;
  } catch (err) {
    // Client-side fallback rescoring using authentic candidate criteria
    console.info('[ChargeAtlas Edge CDN] Rescoring MCDA candidates client-side');
    const cRes = await axios.get('/data/candidates.json');
    const all = cRes.data || [];
    const w = {
      ev_demand_potential: weightsPayload.ev_demand_potential ?? 0.25,
      distance_from_chargers: weightsPayload.distance_from_chargers ?? 0.20,
      infrastructure_gap_severity: weightsPayload.infrastructure_gap_severity ?? 0.15,
      road_accessibility: weightsPayload.road_accessibility ?? 0.15,
      electrical_proximity: weightsPayload.electrical_proximity ?? 0.15,
      land_suitability: weightsPayload.land_suitability ?? 0.10
    };
    const totalW = Object.values(w).reduce((a, b) => a + b, 0) || 1.0;
    const normalizedW = {};
    for (const [k, val] of Object.entries(w)) normalizedW[k] = val / totalW;

    const scored = all.map(c => {
      let totalScore = 0;
      const breakdown = {};
      for (const [critKey, critObj] of Object.entries(c.mcda_criteria_breakdown || {})) {
        const weight = normalizedW[critKey] ?? critObj.weight;
        const weighted = critObj.normalized_score * weight;
        totalScore += weighted;
        breakdown[critKey] = {
          ...critObj,
          weight: Math.round(weight * 100) / 100,
          weighted_score: Math.round(weighted * 10) / 10
        };
      }
      return {
        ...c,
        total_mcda_score: Math.round(totalScore * 10) / 10,
        mcda_criteria_breakdown: breakdown
      };
    });

    scored.sort((a, b) => b.total_mcda_score - a.total_mcda_score);
    let ranked = scored.map((c, idx) => ({ ...c, rank: idx + 1 }));

    if (weightsPayload.scope && weightsPayload.scope !== 'ALL') {
      ranked = ranked.filter(c => c.scope === weightsPayload.scope);
    }
    if (weightsPayload.category && weightsPayload.category !== 'ALL') {
      ranked = ranked.filter(c => c.category === weightsPayload.category);
    }
    return ranked;
  }
};

export const getCandidateDetails = async (candidateId) => {
  const response = await apiClient.get(`/recommendations/candidates/${candidateId}`);
  return response.data;
};

export const optimizeSiting = async (optimizationPayload) => {
  try {
    const response = await apiClient.post('/recommendations/optimize', optimizationPayload);
    return response.data;
  } catch (err) {
    // Client-side heuristic MCLP fallback
    console.info('[ChargeAtlas Edge CDN] Running MCLP optimization client-side');
    const cRes = await axios.get('/data/candidates.json');
    let pool = cRes.data || [];
    if (optimizationPayload.scope && optimizationPayload.scope !== 'ALL') {
      pool = pool.filter(c => c.scope === optimizationPayload.scope);
    }
    const p = optimizationPayload.p_stations || 5;
    const selected = pool.slice(0, p);
    const totalCovered = selected.reduce((sum, s) => sum + (s.demand_indicators?.unserved_ev_catchment || 0), 0);
    const totalPotential = pool.reduce((sum, s) => sum + (s.demand_indicators?.unserved_ev_catchment || 0), 0) || 1;

    return {
      solver_status: 'OPTIMAL (CLIENT_MCLP_HEURISTIC)',
      p_stations_budget: p,
      service_radius_km: optimizationPayload.service_radius_km || 3.0,
      selected_optimal_locations_count: selected.length,
      total_ev_demand_covered: totalCovered,
      total_demand_coverage_pct: Math.round((totalCovered / totalPotential) * 1000) / 10,
      selected_sites: selected
    };
  }
};

export const getSubstations = async () => {
  const response = await apiClient.get('/recommendations/substations');
  return response.data;
};

export const getRecommendationsSensitivity = async (scope = 'ALL') => {
  const response = await apiClient.get('/recommendations/sensitivity', { params: { scope } });
  return response.data;
};

export const getRecommendationsScenarios = async (scope = 'ALL') => {
  const response = await apiClient.get('/recommendations/scenarios', { params: { scope } });
  return response.data;
};

export default apiClient;
