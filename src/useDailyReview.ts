import { useState } from 'react';
import { consumeDailyReview, type DailyReview } from './storage';

const FORCE_DAILY_REVIEW = import.meta.env.VITE_FORCE_DAILY_REVIEW;

/**
 * Resolves, exactly once — on the first render after opening the app on a
 * new day — how yesterday went: 'all-done' (every todo completed, worth
 * celebrating), 'incomplete' (some todos carried over), or 'none' (no
 * todos yesterday, or already shown today). Stays 'none' on every
 * subsequent render/reload for the same day.
 *
 * Set `VITE_FORCE_DAILY_REVIEW` in `.env.local` to force a specific value
 * for visual testing, bypassing the real check entirely.
 */
export function useDailyReview(): DailyReview {
  const [review] = useState<DailyReview>(() => {
    if (FORCE_DAILY_REVIEW === 'all-done' || FORCE_DAILY_REVIEW === 'incomplete' || FORCE_DAILY_REVIEW === 'none') {
      return FORCE_DAILY_REVIEW;
    }
    return consumeDailyReview();
  });
  return review;
}
