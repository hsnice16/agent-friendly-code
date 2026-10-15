import { join } from "node:path";

import { characters, readSafe, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const LABEL = "GEMINI.md";

export const geminiMd: Signal = {
  label: LABEL,
  id: "gemini_md",
  description: "Gemini CLI's instructions file, read on every prompt.",
  improveSuggestion:
    "Add a GEMINI.md at the repo root covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
  check: (repo) => {
    const matched = resolveRelative(repo, "GEMINI.md");

    if (!matched) {
      return {
        pass: 0,
        label: LABEL,
        id: "gemini_md",
        detail: "No GEMINI.md at repo root",
      };
    }

    const len = readSafe(join(repo, matched), repo).trim().length;
    if (len === 0) {
      return {
        pass: 0.2,
        label: LABEL,
        id: "gemini_md",
        matchedPath: matched,
        detail: "GEMINI.md exists but empty",
      };
    }

    if (len < 200) {
      return {
        pass: 0.5,
        label: LABEL,
        id: "gemini_md",
        matchedPath: matched,
        detail: `GEMINI.md exists (${characters(len)}) — thin`,
      };
    }

    if (len < 800) {
      return {
        pass: 0.8,
        label: LABEL,
        id: "gemini_md",
        matchedPath: matched,
        detail: `GEMINI.md exists (${characters(len)})`,
      };
    }

    return {
      pass: 1,
      label: LABEL,
      id: "gemini_md",
      matchedPath: matched,
      detail: `Substantive GEMINI.md (${characters(len)})`,
    };
  },
};
