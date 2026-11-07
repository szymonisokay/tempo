import { describe, expect, it } from "vitest";
import {
  EXTRA_CHAR,
  applyInput,
  computeStats,
  createSession,
  isFinished,
  lettersToPractice,
  nextStep,
  topMisses,
  type Session,
} from "./session";

/** Symuluje pisanie znak po znaku, tak jak robi to pole tekstowe. */
function type(session: Session, text: string, start = 0, msPerKey = 100): Session {
  let s = session;
  let value = s.current;
  let t = start;
  for (const ch of text) {
    if (ch === "\b") value = value.slice(0, -1);
    else value += ch;
    s = applyInput(s, value, t);
    if (s.current === "") value = "";
    t += msPerKey;
  }
  return s;
}

describe("applyInput", () => {
  it("startuje zegar przy pierwszym znaku", () => {
    const s = applyInput(createSession(["ala"]), "a", 1234);
    expect(s.startedAt).toBe(1234);
    expect(s.current).toBe("a");
  });

  it("spacja na początku słowa nic nie robi", () => {
    const s0 = createSession(["ala", "ma"]);
    expect(applyInput(s0, " ", 0)).toBe(s0);
  });

  it("spacja zatwierdza słowo", () => {
    const s = type(createSession(["ala", "ma"]), "ala ");
    expect(s.done).toEqual(["ala"]);
    expect(s.current).toBe("");
    expect(s.errors).toBe(0);
  });

  it("liczy błędy pod oczekiwanym znakiem", () => {
    const s = type(createSession(["żaba", "kot"]), "zaba ");
    expect(s.errors).toBe(1);
    expect(s.missed).toEqual({ ż: 1 });
  });

  it("spacja w połowie słowa to pominięty znak", () => {
    const s = type(createSession(["kot", "pies"]), "ko ");
    expect(s.done).toEqual(["ko"]);
    expect(s.missed).toEqual({ t: 1 });
  });

  it("nadmiarowe znaki są błędami i mają limit", () => {
    const s = type(createSession(["a", "b"]), "a" + "x".repeat(20));
    expect(s.current).toHaveLength(9);
    expect(s.missed[EXTRA_CHAR]).toBeGreaterThan(0);
  });

  it("Backspace nie dolicza naciśnięć", () => {
    const s = type(createSession(["kot", "pies"]), "kp\bo");
    expect(s.current).toBe("ko");
    expect(s.keystrokes).toBe(3);
    expect(s.errors).toBe(1);
  });

  it("ostatnie słowo kończy test bez spacji", () => {
    const s = type(createSession(["ala", "ma"]), "ala ma", 0);
    expect(isFinished(s)).toBe(true);
    expect(s.done).toEqual(["ala", "ma"]);
  });

  it("po zakończeniu ignoruje dalsze wpisywanie", () => {
    const s = type(createSession(["a"]), "a");
    expect(applyInput(s, "b", 999)).toBe(s);
  });

  it("normalizuje Unicode (a + ogonek → ą)", () => {
    const s = applyInput(createSession(["ą", "b"]), "ą", 0);
    expect(s.current).toBe("ą");
    expect(s.errors).toBe(0);
  });
});

describe("nextStep", () => {
  it("podaje następny znak, a po słowie spację", () => {
    let s = createSession(["ok", "tak"]);
    expect(nextStep(s)).toEqual({ type: "char", char: "o" });
    s = type(s, "ok");
    expect(nextStep(s)).toEqual({ type: "char", char: " " });
  });

  it("po błędzie każe użyć Backspace", () => {
    const s = type(createSession(["ok", "tak"]), "x");
    expect(nextStep(s)).toEqual({ type: "backspace" });
  });

  it("po zakończeniu zwraca null", () => {
    expect(nextStep(type(createSession(["a"]), "a"))).toBeNull();
  });
});

describe("computeStats", () => {
  it("liczy WPM ze znaków poprawnych słów (z odstępami)", () => {
    // 10 słów po 4 litery + 9 spacji = 49 znaków w 6 sekund.
    const words = Array(10).fill("abcd");
    let s = createSession(words);
    s = applyInput(s, "a", 0);
    s = { ...type(s, "bcd " + "abcd ".repeat(8) + "abcd", 0, 0), endedAt: 6000 };
    const stats = computeStats(s, 6000);
    expect(stats.correctWords).toBe(10);
    expect(stats.cpm).toBe(490);
    expect(stats.wpm).toBe(98);
    expect(stats.accuracy).toBe(100);
  });

  it("w pierwszej sekundzie pokazuje 0 WPM", () => {
    const s = applyInput(createSession(["abc"]), "a", 0);
    expect(computeStats(s, 500).wpm).toBe(0);
  });

  it("celność z jednym miejscem po przecinku", () => {
    const s = type(createSession(["abc", "d"]), "abx\bc ");
    // 5 naciśnięć dodających znak (a, b, x, c, spacja), w tym 1 błąd.
    expect(s.keystrokes).toBe(5);
    expect(computeStats(s, 10_000).accuracy).toBe(80);
  });
});

describe("topMisses i lettersToPractice", () => {
  it("sortuje błędy i wybiera tylko litery", () => {
    const s = {
      ...createSession(["x"]),
      missed: { ż: 3, Ę: 2, [EXTRA_CHAR]: 5, ".": 4, ę: 1 },
    };
    expect(topMisses(s, 2)).toEqual([
      { char: EXTRA_CHAR, count: 5 },
      { char: ".", count: 4 },
    ]);
    expect(lettersToPractice(s)).toEqual(["ż", "ę"]);
  });
});
