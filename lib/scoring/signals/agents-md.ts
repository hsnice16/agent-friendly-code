import { firstExisting, readSafe } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["AGENTS.md", "CLAUDE.md", "AGENT.md", ".cursor/rules", ".cursorrules"];
const LABEL = "AGENTS.md / CLAUDE.md";

export const agentsMd: Signal = {
  label: LABEL,
  id: "agents_md",
  description: "Presence of an agent-oriented instructions file, with substantive content.",
  improveSuggestion:
    "Add an AGENTS.md covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
  check: (repo) => {
    const matched = firstExisting(repo, CANDIDATES);

    if (!matched) {
      return {
        pass: 0,
        label: LABEL,
        id: "agents_md",
        detail: "No agent instructions file found",
      };
    }

    const len = readSafe(matched).trim().length;
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
        detail: `File exists (${len} chars) — thin`,
      };
    }

    if (len < 800) {
      return {
        pass: 0.8,
        label: LABEL,
        id: "agents_md",
        matchedPath: matched,
        detail: `File exists (${len} chars)`,
      };
    }

    return {
      pass: 1,
      label: LABEL,
      id: "agents_md",
      matchedPath: matched,
      detail: `Substantive (${len} chars)`,
    };
  },
};
