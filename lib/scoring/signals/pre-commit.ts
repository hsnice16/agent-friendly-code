import { firstExisting } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = [".pre-commit-config.yaml", ".husky", "lefthook.yml", "lefthook.yaml"];

export const preCommit: Signal = {
  id: "pre_commit",
  label: "Pre-commit / git hooks",
  description: "Catches problems locally before the agent wastes a CI cycle.",
  improveSuggestion:
    "Set up pre-commit (.pre-commit-config.yaml), husky, or lefthook to run format+lint on every commit.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "pre_commit",
        label: "Pre-commit / git hooks",
        detail: "Hook framework configured",
      };
    }

    return {
      pass: 0,
      id: "pre_commit",
      label: "Pre-commit / git hooks",
      detail: "No pre-commit / husky / lefthook found",
    };
  },
};
