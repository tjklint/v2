import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Language, SiteContent } from './types';
import en from './en.json';
import qc from './qc.json';

const CONTENT: Record<Language, SiteContent> = {
  en: en as SiteContent,
  qc: qc as SiteContent,
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  content: SiteContent;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>('en');
  const content = useMemo(() => CONTENT[language], [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, content }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useContent = (): SiteContent => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useContent must be used inside a LanguageProvider');
  }
  return context.content;
};

export const useLanguage = (): Omit<LanguageContextValue, 'content'> => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside a LanguageProvider');
  }
  const { language, setLanguage } = context;
  return { language, setLanguage };
};
