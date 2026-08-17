import { useCallback, useEffect, useState } from 'react';
import { isValidHex, toRgba } from './color';

const STORAGE_KEY = 'infinite-todo:accent';
export const DEFAULT_ACCENT = '#67944e';

function readStoredAccent(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && isValidHex(stored) ? stored : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

function applyAccent(hex: string): void {
  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-bg', toRgba(hex, 0.1));
  root.style.setProperty('--accent-border', toRgba(hex, 0.5));
}

export function useAccentColor() {
  const [accent, setAccentState] = useState(readStoredAccent);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const setAccent = useCallback((hex: string) => {
    if (!isValidHex(hex)) return;
    setAccentState(hex);
    try {
      localStorage.setItem(STORAGE_KEY, hex);
    } catch {
      // localStorage unavailable — accent still applies for this session.
    }
  }, []);

  return { accent, setAccent };
}
