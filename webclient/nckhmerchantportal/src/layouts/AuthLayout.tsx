import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../i18n';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useUIStore } from '../stores/ui.store';
import { Footer } from '../components/layout/Footer';

interface AuthLayoutProps {
  children?: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { themeMode, toggleTheme } = useUIStore();
  const isDark = themeMode === 'dark';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar with Quick Actions */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
            MS
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            MiniStore KH
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
            aria-label="Toggle theme"
          >
            {isDark ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children || <Outlet />}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <Footer />
      </footer>
    </div>
  );
};

export default AuthLayout;
