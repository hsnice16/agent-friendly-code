import { HOST_DOMAINS, type Host, isHost } from "@/lib/constants/hosts";
import { LEADERBOARD_PAGE_SIZE, MAX_SEARCH_LENGTH } from "@/lib/constants/scoring";
import { DEFAULT_DIR, DEFAULT_SORT, isSortDir, isSortKey, type SortDir, type SortKey } from "@/lib/constants/sort";

// Shared by the server pages and the browser board, so it must not import the
// database or anything server-only.

export type BoardRow = {
  id: number;
  host: string;
  owner: string;
  name: string;
  url: string;
  stars: number | null;
  badge_embedded: number | null;
  description: string | null;
  score: number | null;
};

/** What /api/board serves: every repo once, with its score on each board. */
export type BoardData = {
  models: string[];
  repos: {
    id: number;
    h: string;
    o: string;
    n: string;
    s: number | null;
    b?: 1;
    d?: string;
    /** Only when it isn't the host's usual `https://<domain>/<owner>/<name>`. */
    u?: string;
    /** Aligned with `models`; null where the repo isn't on that board. */
    sc: (number | null)[];
  }[];
};

export type BoardQuery = { q: string; host: Host | "all"; sort: SortKey; dir: SortDir; page: number };

export const DEFAULT_QUERY: BoardQuery = { q: "", host: "all", sort: DEFAULT_SORT, dir: DEFAULT_DIR, page: 1 };

export function cleanQuery(raw: string | null | undefined): string {
  return (raw ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
}

/** Lenient like the server always was: unknown values fall back to the default. */
export function parseBoardQuery(params: URLSearchParams): BoardQuery {
  const host = params.get("host");
  const sort = params.get("sort");
  const dir = params.get("dir");
  const page = Number(params.get("page"));
  return {
    q: cleanQuery(params.get("q")),
    host: isHost(host) ? host : "all",
    sort: isSortKey(sort) ? sort : DEFAULT_SORT,
    dir: isSortDir(dir) ? dir : DEFAULT_DIR,
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  };
}

export function isRecut(query: BoardQuery): boolean {
  return query.q !== "" || query.host !== "all" || query.sort !== DEFAULT_SORT || query.dir !== DEFAULT_DIR;
}

export function defaultRepoUrl(r: { host: string; owner: string; name: string }): string {
  return `https://${isHost(r.host) ? HOST_DOMAINS[r.host] : r.host}/${r.owner}/${r.name}`;
}

/** Which slice of a board `page` shows. Clamped, so a stale or hand-typed page still lands on rows. */
export function pageSlice(total: number, page: number): { page: number; totalPages: number; startIdx: number } {
  const totalPages = Math.max(1, Math.ceil(total / LEADERBOARD_PAGE_SIZE));
  const clamped = Number.isFinite(page) ? Math.min(totalPages, Math.max(1, Math.floor(page))) : 1;
  return { page: clamped, totalPages, startIdx: (clamped - 1) * LEADERBOARD_PAGE_SIZE };
}

export function boardRows(data: BoardData, model: string): BoardRow[] {
  const i = data.models.indexOf(model);
  if (i < 0) {
    return [];
  }
  const rows: BoardRow[] = [];
  for (const r of data.repos) {
    const score = r.sc[i];
    if (score == null) {
      continue;
    }
    rows.push({
      id: r.id,
      host: r.h,
      owner: r.o,
      name: r.n,
      url: r.u ?? defaultRepoUrl({ host: r.h, owner: r.o, name: r.n }),
      stars: r.s,
      badge_embedded: r.b ?? 0,
      description: r.d ?? null,
      score,
    });
  }
  return rows;
}

// SQLite orders NULL below every number, so DESC puts it last and ASC first.
function cmp(a: number | null, b: number | null): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** The same order as `listLeaderboard`'s ORDER BY, tie-breaks included. */
export function sortRows(rows: BoardRow[], sort: SortKey, dir: SortDir): BoardRow[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const primary = sort === "stars" ? cmp(a.stars, b.stars) : cmp(a.score, b.score);
    if (primary !== 0) return sign * primary;
    const secondary = sort === "stars" ? -cmp(a.score, b.score) : -cmp(a.stars, b.stars);
    if (secondary !== 0) return secondary;
    return a.id - b.id;
  });
}

export function matchesQuery(row: { owner: string; name: string }, q: string): boolean {
  return `${row.owner}/${row.name}`.toLowerCase().includes(q.toLowerCase());
}

export type BoardView = { rows: BoardRow[]; startIdx: number; page: number; totalPages: number; total: number };

export function viewBoard(all: BoardRow[], query: BoardQuery): BoardView {
  const hosted = query.host === "all" ? all : all.filter((r) => r.host === query.host);
  const matched = query.q ? hosted.filter((r) => matchesQuery(r, query.q)) : hosted;
  const sorted = sortRows(matched, query.sort, query.dir);
  const { page, totalPages, startIdx } = pageSlice(sorted.length, query.page);
  return {
    page,
    startIdx,
    totalPages,
    total: sorted.length,
    rows: sorted.slice(startIdx, startIdx + LEADERBOARD_PAGE_SIZE),
  };
}
