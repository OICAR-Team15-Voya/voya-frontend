import { api } from '../lib/api';
import type { AuthResponse, User } from '../types';


interface LoginPayload {
  email: string;
  password: string;
}

interface AdminRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}



/**
 * Login + storage tokena.
 * Login response sadrži token i osnovne podatke o korisniku
 * koje pamtimo u localStorage-u za role checkove i UI personalizaciju.
 */
export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/voya/api/auth/login', payload);
    const data = response.data;

    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data));

    return data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  registerAdmin: async (payload: AdminRegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/voya/api/auth/adminRegister',
      payload,
    );
    return response.data;
  },
};


/**
 * Sve operacije nad korisnicima.
 * Backend endpointi su /voya/api/users/...
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

 updatePassword: async (
    id: number,
    payload: UpdatePasswordPayload,
  ): Promise<void> => {
    await api.put(`/voya/api/users/${id}/password`, payload);
  },
};

