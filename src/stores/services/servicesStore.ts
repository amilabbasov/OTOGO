import { create } from 'zustand';
import authService from '../../services/functions/authService';
import { Service, Tag } from '../../types/common';

interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  serviceTags: { [serviceId: number]: Tag[] };
  isLoadingTags: boolean;
}

interface ServicesActions {
  fetchServices: () => Promise<void>;
  fetchServiceTags: (serviceId: number) => Promise<void>;
  clearError: () => void;
}

type ServicesStore = ServicesState & ServicesActions;

const useServicesStore = create<ServicesStore>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,
  serviceTags: {},
  isLoadingTags: false,

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
    }
  },

  fetchServiceTags: async (serviceId: number) => {
    set({ isLoadingTags: true });
    try {
      const response = await authService.getServiceTags(serviceId);
      set(state => ({
        serviceTags: {
          ...state.serviceTags,
          [serviceId]: response.data
        },
        isLoadingTags: false
      }));
    } catch (error: any) {
      console.error('Failed to fetch tags for service:', serviceId, error);
      set({ isLoadingTags: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useServicesStore; 