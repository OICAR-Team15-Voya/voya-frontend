import {api} from '../lib/api';
import type {VehicleCategory} from '../types';

interface VehicleCategoryPayload {
  name: string;
}

/**
 * Kategorije vozila (Sedan, Limuzina, Kombi, ...).
 */

export const vehicleCategoryService = {
  getAll: async (): Promise<VehicleCategory[]> => {
    const response = await api.get<VehicleCategory[]>('/voya/api/vehicle-categories');
    return response.data;
  },

    getById: async (id: number): Promise<VehicleCategory> => {
        const response = await api.get<VehicleCategory>(`/voya/api/vehicle-categories/${id}`);
        return response.data;
    },

    create: async (payload: VehicleCategoryPayload): Promise<VehicleCategory> => {
        const response = await api.post<VehicleCategory>('/voya/api/vehicle-categories', payload);
        return response.data;
    },

    update: async (id: number, payload: VehicleCategoryPayload): Promise<VehicleCategory> => {
        const response = await api.put<VehicleCategory>(`/voya/api/vehicle-categories/${id}`, payload);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/voya/api/vehicle-categories/${id}`);
    },
};