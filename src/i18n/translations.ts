export type Locale = 'en' | 'de';

export const LOCALES: Locale[] = ['en', 'de'];

export interface Translations {
  today: string;
  noTodosYet: string;
  nothingRecorded: string;
  addPlaceholder: string;
  add: string;
  deleteTodoAria: (text: string) => string;
  settingsAria: string;
  closeAria: string;
  accentColorTitle: string;
  hexInputAria: string;
  languageTitle: string;
  localeName: (locale: Locale) => string;
  welcomeDialogAria: string;
  welcomeDialogDismiss: string;
  durationLabelAria: string;
  durationMinutesAbbrev: string;
  durationHoursAbbrev: string;
  durationPickerTitle: string;
  durationPickerDone: string;
  dayTotalApprox: (formatted: string) => string;
}

const en: Translations = {
  today: 'Today',
  noTodosYet: 'No todos yet',
  nothingRecorded: 'Nothing recorded',
  addPlaceholder: 'Add a todo…',
  add: 'Add',
  deleteTodoAria: (text) => `Delete "${text}"`,
  settingsAria: 'Settings',
  closeAria: 'Close',
  accentColorTitle: 'Accent color',
  hexInputAria: 'Hex color value',
  languageTitle: 'Language',
  localeName: (locale) => (locale === 'en' ? 'English' : 'German'),
  welcomeDialogAria: 'Welcome back',
  welcomeDialogDismiss: 'Got it',
  durationLabelAria: 'Estimated time',
  durationMinutesAbbrev: 'm',
  durationHoursAbbrev: 'h',
  durationPickerTitle: 'How long will this take?',
  durationPickerDone: 'Done',
  dayTotalApprox: (formatted) => `≈ ${formatted} planned`,
};

const de: Translations = {
  today: 'Heute',
  noTodosYet: 'Noch keine Todos',
  nothingRecorded: 'Nichts vermerkt',
  addPlaceholder: 'Todo hinzufügen…',
  add: 'Hinzufügen',
  deleteTodoAria: (text) => `„${text}“ löschen`,
  settingsAria: 'Einstellungen',
  closeAria: 'Schließen',
  accentColorTitle: 'Akzentfarbe',
  hexInputAria: 'Hex-Farbwert',
  languageTitle: 'Sprache',
  localeName: (locale) => (locale === 'en' ? 'Englisch' : 'Deutsch'),
  welcomeDialogAria: 'Willkommen zurück',
  welcomeDialogDismiss: 'Alles klar',
  durationLabelAria: 'Geschätzte Dauer',
  durationMinutesAbbrev: 'Min',
  durationHoursAbbrev: 'Std',
  durationPickerTitle: 'Wie lange dauert das?',
  durationPickerDone: 'Fertig',
  dayTotalApprox: (formatted) => `≈ ${formatted} geplant`,
};

export const TRANSLATIONS: Record<Locale, Translations> = { en, de };

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}
