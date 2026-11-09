import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';
import { AuthUser } from '../types/auth.types';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  updateUser: (partialUser: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: storage.getUser<AuthUser>(),
      token: storage.getToken(),
      isAuthenticated: Boolean(storage.getToken()),

      setAuth: (user: AuthUser, token: string) => {
        storage.setUser(user);
        storage.setToken(token);
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (partialUser: Partial<AuthUser>) => {
        set((state) => {
          if (!state.user) return state;
          const updated = { ...state.user, ...partialUser };
          storage.setUser(updated);
          return { user: updated };
        });
      },

      logout: () => {
        storage.clearAuth();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'ministore-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Backward compatible re-exports
export { useAuth, AuthProvider } from '../contexts/AuthContext';
export default useAuthStore;
