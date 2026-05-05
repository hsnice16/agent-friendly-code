import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { firstExisting, readSafe } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["tsconfig.json", "jsconfig.json", "mypy.ini", ".mypy.ini", "pyrightconfig.json"];
const PYPROJECT_RE = /\[tool\.(mypy|pyright)/;

const TYPED_LANG_FILES: { file: string; lang: string }[] = [
  { file: "Cargo.toml", lang: "Rust" },
  { file: "go.mod", lang: "Go" },
  { file: "pom.xml", lang: "Java" },
  { file: "build.gradle", lang: "Java/Kotlin" },
  { file: "build.gradle.kts", lang: "Java/Kotlin" },
  { file: "build.sbt", lang: "Scala" },
  { file: "Package.swift", lang: "Swift" },
  { file: "global.json", lang: "C#" },
  { file: "dune-project", lang: "OCaml" },
  { file: "stack.yaml", lang: "Haskell" },
  { file: "build.zig", lang: "Zig" },
];

const GLOB_TYPED: { re: RegExp; lang: string }[] = [
  { re: /\.(csproj|fsproj|vbproj|sln)$/, lang: "C#" },
  { re: /\.cabal$/, lang: "Haskell" },
];

function detectTypedLang(repo: string): string | null {
  for (const { file, lang } of TYPED_LANG_FILES) {
    if (existsSync(join(repo, file))) {
      return lang;
    }
  }

  try {
    const entries = readdirSync(repo);
    for (const { re, lang } of GLOB_TYPED) {
      if (entries.some((f) => re.test(f))) {
        return lang;
      }
    }
  } catch {}

  return null;
}

export const typeConfig: Signal = {
  id: "type_config",
  label: "Type configuration",
  description: "Static types help agents reason about call sites without running code.",
  improveSuggestion:
    "Add a type config (tsconfig.json for JS/TS, mypy.ini or pyrightconfig.json for Python). Rust/Go/JVM/Scala/Swift/C#/OCaml/Haskell/Zig are typed by default.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "type_config",
        label: "Type configuration",
        detail: "Type config present",
      };
    }

    const pyproject = join(repo, "pyproject.toml");
    if (existsSync(pyproject) && PYPROJECT_RE.test(readSafe(pyproject))) {
      return {
        pass: 1,
        id: "type_config",
        label: "Type configuration",
        matchedPath: "pyproject.toml",
        detail: "Configured in pyproject.toml",
      };
    }

    const lang = detectTypedLang(repo);
    if (lang) {
      return {
        pass: 1,
        id: "type_config",
        label: "Type configuration",
        detail: `Typed language (${lang})`,
      };
    }

    return {
      pass: 0,
      id: "type_config",
      label: "Type configuration",
      detail: "No type config found",
    };
  },
};
