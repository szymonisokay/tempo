import { describe, expect, it } from "vitest";
import { generateText, parseFocus, seededRandom } from "./generator";
import { WORDS } from "./words";

const base = { lang: "pl" as const, count: 50, punctuation: false, digits: false, focus: "" };

describe("parseFocus", () => {
  it("dzieli po spacjach i przecinkach, zachowując dwuznaki", () => {
    expect(parseFocus("ż rz, ść")).toEqual(["ż", "rz", "ść"]);
  });

  it("dłuższy ciąg bez spacji rozbija na litery", () => {
    expect(parseFocus("ąęś")).toEqual(["ą", "ę", "ś"]);
  });

  it("ignoruje wielkość liter, puste wpisy i duplikaty", () => {
    expect(parseFocus("  Ż ż ,, ")).toEqual(["ż"]);
  });
});

describe("generateText", () => {
  it("zwraca tyle słów, ile trzeba, ze słownika", () => {
    const { words, focus } = generateText(base, seededRandom(1));
    expect(words).toHaveLength(50);
    expect(words.every((w) => WORDS.pl.includes(w))).toBe(true);
    expect(focus).toEqual({ status: "none" });
  });

  it("jest powtarzalny dla tego samego ziarna", () => {
    expect(generateText(base, seededRandom(7)).words).toEqual(
      generateText(base, seededRandom(7)).words,
    );
  });

  it("nie powtarza tego samego słowa dwa razy z rzędu", () => {
    const { words } = generateText({ ...base, count: 500 }, seededRandom(3));
    for (let i = 1; i < words.length; i++) expect(words[i]).not.toBe(words[i - 1]);
  });

  it("przy skupieniu większość słów zawiera ćwiczone litery", () => {
    const { words, focus } = generateText({ ...base, count: 400, focus: "rz" }, seededRandom(5));
    const share = words.filter((w) => w.includes("rz")).length / words.length;
    expect(share).toBeGreaterThan(0.6);
    expect(focus.status).toBe("pool");
  });

  it("gdy pasujących słów jest za mało, losuje ze wszystkich", () => {
    const { focus } = generateText({ ...base, focus: "qx" }, seededRandom(2));
    expect(focus).toEqual({ status: "fallback", tokens: ["qx"] });
  });

  it("z interpunkcją zaczyna wielką literą i kończy kropką lub pytajnikiem", () => {
    const { words } = generateText({ ...base, punctuation: true }, seededRandom(11));
    expect(words[0][0]).toBe(words[0][0].toUpperCase());
    expect(words.at(-1)).toMatch(/[.?]$/);
  });

  it("z cyframi wstawia liczby", () => {
    const { words } = generateText({ ...base, count: 300, digits: true }, seededRandom(4));
    expect(words.some((w) => /^\d+$/.test(w))).toBe(true);
  });
});
