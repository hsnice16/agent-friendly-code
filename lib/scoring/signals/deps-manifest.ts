import { firstExisting } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = [
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "poetry.lock",
  "Cargo.toml",
  "go.mod",
  "Gemfile",
  "composer.json",
  "pubspec.yaml",
  "build.gradle",
  "pom.xml",
];

export const depsManifest: Signal = {
  id: "deps_manifest",
  label: "Dependency manifest",
  description: "Machine-readable dependency list so the agent can reproduce the env.",
  improveSuggestion:
    "Commit a proper manifest (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) plus a lockfile.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "deps_manifest",
        detail: "Manifest present",
        label: "Dependency manifest",
      };
    }

    return {
      pass: 0,
      id: "deps_manifest",
      label: "Dependency manifest",
      detail: "No dependency manifest found",
    };
  },
};
