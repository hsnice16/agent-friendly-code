import { join } from "node:path";

import { readSafe, walkFind } from "./helpers";
import { BUILD_FILE_LINTERS, LINTER_FILES } from "./linter-files";
import { findNear, isSkippedDir } from "./nearby";
import type { Signal } from "./types";

// A plain .editorconfig (indent, charset) is tool-neutral and stays a fail; these
// prefixes are keys only dotnet format / Roslyn, Fantomas or ktlint read.
const EDITORCONFIG_TOOL_RE = /^[ \t]*(?:dotnet|csharp|visual_basic|fsharp|ktlint)_/m;

// TreatWarningsAsErrors is left out: it hardens whatever warnings exist but
// configures no analyzer.
const BUILD_PROPS_RE = /<EnforceCodeStyleInBuild>\s*true\s*<|<Analysis(?:Level|Mode)>/i;

// Top-level only: the same names under devDependencies install a tool, not configure it.
const PACKAGE_JSON_KEYS = ["eslintConfig", "prettier", "stylelint", "xo", "standard"];

function hasPackageJsonKey(text: string): boolean {
  try {
    const pkg: unknown = JSON.parse(text);
    if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
      return false;
    }

    return PACKAGE_JSON_KEYS.some((k) => (pkg as Record<string, unknown>)[k] != null);
  } catch {
    return false;
  }
}

const test = (re: RegExp) => (text: string) => re.test(text);
const PY_LINT_SECTION = /^\[(flake8|pylint|isort|pycodestyle|pep8|pydocstyle)\b/m;

// Files that configure a linter in some repos and not in others.
export const LINTER_IN_FILE: { file: string; matches: (text: string) => boolean }[] = [
  { file: "pyproject.toml", matches: test(/\[tool\.(ruff|black|flake8|pylint|mypy|isort|yapf)/) },
  { file: ".editorconfig", matches: test(EDITORCONFIG_TOOL_RE) },
  { file: "Directory.Build.props", matches: test(BUILD_PROPS_RE) },
  { file: "package.json", matches: hasPackageJsonKey },
  { file: "deno.json", matches: test(/"(lint|fmt)"\s*:/) },
  { file: "deno.jsonc", matches: test(/"(lint|fmt)"\s*:/) },
  { file: "tox.ini", matches: test(PY_LINT_SECTION) },
  // Packaging metadata and pytest settings live here too; only a linter section counts.
  { file: "setup.cfg", matches: test(PY_LINT_SECTION) },
  { file: "Cargo.toml", matches: test(/^\[(workspace\.)?lints[\].]/m) },
  { file: "build.zig", matches: test(/\baddFmt\b/) },
  { file: "rebar.config", matches: test(/\berlfmt\b/) },
  { file: "foundry.toml", matches: test(/^\[fmt\]/m) },
  { file: "build.gradle", matches: test(BUILD_FILE_LINTERS) },
  { file: "build.gradle.kts", matches: test(BUILD_FILE_LINTERS) },
  { file: "settings.gradle", matches: test(BUILD_FILE_LINTERS) },
  { file: "settings.gradle.kts", matches: test(BUILD_FILE_LINTERS) },
  { file: "gradle/libs.versions.toml", matches: test(BUILD_FILE_LINTERS) },
  { file: "pom.xml", matches: test(BUILD_FILE_LINTERS) },
];

// Java projects keep Checkstyle rules wherever their build points: `checkstyle/`,
// `style/`, `codestyle/`, `.baseline/checkstyle/`, `src/checkstyle/`.
const CHECKSTYLE_RE = /(^|\/)[^/]*checkstyle[^/]*\.xml$/i;

export const linter: Signal = {
  id: "linter",
  label: "Linter / formatter config",
  description: "A linter, so the agent gets style feedback right away instead of guessing.",
  improveSuggestion:
    "Configure a linter/formatter (ESLint+Prettier, Biome, Ruff, rustfmt+clippy, golangci-lint, .NET rules in .editorconfig) and commit the config.",
  check: (repo) => {
    const m = findNear(repo, { names: LINTER_FILES, kind: "any" });
    if (m) {
      return {
        pass: 1,
        id: "linter",
        matchedPath: m,
        detail: "Config detected",
        label: "Linter / formatter config",
      };
    }

    // One search over every shared file, so the folder listings are read once.
    const inFile = findNear(repo, {
      names: LINTER_IN_FILE.map((f) => f.file),
      accept: (rel) => {
        const entry = LINTER_IN_FILE.find((f) => rel.toLowerCase().endsWith(f.file.toLowerCase()));
        return !!entry && entry.matches(readSafe(join(repo, rel), repo));
      },
    });
    if (inFile) {
      return {
        pass: 1,
        id: "linter",
        matchedPath: inFile,
        label: "Linter / formatter config",
        detail: `Configured in ${inFile}`,
      };
    }

    // Not under a skipped folder: CI writes `build/logs/checkstyle.xml` as a report.
    const [checkstyle] = walkFind(
      repo,
      (rel) => CHECKSTYLE_RE.test(rel) && !rel.split("/").slice(0, -1).some(isSkippedDir),
      2,
      1,
    );
    if (checkstyle) {
      return {
        pass: 1,
        id: "linter",
        matchedPath: checkstyle,
        detail: "Config detected",
        label: "Linter / formatter config",
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
