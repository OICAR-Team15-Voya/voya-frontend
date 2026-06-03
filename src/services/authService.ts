import { api } from '../lib/api';
import type { AuthResponse } from '../types';

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