// services/apiClient.js
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

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request with token:', config.url, token.substring(0, 20) + '...');
      } else {
        console.log('Request without token:', config.url);
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
      console.error("API Xətası:", error.response.status, error.response.data);

      if (error.response.status === 401) {
        console.warn("401 Unauthorized: İstifadəçinin tokeni etibarsızdır. Çıxış edilir.");
        await AsyncStorage.removeItem('userToken');
        // Qeyd: Buraya naviqasiya kodu əlavə edə bilərsiniz (məsələn, login səhifəsinə yönləndirmək üçün)
      } else if (error.response.status === 403) {
        console.warn("403 Forbidden: İstifadəçinin tokeni etibarsızdır və ya yetkisi yoxdur.");
        console.log("Current headers:", error.config?.headers);
        await AsyncStorage.removeItem('userToken');
      }
    } else if (error.request) {
      console.error("Şəbəkə Xətası: Serverə çatıla bilmədi.", error.request);
    } else {
      console.error("Sorğu Qurulması Xətası:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;