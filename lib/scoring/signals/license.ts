import { readdirSync } from "node:fs";
import { join } from "node:path";

import { entryKind, firstExisting, isFileEntry } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = [
  "LICENSE",
  "LICENSE.md",
  "LICENSE.txt",
  "LICENCE",
  "LICENCE.md",
  "LICENCE.txt",
  "COPYING",
  "COPYING.md",
  "COPYING.txt",
  "UNLICENSE",
  "LICENSE-MIT",
  "LICENSE-APACHE",
];

// REUSE keeps one SPDX-named file per licence in `LICENSES/` and makes a root
// LICENSE optional. Exact spelling: a `licenses/` folder is often vendored notices.
function reuseLicenses(repo: string): string | null {
  const abs = join(repo, "LICENSES");

  try {
    // Compared against the listing, not opened by path: a case-insensitive disk would let `licenses/` through.
    if (!readdirSync(repo).includes("LICENSES") || entryKind(repo, abs) !== "dir") {
      return null;
    }

    return readdirSync(abs).some((f) => /^[A-Za-z0-9.+-]+\.txt$/.test(f) && isFileEntry(repo, join(abs, f)))
      ? "LICENSES"
      : null;
  } catch {
    return null;
  }
}

export const license: Signal = {
  id: "license",
  label: "License file",
  description: "A license, so it's clear what may be done with the code.",
  improveSuggestion: "Add a LICENSE (or COPYING) file — MIT, Apache-2.0, BSD, GPL, etc. — at the repo root.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES) ?? reuseLicenses(repo);

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
