import { CANDIDATES as README_CANDIDATES } from "../scoring/signals/readme";

// Not in `lib/scoring/`: the siblings vendor that directory and neither
// materializes a tree, so it would force a re-vendor into both for unused code.
//
// A signal that reads a file adds it here or to the near list; Live Score would
// score any other file as empty. `tests/live-score.test.ts` and
// `scripts/parity-check.ts` catch an omission.
export const CONTENT_CANDIDATES = [
  ...README_CANDIDATES,
  "AGENTS.md",
  "CLAUDE.md",
  "AGENT.md",
  ".claude/CLAUDE.md",
  ".claude/AGENTS.md",
  "GEMINI.md",
  ".openhands/setup.sh",
  ".aider.conf.yml",
  ".gitignore",
  "mix.exs",
] as const;

// Read at the root and in each top-level folder (`childDirs` in lib/scoring/signals/nearby.ts):
// the linter, type and manifest checks look one folder down.
export const NEAR_CONTENT_CANDIDATES = [
  "pyproject.toml",
  "setup.cfg",
  "tox.ini",
  ".editorconfig",
  "Directory.Build.props",
  "package.json",
  "deno.json",
  "deno.jsonc",
  "Cargo.toml",
  "build.zig",
  "rebar.config",
  "foundry.toml",
  "build.gradle",
  "build.gradle.kts",
  "settings.gradle",
  "settings.gradle.kts",
  "gradle/libs.versions.toml",
  "pom.xml",
  "environment.yml",
  "environment.yaml",
] as const;

// Real monorepos stay far below this; it bounds what one hostile tree can make a live score fetch.
export const MAX_NEAR_FETCHES = 150;
