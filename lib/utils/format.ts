import { HOST_LABELS } from "../constants/hosts";

// Intl.NumberFormat handles locale-aware compaction: 30090 → "30K", 1_400_000 → "1.4M".
// We lowercase for aesthetics ("30k" reads a touch softer than "30K").
const COMPACT_NUMBER = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function compactNumber(n: number): string {
  return COMPACT_NUMBER.format(n).toLowerCase();
}

export function compactStars(n: number | null, withSuffix = true): string {
  if (n == null) {
    return "—";
  }

  return `${compactNumber(n)}${withSuffix ? " ★" : ""}`;
}

export function relativeTime(epochSec: number): string {
  const diff = Date.now() / 1000 - epochSec;

  if (diff < 60) {
    return `${Math.round(diff)}s ago`;
  }
  if (diff < 3600) {
    return `${Math.round(diff / 60)}m ago`;
  }
  if (diff < 86400) {
    return `${Math.round(diff / 3600)}h ago`;
  }

  return `${Math.round(diff / 86400)}d ago`;
}

export function hostLabel(host: string): string {
  return HOST_LABELS[host] ?? host;
}
