import { ButtonGroup, PillButton } from "@/components/ui/ButtonGroup";
import { FINGER_LEGEND, Keyboard, type Flash, type HeldKeys } from "./Keyboard";

export interface NextHint {
  char: string;
  label: string;
}

interface KeyboardPanelProps {
  hint: NextHint | null;
  nextKeys: readonly string[];
  flash: Flash;
  held: HeldKeys;
  showKeyboard: boolean;
  fingerColors: boolean;
  onToggleKeyboard: () => void;
  onToggleFingerColors: () => void;
}

export function KeyboardPanel(props: KeyboardPanelProps) {
  const { hint, showKeyboard, fingerColors } = props;
  return (
    <section aria-label="Klawiatura" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-h-11 items-center gap-2.5 text-[15px] text-ink-soft">
          {hint && (
            <>
              Następny:
              <span className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-3 py-1.5 text-bg">
                <span className="font-mono text-lg font-bold">{hint.char}</span>
                <span className="text-[13px]">{hint.label}</span>
              </span>
            </>
          )}
        </div>
        <ButtonGroup label="Widok klawiatury" tone="surface">
          <PillButton pressed={showKeyboard} onClick={props.onToggleKeyboard}>
            Klawiatura
          </PillButton>
          <PillButton pressed={fingerColors} onClick={props.onToggleFingerColors}>
            Kolory palców
          </PillButton>
        </ButtonGroup>
      </div>

      {showKeyboard && (
        <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
          <Keyboard
            nextKeys={props.nextKeys}
            flash={props.flash}
            held={props.held}
            fingerColors={fingerColors}
            label={`Klawiatura ekranowa${hint ? `, następny: ${hint.label}` : ""}`}
          />
          {fingerColors && (
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
              <li>Palce:</li>
              {FINGER_LEGEND.map((finger) => (
                <li key={finger.label} className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="inline-block size-3.5 rounded"
                    style={{ background: finger.color }}
                  />
                  {finger.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
