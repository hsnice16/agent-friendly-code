import { join } from "node:path";

import { characters, createResolver, entryKind, readSafe } from "./helpers";
import type { Signal } from "./types";

// GitHub renders .github/ ahead of the root, but a root README is what agents open first.
export const CANDIDATES = [
  "README.md",
  "README.rst",
  "README.adoc",
  "README.asciidoc",
  "README.markdown",
  "README.txt",
  "README",
  ".github/README.md",
  "docs/README.md",
];

export const readme: Signal = {
  id: "readme",
  label: "README",
  description: "A README with enough detail for the agent to learn the project.",
  improveSuggestion:
    "Expand your README to cover what the project does, how to install, the common commands, and the high-level layout.",
  check: (repo) => {
    // Anything but a folder: a `readme/` of screenshots must not hide `.github/README.md`;
    // a dangling link reads as empty.
    const resolve = createResolver(repo);
    const rel = CANDIDATES.map(resolve).find((r) => r && entryKind(repo, join(repo, r)) !== "dir");
    const p = rel ? join(repo, rel) : null;

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
