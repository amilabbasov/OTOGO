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

// List of endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/drivers',
  '/api/company-providers',
  '/api/individual-providers',
  '/api/drivers/complete-registration',
  '/api/company-providers/complete-registration-company',
  '/api/individual-providers/complete-registration-individual',
  '/api/passwords/reset-request',
  '/api/passwords/validate-token',
  '/api/passwords/update-password',
];

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
        config.url.includes(endpoint)
      );
      
      if (isPublicEndpoint) {
        delete config.headers.Authorization;
      } else {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Token alınarkən xəta baş verdi:", error);
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
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('userToken');
      } else if (error.response.status === 403) {
        await AsyncStorage.removeItem('userToken');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;