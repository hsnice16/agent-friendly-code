import { firstExisting } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["CONTRIBUTING.md", "CONTRIBUTING", ".github/CONTRIBUTING.md", "docs/CONTRIBUTING.md"];

export const contributing: Signal = {
  id: "contributing",
  label: "CONTRIBUTING guide",
  description: "Explicit contribution workflow an agent can follow.",
  improveSuggestion: "Add CONTRIBUTING.md describing branch naming, commit style, test commands, and the PR process.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "contributing",
        detail: "Guide present",
        label: "CONTRIBUTING guide",
      };
    }

    return {
      pass: 0,
      id: "contributing",
      label: "CONTRIBUTING guide",
      detail: "No CONTRIBUTING file",
    };
  },
};
