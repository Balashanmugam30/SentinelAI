'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type SupportedLanguage, getTranslations, type Translations, getLanguageInfo, type LanguageInfo } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  langInfo: LanguageInfo;
  translateToEnglish: (text: string) => Promise<string>;
  translateFromEnglish: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('userLanguage') as SupportedLanguage | null;
    if (saved && ['en', 'ta', 'te', 'hi', 'ml', 'kn'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('userLanguage', lang);
  };

  const translateToEnglish = async (text: string): Promise<string> => {
    if (language === 'en') return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: language, to: 'en' }),
      });
      const data = await res.json();
      return data.translated || text;
    } catch {
      return text;
    }
  };

  const translateFromEnglish = async (text: string): Promise<string> => {
    if (language === 'en') return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: 'en', to: language }),
      });
      const data = await res.json();
      return data.translated || text;
    } catch {
      return text;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: getTranslations(language),
        langInfo: getLanguageInfo(language),
        translateToEnglish,
        translateFromEnglish,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
