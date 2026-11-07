"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  NEUTRAL_KEYS,
  applyInput,
  codeToKeyId,
  computeStats,
  createSession,
  describeKeys,
  generateText,
  isFinished,
  keysForChar,
  lettersToPractice,
  nextStep,
  topMisses,
  type GeneratorOptions,
  type NextStep,
} from "@/lib/engine";
import {
  HISTORY_LIMIT,
  loadHistory,
  loadSettings,
  saveHistory,
  saveSettings,
  type HistoryEntry,
  type Settings,
} from "@/lib/storage";
import { formatClock, formatPercent } from "@/lib/format";
import { SettingsPanel } from "./SettingsPanel";
import { TypingArea } from "./TypingArea";
import { ResultsPanel } from "./ResultsPanel";
import { KeyboardPanel, type NextHint } from "./KeyboardPanel";
import { HistoryList } from "./HistoryList";
import type { Flash, HeldKeys } from "./Keyboard";

const INPUT_ID = "pole-pisania";
const FLASH_MS = 160;
const TICK_MS = 250;

function toGenerator(settings: Settings): GeneratorOptions {
  return {
    lang: settings.lang,
    count: settings.count,
    punctuation: settings.punctuation,
    digits: settings.digits,
    focus: settings.focus,
  };
}

function boot() {
  const settings = loadSettings();
  return { settings, text: generateText(toGenerator(settings)), history: loadHistory() };
}

function keysForStep(step: NextStep): string[] {
  if (!step) return [];
  if (step.type === "backspace") return ["bksp"];
  return keysForChar(step.char);
}

function hintForStep(step: NextStep, keys: readonly string[]): NextHint | null {
  if (!step) return null;
  if (step.type === "backspace") return { char: "⌫", label: "Backspace: popraw błąd" };
  return { char: step.char === " " ? "␣" : step.char, label: describeKeys(step.char, keys) };
}

export function Trainer() {
  const [initial] = useState(boot);
  const [settings, setSettings] = useState(initial.settings);
  const [text, setText] = useState(initial.text);
  const [session, setSession] = useState(() => createSession(initial.text.words));
  const [history, setHistory] = useState(initial.history);
  const [now, setNow] = useState(0);
  const [focused, setFocused] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [held, setHeld] = useState<HeldKeys>({ shift: null, altgr: false });
  const inputRef = useRef<HTMLInputElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const finished = isFinished(session);
  const running = session.startedAt !== null && !finished;

  // Zegar odświeża licznik czasu i WPM w trakcie pisania.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  function focusTyping() {
    inputRef.current?.focus();
  }

  /** Nowy tekst; `patch` zmienia ustawienia przed wygenerowaniem. */
  function restart(patch: Partial<Settings> = {}, options: { focusTyping?: boolean } = {}) {
    const next = { ...settings, ...patch };
    if (Object.keys(patch).length) {
      setSettings(next);
      saveSettings(next);
    }
    const generated = generateText(toGenerator(next));
    setText(generated);
    setSession(createSession(generated.words));
    setNow(0);
    if (options.focusTyping !== false) focusTyping();
  }

  function updateView(patch: Pick<Partial<Settings>, "showKeyboard" | "fingerColors">) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    focusTyping();
  }

  function handleInput(value: string) {
    const t = Date.now();
    const next = applyInput(session, value, t);
    if (next === session) return;
    setSession(next);
    setNow(t);

    if (isFinished(next)) {
      const stats = computeStats(next, t);
      const entry: HistoryEntry = {
        id: String(t),
        at: t,
        lang: settings.lang,
        words: next.words.length,
        focus: settings.focus.trim(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        durationMs: stats.elapsedMs,
        errors: stats.errors,
      };
      const updated = [entry, ...history].slice(0, HISTORY_LIMIT);
      setHistory(updated);
      saveHistory(updated);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" || (finished && e.key === "Enter")) {
      e.preventDefault();
      restart();
      return;
    }
    const id = codeToKeyId(e.code);
    // Ctrl pomijamy: w Windows AltGr wysyła też Ctrl, więc migałby przy każdym ą.
    if (!id || id === "lctrl" || id === "rctrl") return;
    if (id === "lshift" || id === "rshift") setHeld((h) => ({ ...h, shift: id }));
    if (id === "altgr" || e.key === "AltGraph") setHeld((h) => ({ ...h, altgr: true }));

    const required = keysForStep(nextStep(session));
    setFlash({ key: id, ok: NEUTRAL_KEYS.has(id) || required.includes(id) });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS);
  }

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>) {
    const id = codeToKeyId(e.code);
    if (id === "lshift" || id === "rshift") {
      setHeld((h) => (h.shift === id ? { ...h, shift: null } : h));
    }
    if (id === "altgr" || e.key === "AltGraph") setHeld((h) => ({ ...h, altgr: false }));
  }

  function clearHistory() {
    if (!window.confirm("Usunąć całą historię wyników z tej przeglądarki?")) return;
    setHistory([]);
    saveHistory([]);
  }

  const stats = computeStats(session, session.endedAt ?? now);
  const step = nextStep(session);
  const nextKeys = keysForStep(step);
  const hint = hintForStep(step, nextKeys);
  const progress = session.done.length / session.words.length;
  const practice = lettersToPractice(session);

  let status = "";
  if (!finished && !focused) status = "Kliknij w tekst, żeby zacząć pisać.";
  else if (!finished && session.startedAt === null) status = "Czas ruszy z pierwszym znakiem.";

  return (
    <>
      <SettingsPanel
        settings={settings}
        focusResult={text.focus}
        onChange={restart}
        onNewText={() => restart()}
      />

      <section aria-label="Pisanie" className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-baseline gap-x-7 gap-y-2 font-mono">
          <span className="text-4xl font-bold text-accent">
            {stats.wpm}
            <span className="text-[15px] font-medium text-muted"> WPM</span>
          </span>
          <span className="text-base text-ink-soft">{formatPercent(stats.accuracy)}% celności</span>
          <span className="text-base text-ink-soft">{formatClock(stats.elapsedMs)}</span>
          <span className="text-base text-ink-soft">
            {session.done.length} / {session.words.length} słów
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Postęp"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-1 rounded-full bg-surface-2"
        >
          <div
            className="h-1 rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            id={INPUT_ID}
            type="text"
            value={session.current}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setHeld({ shift: null, altgr: false });
            }}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Pole pisania"
            className="absolute top-0 left-0 size-px opacity-0"
          />
          {finished ? (
            <ResultsPanel
              stats={stats}
              wordCount={session.words.length}
              misses={topMisses(session)}
              practiceLetters={practice}
              onNewText={() => restart()}
              onPractice={() => restart({ focus: practice.join(" ") })}
            />
          ) : (
            <>
              <TypingArea session={session} inputId={INPUT_ID} idle={session.startedAt === null} />
              <p className="mt-2.5 min-h-[22px] text-[15px] text-muted">{status}</p>
            </>
          )}
        </div>
      </section>

      <KeyboardPanel
        hint={hint}
        nextKeys={nextKeys}
        flash={flash}
        held={held}
        showKeyboard={settings.showKeyboard}
        fingerColors={settings.fingerColors}
        onToggleKeyboard={() => updateView({ showKeyboard: !settings.showKeyboard })}
        onToggleFingerColors={() => updateView({ fingerColors: !settings.fingerColors })}
      />

      <HistoryList history={history} onClear={clearHistory} />

      <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted">
        <Shortcut keys="Esc">nowy tekst</Shortcut>
        <Shortcut keys="Spacja">następne słowo</Shortcut>
        <Shortcut keys="Backspace">poprawka w bieżącym słowie</Shortcut>
      </ul>
    </>
  );
}

function Shortcut({ keys, children }: { keys: string; children: string }) {
  return (
    <li>
      <kbd className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[13px] text-ink">
        {keys}
      </kbd>{" "}
      {children}
    </li>
  );
}
