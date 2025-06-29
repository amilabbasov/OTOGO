import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserType, AuthUser } from '../../types/common';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  userType: 'customer' | 'provider' | null;
  isLoading: boolean;
  checkToken: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
  setUserType: (userType: 'customer' | 'provider') => Promise<void>;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  userType: null,
  isLoading: false,

  checkToken: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userType = await AsyncStorage.getItem('user_type') as UserType | null;
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : null;
      
      set({ token, userType, user, isLoading: false });
    } catch (error) {
      console.error('Error checking token:', error);
      set({ isLoading: false });
    }
  },

  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem('auth_token', token);
      set({ token });
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  setUser: async (user: AuthUser) => {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  setUserType: async (userType: 'customer' | 'provider') => {
    try {
      await AsyncStorage.setItem('user_type', userType);
      set({ userType });
    } catch (error) {
      console.error('Error setting user type:', error);
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
})); 