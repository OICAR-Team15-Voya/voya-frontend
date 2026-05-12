import { api } from '../lib/api';
import type { Vehicle } from '../types';

interface VehiclePayload {
  vehicleCategoryId: number;
  name: string;
  manufacturer: string;
  model: string;
  registration: string;
}

/**
 * Vozila iz flote — Mercedes S-Class, BMW 5 Series..
 * Svako vozilo pripada jednoj kategoriji.
 */
export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/voya/api/vehicles/all');
    return response.data;
  },

  getAllActive: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/voya/api/vehicles/all-active');
    return response.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/voya/api/vehicles/${id}`);
    return response.data;
  },

  create: async (payload: VehiclePayload): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/voya/api/vehicles', payload);
    return response.data;
  },

  update: async (id: number, payload: VehiclePayload): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/voya/api/vehicles/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/voya/api/vehicles/${id}`);
  },
};