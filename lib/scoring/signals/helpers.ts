import { existsSync, readdirSync, readFileSync, type Stats, statSync } from "node:fs";
import { join } from "node:path";

export function firstExisting(repo: string, candidates: string[]): string | null {
  for (const c of candidates) {
    const p = join(repo, c);

    if (existsSync(p)) {
      return p;
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
