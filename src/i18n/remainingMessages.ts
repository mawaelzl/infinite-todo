import type { Locale } from './translations';

// Shown per day card: a short, encouraging note about what's left to do,
// tiered by how much estimated time remains (not just how many todos).
// Not literal translations of each other — an equally encouraging set in
// each language. No message is shown for days with no todos at all.

function itemWord(locale: Locale, count: number): string {
  if (locale === 'de') return count === 1 ? 'Aufgabe' : 'Aufgaben';
  return count === 1 ? 'thing' : 'things';
}

type Tier = 'quick' | 'moderate' | 'long' | 'unknown';

/** Picks a tone tier from the estimated remaining minutes (null = no estimate available). */
export function remainingTier(remainingMinutes: number | null): Tier {
  if (remainingMinutes === null) return 'unknown';
  if (remainingMinutes <= 20) return 'quick';
  if (remainingMinutes <= 90) return 'moderate';
  return 'long';
}

type Template = (count: number, word: string, time: string) => string;

// `time` is only used by quick/moderate/long templates — `unknown` templates
// ignore it (no estimate to show).
const REMAINING_TEMPLATES: Record<Locale, Record<Tier, Template[]>> = {
  en: {
    quick: [
      (n, w, time) => `${n} ${w} left, about ${time} — quick win`,
      (n, w, time) => `Just ${time} left across ${n} ${w}. Easy`,
      (n, w, time) => `${n} ${w}, roughly ${time} — you'll knock this out fast`,
    ],
    moderate: [
      (n, w, time) => `${n} ${w} left, about ${time} — steady pace, you've got this`,
      (n, w, time) => `Roughly ${time} across ${n} ${w}. Nice and doable`,
      (n, w, time) => `${n} ${w} (${time}) between you and a clear list`,
    ],
    long: [
      (n, w, time) => `${n} ${w} left, about ${time} — no rush, one at a time`,
      (_n, _w, time) => `Roughly ${time} on the list today. Plenty of time`,
      (n, w, time) => `${n} ${w} (${time}) ahead — take it step by step`,
    ],
    unknown: [
      (n, w) => `${n} ${w} left — you've got this`,
      (n, w) => `${n} ${w} to go. Nice and doable`,
      (n, w) => `${n} ${w} left on today's list`,
    ],
  },
  de: {
    quick: [
      (n, w, time) => `${n} ${w}, etwa ${time} — schnell erledigt`,
      (n, w, time) => `Nur noch ${time} bei ${n} ${w}. Locker`,
      (n, w, time) => `${n} ${w}, rund ${time} — das geht fix`,
    ],
    moderate: [
      (n, w, time) => `${n} ${w}, etwa ${time} — im ruhigen Tempo machbar`,
      (n, w, time) => `Rund ${time} bei ${n} ${w}. Gut zu schaffen`,
      (n, w, time) => `${n} ${w} (${time}) bis zur leeren Liste`,
    ],
    long: [
      (n, w, time) => `${n} ${w}, etwa ${time} — kein Stress, Schritt für Schritt`,
      (_n, _w, time) => `Rund ${time} stehen heute an. Genug Zeit dafür`,
      (n, w, time) => `${n} ${w} (${time}) vor dir — einfach nacheinander`,
    ],
    unknown: [
      (n, w) => `Noch ${n} ${w} — läuft schon`,
      (n, w) => `${n} ${w} übrig. Gut zu schaffen`,
      (n, w) => `${n} ${w} stehen noch an`,
    ],
  },
};

const ALL_DONE_MESSAGES: Record<Locale, string[]> = {
  en: [
    'All done. Nice work',
    'Everything checked off. Love that',
    'Clear list. Well earned',
    'All clear here',
    'Done and done. Enjoy the rest of the day',
    'Nothing left. Great job',
  ],
  de: [
    'Alles erledigt. Stark',
    'Liste leer. Gut gemacht',
    'Alles abgehakt',
    'Fertig — sauber durchgezogen',
    'Nichts mehr offen. Gönn dir',
    'Alles geschafft. Weiter so',
  ],
};

/**
 * @param remainingMinutes total estimated minutes left (only counting todos
 *   with a set duration), or null if no remaining todo has an estimate.
 * @param timeLabel formatted duration string (e.g. "45m", "1h 30m"), only
 *   needed when remainingMinutes is not null.
 */
export function randomRemainingMessage(
  locale: Locale,
  remaining: number,
  remainingMinutes: number | null,
  timeLabel: string,
): string {
  const word = itemWord(locale, remaining);
  const tier = remainingTier(remainingMinutes);
  const templates = REMAINING_TEMPLATES[locale][tier];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template(remaining, word, timeLabel);
}

export function randomAllDoneMessage(locale: Locale): string {
  const list = ALL_DONE_MESSAGES[locale];
  return list[Math.floor(Math.random() * list.length)];
}
