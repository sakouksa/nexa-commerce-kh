import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_WIDGETS_LIST } from '@/config/dashboardWidgets';

export interface FontConfig {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
}

export interface SidebarConfig {
  bgColor: string;
  textColor: string;
  activeBgColor: string;
  activeTextColor: string;
  hoverBgColor: string;
  hoverTextColor: string;
  borderColor: string;
  width: number;
  compact: boolean;
  collapsed: boolean;
  roundedStyle: string;
}

export interface NavbarConfig {
  bgColor: string;
  textColor: string;
  borderColor: string;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  transparency: number;
  height: number;
}

export interface LayoutConfig {
  contentWidth: 'full' | 'boxed';
  padding: string;
  cardRadius: string;
  tableRadius: string;
  buttonRadius: string;
  inputRadius: string;
  modalRadius: string;
  drawerRadius: string;
}

export interface CardConfig {
  bgColor: string;
  borderColor: string;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  radius: string;
  hoverEffect: boolean;
}

export interface ButtonConfig {
  primaryColor: string;
  secondaryColor: string;
  dangerColor: string;
  successColor: string;
  radius: string;
  size: 'sm' | 'md' | 'lg';
  hoverAnimation: boolean;
}

export interface TableConfig {
  rowHeight: 'compact' | 'comfortable' | 'spacious';
  headerBgColor: string;
  headerTextColor: string;
  zebraRows: boolean;
  hoverBgColor: string;
  borderColor: string;
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface FormConfig {
  inputRadius: string;
  inputBorderColor: string;
  focusRingColor: string;
  labelWeight: string;
  placeholderColor: string;
}

export interface IconConfig {
  size: number;
  style: 'stroke' | 'fill';
  color: string;
}

export interface WidgetConfig {
  id: string;
  visible: boolean;
  size: 'small' | 'medium' | 'large';
  order: number;
}

export interface ThemeState {
  themeMode: 'light' | 'dark' | 'system';
  language: 'en' | 'kh';
  primaryColor: string;

  font: FontConfig;
  sidebar: SidebarConfig;
  navbar: NavbarConfig;
  layout: LayoutConfig;
  card: CardConfig;
  button: ButtonConfig;
  table: TableConfig;
  form: FormConfig;
  icon: IconConfig;
  widgetsList: WidgetConfig[];

  setLanguage: (lang: 'en' | 'kh') => void;
  updateThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  updatePrimaryColor: (color: string) => void;
  updateFont: (config: Partial<FontConfig>) => void;
  updateSidebar: (config: Partial<SidebarConfig>) => void;
  updateNavbar: (config: Partial<NavbarConfig>) => void;
  updateLayout: (config: Partial<LayoutConfig>) => void;
  updateCard: (config: Partial<CardConfig>) => void;
  updateButton: (config: Partial<ButtonConfig>) => void;
  updateTable: (config: Partial<TableConfig>) => void;
  updateForm: (config: Partial<FormConfig>) => void;
  updateIcon: (config: Partial<IconConfig>) => void;
  updateWidgetsList: (widgets: WidgetConfig[]) => void;
  resetAll: () => void;
}

export function applyPrimaryCssVar(color: string) {
  if (typeof document === 'undefined' || !color) return;
  let c = color.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  document.documentElement.style.setProperty('--primary', `${hDeg} ${sPct}% ${lPct}%`);
  document.documentElement.style.setProperty('--ring', `${hDeg} ${sPct}% ${lPct}%`);
  document.documentElement.style.setProperty('--primary-hex', color);
  document.documentElement.style.setProperty('--sidebar-active-bg', color);
  document.documentElement.style.setProperty('--btn-primary-hex', color);
}

export function applyLayoutCssVars(layout: Partial<LayoutConfig>) {
  if (typeof document === 'undefined' || !layout) return;
  if (layout.cardRadius) document.documentElement.style.setProperty('--card-radius', layout.cardRadius);
  if (layout.tableRadius) document.documentElement.style.setProperty('--table-radius', layout.tableRadius);
  if (layout.buttonRadius) document.documentElement.style.setProperty('--button-radius', layout.buttonRadius);
  if (layout.inputRadius) document.documentElement.style.setProperty('--input-radius', layout.inputRadius);
  if (layout.modalRadius) document.documentElement.style.setProperty('--modal-radius', layout.modalRadius);
  if (layout.drawerRadius) document.documentElement.style.setProperty('--drawer-radius', layout.drawerRadius);
  if (layout.padding) document.documentElement.style.setProperty('--container-padding', layout.padding);
}

export function applyTableCssVars(table: Partial<TableConfig>) {
  if (typeof document === 'undefined' || !table) return;
  if (table.headerBgColor) document.documentElement.style.setProperty('--table-header-bg', table.headerBgColor);
  if (table.headerTextColor) document.documentElement.style.setProperty('--table-header-text', table.headerTextColor);
  if (table.hoverBgColor) document.documentElement.style.setProperty('--table-hover-bg', table.hoverBgColor);
  if (table.borderColor) document.documentElement.style.setProperty('--table-border', table.borderColor);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      language: 'kh',
      primaryColor: '#ec4899',

      font: {
        family: 'Default',
        size: '14px',
        weight: '400',
        lineHeight: '1.5',
        letterSpacing: '0px',
      },

      sidebar: {
        bgColor: '#0b1329',
        textColor: '#94a3b8',
        activeBgColor: '#ec4899',
        activeTextColor: '#ffffff',
        hoverBgColor: '#1e293b',
        hoverTextColor: '#ffffff',
        borderColor: '#1e293b',
        width: 260,
        compact: false,
        collapsed: false,
        roundedStyle: 'rounded-xl',
      },

      navbar: {
        bgColor: '#0f172a',
        textColor: '#f8fafc',
        borderColor: '#1e293b',
        shadow: 'sm',
        transparency: 1,
        height: 64,
      },

      layout: {
        contentWidth: 'full',
        padding: '1.5rem',
        cardRadius: '0.75rem',
        tableRadius: '0.5rem',
        buttonRadius: '0.5rem',
        inputRadius: '0.5rem',
        modalRadius: '0.75rem',
        drawerRadius: '0.75rem',
      },

      card: {
        bgColor: '#ffffff',
        borderColor: '#e2e8f0',
        shadow: 'sm',
        radius: '0.75rem',
        hoverEffect: true,
      },

      button: {
        primaryColor: '#ec4899',
        secondaryColor: '#64748b',
        dangerColor: '#ef4444',
        successColor: '#10b981',
        radius: '0.5rem',
        size: 'md',
        hoverAnimation: true,
      },

      table: {
        rowHeight: 'comfortable',
        headerBgColor: '#f8fafc',
        headerTextColor: '#475569',
        zebraRows: true,
        hoverBgColor: '#f1f5f9',
        borderColor: '#e2e8f0',
        density: 'comfortable',
      },

      form: {
        inputRadius: '0.5rem',
        inputBorderColor: '#cbd5e1',
        focusRingColor: '#ec4899',
        labelWeight: '500',
        placeholderColor: '#94a3b8',
      },

      icon: {
        size: 18,
        style: 'stroke',
        color: '#64748b',
      },

      widgetsList: DEFAULT_WIDGETS_LIST,

      setLanguage: (lang) => {
        set({ language: lang });
      },

      updateThemeMode: (mode) => {
        const isDark =
          mode === 'dark' ||
          (mode === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        set((s) => {
          let nextSidebar = { ...s.sidebar };
          let nextNavbar = { ...s.navbar };

          // Adaptive adaptation for light-panel templates (e.g. Pure Minimalist Snow & Rose Quartz Champagne)
          const sideLower = s.sidebar.bgColor?.toLowerCase();
          const navLower = s.navbar.bgColor?.toLowerCase();

          if (isDark) {
            // Pure Minimalist Snow adaptation to dark mode
            if (sideLower === '#ffffff' && navLower === '#ffffff') {
              nextSidebar = {
                ...nextSidebar,
                bgColor: '#0f172a',
                textColor: '#94a3b8',
                borderColor: '#1e293b',
              };
              nextNavbar = {
                ...nextNavbar,
                bgColor: '#1e293b',
                textColor: '#f8fafc',
                borderColor: '#334155',
              };
            }
            // Rose Champagne adaptation to dark mode
            if (sideLower === '#f8fafc' && (navLower === '#fff1f2' || navLower === '#ffffff')) {
              nextSidebar = {
                ...nextSidebar,
                bgColor: '#181014',
                textColor: '#fbcfe8',
                borderColor: '#2e1220',
              };
              nextNavbar = {
                ...nextNavbar,
                bgColor: '#2a121d',
                textColor: '#fce7f3',
                borderColor: '#4a1d30',
              };
            }
          } else {
            // Restore Pure Minimalist Snow when switching back to light mode
            if (sideLower === '#0f172a' && navLower === '#1e293b' && s.primaryColor === '#4f46e5') {
              nextSidebar = {
                ...nextSidebar,
                bgColor: '#ffffff',
                textColor: '#475569',
                borderColor: '#e2e8f0',
              };
              nextNavbar = {
                ...nextNavbar,
                bgColor: '#ffffff',
                textColor: '#0f172a',
                borderColor: '#e2e8f0',
              };
            }
            // Restore Rose Champagne when switching back to light mode
            if (sideLower === '#181014' && navLower === '#2a121d' && s.primaryColor === '#f43f5e') {
              nextSidebar = {
                ...nextSidebar,
                bgColor: '#f8fafc',
                textColor: '#475569',
                borderColor: '#e2e8f0',
              };
              nextNavbar = {
                ...nextNavbar,
                bgColor: '#fff1f2',
                textColor: '#881337',
                borderColor: '#fecdd3',
              };
            }
          }

          return {
            themeMode: mode,
            sidebar: nextSidebar,
            navbar: nextNavbar,
          };
        });

        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', isDark);
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
      },

      updatePrimaryColor: (color) => {
        applyPrimaryCssVar(color);
        set((s) => ({
          primaryColor: color,
          sidebar: { ...s.sidebar, activeBgColor: color },
          button: { ...s.button, primaryColor: color },
        }));
      },

      updateFont: (config) => set((s) => ({ font: { ...s.font, ...config } })),
      updateSidebar: (config) => set((s) => ({ sidebar: { ...s.sidebar, ...config } })),
      updateNavbar: (config) => set((s) => ({ navbar: { ...s.navbar, ...config } })),
      updateLayout: (config) =>
        set((s) => {
          const next = { ...s.layout, ...config };
          applyLayoutCssVars(next);
          return { layout: next };
        }),
      updateCard: (config) => set((s) => ({ card: { ...s.card, ...config } })),
      updateButton: (config) => set((s) => ({ button: { ...s.button, ...config } })),
      updateTable: (config) =>
        set((s) => {
          const next = { ...s.table, ...config };
          applyTableCssVars(next);
          return { table: next };
        }),
      updateForm: (config) => set((s) => ({ form: { ...s.form, ...config } })),
      updateIcon: (config) => set((s) => ({ icon: { ...s.icon, ...config } })),
      updateWidgetsList: (widgets) => set({ widgetsList: widgets }),

      resetAll: () => {
        applyPrimaryCssVar('#ec4899');
        set({
          themeMode: 'light',
          primaryColor: '#ec4899',
          font: {
            family: 'Default',
            size: '14px',
            weight: '400',
            lineHeight: '1.5',
            letterSpacing: '0px',
          },
          sidebar: {
            bgColor: '#0b1329',
            textColor: '#94a3b8',
            activeBgColor: '#ec4899',
            activeTextColor: '#ffffff',
            hoverBgColor: '#1e293b',
            hoverTextColor: '#ffffff',
            borderColor: '#1e293b',
            width: 260,
            compact: false,
            collapsed: false,
            roundedStyle: 'rounded-xl',
          },
          navbar: {
            bgColor: '#0f172a',
            textColor: '#f8fafc',
            borderColor: '#1e293b',
            shadow: 'sm',
            transparency: 1,
            height: 64,
          },
          layout: {
            contentWidth: 'full',
            padding: '1.5rem',
            cardRadius: '0.75rem',
            tableRadius: '0.5rem',
            buttonRadius: '0.5rem',
            inputRadius: '0.5rem',
            modalRadius: '0.75rem',
            drawerRadius: '0.75rem',
          },
          card: {
            bgColor: '#ffffff',
            borderColor: '#e2e8f0',
            shadow: 'sm',
            radius: '0.75rem',
            hoverEffect: true,
          },
          button: {
            primaryColor: '#ec4899',
            secondaryColor: '#64748b',
            dangerColor: '#ef4444',
            successColor: '#10b981',
            radius: '0.5rem',
            size: 'md',
            hoverAnimation: true,
          },
          table: {
            rowHeight: 'comfortable',
            headerBgColor: '#f8fafc',
            headerTextColor: '#475569',
            zebraRows: true,
            hoverBgColor: '#f1f5f9',
            borderColor: '#e2e8f0',
            density: 'comfortable',
          },
          form: {
            inputRadius: '0.5rem',
            inputBorderColor: '#cbd5e1',
            focusRingColor: '#ec4899',
            labelWeight: '500',
            placeholderColor: '#94a3b8',
          },
          icon: {
            size: 18,
            style: 'stroke',
            color: '#64748b',
          },
          widgetsList: DEFAULT_WIDGETS_LIST,
        });
      },
    }),
    {
      name: 'ministorekh-theme-customizer',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

