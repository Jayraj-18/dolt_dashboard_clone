export type UserRole = 'user' | 'provider' | 'admin';
import {Booking} from "./booking";
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  fullName?: string; // Optional field for full name
    
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  bookings: Booking[];
  fetchBookings: (userId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  loadingBookings: boolean;
  handleAccept: (job: Booking) => Promise<void>;
  providerBookings: Booking[];
    loadingProviderBookings: boolean;
    loading: boolean;
    fetchBookingsProviders: (providerId: string) => Promise<void>;
    handleComplete: (jobId: string, providerId: string) => Promise<void>; // ⬅️ Add this line
}
