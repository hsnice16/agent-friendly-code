import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { resolveRelative } from "./helpers";
import type { Signal } from "./types";

const LABEL = "Cursor rules (.cursor/rules)";

export const cursorRules: Signal = {
  label: LABEL,
  id: "cursor_rules",
  description: "Cursor's canonical instruction surface — `.cursor/rules/*.mdc` (modern) or `.cursorrules` (legacy).",
  improveSuggestion:
    "Add `.cursor/rules/*.mdc` files describing how Cursor should work in this repo (architecture, conventions, naming). The legacy `.cursorrules` file is still read but is deprecated.",
  check: (repo) => {
    const dir = resolveRelative(repo, ".cursor/rules");

    if (dir) {
      const abs = join(repo, dir);

      try {
        if (statSync(abs).isDirectory()) {
          const mdc = readdirSync(abs).filter((f) => f.toLowerCase().endsWith(".mdc"));

          if (mdc.length > 0) {
            return {
              pass: 1,
              label: LABEL,
              id: "cursor_rules",
              matchedPath: `${dir}/${mdc[0]}`,
              detail: `${mdc.length} .mdc file${mdc.length === 1 ? "" : "s"} in .cursor/rules/`,
            };
          }
        }
      } catch {}
    }

    const legacy = resolveRelative(repo, ".cursorrules");
    if (legacy) {
      return {
        pass: 0.5,
        label: LABEL,
        id: "cursor_rules",
        matchedPath: legacy,
        detail: "Legacy .cursorrules — Cursor still reads it, but `.cursor/rules/*.mdc` is preferred",
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
