import { firstExisting, readSafe } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["README.md", "README.rst", "README.txt", "README"];

export const readme: Signal = {
  id: "readme",
  label: "README",
  description: "Non-trivial README so the agent can learn the project quickly.",
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

    const len = readSafe(p).trim().length;
    if (len < 200) {
      return {
        id: "readme",
        label: "README",
        pass: 0.3,
        detail: `README thin (${len} chars)`,
        matchedPath: p,
      };
    }

    if (len < 1000) {
      return {
        pass: 0.7,
        id: "readme",
        matchedPath: p,
        label: "README",
        detail: `README present (${len} chars)`,
      };
    }

    return {
      pass: 1,
      id: "readme",
      matchedPath: p,
      label: "README",
      detail: `README detailed (${len} chars)`,
    };
  },
};
