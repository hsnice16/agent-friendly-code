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
  ".globalconfig",
  "stylecop.json",
  "fsharplint.json",
];

const PYPROJECT_RE = /\[tool\.(ruff|black|flake8|pylint|mypy)/;

// A plain .editorconfig (indent, charset) is tool-neutral and stays a fail; these
// prefixes are keys only dotnet format / Roslyn, Fantomas or ktlint read.
const EDITORCONFIG_TOOL_RE = /^[ \t]*(?:dotnet|csharp|visual_basic|fsharp|ktlint)_/m;

// TreatWarningsAsErrors is left out: it hardens whatever warnings exist but
// configures no analyzer.
const BUILD_PROPS_RE = /<EnforceCodeStyleInBuild>\s*true\s*<|<Analysis(?:Level|Mode)>/i;

export const IN_FILE: { file: string; re: RegExp }[] = [
  { file: "pyproject.toml", re: PYPROJECT_RE },
  { file: ".editorconfig", re: EDITORCONFIG_TOOL_RE },
  { file: "Directory.Build.props", re: BUILD_PROPS_RE },
];

export const linter: Signal = {
  id: "linter",
  label: "Linter / formatter config",
  description: "A linter, so the agent gets style feedback right away instead of guessing.",
  improveSuggestion:
    "Configure a linter/formatter (ESLint+Prettier, Biome, Ruff, rustfmt+clippy, golangci-lint, .NET rules in .editorconfig) and commit the config.",
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

    for (const { file, re } of IN_FILE) {
      const rel = resolveRelative(repo, file);

      if (rel && re.test(readSafe(join(repo, rel), repo))) {
        return {
          pass: 1,
          id: "linter",
          matchedPath: rel,
          label: "Linter / formatter config",
          detail: `Configured in ${rel}`,
        };
      }
    }

    return {
      pass: 0,
      id: "linter",
      label: "Linter / formatter config",
      detail: "No linter/formatter config found",
    };
  },
};
