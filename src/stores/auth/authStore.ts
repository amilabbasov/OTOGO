import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserType, AuthUser } from '../../types/common';
import axiosInstance from '../../services/axiosInstance';

export const validateUserRoles = (roles: string[]): 'driver' | 'provider' => {
  if (!roles || roles.length === 0) {
    throw new Error('User has no roles assigned');
  }

  // Direct role matches
  if (roles.includes('ROLE_PROVIDER')) return 'provider';
  if (roles.includes('ROLE_DRIVER')) return 'driver';
  
  const providerRoles = [
    'ROLE_UPDATE_PROVIDER',
    'ROLE_DELETE_PROVIDER',
    'ROLE_CREATE_PROVIDER',
    'ROLE_READ_PROVIDER',
    'ROLE_MANAGE_PROVIDER'
  ];
  
  const driverRoles = [
    'ROLE_UPDATE_DRIVER',
    'ROLE_DELETE_DRIVER',
    'ROLE_CREATE_DRIVER',
    'ROLE_READ_DRIVER',
    'ROLE_MANAGE_DRIVER'
  ];
  
  if (roles.some(role => providerRoles.includes(role))) {
    return 'provider';
  }
  
  if (roles.some(role => driverRoles.includes(role))) {
    return 'driver';
  }

  if (roles.includes('ROLE_LOGIN') || roles.includes('ROLE_USER')) {
    console.warn('Generic role detected, defaulting to driver:', roles);
    return 'driver';
  }

  throw new Error(`Invalid user roles: ${roles.join(', ')}. User must have either ROLE_DRIVER, ROLE_PROVIDER, or valid legacy roles.`);
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  userType: 'driver' | 'provider' | null;
  isLoading: boolean;
  checkToken: () => Promise<void>;
  clearAuth: () => Promise<void>;
  signup: (email: string, password: string, repeatPassword: string, userType: 'driver' | 'provider') => Promise<{ success: boolean; message?: string; requiresOTP?: boolean }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; userType?: 'driver' | 'provider' }>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const extractErrorMessage = (error: any): string => {
    if (!error) return 'Unknown error occurred';

    if (!error.response) {
      return 'Network error: Please check your internet connection';
    }

    const { data, status } = error.response;

    const statusMessages: { [key: number]: string } = {
      400: 'Invalid request data',
      401: 'Authentication failed',
      403: 'Access denied',
      404: 'Resource not found',
      422: 'Validation error',
      500: 'Server error occurred',
      503: 'Service unavailable'
    };

    if (data && typeof data === 'object') {
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

    return statusMessages[status] || `Request failed with status ${status}`;
  };

  const createUserFromResponse = (response: any, email: string, userType: 'driver' | 'provider'): AuthUser => ({
    id: response.id || response.username || email,
    phone: response.phone || null,
    email: response.email || email,
    userType,
    name: response.name || response.username || email,
  });

  const getUserTypeFromRoles = (roles: string[]): 'driver' | 'provider' => {
    return validateUserRoles(roles);
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

        if (!token[1]) {
          set({
            token: null,
            userType: null,
            user: null,
            isLoading: false
          });
          return;
        }

        const user = userData[1] ? JSON.parse(userData[1]) : null;
        set({
          token: token[1],
          userType: userType[1] as UserType | null,
          user,
          isLoading: false
        });
      } catch (error) {
        console.error('Error checking token:', error);
        set({ 
          token: null, 
          userType: null, 
          user: null, 
          isLoading: false 
        });
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

    signup: async (email: string, password: string, repeatPassword: string, userType: 'driver' | 'provider') => {
      set({ isLoading: true });

      try {
        const endpoint = userType === 'driver' ? 'api/drivers' : 'api/providers';
        const response = await axiosInstance.post(endpoint, {
          email,
          password,
          repeatPassword,
        });

        if (response.status >= 200 && response.status < 300) {
          if (response.data.message && response.data.message.includes('OTP') || response.data.otpSent) {
            set({ isLoading: false });
            return { success: true, requiresOTP: true };
          }
          else if (response.data.token) {
            const user = createUserFromResponse(response.data, email, userType);
            await storeAuthData(response.data.token, user, userType);

            set({ isLoading: false });
            return { success: true, requiresOTP: false };
          }
          else {
            set({ isLoading: false });
            return { success: true, requiresOTP: true };
          }
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

    login: async (email: string, password: string) => {
      set({ isLoading: true });

      try {
        await AsyncStorage.removeItem('auth_token');
        
        const loginData = { email, password };
        const response = await axiosInstance.post('api/auth/login', loginData);
        
        console.log('Token:', response.data.token);

        if (response.status === 200 && response.data.token) {
          try {
            const userType = getUserTypeFromRoles(response.data.roles);
            const user = createUserFromResponse(response.data, email, userType);

            await storeAuthData(response.data.token, user, userType);

            set({ isLoading: false });
            return { success: true, userType };
          } catch (roleError: any) {
            console.error('Role validation error:', roleError);
            set({ isLoading: false });

            await AsyncStorage.multiRemove(['auth_token', 'user_type', 'user_data']);

            return {
              success: false,
              message: 'Your account does not have the required permissions. Please contact support or register with the correct account type.'
            };
          }
        } else {
          set({ isLoading: false });
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