import { api } from '../lib/api';
import type { User } from '../types';

/**
 * Sve operacije nad korisnicima.
 * Backend endpointi su pod /voya/api/users/...
 */
export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/voya/api/users/all');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/voya/api/users/${id}`);
    return response.data;
  },

  activate: async (id: number): Promise<void> => {
    await api.put(`/voya/api/users/${id}/activate`);
  },

  deactivate: async (id: number): Promise<void> => {
    await api.put(`/voya/api/users/${id}/deactivate`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/voya/api/users/${id}`);
  },
};