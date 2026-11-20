import { readdirSync } from "node:fs";
import { join } from "node:path";

import { createResolver, entryKind, isFileEntry } from "./helpers";

// Folders holding samples, docs, fixtures or someone else's code: a manifest or
// config there describes that code, not the repo.
const SKIP = new Set([
  "bench",
  "benchmark",
  "benchmarks",
  "build",
  "demo",
  "demos",
  "deps",
  "dist",
  "doc",
  "docs",
  "e2e",
  "example",
  "examples",
  "extern",
  "external",
  "fixtures",
  "node_modules",
  "out",
  "playground",
  "reports",
  "sample",
  "samples",
  "site",
  "spec",
  "target",
  "template",
  "templates",
  "test",
  "testdata",
  "test-resources",
  "test_resources",
  "tests",
  "third-party",
  "third_party",
  "thirdparty",
  "tmp",
  "vendor",
  "website",
]);

export const isSkippedDir = (name: string) => SKIP.has(name.toLowerCase());

// A hostile root with thousands of folders must not cost thousands of listings.
export const MAX_CHILD_DIRS = 64;

/** Top-level folders a repo keeps its own code in (`src/`, `dotnet/`, `app/`), in a stable order. */
export function childDirs(repo: string): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(repo).sort();
  } catch {
    return [];
  }

  const dirs: string[] = [];
  for (const e of entries) {
    if (dirs.length >= MAX_CHILD_DIRS) {
      break;
    }
    if (e.startsWith(".") || isSkippedDir(e)) {
      continue;
    }
    if (entryKind(repo, join(repo, e)) === "dir") {
      dirs.push(e);
    }
  }

  return dirs;
}

type NearSpec = {
  names?: readonly string[];
  /** Matched against each entry name, for names only a pattern describes (`*.slnx`). */
  patterns?: readonly RegExp[];
  /** "file" by default: a folder named like a config is not one. */
  kind?: "file" | "dir" | "any";
  /** A content check, for files only some of which count (`.editorconfig`). */
  accept?: (rel: string) => boolean;
};

/**
 * The first match at the root, else in a top-level folder. Root first, so a repo's
 * own file always wins over a subproject's. Returns the on-disk relative path.
 */
export function findNear(repo: string, spec: NearSpec): string | null {
  const resolve = createResolver(repo);
  const kind = spec.kind ?? "file";
  const accept = spec.accept ?? (() => true);

  const fits = (rel: string) => {
    const abs = join(repo, rel);
    if (kind === "file" && !isFileEntry(repo, abs)) return false;
    if (kind === "dir" && entryKind(repo, abs) !== "dir") return false;
    return accept(rel);
  };

  for (const base of ["", ...childDirs(repo)]) {
    for (const name of spec.names ?? []) {
      const rel = resolve(base ? `${base}/${name}` : name);
      if (rel && fits(rel)) {
        return rel;
      }
    }

    if (!spec.patterns?.length) {
      continue;
    }

    let entries: string[] = [];
    try {
      entries = readdirSync(base ? join(repo, base) : repo).sort();
    } catch {
      continue;
    }

    for (const re of spec.patterns) {
      for (const e of entries) {
        const rel = base ? `${base}/${e}` : e;
        if (re.test(e) && fits(rel)) {
          return rel;
        }
      }
    }
  }

  return null;
}
