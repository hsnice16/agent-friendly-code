import { readdirSync } from "node:fs";
import { join } from "node:path";

import { entryKind, firstFile, isFileEntry, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const OTHER_CI = [
  ".gitlab-ci.yml",
  "bitbucket-pipelines.yml",
  ".circleci/config.yml",
  "azure-pipelines.yml",
  "azure-pipelines.yaml",
  ".travis.yml",
  "Jenkinsfile",
  ".buildkite/pipeline.yml",
  ".buildkite/pipeline.yaml",
  ".buildkite/pipeline.json",
  "buildkite.yml",
  "buildkite.yaml",
  "buildkite.json",
  "buildkite/pipeline.yml",
  "buildkite/pipeline.yaml",
  "buildkite/pipeline.json",
  ".woodpecker.yml",
  ".woodpecker.yaml",
  "appveyor.yml",
  ".appveyor.yml",
  ".cirrus.yml",
  ".cirrus.star",
  ".drone.yml",
  ".semaphore/semaphore.yml",
  "cloudbuild.yaml",
  "cloudbuild.yml",
  "buildspec.yml",
  "bitrise.yml",
  "codemagic.yaml",
  ".build.yml",
  ".zuul.yaml",
  "zuul.yaml",
  ".onedev-buildspec.yml",
  ".teamcity/settings.kts",
];

// Systems that read every YAML file in a folder; an empty or README-only folder runs nothing.
const CI_DIRS = [".woodpecker", ".forgejo/workflows", ".gitea/workflows", ".builds", ".zuul.d", "zuul.d", ".tekton"];

function yamlFiles(repo: string, rel: string): string[] {
  const abs = join(repo, rel);
  if (entryKind(repo, abs) !== "dir") {
    return [];
  }

  try {
    return readdirSync(abs).filter((f) => /\.ya?ml$/i.test(f) && isFileEntry(repo, join(abs, f)));
  } catch {
    return [];
  }
}

export const ci: Signal = {
  id: "ci",
  label: "CI configuration",
  description: "A CI pipeline the agent can read and run locally.",
  improveSuggestion:
    "Add a CI workflow (e.g. .github/workflows/ci.yml or .gitlab-ci.yml) that runs tests + linter on every PR.",
  check: (repo) => {
    const ghWf = resolveRelative(repo, ".github/workflows");
    const workflows = ghWf ? yamlFiles(repo, ghWf) : [];
    if (ghWf && workflows.length > 0) {
      return {
        pass: 1,
        id: "ci",
        matchedPath: ghWf,
        label: "CI configuration",
        detail: `${workflows.length} GitHub Actions workflow${workflows.length === 1 ? "" : "s"}`,
      };
    }

    const m =
      firstFile(repo, OTHER_CI) ??
      CI_DIRS.map((d) => resolveRelative(repo, d)).find((rel) => rel && yamlFiles(repo, rel).length > 0) ??
      null;
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
