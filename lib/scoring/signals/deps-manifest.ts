import { join } from "node:path";

import { readSafe } from "./helpers";
import { findNear } from "./nearby";
import type { Signal } from "./types";

const CANDIDATES = [
  // JavaScript / TypeScript
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "deno.json",
  "deno.jsonc",
  // Python
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "poetry.lock",
  "setup.py",
  "pixi.toml",
  // Rust, Go, Ruby, PHP, Dart
  "Cargo.toml",
  "go.mod",
  "Gemfile",
  "composer.json",
  "pubspec.yaml",
  // JVM
  "build.gradle",
  "build.gradle.kts",
  "settings.gradle",
  "settings.gradle.kts",
  "gradle/libs.versions.toml",
  "pom.xml",
  "build.sbt",
  "build.sc",
  "build.mill",
  "ivy.xml",
  "deps.edn",
  "project.clj",
  "bb.edn",
  // .NET
  "Directory.Packages.props",
  "packages.config",
  "paket.dependencies",
  // BEAM, Swift, functional and systems languages
  "mix.exs",
  "rebar.config",
  "gleam.toml",
  "Package.swift",
  "Podfile",
  "Cartfile",
  "stack.yaml",
  "package.yaml",
  "cabal.project",
  "dune-project",
  "shard.yml",
  "build.zig",
  "build.zig.zon",
  "elm.json",
  "spago.yaml",
  "v.mod",
  "dub.json",
  "dub.sdl",
  "fpm.toml",
  "alire.toml",
  // Julia, R, Perl
  "Project.toml",
  "DESCRIPTION",
  "renv.lock",
  "cpanfile",
  "Makefile.PL",
  "dist.ini",
  // C / C++
  "CMakeLists.txt",
  "meson.build",
  "conanfile.txt",
  "conanfile.py",
  "vcpkg.json",
  "xmake.lua",
  "MODULE.bazel",
  "WORKSPACE",
  "WORKSPACE.bazel",
];

const PATTERNS = [
  /\.(csproj|fsproj|vbproj|vcxproj|sln|slnx|proj)$/i,
  /\.cabal$/i,
  /\.nimble$/i,
  /\.gemspec$/i,
  /\.opam$/i,
  /\.rockspec$/i,
];

// `environment.yml` also names Ansible vars and app settings; conda's has a dependencies list.
export const CONDA = ["environment.yml", "environment.yaml"];
const CONDA_RE = /^dependencies:/m;
const isConda = (rel: string) => CONDA.includes(rel.slice(rel.lastIndexOf("/") + 1).toLowerCase());

export const depsManifest: Signal = {
  id: "deps_manifest",
  label: "Dependency manifest",
  description: "A dependency manifest, so the agent can reproduce the environment.",
  improveSuggestion:
    "Commit a proper manifest (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) plus a lockfile.",
  check: (repo) => {
    const m = findNear(repo, {
      names: [...CANDIDATES, ...CONDA],
      patterns: PATTERNS,
      accept: (rel) => !isConda(rel) || CONDA_RE.test(readSafe(join(repo, rel), repo)),
    });

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "deps_manifest",
        detail: "Manifest present",
        label: "Dependency manifest",
      };
    }

    return {
      pass: 0,
      id: "deps_manifest",
      label: "Dependency manifest",
      detail: "No dependency manifest found",
    };
  },
};
