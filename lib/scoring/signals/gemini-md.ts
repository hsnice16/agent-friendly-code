import { readdirSync } from "node:fs";
import { join } from "node:path";

import { readSafe } from "./helpers";
import type { Signal } from "./types";

const LABEL = "GEMINI.md";

function findGeminiMd(repo: string): string | null {
  let entries: string[] = [];

  try {
    entries = readdirSync(repo);
  } catch {
    return null;
  }

  for (const e of entries) {
    if (e.toLowerCase() === "gemini.md") {
      return join(repo, e);
    }
  }

  return null;
}

export const geminiMd: Signal = {
  label: LABEL,
  id: "gemini_md",
  description: "Gemini CLI's canonical hierarchical instructions file — read at every prompt.",
  improveSuggestion:
    "Add a GEMINI.md at the repo root covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
  check: (repo) => {
    const matched = findGeminiMd(repo);

    if (!matched) {
      return {
        pass: 0,
        label: LABEL,
        id: "gemini_md",
        detail: "No GEMINI.md at repo root",
      };
    }

    const len = readSafe(matched).trim().length;
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
        detail: `GEMINI.md exists (${len} chars) — thin`,
      };
    }

    if (len < 800) {
      return {
        pass: 0.8,
        label: LABEL,
        id: "gemini_md",
        matchedPath: matched,
        detail: `GEMINI.md exists (${len} chars)`,
      };
    }

    return {
      pass: 1,
      label: LABEL,
      id: "gemini_md",
      matchedPath: matched,
      detail: `Substantive GEMINI.md (${len} chars)`,
    };
  },
};
