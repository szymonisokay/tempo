/**
 * Stan jednej sesji pisania i czyste funkcje, które go zmieniają.
 * Bez Reacta i bez DOM — łatwo to testować i przenieść gdzie indziej.
 *
 * Model: tekst to lista słów. Spacja zatwierdza bieżące słowo i przechodzi
 * do następnego. Poprawiać (Backspace) można tylko bieżące słowo.
 */

export interface Session {
  readonly words: readonly string[];
  /** Zatwierdzone słowa — dokładnie tak, jak je wpisano. */
  readonly done: readonly string[];
  /** To, co wpisano w bieżącym słowie. */
  readonly current: string;
  readonly startedAt: number | null;
  readonly endedAt: number | null;
  /** Wszystkie naciśnięcia, które dodały znak (łącznie ze spacją). */
  readonly keystrokes: number;
  /** Naciśnięcia, które dodały zły znak. */
  readonly errors: number;
  /** Ile razy pomylono dany oczekiwany znak. */
  readonly missed: Readonly<Record<string, number>>;
}

/** Klucz w `missed` dla znaków wpisanych ponad długość słowa. */
export const EXTRA_CHAR = "extra";
/** Ile nadmiarowych znaków można wpisać w jednym słowie. */
export const MAX_OVERFLOW = 8;

export function createSession(words: readonly string[]): Session {
  return {
    words,
    done: [],
    current: "",
    startedAt: null,
    endedAt: null,
    keystrokes: 0,
    errors: 0,
    missed: {},
  };
}

export function isFinished(session: Session): boolean {
  return session.endedAt !== null;
}

/** Pozycja pierwszego błędu we wpisanym fragmencie słowa albo -1. */
export function firstErrorIndex(typed: string, word: string): number {
  for (let p = 0; p < typed.length; p++) {
    if (p >= word.length || typed[p] !== word[p]) return p;
  }
  return -1;
}

/**
 * Przyjmuje aktualną wartość ukrytego pola tekstowego i zwraca nowy stan.
 * Zwraca ten sam obiekt, jeśli nic się nie zmieniło.
 */
export function applyInput(session: Session, rawValue: string, now: number): Session {
  if (isFinished(session)) return session;
  const index = session.done.length;
  const word = session.words[index];
  if (word === undefined) return session;

  let value = rawValue.normalize("NFC");
  if (value.trim() === "") {
    // Spacja na początku słowa niczego nie zatwierdza.
    return session.current === "" ? session : { ...session, current: "" };
  }

  const startedAt = session.startedAt ?? now;
  let keystrokes = session.keystrokes;
  let errors = session.errors;
  const missed: Record<string, number> = { ...session.missed };
  const miss = (key: string) => {
    errors += 1;
    missed[key] = (missed[key] ?? 0) + 1;
  };

  if (/\s$/.test(value)) {
    const typed = value.trim();
    keystrokes += 1;
    // Spacja w środku słowa = pominięty znak.
    if (typed.length < word.length) miss(word[typed.length]);
    const done = [...session.done, typed];
    return {
      ...session,
      done,
      current: "",
      startedAt,
      keystrokes,
      errors,
      missed,
      endedAt: done.length >= session.words.length ? now : null,
    };
  }

  if (value.length > word.length + MAX_OVERFLOW) {
    value = value.slice(0, word.length + MAX_OVERFLOW);
  }
  for (let p = session.current.length; p < value.length; p++) {
    keystrokes += 1;
    if (p >= word.length) miss(EXTRA_CHAR);
    else if (value[p] !== word[p]) miss(word[p]);
  }

  const isLastWord = index === session.words.length - 1;
  if (isLastWord && value === word) {
    // Ostatnie słowo kończy test bez spacji.
    return {
      ...session,
      done: [...session.done, value],
      current: "",
      startedAt,
      keystrokes,
      errors,
      missed,
      endedAt: now,
    };
  }

  return { ...session, current: value, startedAt, keystrokes, errors, missed };
}

export type NextStep = { type: "char"; char: string } | { type: "backspace" } | null;

/** Co użytkownik powinien nacisnąć teraz. */
export function nextStep(session: Session): NextStep {
  if (isFinished(session)) return null;
  const word = session.words[session.done.length];
  if (word === undefined) return null;
  if (firstErrorIndex(session.current, word) !== -1) return { type: "backspace" };
  const char = session.current.length < word.length ? word[session.current.length] : " ";
  return { type: "char", char };
}

export interface Stats {
  elapsedMs: number;
  /** Poprawne znaki / 5 na minutę. */
  wpm: number;
  /** Wszystkie wpisane znaki / 5 na minutę. */
  rawWpm: number;
  /** Poprawne znaki na minutę. */
  cpm: number;
  /** Procent naciśnięć bez błędu, z jednym miejscem po przecinku. */
  accuracy: number;
  correctWords: number;
  errors: number;
}

export function computeStats(session: Session, now: number): Stats {
  const end = session.endedAt ?? now;
  const elapsedMs = session.startedAt === null ? 0 : Math.max(end - session.startedAt, 0);

  let correctChars = 0;
  let correctWords = 0;
  const lastIndex = session.words.length - 1;
  session.done.forEach((typed, i) => {
    const word = session.words[i];
    if (typed === word) {
      correctWords += 1;
      correctChars += word.length + (i < lastIndex ? 1 : 0);
    }
  });
  if (!isFinished(session)) {
    const word = session.words[session.done.length];
    if (word !== undefined) {
      for (let p = 0; p < session.current.length && p < word.length; p++) {
        if (session.current[p] !== word[p]) break;
        correctChars += 1;
      }
    }
  }

  // Poniżej sekundy wynik skacze jak szalony — pokazujemy 0.
  const ready = elapsedMs >= 1000;
  const minutes = elapsedMs / 60000;
  const perMinute = (chars: number) => (ready ? Math.round(chars / minutes) : 0);

  return {
    elapsedMs,
    wpm: ready ? Math.round(correctChars / 5 / minutes) : 0,
    rawWpm: ready ? Math.round(session.keystrokes / 5 / minutes) : 0,
    cpm: perMinute(correctChars),
    accuracy: session.keystrokes
      ? Math.round(((session.keystrokes - session.errors) / session.keystrokes) * 1000) / 10
      : 100,
    correctWords,
    errors: session.errors,
  };
}

export interface Miss {
  char: string;
  count: number;
}

export function topMisses(session: Session, limit = 6): Miss[] {
  return Object.entries(session.missed)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char, "pl"))
    .slice(0, limit);
}

/** Litery z najczęstszych błędów — gotowe do wpisania w „Ćwicz litery”. */
export function lettersToPractice(session: Session, limit = 4): string[] {
  const letters: string[] = [];
  for (const { char } of topMisses(session, Infinity)) {
    const lower = char.toLowerCase();
    if (/^\p{L}$/u.test(lower) && !letters.includes(lower)) letters.push(lower);
    if (letters.length >= limit) break;
  }
  return letters;
}
