import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://194.163.173.179:7500',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let authStoreRef = null;

export const setAuthStoreRef = (store) => {
    authStoreRef = store;
};

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            let token = null;
            
            if (authStoreRef && authStoreRef.getState) {
                token = authStoreRef.getState().token;
            }
            
            if (!token) {
                token = await AsyncStorage.getItem('auth_token');
            }

            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
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