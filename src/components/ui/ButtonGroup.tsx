import type { ReactNode } from "react";
import { cn } from "@/lib/format";

interface ButtonGroupProps {
  label: string;
  children: ReactNode;
  /** Tło grupy: „bg” na kartach, „surface” bezpośrednio na stronie. */
  tone?: "bg" | "surface";
}

export function ButtonGroup({ label, children, tone = "bg" }: ButtonGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-wrap gap-1 rounded-xl p-1",
        tone === "bg" ? "bg-bg" : "bg-surface",
      )}
    >
      {children}
    </div>
  );
}

interface PillButtonProps {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  mono?: boolean;
}

export function PillButton({ pressed, onClick, children, mono }: PillButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "min-h-11 cursor-pointer rounded-lg px-3.5 text-[15px] font-medium transition-colors",
        mono && "font-mono",
        pressed ? "bg-raised text-accent" : "text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
