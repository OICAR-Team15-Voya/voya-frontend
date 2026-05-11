import { api } from '../lib/api';
import type { Driver } from '../types';

interface DriverCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  licenseValidUntil: string;
}

interface DriverUpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseValidUntil: string;
}

/**
 * Sve operacije nad vozačima.
 * Vozač je User s rolom DRIVER + zapis u drivers tablici.
 */
export const driverService = {
  getAll: async (): Promise<Driver[]> => {
    const response = await api.get<Driver[]>('/voya/api/drivers/all');
    return response.data;
  },

  getById: async (id: number): Promise<Driver> => {
    const response = await api.get<Driver>(`/voya/api/drivers/${id}`);
    return response.data;
  },

  create: async (payload: DriverCreatePayload): Promise<Driver> => {
    const response = await api.post<Driver>('/voya/api/drivers', payload);
    return response.data;
  },

  update: async (id: number, payload: DriverUpdatePayload): Promise<Driver> => {
    const response = await api.put<Driver>(`/voya/api/drivers/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/voya/api/drivers/${id}`);
  },
};