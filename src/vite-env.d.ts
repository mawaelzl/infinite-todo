/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Forces the daily "welcome back" review (dialog + confetti when
   * applicable) to a specific outcome, bypassing the real yesterday-todos
   * check. One of "all-done" | "incomplete" | "none". Set via `.env.local`.
   */
  readonly VITE_FORCE_DAILY_REVIEW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
