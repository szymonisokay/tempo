import { ALTGR_LETTERS, KEYBOARD_ROWS, type Finger } from "@/lib/engine";

export type Flash = { key: string; ok: boolean } | null;
export interface HeldKeys {
  shift: string | null;
  altgr: boolean;
}

const FINGER_RGB: Record<Finger, string> = {
  lp: "155,135,245",
  lr: "94,162,240",
  lm: "76,195,165",
  li: "232,169,58",
  ri: "232,169,58",
  rm: "76,195,165",
  rr: "94,162,240",
  rp: "155,135,245",
  thumb: "144,151,161",
};

export const FINGER_LEGEND = [
  { label: "mały palec", color: "rgb(155,135,245)" },
  { label: "serdeczny", color: "rgb(94,162,240)" },
  { label: "środkowy", color: "rgb(76,195,165)" },
  { label: "wskazujący", color: "rgb(232,169,58)" },
  { label: "kciuki", color: "rgb(144,151,161)" },
];

const ACCENT = "#f5b841";
const INK = "#eceae6";
const DARK = "#111317";
const ERROR = "#ff7a6b";

interface KeyboardProps {
  nextKeys: readonly string[];
  flash: Flash;
  held: HeldKeys;
  fingerColors: boolean;
  /** Opis dla czytników ekranu. */
  label: string;
}

export function Keyboard({ nextKeys, flash, held, fingerColors, label }: KeyboardProps) {
  return (
    <div className="overflow-x-auto">
      <div role="img" aria-label={label} className="flex min-w-[680px] flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((key) => {
              const rgb = FINGER_RGB[key.finger];
              let background = fingerColors ? `rgba(${rgb},0.16)` : "#22262e";
              let border = fingerColors ? `rgba(${rgb},0.55)` : "#2c313a";
              let color = INK;
              let subColor = ACCENT;
              let pressed = false;

              if (held.shift === key.id || (held.altgr && key.id === "altgr")) border = ACCENT;
              if (nextKeys.includes(key.id)) {
                background = ACCENT;
                border = ACCENT;
                color = DARK;
                subColor = DARK;
              }
              if (flash?.key === key.id) {
                background = flash.ok ? INK : ERROR;
                border = background;
                color = DARK;
                subColor = DARK;
                pressed = true;
              }

              return (
                <div
                  key={key.id}
                  className="flex h-[50px] min-w-0 basis-0 flex-col justify-between rounded-lg border px-2 py-1.5 transition-[background-color,transform] duration-75"
                  style={{
                    flexGrow: key.width,
                    background,
                    borderColor: border,
                    color,
                    transform: pressed ? "translateY(2px)" : undefined,
                  }}
                >
                  <span
                    className={
                      key.label.length > 1
                        ? "truncate font-mono text-xs font-semibold leading-none"
                        : "font-mono text-base font-semibold leading-none"
                    }
                  >
                    {key.label}
                  </span>
                  <span className="self-end font-mono text-[11px] leading-none" style={{ color: subColor }}>
                    {ALTGR_LETTERS[key.id] ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
