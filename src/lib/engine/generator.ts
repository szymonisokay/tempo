import type { Lang, Random } from "./types";
import { WORDS } from "./words";

export interface GeneratorOptions {
  lang: Lang;
  /** Liczba słów w tekście. */
  count: number;
  /** Wielkie litery na początku zdań, kropki, przecinki i pytajniki. */
  punctuation: boolean;
  /** Od czasu do czasu wstaw liczbę zamiast słowa. */
  digits: boolean;
  /** Litery lub połączenia do ćwiczenia, np. "ż rz ść". Pusty = bez skupienia. */
  focus: string;
}

export type FocusResult =
  | { status: "none" }
  | { status: "pool"; tokens: string[]; poolSize: number }
  | { status: "fallback"; tokens: string[] };

export interface GeneratedText {
  words: string[];
  focus: FocusResult;
}

/** Jaka część słów ma pochodzić z puli „ćwiczonych” liter. */
export const FOCUS_SHARE = 0.75;
/** Minimalna liczba pasujących słów, żeby skupienie miało sens. */
export const MIN_FOCUS_POOL = 3;
const DIGIT_CHANCE = 0.1;
const COMMA_CHANCE = 0.12;
const QUESTION_CHANCE = 0.15;

/**
 * Zamienia wpis użytkownika na listę liter / połączeń.
 * "ż rz, ść" → ["ż", "rz", "ść"]; "ąęś" → ["ą", "ę", "ś"] (dłuższe ciągi bez
 * spacji traktujemy jako pojedyncze litery).
 */
export function parseFocus(focus: string): string[] {
  const out: string[] = [];
  for (const token of focus.normalize("NFC").toLowerCase().split(/[\s,;]+/)) {
    if (!token) continue;
    if (token.length > 2) out.push(...Array.from(token));
    else out.push(token);
  }
  return Array.from(new Set(out));
}

function pick<T>(list: readonly T[], random: Random): T {
  return list[Math.floor(random() * list.length)];
}

function sentenceLength(random: Random): number {
  return 4 + Math.floor(random() * 6);
}

export function generateText(
  options: GeneratorOptions,
  random: Random = Math.random,
): GeneratedText {
  const source = WORDS[options.lang];
  const tokens = parseFocus(options.focus);
  const pool = tokens.length
    ? source.filter((word) => tokens.some((t) => word.includes(t)))
    : [];
  const usePool = pool.length >= MIN_FOCUS_POOL;

  const words: string[] = [];
  let previous = "";
  let inSentence = 0;
  let target = sentenceLength(random);

  for (let i = 0; i < options.count; i++) {
    let word: string;
    if (options.digits && random() < DIGIT_CHANCE) {
      word = String(1 + Math.floor(random() * 1999));
    } else {
      const from = usePool && random() < FOCUS_SHARE ? pool : source;
      word = pick(from, random);
      if (word === previous && from.length > 1) {
        word = from[(from.indexOf(word) + 1) % from.length];
      }
    }
    previous = word;

    if (options.punctuation) {
      if (inSentence === 0) word = word.charAt(0).toUpperCase() + word.slice(1);
      inSentence += 1;
      const last = i === options.count - 1;
      if (last || inSentence >= target) {
        word += random() < QUESTION_CHANCE ? "?" : ".";
        inSentence = 0;
        target = sentenceLength(random);
      } else if (random() < COMMA_CHANCE) {
        word += ",";
      }
    }
    words.push(word);
  }

  let focus: FocusResult = { status: "none" };
  if (tokens.length) {
    focus = usePool
      ? { status: "pool", tokens, poolSize: pool.length }
      : { status: "fallback", tokens };
  }
  return { words, focus };
}

/** Deterministyczny generator liczb losowych (mulberry32) — do testów. */
export function seededRandom(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
