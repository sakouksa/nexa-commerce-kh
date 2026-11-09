import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English bundles
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enNav from '../locales/en/nav.json';
import enDashboard from '../locales/en/dashboard.json';
import enShops from '../locales/en/shops.json';
import enUsers from '../locales/en/users.json';
import enResellers from '../locales/en/resellers.json';
import enBackup from '../locales/en/backup.json';
import enLogs from '../locales/en/logs.json';
import enSettings from '../locales/en/settings.json';
import enButtons from '../locales/en/buttons.json';
import enTables from '../locales/en/tables.json';
import enForms from '../locales/en/forms.json';
import enPagination from '../locales/en/pagination.json';
import enToast from '../locales/en/toast.json';
import enCategories from '../locales/en/categories.json';

// Khmer bundles
import khCommon from '../locales/kh/common.json';
import khAuth from '../locales/kh/auth.json';
import khNav from '../locales/kh/nav.json';
import khDashboard from '../locales/kh/dashboard.json';
import khShops from '../locales/kh/shops.json';
import khUsers from '../locales/kh/users.json';
import khResellers from '../locales/kh/resellers.json';
import khBackup from '../locales/kh/backup.json';
import khLogs from '../locales/kh/logs.json';
import khSettings from '../locales/kh/settings.json';
import khButtons from '../locales/kh/buttons.json';
import khTables from '../locales/kh/tables.json';
import khForms from '../locales/kh/forms.json';
import khPagination from '../locales/kh/pagination.json';
import khToast from '../locales/kh/toast.json';
import khCategories from '../locales/kh/categories.json';

export const defaultNS = 'translation';

const enTranslation = {
  ...enCommon,
  common: enCommon,
  auth: enAuth,
  nav: enNav,
  dashboard: enDashboard,
  shops: enShops,
  users: enUsers,
  resellers: enResellers,
  backup: enBackup,
  logs: enLogs,
  settings: enSettings,
  buttons: enButtons,
  tables: enTables,
  forms: enForms,
  pagination: enPagination,
  toast: enToast,
  categories: enCategories,
};

const khTranslation = {
  ...khCommon,
  common: khCommon,
  auth: khAuth,
  nav: khNav,
  dashboard: khDashboard,
  shops: khShops,
  users: khUsers,
  resellers: khResellers,
  backup: khBackup,
  logs: khLogs,
  settings: khSettings,
  buttons: khButtons,
  tables: khTables,
  forms: khForms,
  pagination: khPagination,
  toast: khToast,
  categories: khCategories,
};

export const resources = {
  en: {
    translation: enTranslation,
    common: enCommon,
    auth: enAuth,
    nav: enNav,
    dashboard: enDashboard,
    shops: enShops,
    users: enUsers,
    resellers: enResellers,
    backup: enBackup,
    logs: enLogs,
    settings: enSettings,
    buttons: enButtons,
    tables: enTables,
    forms: enForms,
    pagination: enPagination,
    toast: enToast,
    categories: enCategories,
  },
  kh: {
    translation: khTranslation,
    common: khCommon,
    auth: khAuth,
    nav: khNav,
    dashboard: khDashboard,
    shops: khShops,
    users: khUsers,
    resellers: khResellers,
    backup: khBackup,
    logs: khLogs,
    settings: khSettings,
    buttons: khButtons,
    tables: khTables,
    forms: khForms,
    pagination: khPagination,
    toast: khToast,
    categories: khCategories,
  },
} as const;

// Flatten lookup dictionaries for bidirectional translation (English <-> Khmer)
let enToKhDict: Record<string, string> = {};
let enToKhLowerDict: Record<string, string> = {};
let khToEnDict: Record<string, string> = {};
let khToEnLowerDict: Record<string, string> = {};

function buildDict(enObj: any, khObj: any) {
  if (!enObj || !khObj) return;
  for (const key of Object.keys(enObj)) {
    const enVal = enObj[key];
    const khVal = khObj[key];
    if (typeof enVal === 'string' && typeof khVal === 'string') {
      const enTrim = enVal.trim();
      const khTrim = khVal.trim();
      
      enToKhDict[enTrim] = khTrim;
      enToKhLowerDict[enTrim.toLowerCase()] = khTrim;
      enToKhDict[key] = khTrim;
      enToKhLowerDict[key.toLowerCase()] = khTrim;

      khToEnDict[khTrim] = enTrim;
      khToEnLowerDict[khTrim.toLowerCase()] = enTrim;
      khToEnDict[key] = enTrim;
      khToEnLowerDict[key.toLowerCase()] = enTrim;
    } else if (typeof enVal === 'object' && typeof khVal === 'object') {
      buildDict(enVal, khVal);
    }
  }
}

export function refreshActiveDict(_lng?: string) {
  enToKhDict = {};
  enToKhLowerDict = {};
  khToEnDict = {};
  khToEnLowerDict = {};

  const enResources = resources.en;
  const khResources = resources.kh;

  for (const ns of Object.keys(enResources) as (keyof typeof enResources)[]) {
    buildDict(enResources[ns], khResources[ns]);
  }
}

export function translateString(text: string, targetLang?: 'en' | 'kh'): string {
  if (!text) return text;
  const currentLang = targetLang || (i18n.language === 'en' ? 'en' : 'kh');

  // 1. Check i18n resource keys first
  if (i18n.isInitialized) {
    const tVal = i18n.t(text as any, { lng: currentLang });
    if (typeof tVal === 'string' && tVal && tVal !== text) {
      return tVal;
    }
    if (text.includes('.')) {
      const colonKey = text.replace('.', ':');
      const colonVal = i18n.t(colonKey as any, { lng: currentLang });
      if (typeof colonVal === 'string' && colonVal && colonVal !== colonKey && colonVal !== text) {
        return colonVal;
      }
    }
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const lead = text.match(/^\s*/)?.[0] || '';
  const trail = text.match(/\s*$/)?.[0] || '';

  // 2. Bidirectional translation
  if (currentLang === 'kh') {
    if (enToKhDict[trimmed]) return lead + enToKhDict[trimmed] + trail;
    if (enToKhLowerDict[lower]) return lead + enToKhLowerDict[lower] + trail;
  } else {
    if (khToEnDict[trimmed]) return lead + khToEnDict[trimmed] + trail;
    if (khToEnLowerDict[lower]) return lead + khToEnLowerDict[lower] + trail;
  }

  return text;
}

const savedLang = localStorage.getItem('admin_language') || localStorage.getItem('i18nextLng') || 'kh';
const initialLang = savedLang.startsWith('en') ? 'en' : 'kh';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    defaultNS: 'translation',
    fallbackNS: ['common', 'auth', 'nav', 'dashboard', 'shops', 'users', 'resellers', 'backup', 'logs', 'settings', 'buttons', 'tables', 'forms', 'pagination', 'toast'],
    keySeparator: '.',
    interpolation: {
      escapeValue: false,
    },
  });

refreshActiveDict(initialLang);

i18n.on('languageChanged', (lng) => {
  refreshActiveDict(lng);
  const normalized = lng === 'en' ? 'en' : 'kh';
  localStorage.setItem('admin_language', normalized);
  localStorage.setItem('i18nextLng', normalized);
});

export default i18n;
