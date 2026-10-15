import { join } from "node:path";

import { entryKind, resolveRelative, walkFind } from "./helpers";
import type { Signal } from "./types";

const DIRS = ["tests", "test", "__tests__", "spec", "specs", "src/test"];
const FILE_RE =
  /(^|\/)(.*\.test\.|.*\.spec\.|test_.*\.py$|.*_test\.go$|.*_test\.rs$|.*Test\.java$|.*Tests?\.kt$|.*_test\.exs$|.*_test\.dart$|.*Spec\.scala$|.*Test\.scala$|.*Test\.php$|.*_test\.rb$|.*_spec\.rb$|.*Tests?\.cs$)/;

export const tests: Signal = {
  id: "tests",
  label: "Test suite",
  description: "Tests the agent can run to check its changes.",
  improveSuggestion:
    "Add a tests/ (or test/, __tests__/, spec/) directory with runnable tests. Document how to run them in AGENTS.md.",
  check: (repo) => {
    for (const d of DIRS) {
      const rel = resolveRelative(repo, d);

      if (!rel) {
        continue;
      }

      if (entryKind(repo, join(repo, rel)) === "dir") {
        return {
          pass: 1,
          id: "tests",
          matchedPath: rel,
          label: "Test suite",
          detail: `Found /${rel}`,
        };
      }
    }

    const hits = walkFind(repo, (rel) => FILE_RE.test(rel), 3, 1);
    if (hits.length > 0) {
      return {
        pass: 0.7,
        id: "tests",
        label: "Test suite",
        matchedPath: hits[0],
        detail: `Test files detected (${hits[0]})`,
      };
    }

    return {
      pass: 0,
      id: "tests",
      label: "Test suite",
      detail: "No test directory or test files found",
    };
  },
};
