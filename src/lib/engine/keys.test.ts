import { describe, expect, it } from "vitest";
import { KEYBOARD_ROWS, codeToKeyId, describeKeys, keysForChar } from "./keys";

describe("keysForChar", () => {
  it.each([
    ["a", ["a"]],
    [" ", ["space"]],
    ["ś", ["s", "altgr"]],
    ["ź", ["x", "altgr"]],
    ["A", ["a", "rshift"]],
    ["J", ["j", "lshift"]],
    ["Ż", ["z", "altgr", "rshift"]],
    ["?", ["/", "lshift"]],
    [".", ["."]],
    ["7", ["7"]],
  ])("%s → %j", (char, keys) => {
    expect(keysForChar(char)).toEqual(keys);
  });

  it("każdy klawisz bazowy istnieje na klawiaturze", () => {
    const ids = new Set(KEYBOARD_ROWS.flat().map((k) => k.id));
    for (const ch of "abcdefghijklmnopqrstuvwxyząćęłńóśźżABCŻ0123456789.,?!:;-") {
      for (const key of keysForChar(ch)) expect(ids, `${ch} → ${key}`).toContain(key);
    }
  });
});

describe("codeToKeyId", () => {
  it.each([
    ["KeyA", "a"],
    ["Digit5", "5"],
    ["Space", "space"],
    ["AltRight", "altgr"],
    ["ShiftLeft", "lshift"],
    ["Slash", "/"],
    ["F5", null],
    [undefined, null],
  ])("%s → %s", (code, id) => {
    expect(codeToKeyId(code)).toBe(id);
  });
});

describe("describeKeys", () => {
  it("opisuje kombinacje po polsku", () => {
    expect(describeKeys("ś", ["s", "altgr"])).toBe("AltGr + s");
    expect(describeKeys("A", ["a", "rshift"])).toBe("prawy Shift + a");
    expect(describeKeys("x", ["x"])).toBe("klawisz x");
    expect(describeKeys(" ", ["space"])).toBe("spacja");
  });
});
