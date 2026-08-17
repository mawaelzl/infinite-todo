import { useCallback, useEffect, useRef, useState } from 'react';
import type { Todo, TodoStore } from './types';
import {
  applyCarryOver,
  createTodoId,
  isPastKey,
  loadStore,
  saveStore,
  todayKey,
} from './storage';

export function useTodos() {
  const [store, setStore] = useState<TodoStore>(() => applyCarryOver(loadStore()));
  const lastCheckedDay = useRef(todayKey());

  // Persist to localStorage whenever the store changes.
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Re-run carry-over if the real-world day rolls over while the app stays open.
  useEffect(() => {
    const checkDayRollover = () => {
      const current = todayKey();
      if (current !== lastCheckedDay.current) {
        lastCheckedDay.current = current;
        setStore((prev) => applyCarryOver(prev));
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
      return { ...prev, [dateKey]: [...(prev[dateKey] ?? []), todo] };
    });
  }, []);

  const toggleTodo = useCallback((dateKey: string, id: string) => {
    if (isPastKey(dateKey)) return;
    setStore((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      ),
    }));
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

  return { getTodos, addTodo, toggleTodo, deleteTodo, updateTodoDuration };
}
