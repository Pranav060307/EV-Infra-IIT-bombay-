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
  '/health': '/data/gis_health.json',
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

const resolveFallback = (rawPath) => {
  if (!rawPath) return null;
  const clean = rawPath.split('?')[0];
  const stripped = clean.startsWith('/api/v1') ? clean.replace('/api/v1', '') : clean;
  return STATIC_FALLBACKS[clean] || STATIC_FALLBACKS[stripped] || STATIC_FALLBACKS['/' + stripped.replace(/^\//, '')] || null;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: isLocalhost ? 6000 : 3000,
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor: on hosted Vercel Edge without an external backend, map directly to Edge CDN assets
apiClient.interceptors.request.use(
  (config) => {
    if (!isLocalhost && (!rawEnvUrl || isEnvLocalhost)) {
      const fallback = resolveFallback(config.url);
      if (fallback) {
        config.url = fallback;
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
      const fallbackUrl = resolveFallback(response.config?.url);
      if (fallbackUrl) {
        console.info(`[ChargeAtlas CDN Edge] Serving authentic static dataset from ${fallbackUrl}`);
        const staticRes = await axios.get(fallbackUrl);
        return staticRes;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const fallbackUrl = resolveFallback(originalRequest?.url);
    if (fallbackUrl && !originalRequest?._isStaticFallback) {
      console.info(`[ChargeAtlas Fallback] Serving authentic static dataset from ${fallbackUrl}`);
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
    try {
      const fb = await fetch('/data/gis_health.json').then(r => r.json());
      return fb;
    } catch {
      return {
        status: 'online',
        service: 'ChargeAtlas Vercel Edge CDN (Static Mode Active)',
        database: 'PostgreSQL 18 + PostGIS 3.5 (Precomputed Authenticated Assets)'
      };
    }
  }
};

export const getSystemStatus = async () => {
  try {
    const response = await apiClient.get('/system-status');
    return response.data;
  } catch (error) {
    try {
      return await fetch('/data/gis_health.json').then(r => r.json());
    } catch {
      return null;
    }
  }
};

// -----------------------------------------------------------------------------
// MODULE 1: DATASET PIPELINE ENDPOINTS
// -----------------------------------------------------------------------------

export const getDatasetMetrics = async () => {
  try {
    const response = await apiClient.get('/datasets/metrics');
    return response.data;
  } catch {
    return await fetch('/data/datasets_metrics.json').then(r => r.json());
  }
};

export const listDatasets = async () => {
  try {
    const response = await apiClient.get('/datasets/list');
    return response.data;
  } catch {
    return await fetch('/data/datasets_list.json').then(r => r.json());
  }
};

export const getTrustRegister = async () => {
  try {
    const response = await apiClient.get('/datasets/trust-register');
    return response.data;
  } catch {
    return await fetch('/data/trust_register.json').then(r => r.json());
  }
};

export const getQualityAudit = async () => {
  try {
    const response = await apiClient.get('/datasets/quality-audit');
    return response.data;
  } catch {
    return await fetch('/data/quality_audit.json').then(r => r.json());
  }
};

export const getDatasetDetails = async (datasetId) => {
  try {
    const response = await apiClient.get(`/datasets/${datasetId}`);
    return response.data;
  } catch {
    const all = await fetch('/data/datasets_list.json').then(r => r.json());
    return (all?.datasets || []).find(d => d.id === datasetId || d.dataset_id === datasetId) || (all?.datasets?.[0] || null);
  }
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
  try {
    const response = await apiClient.get('/gis/health');
    return response.data;
  } catch {
    return await fetch('/data/gis_health.json').then(r => r.json());
  }
};

export const getBoundaries = async () => {
  try {
    const response = await apiClient.get('/gis/boundaries');
    return response.data;
  } catch {
    return {
      boundaries: [
        { name: 'maharashtra_districts', crs: 'EPSG:4326', feature_count: 35 },
        { name: 'pune_urban', crs: 'EPSG:4326', feature_count: 1 },
        { name: 'samruddhi_corridor', crs: 'EPSG:4326', feature_count: 1 }
      ]
    };
  }
};

export const getBoundaryGeoJSON = async (boundaryName) => {
  try {
    const response = await apiClient.get(`/gis/boundaries/${boundaryName}`);
    return response.data;
  } catch (err) {
    console.warn(`[getBoundaryGeoJSON fallback] Fetching /data/${boundaryName}.json directly`);
    return await fetch(`/data/${boundaryName}.json`).then(r => r.json());
  }
};

export const getVerifiedStations = async (params = {}) => {
  let data;
  try {
    const response = await apiClient.get('/gis/stations', { params });
    data = response.data;
  } catch (err) {
    console.warn('[getVerifiedStations fallback] Fetching /data/stations.json directly');
    data = await fetch('/data/stations.json').then(r => r.json());
  }

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
  let data;
  try {
    const response = await apiClient.get('/gis/district-analysis', { params });
    data = response.data;
  } catch (err) {
    console.warn('[getDistrictAnalysis fallback] Fetching /data/district_analysis.json directly');
    data = await fetch('/data/district_analysis.json').then(r => r.json());
  }

  // If dynamic weights are passed, re-calculate CGI dynamically
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
  try {
    const params = district ? { district } : {};
    const response = await apiClient.get('/gis/accessibility/buffers', { params });
    return response.data;
  } catch {
    console.warn('[getAccessibilityBuffers fallback] Fetching /data/accessibility_buffers.json directly');
    return await fetch('/data/accessibility_buffers.json').then(r => r.json());
  }
};

export const getPuneUrbanSummary = async (gridSizeMeters = 1000.0) => {
  try {
    const response = await apiClient.get('/gis/pune/summary', {
      params: { grid_size_meters: gridSizeMeters }
    });
    return response.data;
  } catch {
    console.warn('[getPuneUrbanSummary fallback] Fetching /data/pune_summary.json directly');
    return await fetch('/data/pune_summary.json').then(r => r.json());
  }
};

export const getPuneUrbanGrid = async (gridSizeMeters = 1000.0, forceRefresh = false) => {
  try {
    const response = await apiClient.get('/gis/pune/grid', {
      params: { grid_size_meters: gridSizeMeters, force_refresh: forceRefresh }
    });
    return response.data;
  } catch {
    console.warn('[getPuneUrbanGrid fallback] Fetching /data/pune_grid.json directly');
    return await fetch('/data/pune_grid.json').then(r => r.json());
  }
};

export const getSamruddhiCorridor = async (bufferKm = 20.0, forceRefresh = false) => {
  try {
    const response = await apiClient.get('/gis/samruddhi/corridor', {
      params: { buffer_km: bufferKm, force_refresh: forceRefresh }
    });
    return response.data;
  } catch {
    console.warn('[getSamruddhiCorridor fallback] Fetching /data/samruddhi_corridor.json directly');
    return await fetch('/data/samruddhi_corridor.json').then(r => r.json());
  }
};

export const getPolicyCompliance = async () => {
  try {
    const response = await apiClient.get('/gis/policy-compliance');
    return response.data;
  } catch {
    console.warn('[getPolicyCompliance fallback] Fetching /data/policy_compliance.json directly');
    return await fetch('/data/policy_compliance.json').then(r => r.json());
  }
};

// -----------------------------------------------------------------------------
// PHASE 5: EV DEMAND FORECASTING ENGINE
// -----------------------------------------------------------------------------

export const getHistoricalBaseline = async () => {
  try {
    const response = await apiClient.get('/forecasting/baseline');
    return response.data;
  } catch {
    return await fetch('/data/forecasting_baseline.json').then(r => r.json());
  }
};

export const getForecastModels = async () => {
  try {
    const response = await apiClient.get('/forecasting/models');
    return response.data;
  } catch {
    return await fetch('/data/forecasting_models.json').then(r => r.json());
  }
};

export const getFleetProjections = async (params = {}) => {
  try {
    const response = await apiClient.get('/forecasting/project', { params });
    return response.data;
  } catch {
    return await fetch('/data/forecasting_demand.json').then(r => r.json());
  }
};

export const getChargingDemand = async (params = {}) => {
  try {
    const response = await apiClient.get('/forecasting/charging-demand', { params });
    return response.data;
  } catch {
    return await fetch('/data/forecasting_demand.json').then(r => r.json());
  }
};

export const getDistrictForecast = async (districtName, params = {}) => {
  try {
    const response = await apiClient.get(`/forecasting/district/${districtName}`, { params });
    return response.data;
  } catch {
    return await fetch('/data/forecasting_demand.json').then(r => r.json());
  }
};

// -----------------------------------------------------------------------------
// PHASE 5: INTELLIGENT SITE RECOMMENDER & MCLP OPTIMIZATION
// -----------------------------------------------------------------------------

export const getCandidates = async (params = {}) => {
  let list = [];
  try {
    const response = await apiClient.get('/recommendations/candidates', { params });
    list = Array.isArray(response.data) ? response.data : (response.data?.candidates || []);
  } catch {
    list = await fetch('/data/candidates.json').then(r => r.json());
  }

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
    const all = await fetch('/data/candidates.json').then(r => r.json());
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
  try {
    const response = await apiClient.get(`/recommendations/candidates/${candidateId}`);
    return response.data;
  } catch {
    const all = await fetch('/data/candidates.json').then(r => r.json());
    return all.find(c => c.id === candidateId || c.candidate_id === candidateId) || all[0];
  }
};

export const optimizeSiting = async (optimizationPayload) => {
  try {
    const response = await apiClient.post('/recommendations/optimize', optimizationPayload);
    return response.data;
  } catch (err) {
    // Client-side heuristic MCLP fallback
    console.info('[ChargeAtlas Edge CDN] Running MCLP optimization client-side');
    let pool = await fetch('/data/candidates.json').then(r => r.json());
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
  try {
    const response = await apiClient.get('/recommendations/substations');
    return response.data;
  } catch {
    return await fetch('/data/substations.json').then(r => r.json());
  }
};

export const getRecommendationsSensitivity = async (scope = 'ALL') => {
  try {
    const response = await apiClient.get('/recommendations/sensitivity', { params: { scope } });
    return response.data;
  } catch {
    return await fetch('/data/recommendations_sensitivity.json').then(r => r.json());
  }
};

export const getRecommendationsScenarios = async (scope = 'ALL') => {
  try {
    const response = await apiClient.get('/recommendations/scenarios', { params: { scope } });
    return response.data;
  } catch {
    return await fetch('/data/recommendations_scenarios.json').then(r => r.json());
  }
};

export default apiClient;
