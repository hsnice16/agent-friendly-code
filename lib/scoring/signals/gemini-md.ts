import { join } from "node:path";

import { characters, MAX_READ_BYTES, readSafe, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const LABEL = "GEMINI.md";

// Gemini CLI inlines `@file.md` imports. Only these are followed: the live-score
// path fetches no other file's content, so any other would break parity.
const IMPORTABLE = ["AGENTS.md", "CLAUDE.md", "AGENT.md"];

// Gemini CLI skips imports in code blocks. A fence opens on a ``` or ~~~ line
// and closes on the next bare one; an opener that never closes is ignored.
// Line by line, not one regex: a lazy fence pattern rescans the rest of the
// file from every unclosed opener, which a hostile file turns into minutes.
const FENCE_OPEN = /^[ \t]*(?:```|~~~)/;
const FENCE_CLOSE = /^[ \t]*(?:```|~~~)[ \t]*\r?$/;
const IMPORT = /^[ \t]*@(?:\.\/)?([^\s/]+\.md)[ \t]*\r?$/i;

// Repeated imports could otherwise grow the text without bound.
const MAX_EXPANDED = 4 * MAX_READ_BYTES;

function withImports(repo: string, text: string): string {
  const lines = text.split("\n");
  // nextClose[i]: the first bare fence line at or after i, so each lookup is O(1).
  const nextClose = new Array<number>(lines.length + 1).fill(-1);
  for (let i = lines.length - 1; i >= 0; i--) {
    nextClose[i] = FENCE_CLOSE.test(lines[i]) ? i : nextClose[i + 1];
  }

  const imported = new Map<string, string | null>();
  const out: string[] = [];
  let size = 0;
  const push = (s: string) => {
    if (size <= MAX_EXPANDED) out.push(s);
    size += s.length + 1;
  };

  for (let i = 0; i < lines.length; i++) {
    const close = i < lines.length - 1 && FENCE_OPEN.test(lines[i]) ? nextClose[i + 1] : -1;
    if (close >= 0) {
      for (let j = i; j <= close; j++) push(lines[j]);
      i = close;
      continue;
    }

    const name = IMPORT.exec(lines[i])?.[1];
    if (!name || !IMPORTABLE.some((f) => f.toLowerCase() === name.toLowerCase())) {
      push(lines[i]);
      continue;
    }
    const key = name.toLowerCase();
    if (!imported.has(key)) {
      const rel = resolveRelative(repo, name);
      imported.set(key, rel ? readSafe(join(repo, rel), repo) : null);
    }
    push(imported.get(key) ?? lines[i]);
  }

  return out.join("\n");
}

export const geminiMd: Signal = {
  label: LABEL,
  id: "gemini_md",
  description: "Gemini CLI's instructions file, sent with every prompt.",
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

    const len = withImports(repo, readSafe(join(repo, matched), repo)).trim().length;
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
