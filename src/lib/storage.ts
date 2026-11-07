import type { Lang } from "@/lib/engine";

/**
 * Ustawienia i historia w localStorage. Każdy odczyt i zapis jest w try/catch:
 * w trybie prywatnym albo przy zablokowanych danych strony localStorage potrafi
 * rzucić wyjątkiem — wtedy aplikacja po prostu działa bez zapisu.
 */

export interface Settings {
  lang: Lang;
  count: number;
  punctuation: boolean;
  digits: boolean;
  focus: string;
  showKeyboard: boolean;
  fingerColors: boolean;
}

export const WORD_COUNTS = [25, 50, 100] as const;

export const DEFAULT_SETTINGS: Settings = {
  lang: "pl",
  count: 50,
  punctuation: false,
  digits: false,
  focus: "",
  showKeyboard: true,
  fingerColors: true,
};

export interface HistoryEntry {
  id: string;
  /** Znacznik czasu zakończenia (ms). */
  at: number;
  lang: Lang;
  words: number;
  focus: string;
  wpm: number;
  accuracy: number;
  durationMs: number;
  errors: number;
}

const SETTINGS_KEY = "tempo:settings:v1";
const HISTORY_KEY = "tempo:history:v1";
export const HISTORY_LIMIT = 50;

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Brak miejsca albo zablokowany storage — trudno, działamy dalej.
  }
}

const isLang = (v: unknown): v is Lang => v === "pl" || v === "en";

export function loadSettings(): Settings {
  const raw = read(SETTINGS_KEY);
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const r = raw as Partial<Record<keyof Settings, unknown>>;
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  return {
    lang: isLang(r.lang) ? r.lang : DEFAULT_SETTINGS.lang,
    count: WORD_COUNTS.includes(r.count as (typeof WORD_COUNTS)[number])
      ? (r.count as number)
      : DEFAULT_SETTINGS.count,
    punctuation: bool(r.punctuation, DEFAULT_SETTINGS.punctuation),
    digits: bool(r.digits, DEFAULT_SETTINGS.digits),
    focus: typeof r.focus === "string" ? r.focus.slice(0, 40) : DEFAULT_SETTINGS.focus,
    showKeyboard: bool(r.showKeyboard, DEFAULT_SETTINGS.showKeyboard),
    fingerColors: bool(r.fingerColors, DEFAULT_SETTINGS.fingerColors),
  };
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings);
}

function isEntry(v: unknown): v is HistoryEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.at === "number" &&
    isLang(e.lang) &&
    typeof e.words === "number" &&
    typeof e.focus === "string" &&
    typeof e.wpm === "number" &&
    typeof e.accuracy === "number" &&
    typeof e.durationMs === "number" &&
    typeof e.errors === "number"
  );
}

export function loadHistory(): HistoryEntry[] {
  const raw = read(HISTORY_KEY);
  return Array.isArray(raw) ? raw.filter(isEntry).slice(0, HISTORY_LIMIT) : [];
}

export function saveHistory(history: readonly HistoryEntry[]): void {
  write(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));
}
