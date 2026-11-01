import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    return {
      status: 'offline',
      service: 'ChargeAtlas Backend (Unreachable)',
      error: error.message
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

export default apiClient;
