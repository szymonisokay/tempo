"use client";

import { memo, useLayoutEffect, useRef, type Ref } from "react";
import type { Session } from "@/lib/engine";
import { cn } from "@/lib/format";

interface TypingAreaProps {
  session: Session;
  /** id ukrytego pola — kliknięcie w tekst przenosi do niego fokus. */
  inputId: string;
  /** Kursor miga, dopóki test się nie zaczął. */
  idle: boolean;
}

/**
 * Pokazuje trzy linie tekstu. Gdy bieżące słowo schodzi do trzeciej linii,
 * tekst przewija się tak, żeby bieżąca linia była druga.
 */
export function TypingArea({ session, inputId, idle }: TypingAreaProps) {
  const innerRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const activeIndex = session.done.length;
  // Bieżące słowo może się zawinąć do nowej linii, gdy dopisujemy nadmiarowe znaki.
  const typedLength = session.current.length;

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const align = () => {
      const active = activeRef.current;
      if (!active) return;
      const shift = Math.max(0, active.offsetTop - active.offsetHeight);
      inner.style.transform = `translateY(-${shift}px)`;
    };
    align();
    // Inna szerokość okna = inne łamanie linii, więc liczymy przesunięcie od nowa.
    const observer = new ResizeObserver(align);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [activeIndex, typedLength, session.words]);

  return (
    <label
      htmlFor={inputId}
      className="block h-36 cursor-text overflow-hidden font-mono text-[26px] leading-[46px]"
    >
      <span
        ref={innerRef}
        className="relative flex flex-wrap content-start gap-x-4 transition-transform duration-150 ease-out"
      >
        {session.words.map((word, i) => {
          const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
          const typed =
            state === "done" ? session.done[i] : state === "active" ? session.current : "";
          return (
            <Word
              key={i}
              ref={state === "active" ? activeRef : undefined}
              word={word}
              typed={typed}
              state={state}
              blink={state === "active" && idle}
            />
          );
        })}
      </span>
    </label>
  );
}

interface WordProps {
  word: string;
  typed: string;
  state: "done" | "active" | "pending";
  blink: boolean;
  ref?: Ref<HTMLSpanElement>;
}

const CARET =
  "relative before:pointer-events-none before:absolute before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-accent before:content-['']";

const Word = memo(function Word({ word, typed, state, blink, ref }: WordProps) {
  const length = Math.max(word.length, typed.length);
  const chars = [];
  for (let p = 0; p < length; p++) {
    const expected = word[p];
    const got = typed[p];
    let tone: string;
    if (got === undefined) tone = state === "done" ? "text-error-soft" : "text-pending";
    else if (expected === undefined) tone = "text-error/70";
    else tone = got === expected ? "text-ink" : "text-error";

    let caret: string | false = false;
    if (state === "active") {
      if (p === typed.length) caret = cn(CARET, "before:-left-px");
      else if (typed.length >= length && p === length - 1) caret = cn(CARET, "before:-right-px");
      if (caret && blink) caret = cn(caret, "before:animate-[caret-blink_1s_infinite]");
    }

    chars.push(
      <span key={p} className={cn(tone, caret)}>
        {expected ?? got}
      </span>,
    );
  }

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block border-b-2 whitespace-pre",
        state === "done" && typed !== word ? "border-error" : "border-transparent",
      )}
    >
      {chars}
    </span>
  );
});
