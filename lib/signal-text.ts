// Each signal's label and fix text, for client views: the signal registry can't
// ship to the browser, and passing this text as props repeated it in every repo
// page's HTML and RSC payload. tests/signal-text.test.ts keeps it equal to the registry.

export type SignalText = { label: string; suggestion: string };

export const SIGNAL_TEXT: Record<string, SignalText> = {
  agent_skills: {
    label: "Skills (.agents/skills)",
    suggestion:
      "Add `.agents/skills/<name>/SKILL.md` for the workflows an agent repeats here (running one test, cutting a release, adding a migration), each with a `name` and `description` in its frontmatter.",
  },
  agents_md: {
    label: "AGENTS.md / CLAUDE.md",
    suggestion:
      "Add an AGENTS.md covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
  },
  aider_conf: {
    label: ".aider.conf.yml",
    suggestion:
      "Add a `.aider.conf.yml` at the repo root with `test-cmd`, `lint-cmd` and `auto-test: true`, and list AGENTS.md under `read:`.",
  },
  ci: {
    label: "CI configuration",
    suggestion:
      "Add a CI workflow (e.g. .github/workflows/ci.yml or .gitlab-ci.yml) that runs tests + linter on every PR.",
  },
  contributing: {
    label: "CONTRIBUTING guide",
    suggestion: "Add CONTRIBUTING.md describing branch naming, commit style, test commands, and the PR process.",
  },
  cursor_rules: {
    label: "Cursor rules (.cursor/rules)",
    suggestion:
      "Add `.cursor/rules/*.mdc` files describing how Cursor should work in this repo (architecture, conventions, naming). Cursor's current docs no longer mention the single `.cursorrules` file.",
  },
  deps_manifest: {
    label: "Dependency manifest",
    suggestion: "Commit a proper manifest (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) plus a lockfile.",
  },
  dev_env: {
    label: "Reproducible dev env",
    suggestion: "Add a Makefile or devcontainer or Dockerfile so the agent can set up the project in one command.",
  },
  gemini_md: {
    label: "GEMINI.md",
    suggestion:
      "Add a GEMINI.md at the repo root covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
  },
  license: {
    label: "License file",
    suggestion: "Add a LICENSE (or COPYING) file — MIT, Apache-2.0, BSD, GPL, etc. — at the repo root.",
  },
  linter: {
    label: "Linter / formatter config",
    suggestion:
      "Configure a linter/formatter (ESLint+Prettier, Biome, Ruff, rustfmt+clippy, golangci-lint, .NET rules in .editorconfig) and commit the config.",
  },
  openhands_setup: {
    label: ".openhands/setup.sh",
    suggestion:
      "Add a `.openhands/setup.sh` that installs dependencies and prepares the project so OpenHands can run tests and lints out of the box.",
  },
  pre_commit: {
    label: "Pre-commit / git hooks",
    suggestion: "Set up pre-commit (.pre-commit-config.yaml), husky, or lefthook to run format+lint on every commit.",
  },
  readme: {
    label: "README",
    suggestion:
      "Expand your README to cover what the project does, how to install, the common commands, and the high-level layout.",
  },
  size: {
    label: "Manageable size",
    suggestion:
      "If possible, split into smaller modules or carve out a focused entry path. Document where to start in AGENTS.md.",
  },
  tests: {
    label: "Test suite",
    suggestion:
      "Add a tests/ (or test/, __tests__/, spec/) directory with runnable tests. Document how to run them in AGENTS.md.",
  },
  type_config: {
    label: "Type configuration",
    suggestion:
      "Add a type config (tsconfig.json for JS/TS, mypy.ini or pyrightconfig.json for Python, PHPStan for PHP). Compiled languages such as Rust, Go, Java, C#, Swift and C++ count once their build file is committed.",
  },
};
