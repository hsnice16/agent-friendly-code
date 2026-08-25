export type RecentScore = {
  host: string;
  name: string;
  owner: string;
  score: number;
};

const KEY = "afc:recent-scores";

export const RECENTS_LIMIT = 10;

// Per-visitor and client-only on purpose. A shared list would be the one
// uncacheable read *and* write on the hot path, and it would publicly broadcast
// what repos strangers are scoring.
export function readRecents(): RecentScore[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((r): r is RecentScore => {
        const v = r as Partial<RecentScore>;
        return (
          typeof v?.host === "string" &&
          typeof v?.owner === "string" &&
          typeof v?.name === "string" &&
          typeof v?.score === "number"
        );
      })
      .slice(0, RECENTS_LIMIT);
  } catch {
    return [];
  }
}

export function writeRecent(entry: RecentScore): void {
  try {
    const existing = readRecents().filter(
      (r) => !(r.host === entry.host && r.owner === entry.owner && r.name === entry.name),
    );
    window.localStorage.setItem(KEY, JSON.stringify([entry, ...existing].slice(0, RECENTS_LIMIT)));
  } catch {}
}
