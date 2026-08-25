// Not in `lib/scoring/`: the siblings vendor that directory and neither
// materializes a tree, so it would force a re-vendor into both for unused code.
//
// Derived from every `readSafe` / `readFileSync` call site in
// `lib/scoring/signals/` plus `lib/badge-adoption.ts`. A signal that reads a new
// file must be added here, and only `scripts/parity-check.ts` catches the
// omission — the live path would score the file as empty and raise nothing.
export const CONTENT_CANDIDATES = [
  "README.md",
  "README.rst",
  "README.txt",
  "README",
  "AGENTS.md",
  "CLAUDE.md",
  "AGENT.md",
  ".cursorrules",
  ".cursor/rules",
  "GEMINI.md",
  ".openhands/setup.sh",
  "package.json",
  "pyproject.toml",
  ".gitignore",
] as const;
