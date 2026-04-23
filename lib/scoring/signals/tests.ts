import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import { walkFind } from "./helpers";
import type { Signal } from "./types";

const DIRS = ["tests", "test", "__tests__", "spec", "specs"];
const FILE_RE = /(^|\/)(.*\.test\.|.*\.spec\.|test_.*\.py$|.*_test\.go$|.*_test\.rs$)/;

export const tests: Signal = {
  id: "tests",
  label: "Test suite",
  description: "Detectable tests — agents rely on feedback loops.",
  improveSuggestion:
    "Add a tests/ (or test/, __tests__/, spec/) directory with runnable tests. Document how to run them in AGENTS.md.",
  check: (repo) => {
    for (const d of DIRS) {
      const p = join(repo, d);

      if (existsSync(p) && statSync(p).isDirectory()) {
        return {
          pass: 1,
          id: "tests",
          matchedPath: d,
          label: "Test suite",
          detail: `Found /${d}`,
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
