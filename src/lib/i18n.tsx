'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ptTranslations from './i18n/pt.json';
import enTranslations from './i18n/en.json';

export type Language = 'pt' | 'en';

const DICTIONARY = {
  pt: ptTranslations,
  en: enTranslations,
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const saved = localStorage.getItem('demokratia-lang') as Language;
    if (saved && (saved === 'pt' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('demokratia-lang', lang);
  };

  const t = (key: string): string => {
    if (typeof key !== 'string' || !key) {
        return ''; // Return an empty string for invalid keys
    }
    const keys = key.split('.');
    let result: any = DICTIONARY[language];
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key itself if not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
