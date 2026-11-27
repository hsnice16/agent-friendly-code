import { HOST_LABELS } from "../constants/hosts";

const COMPACT_NUMBER = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function compactNumber(n: number): string {
  return COMPACT_NUMBER.format(n).toLowerCase();
}

export function compactStars(n: number | null, withSuffix = true): string {
  if (n == null) {
    return "—";
  }

  return `${compactNumber(n)}${withSuffix ? " ★" : ""}`;
}

export function relativeTime(epochSec: number): string {
  // A score saved on another machine can be a few seconds ahead of this clock.
  const diff = Math.max(0, Date.now() / 1000 - epochSec);

  if (diff < 60) {
    return `${Math.floor(diff)}s ago`;
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return `${Math.floor(diff / 86400)}d ago`;
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function hostLabel(host: string): string {
  return HOST_LABELS[host] ?? host;
}

// One decimal within 1% of either end: "1 of 371" as "0%" would read as "none",
// "401 of 402" as "100%" as "all". Multiplying first keeps 23 of 40 at 57.5, not 57.4999….
export function percent(part: number, total: number): string {
  const value = total === 0 ? 0 : (part * 100) / total;
  const nearEnd = (value > 0 && value < 1) || (value > 99 && value < 100);
  return `${nearEnd ? value.toFixed(1) : Math.round(value)}%`;
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const MONTH = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

// Fixed locale and zone, and server-side only: ICU output differs between Node
// and browsers, so a date formatted during hydration can mismatch the static HTML.
export function formatDate(epochSec: number, { time = false }: { time?: boolean } = {}): string {
  return (time ? DATE_TIME : DATE).format(new Date(epochSec * 1000));
}

export function formatMonth(epochSec: number): string {
  return MONTH.format(new Date(epochSec * 1000));
}

/** A YYYY-MM-DD day as epoch seconds at its UTC midnight. */
export function dayEpoch(date: string): number {
  return Date.parse(`${date}T00:00:00Z`) / 1000;
}

/** A YYYY-MM-DD day as `formatDate` writes it. */
export function formatDay(date: string): string {
  return formatDate(dayEpoch(date));
}
