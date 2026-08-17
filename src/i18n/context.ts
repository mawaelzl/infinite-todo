import { createContext } from 'react';
import type { Locale, Translations } from './translations';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
