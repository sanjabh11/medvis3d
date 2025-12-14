'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { en, es, type TranslationKeys } from './translations';

export type Locale = 'en' | 'es';

const translations: Record<Locale, TranslationKeys> = {
  en,
  es,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'medvis3d_locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'en' || stored === 'es')) {
    return stored;
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'es') {
    return 'es';
  }
  
  return 'en';
}

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale || 'en');

  // Initialize locale on mount
  useEffect(() => {
    if (!defaultLocale) {
      setLocaleState(getInitialLocale());
    }
  }, [defaultLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, setLocale } = useI18n();
  return { t, locale, setLocale };
}
