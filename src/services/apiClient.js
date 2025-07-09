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
  '/api/auth/logout',

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
      
      if (token && !PUBLIC_ENDPOINTS.includes(config.url || '')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('API Request interceptor error:', error);
    }
    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        await AsyncStorage.removeItem('userToken');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;