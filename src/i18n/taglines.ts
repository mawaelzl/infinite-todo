import type { Locale } from './translations';

// Short, fun, motivating one-liners shown in the app banner. One is picked
// at random per session/locale — not literal translations of each other,
// just an equally fun set in each language.
export const TAGLINES: Record<Locale, string[]> = {
  en: [
    'One task at a time. You got this',
    "Today's the day. Or tomorrow works too",
    'Small steps, big wins',
    'Cross it off, feel the rush',
    'Future you says thanks',
    'Done is better than perfect',
    'Eat the frog first',
    'No calendar, no excuses',
    'Keep scrolling, keep going',
    "Yesterday's todos, today's mission",
    'Progress, not perfection',
    'Check one box. Change the day',
    'Tiny wins add up',
    'You showed up. That counts',
    'Less thinking, more doing',
    'One day, one list, no limits',
    'Momentum starts with one click',
    "Turn 'later' into 'done'",
    'Your future self is watching',
    'Make today count',
  ],
  de: [
    'Ein Schritt nach dem anderen',
    'Heute ist dein Tag. Oder morgen',
    'Kleine Schritte, großer Erfolg',
    'Abhaken und weiterziehen',
    'Dein zukünftiges Ich dankt dir',
    'Fertig schlägt perfekt',
    'Das Unangenehmste zuerst',
    'Kein Kalender, keine Ausreden',
    'Weiterscrollen, weitermachen',
    'Gestern liegen lassen, heute anpacken',
    'Fortschritt statt Perfektion',
    'Ein Haken verändert den Tag',
    'Kleine Erfolge summieren sich',
    'Du bist da. Das zählt',
    'Weniger denken, mehr machen',
    'Ein Tag, eine Liste, keine Grenzen',
    'Schwung beginnt mit einem Klick',
    'Aus „später" wird „erledigt"',
    'Dein zukünftiges Ich schaut zu',
    'Mach heute zählend',
  ],
};

export function randomTagline(locale: Locale): string {
  const list = TAGLINES[locale];
  return list[Math.floor(Math.random() * list.length)];
}
