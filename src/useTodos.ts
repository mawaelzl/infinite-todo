import { useCallback, useEffect, useRef, useState } from 'react';
import type { Todo, TodoStore } from './types';
import {
  applyCarryOver,
  consumeDailyReview,
  createTodoId,
  isPastKey,
  loadStore,
  orderTodos,
  saveStore,
  todayKey,
  type DailyReview,
} from './storage';

const FORCE_DAILY_REVIEW = import.meta.env.VITE_FORCE_DAILY_REVIEW;

function resolveDailyReview(): DailyReview {
  if (FORCE_DAILY_REVIEW === 'all-done' || FORCE_DAILY_REVIEW === 'incomplete' || FORCE_DAILY_REVIEW === 'none') {
    return FORCE_DAILY_REVIEW;
  }
  return consumeDailyReview();
}

/** A daily review result tagged with the day it was resolved for, so the UI
 * can tell "a new rollover happened" apart from "nothing changed" even when
 * two different days happen to resolve to the same status (e.g. two
 * 'incomplete' days in a row) — a bare string would look unchanged to React
 * and silently fail to re-trigger the welcome dialog/confetti. */
export interface DailyReviewEvent {
  kind: DailyReview;
  day: string;
}

export function useTodos() {
  const [store, setStore] = useState<TodoStore>(() => applyCarryOver(loadStore()));
  const [dailyReview, setDailyReview] = useState<DailyReviewEvent>(() => ({
    kind: resolveDailyReview(),
    day: todayKey(),
  }));
  const lastCheckedDay = useRef(todayKey());

  // Persist to localStorage whenever the store changes.
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Re-run carry-over if the real-world day rolls over while the app stays
  // open, and re-resolve the daily review too so the welcome message/confetti
  // shows up for the new day without needing a manual reload.
  useEffect(() => {
    const checkDayRollover = () => {
      const current = todayKey();
      if (current !== lastCheckedDay.current) {
        lastCheckedDay.current = current;
        setStore((prev) => applyCarryOver(prev));
        setDailyReview({ kind: resolveDailyReview(), day: current });
      }
    };
    const interval = setInterval(checkDayRollover, 60_000);
    document.addEventListener('visibilitychange', checkDayRollover);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', checkDayRollover);
    };
  }, []);

  const getTodos = useCallback(
    (dateKey: string): Todo[] => store[dateKey] ?? [],
    [store],
  );

  const addTodo = useCallback((dateKey: string, text: string, durationMinutes?: number) => {
    const trimmed = text.trim();
    if (!trimmed || isPastKey(dateKey)) return;
    setStore((prev) => {
      const todo: Todo = {
        id: createTodoId(),
        text: trimmed,
        done: false,
        createdDate: dateKey,
        ...(durationMinutes !== undefined ? { durationMinutes } : {}),
      };
      return { ...prev, [dateKey]: orderTodos([...(prev[dateKey] ?? []), todo]) };
    });
  }, []);

  const toggleTodo = useCallback((dateKey: string, id: string) => {
    if (isPastKey(dateKey)) return;
    setStore((prev) => {
      const todos = prev[dateKey] ?? [];
      const target = todos.find((t) => t.id === id);
      if (!target) return prev;
      const toggled: Todo = { ...target, done: !target.done };
      const rest = todos.filter((t) => t.id !== id);
      const unchecked = rest.filter((t) => !t.done);
      const checked = rest.filter((t) => t.done);
      // The toggled item lands right at the boundary between the two groups:
      // that's the bottom of the checked section when it just got checked,
      // and the top of the unchecked section when it just got unchecked.
      const next = [...checked, toggled, ...unchecked];
      return { ...prev, [dateKey]: next };
    });
  }, []);


  const deleteTodo = useCallback((dateKey: string, id: string) => {
    if (isPastKey(dateKey)) return;
    setStore((prev) => {
      const remaining = (prev[dateKey] ?? []).filter((t) => t.id !== id);
      const next = { ...prev };
      if (remaining.length > 0) next[dateKey] = remaining;
      else delete next[dateKey];
      return next;
    });
  }, []);

  const updateTodoDuration = useCallback((dateKey: string, id: string, durationMinutes: number) => {
    if (isPastKey(dateKey)) return;
    setStore((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).map((t) =>
        t.id === id ? { ...t, durationMinutes } : t,
      ),
    }));
  }, []);

  return { getTodos, addTodo, toggleTodo, deleteTodo, updateTodoDuration, dailyReview };
}
