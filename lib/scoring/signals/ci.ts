import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { firstExisting } from "./helpers";
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
  description: "Defined pipeline the agent can reason about / emulate locally.",
  improveSuggestion:
    "Add a CI workflow (e.g. .github/workflows/ci.yml or .gitlab-ci.yml) that runs tests + linter on every PR.",
  check: (repo) => {
    const ghWf = join(repo, ".github", "workflows");

    if (existsSync(ghWf) && statSync(ghWf).isDirectory()) {
      const files = readdirSync(ghWf).filter((f) => /\.ya?ml$/.test(f));

      if (files.length > 0) {
        return {
          pass: 1,
          id: "ci",
          label: "CI configuration",
          matchedPath: ".github/workflows",
          detail: `${files.length} GitHub Actions workflow(s)`,
        };
      }
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
