import { join } from "node:path";

import { createResolver, readSafe } from "./helpers";
import type { Signal } from "./types";

const LEFTHOOK = ["yml", "yaml", "toml", "json", "jsonc"].flatMap((ext) => [
  `lefthook.${ext}`,
  `.lefthook.${ext}`,
  `.config/lefthook.${ext}`,
]);

const CANDIDATES = [
  ".pre-commit-config.yaml",
  // pre-commit itself reads only `.yaml`; prek reads both, and `prek.toml`.
  ".pre-commit-config.yml",
  "prek.toml",
  ".husky",
  ".huskyrc",
  ".huskyrc.json",
  ...LEFTHOOK,
  ".simple-git-hooks.js",
  ".simple-git-hooks.cjs",
  ".simple-git-hooks.mjs",
  ".simple-git-hooks.json",
  "simple-git-hooks.js",
  "simple-git-hooks.cjs",
  "simple-git-hooks.mjs",
  "simple-git-hooks.json",
  ".rusty-hook.toml",
  "rusty-hook.toml",
  ".overcommit.yml",
  "captainhook.json",
  "grumphp.yml",
  "grumphp.yaml",
  "grumphp.yml.dist",
  "grumphp.yaml.dist",
  "grumphp.dist.yml",
  "grumphp.dist.yaml",
  "hk.pkl",
];

// simple-git-hooks and yorkie read a top-level key; Husky up to v4 read `husky.hooks`.
function packageJsonHooks(text: string): boolean {
  try {
    const pkg = JSON.parse(text);
    return !!pkg && typeof pkg === "object" && !!(pkg["simple-git-hooks"] || pkg.gitHooks || pkg.husky?.hooks);
  } catch {
    return false;
  }
}

// [ \t], not \s: with `m`, \s spans newlines and a file of blank lines goes quadratic.
const CARGO_HUSKY_RE = /^[ \t]*cargo-husky[ \t]*=/m;

export const preCommit: Signal = {
  id: "pre_commit",
  label: "Pre-commit / git hooks",
  description: "Pre-commit hooks catch problems before the agent waits on CI.",
  improveSuggestion:
    "Set up pre-commit (.pre-commit-config.yaml), husky, or lefthook to run format+lint on every commit.",
  check: (repo) => {
    const resolve = createResolver(repo);
    let m = CANDIDATES.map(resolve).find(Boolean) ?? null;

    if (!m) {
      const pkg = resolve("package.json");
      if (pkg && packageJsonHooks(readSafe(join(repo, pkg), repo))) m = pkg;
    }

    if (!m) {
      const cargo = resolve("Cargo.toml");
      if (cargo && CARGO_HUSKY_RE.test(readSafe(join(repo, cargo), repo))) m = cargo;
    }

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "pre_commit",
        label: "Pre-commit / git hooks",
        detail: "Hook framework configured",
      };
    }

    return {
      pass: 0,
      id: "pre_commit",
      label: "Pre-commit / git hooks",
      detail: "No pre-commit / husky / lefthook found",
    };
  },
};
