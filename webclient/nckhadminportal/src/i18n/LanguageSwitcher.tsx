import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'badge' | 'minimal' | 'dropdown';
  isNavbarDark?: boolean;
}

const languages = [
  { code: 'kh', name: 'ភាសាខ្មែរ', short: 'KH', flag: '🇰🇭' },
  { code: 'en', name: 'English', short: 'EN', flag: '🇬🇧' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown',
  isNavbarDark = false,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'en' ? 'en' : 'kh';
  const activeLang = languages.find((l) => l.code === currentLang) || languages[0];

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'kh' : 'en';
    handleSelectLanguage(nextLang);
  };

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        title="Toggle language"
        className={`h-8 px-2 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground ${className}`}
      >
        <span className="text-sm leading-none">{activeLang.flag}</span>
        <span className="font-semibold tracking-wide">{activeLang.short}</span>
      </Button>
    );
  }

  if (variant === 'button') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-lg border border-border/80 bg-muted/40 shadow-2xs backdrop-blur-xs ${className}`}
      >
        {languages.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-xs leading-none">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Modern enterprise dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 px-2.5 rounded-lg text-xs font-medium transition-all shadow-2xs ${
            isNavbarDark
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white'
              : 'border-border/70 hover:bg-accent text-foreground'
          } ${className}`}
        >
          <Globe className={`size-3.5 ${isNavbarDark ? 'text-white/80' : 'text-muted-foreground'}`} />
          <span className="text-xs leading-none">{activeLang.flag}</span>
          <span
            className={`font-semibold text-xs tracking-wide ${
              isNavbarDark ? 'text-white' : 'text-foreground'
            }`}
          >
            {activeLang.short}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            className="flex items-center justify-between text-xs py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{lang.flag}</span>
              <span className={currentLang === lang.code ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                {lang.name}
              </span>
            </div>
            {currentLang === lang.code && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
