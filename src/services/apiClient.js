// apiClient.ts
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
      const token = await AsyncStorage.getItem('userToken'); // Fixed: use 'userToken' instead of 'authToken'
      
      console.log('API Request interceptor:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isPublicEndpoint: PUBLIC_ENDPOINTS.includes(config.url || ''),
        headers: config.headers
      });

      if (token && !PUBLIC_ENDPOINTS.includes(config.url || '')) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API Request: Added Authorization header for private endpoint');
      } else if (PUBLIC_ENDPOINTS.includes(config.url || '')) {
        console.log('API Request: Public endpoint, no Authorization header needed');
      } else {
        console.log('API Request: No token available for private endpoint');
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
    console.log('API Response successful:', {
      url: response.config.url,
      status: response.status,
      data: response.data ? 'data present' : 'no data'
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn(`API Error ${error.response.status}: Token invalid or forbidden. Clearing token.`);
        await AsyncStorage.removeItem('userToken');
      }
    }
    console.error('API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default apiClient;