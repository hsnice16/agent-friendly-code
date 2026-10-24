import { readdirSync } from "node:fs";
import { join } from "node:path";

import { entryKind, isFileEntry, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const LABEL = "Cursor rules (.cursor/rules)";

// Cursor reads `.mdc` (not `.md`) in `.cursor/rules/`, its subfolders, and any
// subdirectory's `.cursor/rules/` (CLI changelog). The search stops at the tests
// check's depth so a repo without rules doesn't cost a full walk.
const PARENT_DEPTH = 3;
const SUBFOLDER_DEPTH = 3;
const SKIP = new Set(["node_modules", ".git", "vendor", "target"]);

function list(repo: string, rel: string): string[] {
  try {
    // Sorted: readdir order is filesystem-dependent, and the first hit becomes matchedPath.
    return readdirSync(join(repo, rel)).sort();
  } catch {
    return [];
  }
}

function mdcFiles(repo: string, rel: string, depth: number, out: string[]): void {
  for (const e of list(repo, rel)) {
    const child = `${rel}/${e}`;
    const kind = entryKind(repo, join(repo, child));
    if (kind === "dir") {
      if (depth < SUBFOLDER_DEPTH) mdcFiles(repo, child, depth + 1, out);
    } else if (e.toLowerCase().endsWith(".mdc") && isFileEntry(repo, join(repo, child))) {
      out.push(child);
    }
  }
}

/** Every `.cursor/rules/` folder, the root one first. */
function rulesDirs(repo: string): string[] {
  const found: string[] = [];
  const visit = (rel: string, depth: number) => {
    const dir = resolveRelative(repo, rel ? `${rel}/.cursor/rules` : ".cursor/rules");
    if (dir && entryKind(repo, join(repo, dir)) === "dir") found.push(dir);
    if (depth >= PARENT_DEPTH) return;

    for (const e of list(repo, rel || ".")) {
      if (SKIP.has(e) || e.toLowerCase() === ".cursor") continue;
      const child = rel ? `${rel}/${e}` : e;
      if (entryKind(repo, join(repo, child)) === "dir") visit(child, depth + 1);
    }
  };

  visit("", 0);
  return found;
}

export const cursorRules: Signal = {
  label: LABEL,
  id: "cursor_rules",
  description: "Cursor's instructions: `.cursor/rules/*.mdc`, or the older `.cursorrules`.",
  improveSuggestion:
    "Add `.cursor/rules/*.mdc` files describing how Cursor should work in this repo (architecture, conventions, naming). Cursor's current docs no longer mention the single `.cursorrules` file.",
  check: (repo) => {
    const dirs = rulesDirs(repo);
    const mdc: string[] = [];
    for (const d of dirs) mdcFiles(repo, d, 0, mdc);

    if (mdc.length > 0) {
      const onlyRoot = mdc.every((p) => p.toLowerCase().startsWith(".cursor/rules/"));

      return {
        pass: 1,
        label: LABEL,
        id: "cursor_rules",
        matchedPath: mdc[0],
        detail: `${mdc.length} .mdc file${mdc.length === 1 ? "" : "s"} in ${onlyRoot ? ".cursor/rules/" : ".cursor/rules/ folders"}`,
      };
    }

    const legacy = resolveRelative(repo, ".cursorrules");
    if (legacy) {
      return {
        pass: 0.5,
        label: LABEL,
        id: "cursor_rules",
        matchedPath: legacy,
        detail: "Only the older .cursorrules — Cursor's docs now cover .cursor/rules/*.mdc instead",
      };
    }

    return {
      pass: 0,
      label: LABEL,
      id: "cursor_rules",
      detail: "No .cursor/rules/*.mdc or .cursorrules",
    };
  },
};
