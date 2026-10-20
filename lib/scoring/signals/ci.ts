import { readdirSync } from "node:fs";
import { join } from "node:path";

import { entryKind, firstExisting, isFileEntry, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const OTHER_CI = [
  ".gitlab-ci.yml",
  ".circleci/config.yml",
  "azure-pipelines.yml",
  ".travis.yml",
  "Jenkinsfile",
  ".buildkite/pipeline.yml",
];

export const ci: Signal = {
  id: "ci",
  label: "CI configuration",
  description: "A CI pipeline the agent can read and run locally.",
  improveSuggestion:
    "Add a CI workflow (e.g. .github/workflows/ci.yml or .gitlab-ci.yml) that runs tests + linter on every PR.",
  check: (repo) => {
    const ghWf = resolveRelative(repo, ".github/workflows");

    if (ghWf) {
      const abs = join(repo, ghWf);

      try {
        if (entryKind(repo, abs) === "dir") {
          const files = readdirSync(abs).filter((f) => /\.ya?ml$/i.test(f) && isFileEntry(repo, join(abs, f)));

          if (files.length > 0) {
            return {
              pass: 1,
              id: "ci",
              matchedPath: ghWf,
              label: "CI configuration",
              detail: `${files.length} GitHub Actions workflow${files.length === 1 ? "" : "s"}`,
            };
          }
        }
      } catch {}
    }

    const m = firstExisting(repo, OTHER_CI);
    if (m) {
      return {
        id: "ci",
        pass: 0.9,
        matchedPath: m,
        label: "CI configuration",
        detail: "CI config present",
      };
    }

    return {
      pass: 0,
      id: "ci",
      label: "CI configuration",
      detail: "No CI config found",
    };
  },
};
