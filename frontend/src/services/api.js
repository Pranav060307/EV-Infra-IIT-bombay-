import axios from 'axios';

// Prioritize environment variable (e.g. on Vercel), fallback to relative /api/v1 in prod, or local port 8000 in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15s timeout
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

// Response interceptor with graceful error logging and proxy fallback
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || 'unknown';
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.message;

    console.warn(`[ChargeAtlas API Notice] ${status ? `HTTP ${status}` : 'Network Error'} on ${url}: ${detail}`);

    // If direct connection to http://localhost:8000 fails (e.g. ad-blocker or port isolation),
    // retry once via Vite's relative proxy path (/api/v1)
    if (!originalRequest._retry && (error.code === 'ERR_NETWORK' || error.message.includes('Network Error'))) {
      originalRequest._retry = true;
      if (originalRequest.baseURL && originalRequest.baseURL.includes(':8000')) {
        console.info(`[ChargeAtlas API Fallback] Retrying ${url} via Vite proxy /api/v1...`);
        originalRequest.baseURL = '/api/v1';
        return apiClient(originalRequest);
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

export const getDistrictAnalysis = async () => {
  const response = await apiClient.get('/gis/district-analysis');
  return response.data;
};

export const getPuneUrbanGrid = async (gridSizeMeters = 1000.0) => {
  const response = await apiClient.get('/gis/pune/grid', {
    params: { grid_size_meters: gridSizeMeters }
  });
  return response.data;
};

export const getSamruddhiCorridor = async (bufferKm = 20.0) => {
  const response = await apiClient.get('/gis/samruddhi/corridor', {
    params: { buffer_km: bufferKm }
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

export default apiClient;
