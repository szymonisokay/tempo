/** Małe pomocniki do formatowania liczb i dat po polsku. */

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** 75 500 ms → „1:15”. */
export function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const seconds = total % 60;
  return `${Math.floor(total / 60)}:${seconds.toString().padStart(2, "0")}`;
}

const percentFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 });

/** 96.4 → „96,4”. */
export function formatPercent(value: number): string {
  return percentFormat.format(value);
}

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(timestamp: number): string {
  return dateFormat.format(timestamp);
}
