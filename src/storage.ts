import type { Todo, TodoStore } from './types';

const STORAGE_KEY = 'infinite-todo:data';

/** Formats a Date as YYYY-MM-DD using local timezone (avoids UTC off-by-one bugs). */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns today's date key in local timezone. */
export function todayKey(): string {
  return formatDateKey(new Date());
}

/** Returns the date key `offset` days from today (negative = past, positive = future). */
export function offsetKey(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return formatDateKey(date);
}

/** Parses a YYYY-MM-DD key back into a local Date at midnight. */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Compares two date keys: negative if a < b, 0 if equal, positive if a > b. */
export function compareDateKeys(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isPastKey(key: string): boolean {
  return compareDateKeys(key, todayKey()) < 0;
}

export function isFutureKey(key: string): boolean {
  return compareDateKeys(key, todayKey()) > 0;
}

export function isTodayKey(key: string): boolean {
  return key === todayKey();
}

export function loadStore(): TodoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as TodoStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStore(store: TodoStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable or quota exceeded — silently ignore.
  }
}

export function createTodoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Groups a day's todos so all checked items come before all unchecked items,
 * preserving each group's existing relative order (stable partition). Keeps
 * the list tidy as items get checked/unchecked and carried over.
 */
export function orderTodos(todos: Todo[]): Todo[] {
  const checked = todos.filter((t) => t.done);
  const unchecked = todos.filter((t) => !t.done);
  return [...checked, ...unchecked];
}

/**
 * Moves every incomplete todo from a past date into today's list, removing it
 * from its original day. Completed todos are left untouched on their original
 * day (read-only history). Returns a new store; does not mutate the input.
 */
export function applyCarryOver(store: TodoStore): TodoStore {
  const today = todayKey();
  const next: TodoStore = {};
  const carried: Todo[] = [];

  for (const [key, todos] of Object.entries(store)) {
    if (key === today) continue; // handle today last, after collecting carried todos
    if (isPastKey(key)) {
      const remaining = todos.filter((t) => t.done);
      const incomplete = todos.filter((t) => !t.done);
      if (remaining.length > 0) next[key] = remaining;
      carried.push(...incomplete);
    } else {
      next[key] = orderTodos(todos);
    }
  }

  const existingToday = store[today] ?? [];
  const merged = orderTodos([...existingToday, ...carried]);
  if (merged.length > 0) next[today] = merged;

  return next;
}

const REVIEW_STORAGE_KEY = 'infinite-todo:reviewed-on';

export type DailyReview = 'all-done' | 'incomplete' | 'none';

/**
 * Checks (once) how yesterday went — used to show a "welcome back" message
 * and/or confetti the first time the app is opened on a new day. Must be
 * evaluated against the raw, pre-carry-over store: after carry-over a
 * partially completed day would incorrectly look "all done" since only its
 * completed todos remain. Only ever resolves to something other than 'none'
 * once per calendar day (tracked via localStorage) even across reloads or
 * multiple tabs — after that, or if yesterday had no todos at all, it
 * returns 'none'.
 */
export function consumeDailyReview(): DailyReview {
  try {
    const today = todayKey();
    if (localStorage.getItem(REVIEW_STORAGE_KEY) === today) return 'none';
    localStorage.setItem(REVIEW_STORAGE_KEY, today);

    const rawStore = loadStore();
    const yesterday = rawStore[offsetKey(-1)] ?? [];
    if (yesterday.length === 0) return 'none';

    return yesterday.every((t) => t.done) ? 'all-done' : 'incomplete';
  } catch {
    return 'none';
  }
}
