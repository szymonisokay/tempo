import type { Lang } from "@/lib/engine";
import type { HistoryEntry } from "@/lib/storage";
import { formatDateTime, formatPercent } from "@/lib/format";

const LANG_NAMES: Record<Lang, string> = { pl: "Polski", en: "English" };
const VISIBLE = 5;

interface HistoryListProps {
  history: HistoryEntry[];
  onClear: () => void;
}

export function HistoryList({ history, onClear }: HistoryListProps) {
  if (!history.length) return null;

  const best = (lang: Lang) =>
    history.filter((e) => e.lang === lang).reduce((max, e) => Math.max(max, e.wpm), 0);
  const records = (["pl", "en"] as const)
    .map((lang) => ({ lang, wpm: best(lang) }))
    .filter((r) => r.wpm > 0);

  return (
    <section aria-labelledby="historia" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="historia" className="text-base font-semibold">
          Historia
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          {records.map((r) => (
            <span key={r.lang}>
              Rekord {LANG_NAMES[r.lang]}:{" "}
              <strong className="font-mono text-ink">{r.wpm} WPM</strong>
            </span>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 cursor-pointer rounded-[10px] px-3 text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Wyczyść
          </button>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5">
        {history.slice(0, VISIBLE).map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap justify-between gap-2 rounded-[10px] bg-surface px-4 py-3 text-sm"
          >
            <span className="text-ink-soft">
              {formatDateTime(entry.at)} · {LANG_NAMES[entry.lang]} · {entry.words} słów
              {entry.focus && ` · litery: ${entry.focus}`}
            </span>
            <span className="font-mono">
              <strong>{entry.wpm}</strong> WPM · {formatPercent(entry.accuracy)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
