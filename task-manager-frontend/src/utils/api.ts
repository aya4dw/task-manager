import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const host = isLocalhost ? 'localhost' : window.location.hostname;

// API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalhost ? '/api/v1' : `http://${host}:3001/api/v1`);

// WebSocket path
export const WS_URL_PATH = '/ws';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Key storage
const API_KEY_KEY = 'task_manager_api_key';

// Get API Key from local storage
export const getApiKey = (): string => {
  return localStorage.getItem(API_KEY_KEY) || '';
};

// Set API Key
export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_KEY, key);
};

// Request interceptor - add API key
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = getApiKey();
    if (apiKey && config.headers) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = error.response?.data as { error?: { message?: string } };
    const message = apiError?.error?.message || error.message || '请求失败';
    
    if (window) {
      console.error('API Error:', message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
