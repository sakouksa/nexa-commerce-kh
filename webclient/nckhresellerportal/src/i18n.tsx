import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export const en = {
  // Auth
  'auth.loginTitle': 'Sign in to Merchant Portal',
  'auth.loginSubtitle': 'Manage your shop products, orders, POS & ABA KHQR payments.',
  'auth.emailOrUsername': 'Email address or Username',
  'auth.emailPlaceholder': 'Enter your email address',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': '••••••••••••••••',
  'auth.rememberMe': 'Remember Me',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.signIn': 'Sign in to Merchant Portal',
  'auth.signingIn': 'Signing in...',
  'auth.noAccount': "Don't have a merchant account?",
  'auth.contactAdmin': 'Contact Admin',
  'auth.or': 'or',
  'auth.signInGoogle': 'Sign in with google',
  'auth.accountLocked': 'Account locked',
  'auth.lockedWait': 'Try again in',
  'auth.attemptsRemaining': 'attempt(s) left before account is locked',
  'auth.enterCredentials': 'Please enter email or username and password',
  'auth.merchantOnly': 'This panel is for shop owners and staff only',
  'auth.forgotPrompt': 'Forgot password? Please contact administrator via Telegram @your_telegram',
  'auth.welcomeBack': 'Welcome back!',
  'auth.demoMerchant': 'Filled Merchant Demo credentials',
  'auth.demoStaff': 'Filled Staff Demo credentials',

  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.pos': 'POS Sale',
  'nav.products': 'Products',
  'nav.categories': 'Categories',
  'nav.stock': 'Stock',
  'nav.orders': 'Orders',
  'nav.customers': 'Customers',
  'nav.reports': 'Reports',
  'nav.receipts': 'Receipts',
  'nav.settings': 'Shop Settings',
  'nav.payment': 'Payment (ABA Pay)',
  'nav.telegram': 'Telegram Bot',
  'nav.backup': 'Backup & Import',
  'nav.upgrade': 'Upgrade Plan',
  'nav.logout': 'Logout',
  'nav.myShop': 'My Shop',
  'nav.shopDashboard': 'Shop Dashboard',
  'nav.shopNumber': 'Shop #',

  // Common
  'common.search': 'Search...',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.status': 'Status',
  'common.active': 'Active',
  'common.inactive': 'Inactive',
  'common.actions': 'Actions',
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.loading': 'Loading...',
  'common.noData': 'No data found',
  'common.success': 'Success',
  'common.error': 'Error',
  'common.warning': 'Warning',
  'common.info': 'Information',
  'common.theme': 'Theme',
  'common.light': 'Light',
  'common.dark': 'Dark',
  'common.language': 'Language',
};

export const kh: typeof en = {
  // Auth
  'auth.loginTitle': 'ចូលគ្រប់គ្រងហាង (Merchant Portal)',
  'auth.loginSubtitle': 'គ្រប់គ្រងផលិតផល ការបញ្ជាទិញ ប្រព័ន្ធគិតលុយ POS និងការទូទាត់ ABA KHQR។',
  'auth.emailOrUsername': 'អ៊ីមែល ឬ ឈ្មោះគណនី (Email / Username)',
  'auth.emailPlaceholder': 'បញ្ចូលអ៊ីមែល ឬ ឈ្មោះគណនីរបស់អ្នក',
  'auth.password': 'ពាក្យសម្ងាត់ (Password)',
  'auth.passwordPlaceholder': '••••••••••••••••',
  'auth.rememberMe': 'ចងចាំគណនីខ្ញុំ (Remember Me)',
  'auth.forgotPassword': 'ភ្លេចពាក្យសម្ងាត់?',
  'auth.signIn': 'ចូលគ្រប់គ្រងហាង (Sign in)',
  'auth.signingIn': 'កំពុងចូលប្រព័ន្ធ...',
  'auth.noAccount': 'មិនទាន់មានគណនីហាងមែនទេ?',
  'auth.contactAdmin': 'ទាក់ទង Admin',
  'auth.or': 'ឬ',
  'auth.signInGoogle': 'ចូលតាម Google',
  'auth.accountLocked': 'គណនីត្រូវបានចាក់សោបណ្តោះអាសន្ន',
  'auth.lockedWait': 'សូមព្យាយាមម្តងទៀតក្នុងរយៈពេល',
  'auth.attemptsRemaining': 'ដងទៀត មុនពេលចាក់សោគណនី',
  'auth.enterCredentials': 'សូមបញ្ចូលអ៊ីមែល ឬឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់',
  'auth.merchantOnly': 'ផ្ទាំងនេះសម្រាប់តែម្ចាស់ហាង ឬបុគ្គលិកប៉ុណ្ណោះ',
  'auth.forgotPrompt': 'ភ្លេចពាក្យសម្ងាត់? សូមទាក់ទង Admin តាម Telegram @your_telegram',
  'auth.welcomeBack': 'ស្វាគមន៍ការត្រឡប់មកវិញ!',
  'auth.demoMerchant': 'បានបំពេញគណនីគំរូ ម្ចាស់ហាង',
  'auth.demoStaff': 'បានបំពេញគណនីគំរូ បុគ្គលិក',

  // Navigation
  'nav.dashboard': 'ផ្ទាំងគ្រប់គ្រង',
  'nav.pos': 'ប្រព័ន្ធគិតលុយ (POS)',
  'nav.products': 'ផលិតផល',
  'nav.categories': 'ប្រភេទផលិតផល',
  'nav.stock': 'ស្តុកទំនិញ',
  'nav.orders': 'ការបញ្ជាទិញ',
  'nav.customers': 'អតិថិជន',
  'nav.reports': 'របាយការណ៍',
  'nav.receipts': 'វិក្កយបត្រ',
  'nav.settings': 'ការកំណត់ហាង',
  'nav.payment': 'ការទូទាត់ (ABA Pay)',
  'nav.telegram': 'Telegram Bot',
  'nav.backup': 'Backup & ទាញយក',
  'nav.upgrade': 'ដំឡើងគម្រោង (Upgrade)',
  'nav.logout': 'ចាកចេញ (Logout)',
  'nav.myShop': 'ហាងរបស់ខ្ញុំ',
  'nav.shopDashboard': 'ផ្ទាំងគ្រប់គ្រងហាង',
  'nav.shopNumber': 'ហាងលេខ #',

  // Common
  'common.search': 'ស្វែងរក...',
  'common.filter': 'ចម្រាញ់',
  'common.all': 'ទាំងអស់',
  'common.status': 'ស្ថានភាព',
  'common.active': 'សកម្ម (Active)',
  'common.inactive': 'អសកម្ម (Inactive)',
  'common.actions': 'សកម្មភាព',
  'common.save': 'រក្សាទុក',
  'common.saving': 'កំពុងរក្សាទុក...',
  'common.cancel': 'បោះបង់',
  'common.delete': 'លុប',
  'common.edit': 'កែប្រែ',
  'common.create': 'បង្កើតថ្មី',
  'common.loading': 'កំពុងផ្ទុក...',
  'common.noData': 'គ្មានទិន្នន័យ',
  'common.success': 'ជោគជ័យ',
  'common.error': 'កំហុស',
  'common.warning': 'ការព្រមាន',
  'common.info': 'ព័ត៌មាន',
  'common.theme': 'រចនាប័ទ្ម',
  'common.light': 'ពន្លឺ',
  'common.dark': 'ងងឹត',
  'common.language': 'ភាសា',
};

export interface LanguageContextType {
  lang: 'kh' | 'en';
  setLang: (lang: 'kh' | 'en') => void;
  toggle: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'kh',
  setLang: () => {},
  toggle: () => {},
  t: (k: string, fb?: string) => fb || k,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<'kh' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('merchant_language') || localStorage.getItem('ms_lang') || 'kh';
      return saved.startsWith('en') ? 'en' : 'kh';
    } catch {
      return 'kh';
    }
  });

  const setLang = (newLang: 'kh' | 'en') => {
    setLangState(newLang);
    try {
      localStorage.setItem('merchant_language', newLang);
      localStorage.setItem('ms_lang', newLang);
      document.documentElement.lang = newLang === 'kh' ? 'km' : 'en';
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem('merchant_language', lang);
      localStorage.setItem('ms_lang', lang);
      document.documentElement.lang = lang === 'kh' ? 'km' : 'en';
    } catch {}
  }, [lang]);

  const toggle = () => setLang(lang === 'kh' ? 'en' : 'kh');

  const t = (key: string, fallback?: string): string => {
    const dict = lang === 'kh' ? kh : en;
    if ((dict as any)[key]) return (dict as any)[key];
    const fallbackDict = lang === 'kh' ? en : kh;
    if ((fallbackDict as any)[key]) return (fallbackDict as any)[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs backdrop-blur-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('kh')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          lang === 'kh'
            ? 'bg-sky-600 text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="text-sm">🇰🇭</span>
        <span>ភាសាខ្មែរ</span>
      </button>

      <button
        type="button"
        onClick={() => setLang('en')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          lang === 'en'
            ? 'bg-sky-600 text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span className="text-sm">🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};

export default LanguageProvider;
