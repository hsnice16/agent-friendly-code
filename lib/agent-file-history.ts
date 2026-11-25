import type { SnapshotRow } from "./agents-md-adoption";
import { hasAgentFile, OTHER_FILES } from "./utils/agent-instructions";

// No data import, so scripts/agents-md-adoption.ts can build the file it writes.

/** `agentsMd` / `claudeMd`: that file at the root is what the agents_md check matched. */
const HISTORY_KEYS = ["agentsMd", "claudeMd", ...OTHER_FILES.map((f) => f.key)] as const;
export type HistoryKey = (typeof HISTORY_KEYS)[number];

/**
 * Snapshot days, YYYY-MM-DD. `lastMissed`: the last day before `firstFound` that
 * the same version of the checks did not find it; null when every miss was by
 * an older version, which may simply not have recognised the file.
 */
export type FirstSeen = { checkedFrom: string; firstFound: string; lastMissed: string | null };

/** Keyed by lowercased repo URL; a repo whose files were never found is left out. */
export type FileHistory = Record<string, Partial<Record<HistoryKey, FirstSeen>>>;

type Miss = { date: string; scorer: string };
type KeyAcc = { checkedFrom: string; misses: Miss[]; seen: FirstSeen | null };
type RepoAcc = { url: string; id: number | null; last: string; keys: Map<HistoryKey, KeyAcc>; hadAgentsMd: boolean };
type Acc = { last: string; repos: RepoAcc[]; byId: Map<number, RepoAcc>; byUrl: Map<string, RepoAcc> };

const OTHER_KEY = new Map<string, HistoryKey>(OTHER_FILES.map((f) => [f.signalId, f.key]));

export function newHistory(): Acc {
  return { last: "", repos: [], byId: new Map(), byUrl: new Map() };
}

// By URL, or for a URL not seen before, by id: a rename keeps the id (react's
// history spans facebook/react and react/react). The first days' reseeds
// handed ids to other repos, so an id only carries over when its old URL is
// gone from the same snapshot.
function repoOf(acc: Acc, r: SnapshotRow, date: string, urls: Set<string>): RepoAcc {
  const url = r.url.toLowerCase();
  const id = r.repoId ?? null;
  const renamed = id != null ? acc.byId.get(id) : undefined;
  let repo = acc.byUrl.get(url) ?? (renamed && renamed.id === id && !urls.has(renamed.url) ? renamed : undefined);
  if (!repo) {
    repo = { url, id, last: date, keys: new Map(), hadAgentsMd: false };
    acc.repos.push(repo);
  }
  repo.url = url;
  repo.id = id;
  repo.last = date;
  if (id != null) acc.byId.set(id, repo);
  acc.byUrl.set(url, repo);
  return repo;
}

/**
 * Feed snapshots oldest first. `scorer` identifies the checks' code that wrote
 * the snapshot: a file that appears across a change to it may have been there
 * all along.
 */
export function recordSnapshot(acc: Acc, date: string, rows: SnapshotRow[], scorer = ""): void {
  acc.last = date;
  // A snapshot can hold one repo twice (early ones did, under two ids): found in either counts.
  const today = new Map<RepoAcc, Map<HistoryKey, boolean>>();
  const note = (repo: RepoAcc, key: HistoryKey, found: boolean) => {
    const keys = today.get(repo) ?? new Map<HistoryKey, boolean>();
    keys.set(key, (keys.get(key) ?? false) || found);
    today.set(repo, keys);
  };
  const urls = new Set(rows.map((r) => r.url.toLowerCase()));
  for (const r of rows) {
    const repo = repoOf(acc, r, date, urls);
    if (!r.signalId || r.pass == null) continue;
    const has = hasAgentFile({ pass: r.pass, matchedPath: r.matchedPath });
    if (r.signalId === "agents_md") {
      const p = r.matchedPath?.toLowerCase();
      note(repo, "agentsMd", has && p === "agents.md");
      note(repo, "claudeMd", has && p === "claude.md");
      continue;
    }
    const key = OTHER_KEY.get(r.signalId);
    if (key) note(repo, key, has);
  }

  for (const [repo, keys] of today) {
    // The check stops at AGENTS.md, so a CLAUDE.md beside it was never looked at.
    if (repo.hadAgentsMd) keys.delete("claudeMd");
    repo.hadAgentsMd ||= keys.get("agentsMd") ?? false;
    for (const [key, found] of keys) mark(repo, key, found, date, scorer);
  }
}

function mark(repo: RepoAcc, key: HistoryKey, found: boolean, date: string, scorer: string): void {
  let k = repo.keys.get(key);
  if (!k) {
    k = { checkedFrom: date, misses: [], seen: null };
    repo.keys.set(key, k);
  }
  if (k.seen) return;
  if (!found) {
    k.misses.push({ date, scorer });
    return;
  }
  const lastMissed = k.misses.findLast((m) => m.scorer === scorer)?.date ?? null;
  k.seen = { checkedFrom: k.checkedFrom, firstFound: date, lastMissed };
  k.misses = [];
}

export function finishHistory(acc: Acc): FileHistory {
  const out: FileHistory = {};
  for (const repo of [...acc.repos].sort((a, b) => (a.url < b.url ? -1 : 1))) {
    // Off the board by the last snapshot: no page reads it.
    if (repo.last !== acc.last) continue;
    const entry: Partial<Record<HistoryKey, FirstSeen>> = {};
    for (const key of HISTORY_KEYS) {
      const seen = repo.keys.get(key)?.seen;
      if (seen) entry[key] = seen;
    }
    if (Object.keys(entry).length > 0) out[repo.url] = entry;
  }
  return out;
}

const tuple = (s: FirstSeen) =>
  s.lastMissed ? [s.checkedFrom, s.firstFound, s.lastMissed] : [s.checkedFrom, s.firstFound];

/** One repo per line keeps the daily diff to the repos that changed; [checkedFrom, firstFound, lastMissed?]. */
export function historyJson(history: FileHistory): string {
  const lines = Object.entries(history).map(([url, e]) => {
    const tuples = Object.fromEntries(Object.entries(e).map(([k, s]) => [k, tuple(s)]));
    return `    ${JSON.stringify(url)}: ${JSON.stringify(tuples)}`;
  });
  return ["{", '  "repos": {', lines.join(",\n"), "  }", "}", ""].join("\n");
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RE = /^https:\/\/[a-z0-9.-]+\/[^\s"<>]+$/;

function fail(): never {
  throw new Error("agent-file-history.json: unexpected shape");
}

// Written by the rescore job, which runs untrusted repos' parsers: only known
// keys holding dates are copied out, as parseAdoption does.
export function parseFileHistory(raw: unknown): FileHistory {
  const repos = (raw as { repos?: unknown } | null)?.repos;
  if (typeof repos !== "object" || repos === null || Array.isArray(repos)) fail();
  const out: FileHistory = {};
  for (const [url, v] of Object.entries(repos)) {
    if (!URL_RE.test(url) || url !== url.toLowerCase() || typeof v !== "object" || v === null) fail();
    const entry: Partial<Record<HistoryKey, FirstSeen>> = {};
    for (const key of HISTORY_KEYS) {
      const t = (v as Record<string, unknown>)[key];
      if (t === undefined) continue;
      if (
        !Array.isArray(t) ||
        t.length < 2 ||
        t.length > 3 ||
        !t.every((d) => typeof d === "string" && DATE_RE.test(d))
      ) {
        fail();
      }
      const [checkedFrom, firstFound, lastMissed = null] = t as string[];
      // String order is date order for YYYY-MM-DD.
      if (firstFound < checkedFrom || (lastMissed && (lastMissed < checkedFrom || lastMissed >= firstFound))) fail();
      entry[key] = { checkedFrom, firstFound, lastMissed };
    }
    out[url] = entry;
  }
  return out;
}
