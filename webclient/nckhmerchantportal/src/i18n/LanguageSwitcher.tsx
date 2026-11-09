import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'badge' | 'minimal' | 'dropdown';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown',
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'en' ? 'en' : 'kh';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'kh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        title={currentLang === 'en' ? 'ប្តូរទៅភាសាខ្មែរ' : 'Switch to English'}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1d3538] border border-slate-200 dark:border-[#2a4245] transition-colors cursor-pointer select-none shrink-0 ${className}`}
      >
        <span className="text-sm leading-none">{currentLang === 'en' ? '🇬🇧' : '🇰🇭'}</span>
        <span className="text-[11px] font-bold">{currentLang === 'en' ? 'EN' : 'KH'}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1d3538] border border-slate-200 dark:border-[#2a4245] transition-colors cursor-pointer select-none shrink-0 ${className}`}
            title="Language"
          >
            <span className="text-sm leading-none">{currentLang === 'en' ? '🇬🇧' : '🇰🇭'}</span>
            <span className="text-[11px] font-bold">{currentLang === 'en' ? 'EN' : 'KH'}</span>
            <ChevronDown className="size-3 text-slate-400 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-36 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg text-xs font-medium"
        >
          <DropdownMenuItem
            onClick={() => i18n.changeLanguage('kh')}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇰🇭</span>
              <span className={currentLang === 'kh' ? 'font-bold text-[#0c5c46] dark:text-emerald-400' : ''}>
                ភាសាខ្មែរ
              </span>
            </div>
            {currentLang === 'kh' && <Check className="size-3.5 text-[#0c5c46] dark:text-emerald-400" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => i18n.changeLanguage('en')}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇬🇧</span>
              <span className={currentLang === 'en' ? 'font-bold text-[#0c5c46] dark:text-emerald-400' : ''}>
                English
              </span>
            </div>
            {currentLang === 'en' && <Check className="size-3.5 text-[#0c5c46] dark:text-emerald-400" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs ${className}`}
    >
      <button
        type="button"
        onClick={() => i18n.changeLanguage('kh')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          currentLang === 'kh'
            ? 'bg-[#0c5c46] text-white shadow-2xs font-semibold'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
      >
        <span className="text-sm">🇰🇭</span>
        <span>ភាសាខ្មែរ</span>
      </button>

      <button
        type="button"
        onClick={() => i18n.changeLanguage('en')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
          currentLang === 'en'
            ? 'bg-[#0c5c46] text-white shadow-2xs font-semibold'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
      >
        <span className="text-sm">🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
