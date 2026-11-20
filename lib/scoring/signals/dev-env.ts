import { readdirSync } from "node:fs";
import { join } from "node:path";

import { createResolver, entryKind, isFileEntry, readSafe } from "./helpers";
import type { Signal } from "./types";

// Each inner list is one tool, counted once however many of its files are present:
// Taskfile.yml beside its Taskfile.dist.yml override is still one Taskfile.
const ARTIFACTS: string[][] = [
  ["Makefile", "GNUmakefile", "BSDmakefile"],
  [".devcontainer/devcontainer.json"],
  [".devcontainer.json"],
  ["flake.nix"],
  ["shell.nix"],
  ["default.nix"],
  ["devenv.nix"],
  ["devbox.json"],
  ["Dockerfile", "Containerfile"],
  ["docker-compose.yml"],
  ["docker-compose.yaml"],
  ["compose.yml"],
  ["compose.yaml"],
  ["justfile", ".justfile"],
  ["Taskfile.yml", "Taskfile.yaml", "Taskfile.dist.yml", "Taskfile.dist.yaml"],
  ["Rakefile", "Rakefile.rb"],
  ["Earthfile"],
  ["Makefile.toml"],
  ["Vagrantfile"],
  ["Brewfile"],
  [".gitpod.yml"],
  ["tox.ini"],
  ["noxfile.py"],
  ["pixi.toml"],
  ["mvnw"],
  ["gradlew"],
  ["bin/setup"],
  ["script/bootstrap", "script/setup"],
  [".devin/blueprint.yaml"],
  [".cursor/environment.json"],
  [".github/workflows/copilot-setup-steps.yml"],
];

// The language's own tool fetches dependencies and builds in one command (`cargo
// build`, `go build`, `dotnet build`, `swift build`), so the manifest is the setup.
const TOOLCHAIN_FILES = [
  "Cargo.toml",
  "go.mod",
  "Package.swift",
  "pubspec.yaml",
  "build.zig",
  "gleam.toml",
  "deno.json",
  "deno.jsonc",
  "stack.yaml",
  "cabal.project",
  "shard.yml",
  "rebar.config",
  "elm.json",
  "spago.yaml",
  "dub.json",
  "dub.sdl",
  "fpm.toml",
  "alire.toml",
  "build.sbt",
  "MODULE.bazel",
  "uv.lock",
];
const TOOLCHAIN_PATTERNS = /\.(sln|slnx|csproj|fsproj|vbproj|cabal|nimble)$/i;
// `mix compile` does not fetch deps; a `setup` alias is the one-command path.
const MIX_SETUP_RE = /\bsetup:\s*\[/;

function nestedDevcontainer(repo: string, resolve: (rel: string) => string | null): string | null {
  const dir = resolve(".devcontainer");
  if (!dir || entryKind(repo, join(repo, dir)) !== "dir") {
    return null;
  }

  let subs: string[] = [];
  try {
    subs = readdirSync(join(repo, dir)).sort();
  } catch {
    return null;
  }

  // The devcontainer spec's third location: one folder per config, for repos with several.
  for (const sub of subs) {
    const rel = resolve(`${dir}/${sub}/devcontainer.json`);
    if (rel && isFileEntry(repo, join(repo, rel))) {
      return rel;
    }
  }

  return null;
}

function toolchain(repo: string, resolve: (rel: string) => string | null): string | null {
  for (const f of TOOLCHAIN_FILES) {
    const rel = resolve(f);
    if (rel && isFileEntry(repo, join(repo, rel))) {
      return rel;
    }
  }

  try {
    const hit = readdirSync(repo)
      .sort()
      .find((e) => TOOLCHAIN_PATTERNS.test(e) && isFileEntry(repo, join(repo, e)));
    if (hit) {
      return hit;
    }
  } catch {}

  const mix = resolve("mix.exs");
  return mix && MIX_SETUP_RE.test(readSafe(join(repo, mix), repo)) ? mix : null;
}

export const devEnv: Signal = {
  id: "dev_env",
  label: "Reproducible dev env",
  description: "One-command setup the agent can run: Makefile, devcontainer, Nix or Docker.",
  improveSuggestion: "Add a Makefile or devcontainer or Dockerfile so the agent can set up the project in one command.",
  check: (repo) => {
    const resolve = createResolver(repo);
    const matches: string[] = [];

    for (const group of ARTIFACTS) {
      for (const f of group) {
        const rel = resolve(f);
        if (rel) {
          matches.push(rel);
          break;
        }
      }
    }

    if (!matches.some((m) => m.toLowerCase().endsWith("devcontainer.json"))) {
      const nested = nestedDevcontainer(repo, resolve);
      if (nested) matches.push(nested);
    }

    const tool = toolchain(repo, resolve);
    if (tool) matches.push(tool);

    if (matches.length >= 2) {
      return {
        pass: 1,
        id: "dev_env",
        matchedPath: matches[0],
        label: "Reproducible dev env",
        detail: `${matches.length} env artifacts (${matches.slice(0, 2).join(", ")})`,
      };
    }

    if (matches.length === 1) {
      return {
        pass: 0.7,
        id: "dev_env",
        matchedPath: matches[0],
        detail: `Has ${matches[0]}`,
        label: "Reproducible dev env",
      };
    }

    const pkg = resolve("package.json");
    if (pkg) {
      try {
        const j = JSON.parse(readSafe(join(repo, pkg), repo));

        if (j.scripts && Object.keys(j.scripts).length >= 3) {
          return {
            pass: 0.6,
            id: "dev_env",
            matchedPath: pkg,
            label: "Reproducible dev env",
            detail: `package.json has ${Object.keys(j.scripts).length} scripts`,
          };
        }
      } catch {}
    }

    return {
      pass: 0,
      id: "dev_env",
      label: "Reproducible dev env",
      detail: "No Makefile / devcontainer / Docker / equivalent found",
    };
  },
};
