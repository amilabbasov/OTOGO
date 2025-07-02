import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserType, AuthUser } from '../../types/common';
import axiosInstance, { setAuthStoreRef } from '../../services/axiosInstance';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  userType: 'driver' | 'provider' | null;
  isLoading: boolean;
  checkToken: () => Promise<void>;
  clearAuth: () => Promise<void>;
  signup: (phone: string, password: string, repeatPassword: string, userType: 'driver' | 'provider') => Promise<{ success: boolean; message?: string }>;
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const extractErrorMessage = (error: any): string => {
    // Xəta yoxdursa
    if (!error) return 'Unknown error occurred';
    
    // Network xətası
    if (!error.response) {
      return 'Network error: Please check your internet connection';
    }
    
    const { data, status } = error.response;
    
    // Status-a görə default mesajlar
    const statusMessages: { [key: number]: string } = {
      400: 'Invalid request data',
      401: 'Authentication failed',
      403: 'Access denied',
      404: 'Resource not found',
      422: 'Validation error',
      500: 'Server error occurred',
      503: 'Service unavailable'
    };
    
    // Müxtəlif backend xəta formatlarını yoxla
    if (data) {
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
      
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
      
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(', ');
      }
      
      if (data.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors)
          .flat()
          .filter(msg => typeof msg === 'string' && msg.trim())
          .join(', ');
        if (errorMessages) return errorMessages;
      }
      
      if (typeof data.details === 'string' && data.details.trim()) {
        return data.details;
      }
      
      if (typeof data.msg === 'string' && data.msg.trim()) {
        return data.msg;
      }
      
      if (typeof data === 'string' && data.trim()) {
        return data;
      }
    }
    
    // Default status mesajı
    return statusMessages[status] || `Request failed with status ${status}`;
  };

  const createUserFromResponse = (response: any, phone: string, userType: 'driver' | 'provider'): AuthUser => ({
    id: response.username || phone,
    phone: response.username || phone,
    email: `${response.username || phone}@temp.com`,
    userType,
    name: response.username || phone,
  });

  const getUserTypeFromRoles = (roles: string[]): 'driver' | 'provider' => {
    if (roles?.includes('ROLE_PROVIDER')) return 'provider';
    if (roles?.includes('ROLE_DRIVER')) return 'driver';
    return 'driver'; 
  };

  const storeAuthData = async (token: string, user: AuthUser, userType: 'driver' | 'provider') => {
    await AsyncStorage.multiSet([
      ['auth_token', token],
      ['user_data', JSON.stringify(user)],
      ['user_type', userType]
    ]);
    set({ token, user, userType });
  };

  const store = {
    token: null,
    user: null,
    userType: null,
    isLoading: false,

    checkToken: async () => {
      set({ isLoading: true });
      try {
        const [token, userType, userData] = await AsyncStorage.multiGet([
          'auth_token',
          'user_type',
          'user_data'
        ]);

        const user = userData[1] ? JSON.parse(userData[1]) : null;
        set({
          token: token[1],
          userType: userType[1] as UserType | null,
          user,
          isLoading: false
        });
      } catch (error) {
        console.error('Error checking token:', error);
        set({ isLoading: false });
      }
    },

    clearAuth: async () => {
      try {
        await AsyncStorage.multiRemove(['auth_token', 'user_type', 'user_data']);
        set({ token: null, user: null, userType: null });
      } catch (error) {
        console.error('Error clearing auth:', error);
      }
    },

    signup: async (phone: string, password: string, repeatPassword: string, userType: 'driver' | 'provider') => {
      set({ isLoading: true });

      try {
        const endpoint = userType === 'driver' ? 'api/drivers' : 'api/providers';
        const response = await axiosInstance.post(endpoint, {
          phone,
          password,
          repeatPassword,
        });

        if (response.status === 200 && response.data.token) {
          const user = createUserFromResponse(response.data, phone, userType);
          await storeAuthData(response.data.token, user, userType);

          set({ isLoading: false });
          return { success: true };
        } else {
          set({ isLoading: false });
          // Response data-dan mesaj çıxar
          const errorMessage = response.data?.message || response.data?.error || 'Registration failed';
          return { success: false, message: errorMessage };
        }
      } catch (error: any) {
        console.error('Signup error:', error);
        set({ isLoading: false });
        return {
          success: false,
          message: extractErrorMessage(error)
        };
      }
    },

    login: async (phone: string, password: string) => {
      set({ isLoading: true });

      try {
        const response = await axiosInstance.post('api/auth/login', { phone, password });

        if (response.status === 200 && response.data.token) {
          const userType = getUserTypeFromRoles(response.data.roles);
          const user = createUserFromResponse(response.data, phone, userType);

          await storeAuthData(response.data.token, user, userType);

          set({ isLoading: false });
          return { success: true };
        } else {
          set({ isLoading: false });
          // Response data-dan mesaj çıxar
          const errorMessage = response.data?.message || response.data?.error || 'Invalid response from server';
          return { success: false, message: errorMessage };
        }
      } catch (error: any) {
        console.error('Login error:', error);
        set({ isLoading: false });
        return {
          success: false,
          message: extractErrorMessage(error)
        };
      }
    },
  };

  return store;
});

setAuthStoreRef(useAuthStore); 