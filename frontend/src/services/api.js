import axios from 'axios';

// Prioritize environment variable (e.g. on Vercel), fallback to relative /api/v1 in prod, or local port 8000 in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');

// Pre-computed authentic static datasets hosted on Vercel Edge CDN for sub-50ms instant loading
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
  timeout: 4000, // 4s timeout for responsive failover to CDN cache
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor for diagnostics
apiClient.interceptors.request.use(
  (config) => {
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

    // If live API is unreachable or times out (e.g. on Vercel deployment), serve authentic static dataset instantly
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
  return response.data;
};

export const getDistrictAnalysis = async (params = {}) => {
  const response = await apiClient.get('/gis/district-analysis', { params });
  return response.data;
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
  return response.data;
};

export const rescoreMCDA = async (weightsPayload) => {
  const response = await apiClient.post('/recommendations/mcda', weightsPayload);
  return response.data;
};

export const getCandidateDetails = async (candidateId) => {
  const response = await apiClient.get(`/recommendations/candidates/${candidateId}`);
  return response.data;
};

export const optimizeSiting = async (optimizationPayload) => {
  const response = await apiClient.post('/recommendations/optimize', optimizationPayload);
  return response.data;
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
