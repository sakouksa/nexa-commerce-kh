import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useLanguage } from '@/i18n';

function hexToHsl(hex: string): string {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }
  if (hex.length !== 6) return '330 81% 60%';

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const H = Math.round(h * 360);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);

  return `${H} ${S}% ${L}%`;
}

function hexToRgba(hex: string, alpha: number): string {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }
  if (hex.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const getRadiusVal = (r?: string) => {
  if (!r) return '0.75rem';
  if (r === 'rounded-none') return '0px';
  if (r === 'rounded-sm') return '0.125rem';
  if (r === 'rounded' || r === 'rounded-md' || r === '0.375rem') return '0.375rem';
  if (r === 'rounded-lg' || r === '0.5rem') return '0.5rem';
  if (r === 'rounded-xl' || r === '0.75rem') return '0.75rem';
  if (r === 'rounded-2xl' || r === '1rem') return '1rem';
  if (r === 'rounded-3xl' || r === '1.5rem') return '1.5rem';
  if (r === 'rounded-full' || r === 'rounded-pill') return '9999px';
  if (r.endsWith('px') || r.endsWith('rem') || r.endsWith('%')) return r;
  return '0.75rem';
};

const getShadowVal = (shadow?: string, darkMode?: boolean) => {
  if (!shadow || shadow === 'none') return 'none';

  if (darkMode) {
    switch (shadow) {
      case 'sm':
        return '0 3px 12px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.3)';
      case 'md':
        return '0 8px 24px -2px rgba(0, 0, 0, 0.7), 0 4px 10px -2px rgba(0, 0, 0, 0.5)';
      case 'lg':
        return '0 18px 45px -4px rgba(0, 0, 0, 0.9), 0 8px 18px -4px rgba(0, 0, 0, 0.7)';
      default:
        return '0 3px 12px rgba(0, 0, 0, 0.45)';
    }
  }

  switch (shadow) {
    case 'sm':
      return '0 2px 8px -1px rgba(0, 0, 0, 0.09), 0 1px 4px -1px rgba(0, 0, 0, 0.06)';
    case 'md':
      return '0 6px 20px -2px rgba(0, 0, 0, 0.16), 0 3px 8px -2px rgba(0, 0, 0, 0.1)';
    case 'lg':
      return '0 16px 36px -4px rgba(0, 0, 0, 0.28), 0 6px 16px -3px rgba(0, 0, 0, 0.16)';
    default:
      return '0 2px 8px -1px rgba(0, 0, 0, 0.09)';
  }
};

export const ThemeSynchronizer: React.FC = () => {
  const customizer = useThemeStore();
  const { isKhmer } = useLanguage();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Language-based Font dynamic configuration
    const activeFont =
      customizer.font.family !== 'Default'
        ? customizer.font.family
        : isKhmer
        ? "'Kantumruy Pro', sans-serif"
        : "'Inter', sans-serif";

    root.style.setProperty('--font-sans', activeFont);
    root.style.setProperty('font-size', customizer.font.size);
    root.style.setProperty('font-weight', customizer.font.weight);
    root.style.setProperty('line-height', customizer.font.lineHeight);
    root.style.setProperty('letter-spacing', customizer.font.letterSpacing);

    // 2. Dark/Light/System Mode
    const isDark =
      customizer.themeMode === 'dark' ||
      (customizer.themeMode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);

    // 3. Primary Color & Fallbacks
    root.style.setProperty('--primary', hexToHsl(customizer.primaryColor));
    root.style.setProperty('--primary-hex', customizer.primaryColor);
    root.style.setProperty('--primary-color', customizer.primaryColor);
    root.style.setProperty('--ring', hexToHsl(customizer.primaryColor));
    root.style.setProperty('--primary-foreground', '0 0% 100%');

    // 4. Border Radii & Layout Settings
    root.style.setProperty('--radius', customizer.layout.cardRadius);
    root.style.setProperty('--table-radius', customizer.layout.tableRadius);
    root.style.setProperty('--button-radius', customizer.layout.buttonRadius);
    root.style.setProperty('--input-radius', customizer.layout.inputRadius);
    root.style.setProperty('--modal-radius', customizer.layout.modalRadius);
    root.style.setProperty('--drawer-radius', customizer.layout.drawerRadius);
    root.style.setProperty('--container-padding', customizer.layout.padding);

    // 5. Sidebar Styles
    const sidebarActiveBg = customizer.sidebar.activeBgColor || customizer.primaryColor;
    root.style.setProperty('--sidebar-bg', customizer.sidebar.bgColor);
    root.style.setProperty('--sidebar-text', customizer.sidebar.textColor);
    root.style.setProperty('--sidebar-active-bg', sidebarActiveBg);
    root.style.setProperty('--sidebar-active-text', customizer.sidebar.activeTextColor || '#ffffff');
    root.style.setProperty('--sidebar-hover-bg', customizer.sidebar.hoverBgColor);
    root.style.setProperty('--sidebar-hover-text', customizer.sidebar.hoverTextColor);
    root.style.setProperty('--sidebar-border', customizer.sidebar.borderColor);
    root.style.setProperty('--sidebar-width', `${customizer.sidebar.width}px`);
    root.style.setProperty('--sidebar-radius', getRadiusVal(customizer.sidebar.roundedStyle));

    // 6. Navbar Styles
    root.style.setProperty(
      '--navbar-bg',
      hexToRgba(customizer.navbar.bgColor, customizer.navbar.transparency)
    );
    root.style.setProperty('--navbar-text', customizer.navbar.textColor);
    root.style.setProperty('--navbar-border', customizer.navbar.borderColor);
    root.style.setProperty('--navbar-height', `${customizer.navbar.height}px`);
    root.style.setProperty('--navbar-shadow', getShadowVal(customizer.navbar.shadow, isDark));

    // 7. Cards
    root.style.setProperty('--card-bg', customizer.card.bgColor);
    root.style.setProperty('--card-border', customizer.card.borderColor);

    // 8. Buttons
    root.style.setProperty('--btn-primary', hexToHsl(customizer.button.primaryColor));
    root.style.setProperty('--btn-primary-hex', customizer.button.primaryColor);
    root.style.setProperty('--btn-secondary', hexToHsl(customizer.button.secondaryColor));
    root.style.setProperty('--btn-danger', hexToHsl(customizer.button.dangerColor));
    root.style.setProperty('--btn-success', hexToHsl(customizer.button.successColor));

    // 9. Tables
    root.style.setProperty('--table-header-bg', customizer.table.headerBgColor);
    root.style.setProperty('--table-header-text', customizer.table.headerTextColor);
    root.style.setProperty('--table-hover-bg', customizer.table.hoverBgColor);
    root.style.setProperty('--table-border', customizer.table.borderColor);

    // 10. Forms
    root.style.setProperty('--input-border', customizer.form.inputBorderColor);
    root.style.setProperty('--input-focus', hexToHsl(customizer.form.focusRingColor));
    root.style.setProperty('--label-weight', customizer.form.labelWeight);
    root.style.setProperty('--placeholder-color', customizer.form.placeholderColor);
  }, [customizer, isKhmer]);

  return null;
};

export default ThemeSynchronizer;

