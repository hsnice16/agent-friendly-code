import { firstExisting } from "./helpers";
import type { Signal } from "./types";

const LABEL = ".aider.conf.yml";
const CANDIDATES = [".aider.conf.yml", ".aider.conf.yaml"];

export const aiderConf: Signal = {
  label: LABEL,
  id: "aider_conf",
  description: "Aider reads `.aider.conf.yml` (or `.yaml`) for repo-level config — model, lint command, test command.",
  improveSuggestion:
    "Add a `.aider.conf.yml` at the repo root pinning Aider's `test-cmd` and `lint-cmd` so it auto-runs them after edits.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        label: LABEL,
        matchedPath: m,
        id: "aider_conf",
        detail: "Aider config present",
      };
    }

    return {
      pass: 0,
      label: LABEL,
      id: "aider_conf",
      detail: "No .aider.conf.yml at repo root",
    };
  },
};
