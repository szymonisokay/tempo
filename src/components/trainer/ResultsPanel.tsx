import { EXTRA_CHAR, type Miss, type Stats } from "@/lib/engine";
import { formatClock, formatPercent } from "@/lib/format";

interface ResultsPanelProps {
  stats: Stats;
  wordCount: number;
  misses: Miss[];
  practiceLetters: string[];
  onNewText: () => void;
  onPractice: () => void;
}

function missLabel(char: string): string {
  if (char === EXTRA_CHAR) return "nadmiarowe";
  if (char === " ") return "spacja";
  return char;
}

export function ResultsPanel(props: ResultsPanelProps) {
  const { stats, misses, practiceLetters } = props;
  return (
    <div aria-live="polite" className="flex flex-col gap-6 rounded-2xl bg-surface p-7">
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-5">
        <div>
          <dt className="text-sm text-muted">WPM</dt>
          <dd className="mt-1 font-mono text-[52px] leading-none font-bold text-accent">{stats.wpm}</dd>
        </div>
        <Stat label="Znaki na minutę" value={String(stats.cpm)} />
        <Stat label="Celność" value={`${formatPercent(stats.accuracy)}%`} />
        <Stat label="Czas" value={formatClock(stats.elapsedMs)} />
        <Stat label="Poprawne słowa" value={`${stats.correctWords}/${props.wordCount}`} />
        <Stat label="Błędy" value={String(stats.errors)} />
      </dl>

      {misses.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <p className="text-sm font-semibold">Najczęściej mylone</p>
          <ul className="flex flex-wrap gap-2">
            {misses.map((miss) => (
              <li
                key={miss.char}
                className="flex items-baseline gap-2 rounded-[10px] bg-surface-2 px-3 py-2"
              >
                <span className="font-mono text-lg font-bold">{missLabel(miss.char)}</span>
                <span className="text-[13px] text-ink-soft">× {miss.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={props.onNewText}
          className="min-h-12 cursor-pointer rounded-[10px] bg-accent px-5 font-semibold text-bg transition-colors hover:bg-accent-hover"
        >
          Nowy tekst
        </button>
        {practiceLetters.length > 0 && (
          <button
            type="button"
            onClick={props.onPractice}
            className="min-h-12 cursor-pointer rounded-[10px] bg-raised px-5 font-medium text-ink transition-colors hover:bg-line-strong"
          >
            Ćwicz te litery: <span className="font-mono">{practiceLetters.join(" ")}</span>
          </button>
        )}
        <span className="text-sm text-muted">albo naciśnij Enter</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-[30px] font-bold">{value}</dd>
    </div>
  );
}
