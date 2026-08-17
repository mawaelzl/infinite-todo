import type { Translations } from './i18n/translations';

// Fixed set of selectable time estimates, in minutes. Deliberately a closed
// list (no free text) since these are rough estimates, not commitments.
export const DURATION_OPTIONS = [5, 15, 30, 60, 120, 240, 480] as const;
export type DurationMinutes = (typeof DURATION_OPTIONS)[number];

/** Formats a minute count as a short "1h 30m" / "45m" style string. */
export function formatDuration(minutes: number, t: Translations): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder}${t.durationMinutesAbbrev}`;
  if (remainder === 0) return `${hours}${t.durationHoursAbbrev}`;
  return `${hours}${t.durationHoursAbbrev} ${remainder}${t.durationMinutesAbbrev}`;
}

/** Fraction (0-1) of a single clock face that `minutes` fills, capped at one full hour. */
export function clockFraction(minutes: number): number {
  return Math.min(minutes / 60, 1);
}

/** Angle (degrees, clockwise from 12 o'clock) for a duration option's position on the dial. */
export function angleForIndex(index: number): number {
  return (360 / DURATION_OPTIONS.length) * index;
}
