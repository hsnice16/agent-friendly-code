import { firstExisting } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING", "COPYING.md"];

export const license: Signal = {
  id: "license",
  label: "License file",
  description: "Clarity on what an agent is allowed to do with the code.",
  improveSuggestion: "Add a LICENSE (or COPYING) file — MIT, Apache-2.0, BSD, GPL, etc. — at the repo root.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        id: "license",
        matchedPath: m,
        label: "License file",
        detail: "License present",
      };
    }

    return {
      pass: 0,
      id: "license",
      label: "License file",
      detail: "No LICENSE/COPYING file",
    };
  },
};
