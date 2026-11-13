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

export type BoardQuery = {
  q: string;
  host: Host | "all";
  /** Only repos that show the badge in their README. */
  badge: boolean;
  sort: SortKey;
  dir: SortDir;
  page: number;
};

export const DEFAULT_QUERY: BoardQuery = {
  q: "",
  host: "all",
  badge: false,
  sort: DEFAULT_SORT,
  dir: DEFAULT_DIR,
  page: 1,
};

export function cleanQuery(raw: string | null | undefined): string {
  return (raw ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
}

/** Lenient: unknown values fall back to the default. */
export function parseBoardQuery(params: URLSearchParams): BoardQuery {
  const host = params.get("host");
  const sort = params.get("sort");
  const dir = params.get("dir");
  const page = Number(params.get("page"));
  return {
    q: cleanQuery(params.get("q")),
    host: isHost(host) ? host : "all",
    badge: params.get("badge") === "1",
    sort: isSortKey(sort) ? sort : DEFAULT_SORT,
    dir: isSortDir(dir) ? dir : DEFAULT_DIR,
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  };
}

export function isRecut(query: BoardQuery): boolean {
  return (
    query.q !== "" || query.host !== "all" || query.badge || query.sort !== DEFAULT_SORT || query.dir !== DEFAULT_DIR
  );
}

export function defaultRepoUrl(r: { host: string; owner: string; name: string }): string {
  return `https://${isHost(r.host) ? HOST_DOMAINS[r.host] : r.host}/${r.owner}/${r.name}`;
}

/** The board's spelling of a repo, matched as hosts match names: case-insensitively. */
export function findBoardRepo(
  data: BoardData,
  { host, owner, name }: { host: string; owner: string; name: string },
): { host: string; owner: string; name: string } | null {
  const o = owner.toLowerCase();
  const n = name.toLowerCase();
  const r = data.repos.find((x) => x.h === host && x.o.toLowerCase() === o && x.n.toLowerCase() === n);
  return r ? { host: r.h, owner: r.o, name: r.n } : null;
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

function matchesQuery(row: { owner: string; name: string }, q: string): boolean {
  return `${row.owner}/${row.name}`.toLowerCase().includes(q.toLowerCase());
}

export type BoardView = {
  /** `rank` is absent on the prerendered page, whose rows sit at their rank. */
  rows: (BoardRow & { rank?: number })[];
  startIdx: number;
  page: number;
  totalPages: number;
  total: number;
};

// A row's place on the uncut board, which a sorted or filtered cut must still
// show: medals belong to the real top three, not whoever lists first.
const ranksByBoard = new WeakMap<BoardRow[], Map<number, number>>();

function boardRanks(all: BoardRow[]): Map<number, number> {
  let ranks = ranksByBoard.get(all);
  if (!ranks) {
    ranks = new Map(sortRows(all, DEFAULT_SORT, DEFAULT_DIR).map((r, i) => [r.id, i + 1]));
    ranksByBoard.set(all, ranks);
  }
  return ranks;
}

export function viewBoard(all: BoardRow[], query: BoardQuery): BoardView {
  const hosted = query.host === "all" ? all : all.filter((r) => r.host === query.host);
  const badged = query.badge ? hosted.filter((r) => r.badge_embedded === 1) : hosted;
  const matched = query.q ? badged.filter((r) => matchesQuery(r, query.q)) : badged;
  const sorted = sortRows(matched, query.sort, query.dir);
  const { page, totalPages, startIdx } = pageSlice(sorted.length, query.page);
  const ranks = boardRanks(all);
  return {
    page,
    startIdx,
    totalPages,
    total: sorted.length,
    rows: sorted
      .slice(startIdx, startIdx + LEADERBOARD_PAGE_SIZE)
      .map((r, i) => ({ ...r, rank: ranks.get(r.id) ?? startIdx + i + 1 })),
  };
}
