import { join } from "node:path";

import { readSafe, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const LABEL = ".aider.conf.yml";

// Aider looks for this one spelling only; a `.yaml` file loads just through `--config`.
const REL = ".aider.conf.yml";

// Settings that change what Aider runs or reads; a model choice, `auto-test: false` or `read: []` changes neither.
const USEFUL = [
  /^(?:test|lint)-cmd[ \t]*:[ \t]*[^\s#]/m,
  /^auto-test[ \t]*:[ \t]*true\b/im,
  /^read[ \t]*:[ \t]*(?:[^\s#[]|\[[ \t]*[^\s\]]|\r?\n[ \t]+-[ \t]*\S)/m,
];

export const aiderConf: Signal = {
  label: LABEL,
  id: "aider_conf",
  description: "`.aider.conf.yml`: Aider's repo config — test and lint commands, and the files it reads.",
  improveSuggestion:
    "Add a `.aider.conf.yml` at the repo root with `test-cmd`, `lint-cmd` and `auto-test: true`, and list AGENTS.md under `read:`.",
  check: (repo) => {
    const rel = resolveRelative(repo, REL);

    if (!rel) {
      return {
        pass: 0,
        label: LABEL,
        id: "aider_conf",
        detail: "No .aider.conf.yml at repo root",
      };
    }

    const text = readSafe(join(repo, rel), repo);
    if (text.trim().length === 0) {
      return {
        pass: 0.2,
        label: LABEL,
        matchedPath: rel,
        id: "aider_conf",
        detail: "Empty .aider.conf.yml",
      };
    }

    if (!USEFUL.some((re) => re.test(text))) {
      return {
        pass: 0.5,
        label: LABEL,
        matchedPath: rel,
        id: "aider_conf",
        detail: "Aider config sets no test-cmd, lint-cmd, auto-test or read",
      };
    }

    return {
      pass: 1,
      label: LABEL,
      matchedPath: rel,
      id: "aider_conf",
      detail: "Aider config sets test-cmd, lint-cmd, auto-test or read",
    };
  },
};
