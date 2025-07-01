import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://194.163.173.179:7500/',
    timeout: 10000,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const tokenString = await AsyncStorage.getItem('auth_token');

            if (tokenString) {
                config.headers['Authorization'] = `Bearer ${tokenString}`;
            }
        } catch (error) {
            console.error('Error fetching auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;