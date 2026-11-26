import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import ignore from "ignore";
import { entryKind, isRealDir, readSafe } from "./helpers";
import type { Signal } from "./types";

const BASELINE_IGNORE = ["node_modules", ".git", "vendor", "target", "dist", "build", ".next"];
const CAP = 10000;
const MAX_DEPTH = 8;
// Folders holding only dotfiles add no files, so CAP alone never stops a tree of
// them. Real walks reach CAP within ~2,300 folders (airflow, vscode).
const MAX_DIRS = 20000;

// `ignore` compiles each line to a backtracking regex and tests it against every
// path, so a hostile .gitignore plus hostile file names can stall the walk. A
// line's cost grows with the power of the `*`s sharing a segment, and the walk's
// with lines × path length; both are bounded below. Real lines carry at most three
// wildcards (`**/*.tfstate.*`). Dropping a line or a match can only raise the count.
const MAX_IGNORE_LINES = 1000;
const MAX_IGNORE_LINE_LENGTH = 256;
const MAX_STARS_PER_SEGMENT = 2;
const MAX_WILDCARDS = 3;
// Roughly regex steps; real repos use under a third of it (airflow: 1.3e8).
const IGNORE_WORK_BUDGET = 5e8;
// A run of `**` segments means what one does, and nesting them is exponential.
const GLOBSTAR_RUN = /(?<=^|\/)\*\*(?:\/\*\*)+(?=\/|$)/g;

function segmentStars(line: string): number[] {
  return line.split("/").map((seg) => (seg === "**" ? 0 : (seg.match(/\*/g)?.length ?? 0)));
}

export function safeIgnoreLines(text: string): string[] {
  const out: string[] = [];

  for (const raw of text.split(/\r?\n/)) {
    if (out.length >= MAX_IGNORE_LINES) {
      break;
    }

    if (raw.trim() === "" || raw.startsWith("#") || raw.length > MAX_IGNORE_LINE_LENGTH) {
      continue;
    }

    const line = raw.replace(GLOBSTAR_RUN, "**");
    const stars = segmentStars(line);
    const globstars = line.split("/").filter((seg) => seg === "**").length;

    if (Math.max(...stars) <= MAX_STARS_PER_SEGMENT && stars.reduce((a, b) => a + b, globstars) <= MAX_WILDCARDS) {
      out.push(line);
    }
  }

  return out;
}

// What one path costs to test: two `*`s in a segment rescan it per candidate split.
function matchWork(path: string, lines: number, quadratic: number): number {
  const longest = quadratic ? Math.max(...path.split("/").map((seg) => seg.length)) : 0;
  return path.length * (lines + quadratic * longest);
}

export const size: Signal = {
  id: "size",
  label: "Manageable size",
  description: "Very large repos strain the agent's context window.",
  improveSuggestion:
    "If possible, split into smaller modules or carve out a focused entry path. Document where to start in AGENTS.md.",
  check: (repo) => {
    const base = ignore().add(BASELINE_IGNORE);
    const lines = safeIgnoreLines(readSafe(join(repo, ".gitignore"), repo));
    const ig = ignore().add(BASELINE_IGNORE).add(lines);
    const quadratic = lines.filter((l) => segmentStars(l).some((n) => n > 1)).length;

    let count = 0;
    let dirs = 0;
    let work = 0;

    const visit = (dir: string, depth: number) => {
      if (count > CAP || depth > MAX_DEPTH || ++dirs > MAX_DIRS) {
        return;
      }

      let entries: string[] = [];
      try {
        entries = readdirSync(dir);
      } catch {
        return;
      }

      for (const e of entries) {
        if (e.startsWith(".")) {
          continue;
        }

        const abs = join(dir, e);
        const kind = entryKind(repo, abs);

        if (!kind) {
          continue;
        }

        // A link to a folder counts as the one file git stores.
        const descend = kind === "dir" && isRealDir(abs);
        const rel = relative(repo, abs).split(sep).join("/");
        const path = descend ? `${rel}/` : rel;
        work += matchWork(path, lines.length, quadratic);
        if ((work <= IGNORE_WORK_BUDGET ? ig : base).ignores(path)) {
          continue;
        }

        if (descend) {
          visit(abs, depth + 1);
        } else {
          count++;
        }

        if (count > CAP) {
          return;
        }
      }
    };

    visit(repo, 0);
    if (dirs > MAX_DIRS) {
      return {
        pass: 0.2,
        id: "size",
        label: "Manageable size",
        detail: `${MAX_DIRS.toLocaleString("en-US")}+ folders — very large`,
      };
    }

    if (count < 50) {
      return {
        pass: 0.9,
        id: "size",
        label: "Manageable size",
        detail: `${count} files — very small`,
      };
    }

    if (count < 500) {
      return {
        pass: 1,
        id: "size",
        detail: `${count} files`,
        label: "Manageable size",
      };
    }

    if (count < 2000) {
      return {
        pass: 0.8,
        id: "size",
        detail: `${count} files`,
        label: "Manageable size",
      };
    }

    if (count < 5000) {
      return {
        pass: 0.5,
        id: "size",
        label: "Manageable size",
        detail: `${count} files — large`,
      };
    }

    return {
      pass: 0.2,
      id: "size",
      label: "Manageable size",
      detail: count > CAP ? `${CAP}+ files — very large` : `${count} files — very large`,
    };
  },
};
