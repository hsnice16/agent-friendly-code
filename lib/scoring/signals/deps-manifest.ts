import { readdirSync } from "node:fs";

import { firstExisting } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = [
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "poetry.lock",
  "Cargo.toml",
  "go.mod",
  "Gemfile",
  "composer.json",
  "pubspec.yaml",
  "build.gradle",
  "build.gradle.kts",
  "build.sbt",
  "pom.xml",
  "mix.exs",
  "Package.swift",
  "deps.edn",
  "project.clj",
  "stack.yaml",
  "dune-project",
  "rebar.config",
  "shard.yml",
  "build.zig",
  "CMakeLists.txt",
  "meson.build",
  "conanfile.txt",
  "conanfile.py",
  "vcpkg.json",
];

const GLOB_MANIFESTS: RegExp[] = [/\.(csproj|fsproj|vbproj|sln)$/, /\.cabal$/, /\.nimble$/];

function findGlobManifest(repo: string): string | null {
  try {
    const entries = readdirSync(repo);
    for (const re of GLOB_MANIFESTS) {
      const hit = entries.find((f) => re.test(f));
      if (hit) {
        return hit;
      }
    }
  } catch {}

  return null;
}

export const depsManifest: Signal = {
  id: "deps_manifest",
  label: "Dependency manifest",
  description: "Machine-readable dependency list so the agent can reproduce the env.",
  improveSuggestion:
    "Commit a proper manifest (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) plus a lockfile.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "deps_manifest",
        detail: "Manifest present",
        label: "Dependency manifest",
      };
    }

    const glob = findGlobManifest(repo);
    if (glob) {
      return {
        pass: 1,
        matchedPath: glob,
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
