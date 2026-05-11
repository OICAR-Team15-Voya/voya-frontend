// Centralizirani TypeScript tipovi za sve entitete koje backend vraća.
// Svaka stranica importa iz ovog filea, a ne direktno iz komponenti ili servisa, radi lakše održivosti i boljeg tipiziranja.

export type Role = 'ADMIN' | 'CLIENT' | 'DRIVER';

export type ReservationStatus =
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  role: Role;
  status: boolean;
}

export interface Driver {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseValidUntil: string;
}

export interface VehicleCategory {
  id: number;
  name: string;
}

export interface Vehicle {
  id: number;
  vehicleCategoryId: number;
  categoryName: string;
  name: string | null;
  manufacturer: string;
  model: string;
  registration: string;
  active: boolean;
}

export interface Reservation {
  id: number;

  // User
  userId: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;

  // Vehicle category
  vehicleCategoryId: number;
  vehicleCategoryName: string;

  // Driver (nullable)
  driverId: number | null;
  driverFirstName: string | null;
  driverLastName: string | null;

  // Vehicle (nullable)
  vehicleId: number | null;
  vehicleName: string | null;
  vehicleRegistration: string | null;

  // Reservation details
  time: string;
  pickupLocation: string;
  dropoffLocation: string;
  passengerNumber: number | null;
  luggageNumber: number | null;
  welcomeSign: string | null;
  additionalNotes: string | null;
  status: ReservationStatus;

  // Payment
  price: number | null;
  isPaid: boolean;
}

// Auth — što backend vraća na login/register
export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string | null;
  role: Role;
}