import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UIState {
  themeMode: ThemeMode;
  sidebarCollapsed: boolean;
  primaryColor: string;
  activeModal: string | null;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setPrimaryColor: (color: string) => void;
  setActiveModal: (modal: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      themeMode: 'light',
      sidebarCollapsed: false,
      primaryColor: '#4f46e5',
      activeModal: null,

      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
        const isDark =
          mode === 'dark' ||
          (mode === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', isDark);
        }
      },

      toggleTheme: () => {
        const current = get().themeMode;
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        get().setThemeMode(next);
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sidebar_collapsed', String(collapsed));
        }
      },

      toggleSidebar: () => {
        const next = !get().sidebarCollapsed;
        get().setSidebarCollapsed(next);
      },

      setPrimaryColor: (color: string) => {
        set({ primaryColor: color });
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--primary-color', color);
        }
      },

      setActiveModal: (modal: string | null) => set({ activeModal: modal }),
    }),
    {
      name: 'ministore-ui-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUIStore;
