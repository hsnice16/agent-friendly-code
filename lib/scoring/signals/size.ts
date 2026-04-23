import { readdirSync, type Stats, statSync } from "node:fs";
import { join } from "node:path";

import type { Signal } from "./types";

const IGNORE = new Set(["node_modules", ".git", "vendor", "target", "dist", "build", ".next"]);
const CAP = 10000;
const MAX_DEPTH = 8;

export const size: Signal = {
  id: "size",
  label: "Manageable size",
  description: "Very large repos strain an agent's context window.",
  improveSuggestion:
    "If possible, split into smaller modules or carve out a focused entry path. Document where to start in AGENTS.md.",
  check: (repo) => {
    let count = 0;

    const visit = (dir: string, depth: number) => {
      if (count > CAP || depth > MAX_DEPTH) {
        return;
      }

      let entries: string[] = [];
      try {
        entries = readdirSync(dir);
      } catch {
        return;
      }

      for (const e of entries) {
        if (IGNORE.has(e) || e.startsWith(".")) {
          continue;
        }

        const abs = join(dir, e);
        let st: Stats;
        try {
          st = statSync(abs);
        } catch {
          continue;
        }

        if (st.isDirectory()) {
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
      detail: `${count}+ files — very large`,
    };
  },
};
