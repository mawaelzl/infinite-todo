import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isLocale, TRANSLATIONS, type Locale } from './translations';
import { LocaleContext, type LocaleContextValue } from './context';

const STORAGE_KEY = 'infinite-todo:locale';

function detectDefaultLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    // localStorage unavailable — fall through to browser detection.
  }
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  return browserLang === 'de' ? 'de' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectDefaultLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — locale still applies for this session.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: TRANSLATIONS[locale] }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
