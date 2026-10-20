import { characters, firstExisting, readSafe } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["AGENTS.md", "CLAUDE.md", "AGENT.md"];
const LABEL = "AGENTS.md / CLAUDE.md";

export const agentsMd: Signal = {
  label: LABEL,
  id: "agents_md",
  description: "An instructions file for agents, with real content.",
  improveSuggestion:
    "Add an AGENTS.md covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
  check: (repo) => {
    // An empty AGENTS.md stub must not hide a full CLAUDE.md beside it.
    let matched: string | null = null;
    let len = 0;

    for (const c of CANDIDATES) {
      const hit = firstExisting(repo, [c]);
      if (!hit) {
        continue;
      }

      const n = readSafe(hit, repo).trim().length;
      if (!matched || n > 0) {
        matched = hit;
        len = n;
      }

      if (n > 0) {
        break;
      }
    }

    if (!matched) {
      return {
        pass: 0,
        label: LABEL,
        id: "agents_md",
        detail: "No agent instructions file found",
      };
    }

    if (len === 0) {
      return {
        pass: 0.2,
        label: LABEL,
        id: "agents_md",
        matchedPath: matched,
        detail: "File exists but empty",
      };
    }

    if (len < 200) {
      return {
        pass: 0.5,
        label: LABEL,
        id: "agents_md",
        matchedPath: matched,
        detail: `File exists (${characters(len)}) — thin`,
      };
    }

    if (len < 800) {
      return {
        pass: 0.8,
        label: LABEL,
        id: "agents_md",
        matchedPath: matched,
        detail: `File exists (${characters(len)})`,
      };
    }

    return {
      pass: 1,
      label: LABEL,
      id: "agents_md",
      matchedPath: matched,
      detail: `Substantive (${characters(len)})`,
    };
  },
};
