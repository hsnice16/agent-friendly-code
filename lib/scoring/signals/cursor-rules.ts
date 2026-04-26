import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import type { Signal } from "./types";

const LABEL = "Cursor rules (.cursor/rules)";

export const cursorRules: Signal = {
  label: LABEL,
  id: "cursor_rules",
  description: "Cursor's canonical instruction surface — `.cursor/rules/*.mdc` (modern) or `.cursorrules` (legacy).",
  improveSuggestion:
    "Add `.cursor/rules/*.mdc` files describing how Cursor should work in this repo (architecture, conventions, naming). The legacy `.cursorrules` file is still read but is deprecated.",
  check: (repo) => {
    const dir = join(repo, ".cursor", "rules");

    if (existsSync(dir)) {
      try {
        if (statSync(dir).isDirectory()) {
          const mdc = readdirSync(dir).filter((f) => f.endsWith(".mdc"));

          if (mdc.length > 0) {
            return {
              pass: 1,
              label: LABEL,
              id: "cursor_rules",
              matchedPath: `.cursor/rules/${mdc[0]}`,
              detail: `${mdc.length} .mdc file${mdc.length === 1 ? "" : "s"} in .cursor/rules/`,
            };
          }
        }
      } catch {}
    }

    const legacy = join(repo, ".cursorrules");
    if (existsSync(legacy)) {
      return {
        pass: 0.5,
        label: LABEL,
        id: "cursor_rules",
        matchedPath: ".cursorrules",
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
