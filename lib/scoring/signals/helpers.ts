import {
  closeSync,
  fstatSync,
  lstatSync,
  openSync,
  readdirSync,
  readlinkSync,
  readSync,
  realpathSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

// The scored tree is untrusted — a PR branch, a live-scored repo — so its links
// are never followed out of it, and no read is unbounded: a README linked to
// /dev/zero, /etc/passwd or a CI runner's /proc would otherwise be read.
/** The site parses this count back out of stored details (fileLength), so keep the shape. */
export function characters(n: number): string {
  return `${n.toLocaleString("en-US")} characters`;
}

export const MAX_READ_BYTES = 1024 * 1024;

// "escaped" is a link that leaves the repo, or lands on its root: never followed,
// but still the one file git stores. The live-score materializer stands an empty
// placeholder in for it, which every caller here treats the same way.
export type EntryKind = "dir" | "file" | "escaped";

const inside = (root: string, p: string) => p.startsWith(root + sep);

export function entryKind(repo: string, abs: string): EntryKind | null {
  try {
    const own = lstatSync(abs);
    if (!own.isSymbolicLink()) {
      return own.isDirectory() ? "dir" : own.isFile() ? "file" : null;
    }

    // Lexical first, as the materializer decides: a dangling link that points out
    // must read the same on a clone as its placeholder does on the live path.
    if (!inside(resolve(repo), resolve(dirname(abs), readlinkSync(abs)))) {
      return "escaped";
    }

    const real = realpathSync(abs);
    if (!inside(realpathSync(repo), real)) {
      return "escaped";
    }

    const target = statSync(real);
    return target.isDirectory() ? "dir" : target.isFile() ? "file" : null;
  } catch {
    // Dangling, or unreadable.
    return null;
  }
}

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

    if (current !== repo && entryKind(repo, current) !== "dir") {
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

// Truncated rather than refused past the cap, so a long README keeps its score.
// Without `repo` there is no root to hold links to; pass it wherever one exists.
export function readSafe(p: string, repo?: string): string {
  try {
    if (repo ? entryKind(repo, p) !== "file" : !statSync(p).isFile()) {
      return "";
    }

    const fd = openSync(p, "r");
    try {
      const buf = Buffer.alloc(Math.min(fstatSync(fd).size, MAX_READ_BYTES));
      let n = 0;
      while (n < buf.length) {
        const got = readSync(fd, buf, n, buf.length - n, n);
        if (got === 0) {
          break;
        }
        n += got;
      }

      return buf.toString("utf8", 0, n);
    } finally {
      closeSync(fd);
    }
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
      // readdir order is filesystem-dependent, and the first hit becomes matchedPath.
      entries = readdirSync(dir).sort();
    } catch {
      return;
    }

    for (const e of entries) {
      if (e === "node_modules" || e === ".git" || e === "vendor" || e === "target") {
        continue;
      }

      const abs = join(dir, e);
      const relNext = rel ? `${rel}/${e}` : e;

      const kind = entryKind(root, abs);
      if (!kind) {
        continue;
      }

      if (kind === "dir") {
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
