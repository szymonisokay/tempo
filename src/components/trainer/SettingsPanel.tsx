import type { FocusResult } from "@/lib/engine";
import { WORD_COUNTS, type Settings } from "@/lib/storage";
import { ButtonGroup, PillButton } from "@/components/ui/ButtonGroup";
import { RefreshIcon } from "@/components/icons";
import { cn } from "@/lib/format";

const PRESETS: Record<Settings["lang"], string[]> = {
  pl: ["ą ę", "ś ź ż", "ł ń ó ć", "rz sz cz", "ch dź"],
  en: ["th", "ing", "wh", "q z x"],
};

interface SettingsPanelProps {
  settings: Settings;
  focusResult: FocusResult;
  /** Zmiana ustawień tekstu — zawsze generuje nowy tekst. */
  onChange: (patch: Partial<Settings>, options?: { focusTyping?: boolean }) => void;
  onNewText: () => void;
}

export function SettingsPanel({ settings, focusResult, onChange, onNewText }: SettingsPanelProps) {
  return (
    <section aria-label="Ustawienia tekstu" className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <ButtonGroup label="Język tekstu">
          <PillButton
            pressed={settings.lang === "pl"}
            onClick={() => onChange({ lang: "pl", focus: "" })}
          >
            Polski
          </PillButton>
          <PillButton
            pressed={settings.lang === "en"}
            onClick={() => onChange({ lang: "en", focus: "" })}
          >
            English
          </PillButton>
        </ButtonGroup>

        <ButtonGroup label="Długość tekstu">
          {WORD_COUNTS.map((count) => (
            <PillButton
              key={count}
              pressed={settings.count === count}
              onClick={() => onChange({ count })}
            >
              {count} słów
            </PillButton>
          ))}
        </ButtonGroup>

        <ButtonGroup label="Dodatki">
          <PillButton
            pressed={settings.punctuation}
            onClick={() => onChange({ punctuation: !settings.punctuation })}
          >
            Interpunkcja
          </PillButton>
          <PillButton
            pressed={settings.digits}
            onClick={() => onChange({ digits: !settings.digits })}
          >
            Cyfry
          </PillButton>
        </ButtonGroup>

        <button
          type="button"
          onClick={onNewText}
          className="ml-auto inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-xl bg-accent px-[18px] text-[15px] font-semibold text-bg transition-colors hover:bg-accent-hover"
        >
          <RefreshIcon className="size-[18px]" />
          Nowy tekst
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label htmlFor="litery" className="text-sm font-semibold">
          Ćwicz litery
        </label>
        <input
          id="litery"
          type="text"
          value={settings.focus}
          maxLength={40}
          onChange={(e) => onChange({ focus: e.target.value }, { focusTyping: false })}
          placeholder={settings.lang === "pl" ? "np. ż rz ść" : "e.g. th ing"}
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 w-44 rounded-[10px] border border-line-strong bg-bg px-3 font-mono text-base text-ink placeholder:text-pending focus:border-accent focus:outline-none"
        />
        {PRESETS[settings.lang].map((preset) => {
          const active = settings.focus === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ focus: active ? "" : preset })}
              className={cn(
                "min-h-11 cursor-pointer rounded-[10px] border px-3 font-mono text-[15px] transition-colors",
                active
                  ? "border-accent bg-raised text-accent"
                  : "border-line-strong text-ink-soft hover:text-ink",
              )}
            >
              {preset}
            </button>
          );
        })}
      </div>

      <FocusInfo result={focusResult} />
    </section>
  );
}

function FocusInfo({ result }: { result: FocusResult }) {
  if (result.status === "none") return null;
  return (
    <p className="text-[13px] text-muted">
      {result.status === "pool"
        ? `W słowniku jest ${result.poolSize} słów z tymi literami. Stanowią około 3/4 tekstu.`
        : "Za mało słów z tymi literami, więc tekst jest losowany ze wszystkich słów."}
    </p>
  );
}
