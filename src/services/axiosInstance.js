import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { DeviceEventEmitter } from 'react-native';

const axiosInstance = axios.create({
    baseURL: 'http://194.163.173.179:7500',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            
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

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.log('Authentication failed (401) - initiating logout process');
            
            try {
                await AsyncStorage.multiRemove(['auth_token', 'user_type', 'user_data']);
                
                DeviceEventEmitter.emit('FORCE_LOGOUT', {
                    reason: 'unauthorized',
                    message: 'Your session has expired. Please log in again.'
                });
                
            } catch (clearError) {
                console.error('Error clearing auth data on 401:', clearError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;