import type { Locale } from './translations';

// Shown once per day, the first time the app is opened, based on how
// yesterday went. Not literal translations of each other — an equally
// encouraging set in each language. No message is shown if yesterday had no
// todos at all.
export const WELCOME_MESSAGES: Record<Locale, { allDone: string[]; incomplete: string[] }> = {
  en: {
    allDone: [
      'You cleared everything yesterday. Nice one',
      'Yesterday: fully done. Enjoy the clean slate',
      'Every todo checked off yesterday. Love that for you',
      "Look at you go — yesterday's list, all cleared",
      'Nothing left over from yesterday. Smooth',
      'A tidy finish yesterday. On to today',
      "All done, all yesterday. Easy like that",
      'Clean slate today, thanks to yesterday-you',
    ],
    incomplete: [
      "A few things from yesterday hopped over to today. All good",
      'Some leftovers today — happens to everyone',
      "Today's list got a little extra company from yesterday. No biggie",
      'A couple todos tagged along into today. Whenever works',
      "Yesterday left a little behind. Today's got room for it",
      'A few tasks followed you into today — take your time',
      "Some things are still hanging around. Today's a fine day for them",
      "A little carried over. Today's wide open, no rush",
    ],
  },
  de: {
    allDone: [
      'Gestern alles im Kasten',
      'Liste von gestern? Leer geräumt',
      'Alles erledigt, null hängen geblieben',
      'Sauber durchgezogen gestern',
      'Kopf frei — gestern ist komplett abgehakt',
      'Nichts liegen geblieben. Läuft bei dir',
      'Gestern voll durchgezogen, heute geht’s locker weiter',
      'Aufgeräumter Start heute, dank gestern',
    ],
    incomplete: [
      'Ein paar Reste von gestern sind mit eingezogen',
      'Heute ist ein bisschen was dazugekommen. Passt schon',
      'Nicht alles hat’s gestern geschafft. Kein Ding',
      'Ein paar Punkte ziehen mit um. Eile hat’s nicht',
      'Rest von gestern meldet sich heute nochmal',
      'Manches wartet noch. Heute ist genug Zeit dafür',
      'Ein paar Aufgaben trödeln noch rum. Alles gut',
      'Kleiner Rückstau von gestern, kein Stress deswegen',
    ],
  },
};

export function randomWelcomeMessage(locale: Locale, variant: 'allDone' | 'incomplete'): string {
  const list = WELCOME_MESSAGES[locale][variant];
  return list[Math.floor(Math.random() * list.length)];
}
