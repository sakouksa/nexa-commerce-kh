import React, { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { translateString, refreshActiveDict, resources } from './i18n';
import { useTranslation } from 'react-i18next';
export { LanguageSwitcher } from './LanguageSwitcher';
export { resources, translateString, refreshActiveDict };

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return React.createElement(I18nextProvider, { i18n }, children);
};

export function useLanguage() {
  const { t: i18nT, i18n: inst } = useTranslation();
  const lang = (inst.language === 'en' ? 'en' : 'kh') as 'en' | 'kh';

  const setLanguage = (newLang: 'en' | 'kh') => {
    inst.changeLanguage(newLang);
  };

  const t = (key: string, defaultValueOrOptions?: any, maybeOptions?: any): string => {
    if (!key) return '';
    const rawRes = i18nT(key as any, defaultValueOrOptions, maybeOptions);
    const res = typeof rawRes === 'string' ? rawRes : (rawRes ? String(rawRes) : '');

    if (res && res !== key) return res;

    // Check if key has namespace prefix like 'auth.loginTitle' -> try 'auth:loginTitle'
    if (key.includes('.')) {
      const colonKey = key.replace('.', ':');
      const rawColonRes = i18nT(colonKey as any, defaultValueOrOptions, maybeOptions);
      const colonRes = typeof rawColonRes === 'string' ? rawColonRes : (rawColonRes ? String(rawColonRes) : '');
      if (colonRes && colonRes !== colonKey && colonRes !== key) return colonRes;
    }

    if (typeof defaultValueOrOptions === 'string' && defaultValueOrOptions) {
      if (lang === 'kh') {
        const trFallback = translateString(defaultValueOrOptions);
        if (trFallback && trFallback !== defaultValueOrOptions) return trFallback;
      }
      return defaultValueOrOptions;
    }

    if (lang === 'kh') {
      const translated = translateString(key);
      if (translated && translated !== key) return translated;
    }

    return res || key;
  };

  return {
    lang,
    language: lang,
    isKhmer: lang === 'kh',
    isEnglish: lang === 'en',
    setLanguage,
    t,
    translateString,
  };
}

export const t = (key: string, defaultValueOrOptions?: any, maybeOptions?: any): string => {
  if (!key) return '';
  const rawRes = i18n.t(key as any, defaultValueOrOptions, maybeOptions);
  const res = typeof rawRes === 'string' ? rawRes : (rawRes ? String(rawRes) : '');

  if (res && res !== key) return res;
  if (key.includes('.')) {
    const colonKey = key.replace('.', ':');
    const rawColonRes = i18n.t(colonKey as any, defaultValueOrOptions, maybeOptions);
    const colonRes = typeof rawColonRes === 'string' ? rawColonRes : (rawColonRes ? String(rawColonRes) : '');
    if (colonRes && colonRes !== colonKey && colonRes !== key) return colonRes;
  }
  const lang = i18n.language === 'en' ? 'en' : 'kh';
  if (typeof defaultValueOrOptions === 'string' && defaultValueOrOptions) {
    if (lang === 'kh') {
      const trFallback = translateString(defaultValueOrOptions);
      if (trFallback && trFallback !== defaultValueOrOptions) return trFallback;
    }
    return defaultValueOrOptions;
  }
  if (lang === 'kh') {
    const translated = translateString(key);
    if (translated && translated !== key) return translated;
  }
  return res || key;
};

export default i18n;
