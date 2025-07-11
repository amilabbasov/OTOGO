import apiClient from '../apiClient';

export type CarModel = {
  id: number;
  name: string;
  brandId: number;
};

export type CarBrand = {
  id: number;
  name: string;
};

const carService = {
  getBrands: async (): Promise<CarBrand[]> => {
    try {
      const response = await apiClient.get<CarBrand[]>('/api/brands');
      return response.data;
    } catch (error) {
      // Handle error explicitly
      throw error;
    }
  },
  getModels: async (): Promise<CarModel[]> => {
    try {
      const response = await apiClient.get<CarModel[]>('/api/models');
      return response.data;
    } catch (error) {
      // Handle error explicitly
      throw error;
    }
  },
  getModelsByBrand: async (brandId: number): Promise<CarModel[]> => {
    try {
      const response = await apiClient.get<CarModel[]>(`/api/models/by-brand/${brandId}`);
      return response.data;
    } catch (error) {
      // Handle error explicitly
      throw error;
    }
  },
  postCar: async (car: { name: string; brandId: number; modelId: number; year: number }): Promise<{ id: number; name: string; brandId: number; modelId: number; year: number }> => {
    try {
      const response = await apiClient.post('/api/cars', car);
      return response.data;
    } catch (error) {
      // Handle error explicitly
      throw error;
    }
  },
};

export default carService; 