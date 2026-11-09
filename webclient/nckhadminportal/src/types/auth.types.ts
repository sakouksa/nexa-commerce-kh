import { User } from './user.types';

export interface AuthContextType {
  user: User | null;
  setAuth: (token: string, userData: User) => void;
  logout: () => void;
}
