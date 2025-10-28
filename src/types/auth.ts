export type UserRole = 'user' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
 // login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}
