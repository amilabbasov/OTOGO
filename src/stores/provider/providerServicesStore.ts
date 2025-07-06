import { create } from 'zustand';
import authService from '../../services/functions/authService';
import { Service } from '../../types/common';

interface ProviderServicesState {
  selectedServices: number[];
  isLoading: boolean;
  error: string | null;
}

interface ProviderServicesActions {
  updateServices: (serviceIds: number[], userType: 'individual_provider' | 'company_provider') => Promise<void>;
  setSelectedServices: (serviceIds: number[]) => void;
  clearError: () => void;
}

type ProviderServicesStore = ProviderServicesState & ProviderServicesActions;

const useProviderServicesStore = create<ProviderServicesStore>((set, get) => ({
  selectedServices: [],
  isLoading: false,
  error: null,

  updateServices: async (serviceIds: number[], userType: 'individual_provider' | 'company_provider') => {
    set({ isLoading: true, error: null });
    try {
      let response;
      
      if (userType === 'individual_provider') {
        response = await authService.updateIndividualProviderServices(serviceIds);
      } else {
        response = await authService.updateCompanyProviderServices(serviceIds);
      }
      
      set({ 
        selectedServices: serviceIds,
        isLoading: false, 
        error: null 
      });
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update services.';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      console.error('Error updating provider services:', error);
      throw error;
    }
  },

  setSelectedServices: (serviceIds: number[]) => {
    set({ selectedServices: serviceIds });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useProviderServicesStore; 