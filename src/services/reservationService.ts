import { api } from '../lib/api';
import type { Reservation, ReservationStatus } from '../types';

interface ReservationCreatePayload {
  userId: number;
  vehicleCategoryId: number;
  time: string;            // ISO datetime
  pickupLocation: string;
  dropoffLocation: string;
  passengerNumber?: number | null;
  luggageNumber?: number | null;
  welcomeSign?: string | null;
  additionalNotes?: string | null;
}

interface ReservationUpdatePayload {
  vehicleCategoryId: number;
  driverId?: number | null;
  vehicleId?: number | null;
  time: string;
  pickupLocation: string;
  dropoffLocation: string;
  passengerNumber?: number | null;
  luggageNumber?: number | null;
  welcomeSign?: string | null;
  additionalNotes?: string | null;
  status: ReservationStatus;
  price?: number | null;
  isPaid: boolean;
}

/**
 * Sve operacije nad rezervacijama.
 */
export const reservationService = {
  getAll: async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>('/voya/api/reservations/all');
    return response.data;
  },

  getById: async (id: number): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/voya/api/reservations/${id}`);
    return response.data;
  },

  getByUserId: async (userId: number): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>(`/voya/api/reservations/user/${userId}`);
    return response.data;
  },

  getMyRides: async (): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>('/voya/api/reservations/my-rides');
    return response.data;
  },

  create: async (payload: ReservationCreatePayload): Promise<Reservation> => {
    const response = await api.post<Reservation>('/voya/api/reservations', payload);
    return response.data;
  },

  update: async (id: number, payload: ReservationUpdatePayload): Promise<Reservation> => {
    const response = await api.put<Reservation>(`/voya/api/reservations/${id}`, payload);
    return response.data;
  },


  //treba doraditi patch
  setInProgress: async (id: number): Promise<void> => {
    await api.patch(`/voya/api/reservations/set-in-progress/${id}`);
  },

  setCompleted: async (id: number): Promise<void> => {
    await api.patch(`/voya/api/reservations/set-completed/${id}`);
  },

  cancel: async (id: number): Promise<void> => {
    await api.patch(`/voya/api/reservations/cancel/${id}`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/voya/api/reservations/${id}`);
  },
};