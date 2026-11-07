/**
 * Układ „polski programisty” (QWERTY + AltGr) i mapowanie znaków na klawisze.
 */

export type Finger = "lp" | "lr" | "lm" | "li" | "ri" | "rm" | "rr" | "rp" | "thumb";

export interface KeyDef {
  id: string;
  label: string;
  /** Szerokość w jednostkach zwykłego klawisza. */
  width: number;
  finger: Finger;
}

const key = (id: string, label: string, width: number, finger: Finger): KeyDef => ({
  id,
  label,
  width,
  finger,
});
const k = (id: string, finger: Finger) => key(id, id, 1, finger);

export const KEYBOARD_ROWS: readonly (readonly KeyDef[])[] = [
  [
    k("`", "lp"), k("1", "lp"), k("2", "lr"), k("3", "lm"), k("4", "li"), k("5", "li"),
    k("6", "ri"), k("7", "ri"), k("8", "rm"), k("9", "rr"), k("0", "rp"), k("-", "rp"),
    k("=", "rp"), key("bksp", "Backspace", 2, "rp"),
  ],
  [
    key("tab", "Tab", 1.5, "lp"), k("q", "lp"), k("w", "lr"), k("e", "lm"), k("r", "li"),
    k("t", "li"), k("y", "ri"), k("u", "ri"), k("i", "rm"), k("o", "rr"), k("p", "rp"),
    k("[", "rp"), k("]", "rp"), key("bslash", "\\", 1.5, "rp"),
  ],
  [
    key("caps", "Caps", 1.75, "lp"), k("a", "lp"), k("s", "lr"), k("d", "lm"), k("f", "li"),
    k("g", "li"), k("h", "ri"), k("j", "ri"), k("k", "rm"), k("l", "rr"), k(";", "rp"),
    key("quote", "'", 1, "rp"), key("enter", "Enter", 2.25, "rp"),
  ],
  [
    key("lshift", "Shift", 2.25, "lp"), k("z", "lp"), k("x", "lr"), k("c", "lm"), k("v", "li"),
    k("b", "li"), k("n", "ri"), k("m", "ri"), k(",", "rm"), k(".", "rr"), k("/", "rp"),
    key("rshift", "Shift", 2.75, "rp"),
  ],
  [
    key("lctrl", "Ctrl", 1.5, "lp"), key("alt", "Alt", 1.5, "thumb"),
    key("space", "Spacja", 8, "thumb"), key("altgr", "AltGr", 2.5, "thumb"),
    key("rctrl", "Ctrl", 1.5, "rp"),
  ],
];

/** Litera bazowa → znak z AltGr. */
export const ALTGR_LETTERS: Readonly<Record<string, string>> = {
  a: "ą", c: "ć", e: "ę", l: "ł", n: "ń", o: "ó", s: "ś", x: "ź", z: "ż",
};

const DIACRITIC_BASE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(ALTGR_LETTERS).map(([base, diacritic]) => [diacritic, base]),
);

/** Znaki z Shiftem, które nie są wielkimi literami. */
const SHIFT_SYMBOLS: Readonly<Record<string, string>> = {
  "?": "/", "!": "1", ":": ";", "(": "9", ")": "0", "_": "-", '"': "quote",
};

const LEFT_HAND = new Set(Array.from("`12345qwertasdfgzxcvb"));

/** Shift po przeciwnej stronie niż klawisz — tak uczy się pisania 10 palcami. */
export function shiftKeyFor(baseKey: string): "lshift" | "rshift" {
  return LEFT_HAND.has(baseKey) ? "rshift" : "lshift";
}

/** Klawisze potrzebne do wpisania znaku: [klawisz bazowy, ...modyfikatory]. */
export function keysForChar(char: string): string[] {
  if (char === " ") return ["space"];
  const lower = char.toLowerCase();
  const isUpper = char !== lower;
  const keys: string[] = [];
  let base: string;
  if (DIACRITIC_BASE[lower]) {
    base = DIACRITIC_BASE[lower];
    keys.push("altgr");
  } else if (SHIFT_SYMBOLS[char]) {
    base = SHIFT_SYMBOLS[char];
    keys.push(shiftKeyFor(base));
  } else {
    base = lower;
  }
  if (isUpper) keys.push(shiftKeyFor(base));
  return [base, ...keys];
}

const CODE_TO_KEY: Readonly<Record<string, string>> = {
  Space: "space", Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]",
  Backslash: "bslash", Semicolon: ";", Quote: "quote", Comma: ",", Period: ".",
  Slash: "/", Backquote: "`", Backspace: "bksp", Tab: "tab", CapsLock: "caps",
  Enter: "enter", ShiftLeft: "lshift", ShiftRight: "rshift", AltLeft: "alt",
  AltRight: "altgr", ControlLeft: "lctrl", ControlRight: "rctrl",
};

/** KeyboardEvent.code → id klawisza z KEYBOARD_ROWS (fizyczne położenie). */
export function codeToKeyId(code: string | undefined): string | null {
  if (!code) return null;
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit")) return code.slice(5);
  return CODE_TO_KEY[code] ?? null;
}

/** Klawisze, których naciśnięcie nigdy nie jest „błędem”. */
export const NEUTRAL_KEYS: ReadonlySet<string> = new Set([
  "lshift", "rshift", "altgr", "alt", "caps", "bksp", "lctrl", "rctrl",
]);

const KEY_NAMES: Readonly<Record<string, string>> = {
  lshift: "lewy Shift",
  rshift: "prawy Shift",
  altgr: "AltGr",
  quote: "'",
  bslash: "\\",
};

/** Opis dla człowieka, np. „AltGr + s” albo „prawy Shift + a”. */
export function describeKeys(char: string, keys: readonly string[]): string {
  if (char === " ") return "spacja";
  const [base, ...mods] = keys;
  const baseName = KEY_NAMES[base] ?? base;
  if (!mods.length) return `klawisz ${baseName}`;
  return [...mods.map((m) => KEY_NAMES[m] ?? m), baseName].join(" + ");
}
