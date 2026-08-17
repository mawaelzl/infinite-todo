export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdDate: string; // YYYY-MM-DD (local timezone), day it was originally added to
  durationMinutes?: number; // rough estimate of how long the task will take, in minutes
}

// Maps a date key (YYYY-MM-DD, local timezone) to the list of todos on that day.
export type TodoStore = Record<string, Todo[]>;
