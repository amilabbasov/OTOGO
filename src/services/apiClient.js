import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://194.163.173.179:7500',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const PUBLIC_ENDPOINTS = [
  '/api/auth/login',

  '/api/drivers',
  '/api/company-providers',
  '/api/individual-providers',

  '/api/drivers/verify',
  '/api/company-providers/verify',
  '/api/individual-providers/verify',

  '/api/passwords/reset-request',
  '/api/passwords/validate-token',
  '/api/passwords/update-password',

  '/api/drivers/auth/resend-code',
  '/api/company-providers/auth/resend-code',
  '/api/individual-providers/auth/resend-code',
  '/api/passwords/auth/resend-code',

  '/api/services',
];

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (PUBLIC_ENDPOINTS.includes(config.url || '')) {
        delete config.headers.Authorization;
      } 
      else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
    } catch (error) {
      console.error("Axios Interceptor Request Error:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const isPublicEndpoint = PUBLIC_ENDPOINTS.includes(error.config?.url || '');
      
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('userToken');
        delete apiClient.defaults.headers.common['Authorization'];
      } else if (error.response.status === 403 && !isPublicEndpoint) {
        await AsyncStorage.removeItem('userToken');
        delete apiClient.defaults.headers.common['Authorization'];
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;