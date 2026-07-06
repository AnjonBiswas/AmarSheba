import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import bn from '../locales/bn.js';
import en from '../locales/en.js';

const dictionaries = { en, bn };
const LocaleContext = createContext(null);
const LOCALE_KEY = 'amarsheba-locale';

function normalizeLocale(locale) {
  return Object.hasOwn(dictionaries, locale) ? locale : 'en';
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => normalizeLocale(localStorage.getItem(LOCALE_KEY) || 'en'));

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  const value = useMemo(() => {
    const t = (path) => path.split('.').reduce((acc, key) => acc?.[key], dictionaries[locale]) || path;
    const changeLocale = (nextLocale) => {
      const safeLocale = normalizeLocale(nextLocale);
      document.documentElement.lang = safeLocale;
      localStorage.setItem(LOCALE_KEY, safeLocale);
      setLocaleState(safeLocale);
    };

    return { locale, setLocale: changeLocale, t, translations: dictionaries[locale] };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
}
