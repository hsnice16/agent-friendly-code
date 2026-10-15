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

export function hostLabel(host: string): string {
  return HOST_LABELS[host] ?? host;
}

// One decimal under 1%: rounding "1 of 371" to "0%" would read as "none".
export function percent(part: number, total: number): string {
  const value = total === 0 ? 0 : (part / total) * 100;
  return `${value > 0 && value < 1 ? value.toFixed(1) : Math.round(value)}%`;
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
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
