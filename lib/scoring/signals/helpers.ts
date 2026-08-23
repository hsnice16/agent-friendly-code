import { readdirSync, readFileSync, type Stats, statSync } from "node:fs";
import { join } from "node:path";

// Path lookups are case-insensitive: README / LICENSE / CONTRIBUTING casing
// varies in the wild (`readme.md`, `Readme.md`, `README.MD`), and exact
// matching scores those files as missing on case-sensitive filesystems.
type DirIndex = {
  exact: Set<string>;
  lower: Map<string, string>;
};

type DirCache = Map<string, DirIndex | null>;

function indexDir(dir: string, cache: DirCache): DirIndex | null {
  const cached = cache.get(dir);

  if (cached !== undefined) {
    return cached;
  }

  let index: DirIndex | null = null;

  try {
    const entries = readdirSync(dir);
    const lower = new Map<string, string>();

    // Sorted so that when both README.md and readme.md exist, the pick is
    // stable across runs instead of following readdir order.
    for (const e of [...entries].sort()) {
      const key = e.toLowerCase();

      if (!lower.has(key)) {
        lower.set(key, e);
      }
    }

    index = { lower, exact: new Set(entries) };
  } catch {}

  cache.set(dir, index);
  return index;
}

function resolveWith(repo: string, rel: string, cache: DirCache): string | null {
  const parts: string[] = [];
  let current = repo;

  for (const segment of rel.split("/")) {
    if (!segment) {
      return null;
    }

    const index = indexDir(current, cache);
    if (!index) {
      return null;
    }

    // Exact spelling wins so it is never shadowed by a differently-cased sibling.
    const actual = index.exact.has(segment) ? segment : index.lower.get(segment.toLowerCase());
    if (!actual) {
      return null;
    }

    parts.push(actual);
    current = join(current, actual);
  }

  return parts.join("/");
}

// Returns the path as spelled on disk, not as spelled in the candidate list —
// callers surface it as `matchedPath`, so it has to be the real name.
export function resolveRelative(repo: string, rel: string): string | null {
  return resolveWith(repo, rel, new Map());
}

// Deduped by resolved path: a candidate list carrying two spellings of one
// file (Makefile / makefile) must not count as two hits.
export function resolveAllRelative(repo: string, candidates: string[]): string[] {
  const cache: DirCache = new Map();
  const hits = new Set<string>();

  for (const c of candidates) {
    const hit = resolveWith(repo, c, cache);

    if (hit) {
      hits.add(hit);
    }
  }

  return [...hits];
}

// Absolute, unlike the resolve* helpers above: callers feed the result straight
// to readSafe, and scorer.ts relativises it before it is stored or rendered.
export function firstExisting(repo: string, candidates: string[]): string | null {
  // One directory listing serves every candidate rooted in the same place.
  const cache: DirCache = new Map();

  for (const c of candidates) {
    const hit = resolveWith(repo, c, cache);

    if (hit) {
      return join(repo, hit);
    }
  }

  return null;
}

export function readSafe(p: string): string {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

export function walkFind(root: string, match: (rel: string) => boolean, maxDepth = 3, maxHits = 1): string[] {
  const hits: string[] = [];

  const visit = (dir: string, depth: number, rel: string) => {
    if (hits.length >= maxHits || depth > maxDepth) {
      return;
    }

    let entries: string[] = [];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const e of entries) {
      if (e === "node_modules" || e === ".git" || e === "vendor" || e === "target") {
        continue;
      }

      const abs = join(dir, e);
      const relNext = rel ? `${rel}/${e}` : e;

      let st: Stats;
      try {
        st = statSync(abs);
      } catch {
        continue;
      }

      if (st.isDirectory()) {
        visit(abs, depth + 1, relNext);
      } else if (match(relNext)) {
        hits.push(relNext);

        if (hits.length >= maxHits) {
          return;
        }
      }
    }
  };

  visit(root, 0, "");
  return hits;
}
