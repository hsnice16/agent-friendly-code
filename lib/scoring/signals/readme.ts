import { characters, firstExisting, readSafe } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["README.md", "README.rst", "README.txt", "README"];

export const readme: Signal = {
  id: "readme",
  label: "README",
  description: "A README with enough detail for the agent to learn the project.",
  improveSuggestion:
    "Expand your README to cover what the project does, how to install, the common commands, and the high-level layout.",
  check: (repo) => {
    const p = firstExisting(repo, CANDIDATES);

    if (!p) {
      return {
        pass: 0,
        id: "readme",
        label: "README",
        detail: "No README found",
      };
    }

    const len = readSafe(p, repo).trim().length;
    if (len < 200) {
      return {
        id: "readme",
        label: "README",
        pass: 0.3,
        detail: `README thin (${characters(len)})`,
        matchedPath: p,
      };
    }

    if (len < 1000) {
      return {
        pass: 0.7,
        id: "readme",
        matchedPath: p,
        label: "README",
        detail: `README present (${characters(len)})`,
      };
    }

    return {
      pass: 1,
      id: "readme",
      matchedPath: p,
      label: "README",
      detail: `README detailed (${characters(len)})`,
    };
  },
};
