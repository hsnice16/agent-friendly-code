import { existsSync } from "node:fs";
import { join } from "node:path";

import { firstExisting, readSafe } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = [
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.json",
  ".eslintrc.cjs",
  "eslint.config.js",
  "eslint.config.mjs",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.js",
  "prettier.config.js",
  "ruff.toml",
  ".ruff.toml",
  ".pylintrc",
  ".flake8",
  "setup.cfg",
  "rustfmt.toml",
  ".rustfmt.toml",
  "clippy.toml",
  ".golangci.yml",
  ".golangci.yaml",
  "biome.json",
  ".biome.json",
];

const PYPROJECT_RE = /\[tool\.(ruff|black|flake8|pylint|mypy)/;

export const linter: Signal = {
  id: "linter",
  label: "Linter / formatter config",
  description: "Agents get immediate feedback on style rather than ambiguous drift.",
  improveSuggestion:
    "Configure a linter/formatter (ESLint+Prettier, Biome, Ruff, rustfmt+clippy, golangci-lint) and commit the config.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        id: "linter",
        matchedPath: m,
        detail: "Config detected",
        label: "Linter / formatter config",
      };
    }

    const pyproject = join(repo, "pyproject.toml");
    if (existsSync(pyproject) && PYPROJECT_RE.test(readSafe(pyproject))) {
      return {
        pass: 1,
        id: "linter",
        matchedPath: "pyproject.toml",
        label: "Linter / formatter config",
        detail: "Configured in pyproject.toml",
      };
    }

    return {
      pass: 0,
      id: "linter",
      label: "Linter / formatter config",
      detail: "No linter/formatter config found",
    };
  },
};
