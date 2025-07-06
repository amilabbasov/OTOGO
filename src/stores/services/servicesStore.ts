import { create } from 'zustand';
import authService from '../../services/functions/authService';
import { Service } from '../../types/common';

interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

interface ServicesActions {
  fetchServices: () => Promise<void>;
  clearError: () => void;
}

type ServicesStore = ServicesState & ServicesActions;

const useServicesStore = create<ServicesStore>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.getServices();
      set({ 
        services: response.data, 
        isLoading: false, 
        error: null 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch services.';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      console.error('Error fetching services:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useServicesStore; 