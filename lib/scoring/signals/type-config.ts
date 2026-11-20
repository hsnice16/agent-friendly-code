import { join } from "node:path";

import { TYPED_LANGUAGE_DETAIL_PREFIX } from "../details";
import { createResolver, readSafe } from "./helpers";
import { findNear } from "./nearby";
import type { Signal } from "./types";

// Type-checker configs for languages that are not typed by default.
const CONFIGS = [
  "tsconfig.json",
  "jsconfig.json",
  "deno.json",
  "deno.jsonc",
  ".flowconfig",
  "mypy.ini",
  ".mypy.ini",
  "pyrightconfig.json",
  "pyrefly.toml",
  "ty.toml",
  "sorbet/config",
  "Steepfile",
  "phpstan.neon",
  "phpstan.neon.dist",
  "phpstan.dist.neon",
  "psalm.xml",
  "psalm.xml.dist",
  ".luaurc",
];
// Monorepos keep only `tsconfig.base.json` at the top; Laravel ships `phpstan.src.neon.dist`.
const CONFIG_PATTERNS = [/^tsconfig[.-][\w.-]+\.json$/i, /^phpstan\.[\w.-]+\.neon(\.dist)?$/i];

export const TYPE_IN_FILE: { file: string; re: RegExp }[] = [
  { file: "pyproject.toml", re: /\[tool\.(mypy|pyright|basedpyright|ty|pyrefly)[\].]/ },
  { file: "setup.cfg", re: /^\[mypy[\]-]/m },
];

const TYPED_LANG_FILES: Record<string, string> = {
  "cargo.toml": "Rust",
  "go.mod": "Go",
  "pom.xml": "Java",
  "build.gradle": "Java/Kotlin",
  "build.gradle.kts": "Java/Kotlin",
  "settings.gradle": "Java/Kotlin",
  "settings.gradle.kts": "Java/Kotlin",
  "build.sbt": "Scala",
  "build.sc": "Scala",
  "build.mill": "Scala",
  "package.swift": "Swift",
  "global.json": ".NET",
  "directory.packages.props": ".NET",
  "dune-project": "OCaml",
  "stack.yaml": "Haskell",
  "cabal.project": "Haskell",
  "build.zig": "Zig",
  "pubspec.yaml": "Dart",
  "shard.yml": "Crystal",
  "gleam.toml": "Gleam",
  "elm.json": "Elm",
  "spago.yaml": "PureScript",
  "spago.dhall": "PureScript",
  "rescript.json": "ReScript",
  "bsconfig.json": "ReScript",
  "v.mod": "V",
  "dub.json": "D",
  "dub.sdl": "D",
  "fpm.toml": "Fortran",
  "alire.toml": "Ada",
  "cmakelists.txt": "C/C++",
  "meson.build": "C/C++",
  "xmake.lua": "C/C++",
  "conanfile.txt": "C/C++",
  "conanfile.py": "C/C++",
  "vcpkg.json": "C/C++",
};

const TYPED_LANG_PATTERNS: { re: RegExp; lang: string }[] = [
  { re: /\.(csproj|fsproj|vbproj)$/i, lang: ".NET" },
  { re: /\.vcxproj$/i, lang: "C/C++" },
  // A Visual Studio solution may hold C#, F#, VB or C++ projects: typed either way.
  { re: /\.(sln|slnx)$/i, lang: ".NET/C++" },
  { re: /\.cabal$/i, lang: "Haskell" },
  { re: /\.nimble$/i, lang: "Nim" },
  { re: /\.opam$/i, lang: "OCaml" },
];

const NATIVE_PY_BACKEND_RE = /build-backend\s*=\s*["'](mesonpy|scikit_build_core\.build|py_build_cmake)/;

const baseName = (rel: string) => rel.slice(rel.lastIndexOf("/") + 1);

function langOf(rel: string): string {
  const name = baseName(rel);
  return TYPED_LANG_FILES[name.toLowerCase()] ?? TYPED_LANG_PATTERNS.find((p) => p.re.test(name))?.lang ?? "typed";
}

function typedLanguage(repo: string): { rel: string; lang: string } | null {
  // numpy and scipy build their C extensions through a native build backend; the repo is still
  // Python. A pyproject.toml for helper scripts (llama.cpp) leaves a C++ repo C++.
  const pyproject = createResolver(repo)("pyproject.toml");
  const pythonPackage = !!pyproject && NATIVE_PY_BACKEND_RE.test(readSafe(join(repo, pyproject), repo));
  const file = findNear(repo, {
    names: Object.keys(TYPED_LANG_FILES),
    patterns: TYPED_LANG_PATTERNS.map((p) => p.re),
    accept: (rel) => !(pythonPackage && langOf(rel) === "C/C++"),
  });
  if (file) {
    return { rel: file, lang: langOf(file) };
  }

  // An Xcode app has no Package.swift; its project is a folder.
  const xcode = findNear(repo, { patterns: [/\.xcodeproj$/i], kind: "dir" });
  return xcode ? { rel: xcode, lang: "Swift/Objective-C" } : null;
}

export const typeConfig: Signal = {
  id: "type_config",
  label: "Type configuration",
  description: "Static types let the agent check call sites without running code.",
  improveSuggestion:
    "Add a type config (tsconfig.json for JS/TS, mypy.ini or pyrightconfig.json for Python, PHPStan for PHP). Compiled languages such as Rust, Go, Java, C#, Swift and C++ count once their build file is committed.",
  check: (repo) => {
    const config = findNear(repo, { names: CONFIGS, patterns: CONFIG_PATTERNS });
    if (config) {
      return {
        pass: 1,
        matchedPath: config,
        id: "type_config",
        label: "Type configuration",
        detail: "Type config present",
      };
    }

    for (const { file, re } of TYPE_IN_FILE) {
      const rel = findNear(repo, { names: [file], accept: (r) => re.test(readSafe(join(repo, r), repo)) });
      if (rel) {
        return {
          pass: 1,
          id: "type_config",
          label: "Type configuration",
          matchedPath: rel,
          detail: `Configured in ${rel}`,
        };
      }
    }

    const typed = typedLanguage(repo);
    if (typed) {
      return {
        pass: 1,
        id: "type_config",
        label: "Type configuration",
        matchedPath: typed.rel,
        detail: `${TYPED_LANGUAGE_DETAIL_PREFIX} (${typed.lang})`,
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
