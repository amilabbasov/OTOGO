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

      // Debug logları əlavə edirik
      console.log('--- Interceptor Request Start ---');
      console.log('Interceptor: Original Request URL:', config.url);
      console.log('Interceptor: Original Request Headers:', config.headers);
      console.log('Interceptor: Current Token in AsyncStorage:', token ? 'Exists' : 'Does NOT exist');


      if (PUBLIC_ENDPOINTS.includes(config.url || '')) {
        console.log('Interceptor: Endpoint is PUBLIC. Removing Authorization header if present.');
        delete config.headers.Authorization; // Public endpoint üçün tokeni sil
      } 
      else if (token) {
        console.log('Interceptor: Endpoint is PROTECTED. Adding Authorization header.');
        config.headers.Authorization = `Bearer ${token}`; // Qorunan endpoint üçün tokeni əlavə et
      } else {
        console.log('Interceptor: Endpoint is PROTECTED, but no token found.');
      }

      console.log('Interceptor: Final Request Headers:', config.headers);
      console.log('--- Interceptor Request End ---');

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
    console.log('--- Interceptor Response Error Start ---');
    console.log('Interceptor: Response Error Status:', error.response?.status);
    console.log('Interceptor: Response Error URL:', error.config?.url);
    console.log('Interceptor: Response Error Data:', error.response?.data);
    console.log('Interceptor: Response Error Headers:', error.response?.headers);

    if (error.response) {
      // Only clear auth for 401 errors or 403 errors on protected endpoints
      const isPublicEndpoint = PUBLIC_ENDPOINTS.includes(error.config?.url || '');
      
      if (error.response.status === 401) {
        console.log('Interceptor: 401 error detected. Clearing token from AsyncStorage and apiClient defaults.');
        await AsyncStorage.removeItem('userToken');
        delete apiClient.defaults.headers.common['Authorization'];
      } else if (error.response.status === 403 && !isPublicEndpoint) {
        console.log('Interceptor: 403 error on protected endpoint detected. Clearing token from AsyncStorage and apiClient defaults.');
        await AsyncStorage.removeItem('userToken');
        delete apiClient.defaults.headers.common['Authorization'];
          } else if (error.response.status === 403 && isPublicEndpoint) {
      console.log('Interceptor: 403 error on public endpoint detected. This might be rate limiting or validation error, not auth issue.');
      console.log('Interceptor: 403 error details - URL:', error.config?.url);
      console.log('Interceptor: 403 error details - Method:', error.config?.method);
      console.log('Interceptor: 403 error details - Data:', error.config?.data);
      console.log('Interceptor: 403 error details - Response status:', error.response?.status);
      console.log('Interceptor: 403 error details - Response status text:', error.response?.statusText);
      console.log('Interceptor: 403 error details - Response headers:', error.response?.headers);
    }
    }
    console.log('--- Interceptor Response Error End ---');
    return Promise.reject(error);
  }
);

export default apiClient;