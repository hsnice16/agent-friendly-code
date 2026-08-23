import { join } from "node:path";

import { firstExisting, readSafe, resolveRelative } from "./helpers";
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
  ".rubocop.yml",
  ".standard.yml",
  ".swiftlint.yml",
  ".swiftformat",
  ".swift-format",
  "detekt.yml",
  "config/detekt/detekt.yml",
  ".scalafmt.conf",
  "phpstan.neon",
  "phpstan.neon.dist",
  "psalm.xml",
  "psalm.xml.dist",
  ".php-cs-fixer.dist.php",
  ".php-cs-fixer.php",
  ".credo.exs",
  ".formatter.exs",
  "stylua.toml",
  ".stylua.toml",
  "checkstyle.xml",
  "config/checkstyle/checkstyle.xml",
  "analysis_options.yaml",
  ".clang-format",
  ".clang-tidy",
  ".clj-kondo/config.edn",
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

    const pyproject = resolveRelative(repo, "pyproject.toml");
    if (pyproject && PYPROJECT_RE.test(readSafe(join(repo, pyproject)))) {
      return {
        pass: 1,
        id: "linter",
        matchedPath: pyproject,
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
