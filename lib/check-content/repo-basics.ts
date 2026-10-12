import type { CheckContent } from "./types";

export const REPO_BASIC_CHECKS: Record<string, CheckContent> = {
  readme: {
    title: "README: how much a repo needs for AI coding agents",
    description:
      "Why a detailed README helps AI coding agents, how we score README length, and how popular open source repos compare.",
    what: "The README is the first file anyone opens, and that includes an agent. This check looks for one at the repo root and measures how much it says.",
    why: "An agent starts every task knowing nothing about the project. A README that covers what the project does, how to install it and how the code is laid out saves it from working that out file by file. Cursor's profile gives the README its top weight.",
    scoring: [
      "Full pass: a README (`.md`, `.rst`, `.txt` or no extension) with 1,000 or more characters.",
      "70%: 200 to 999 characters.",
      "30%: under 200 characters.",
      "Fail: no README at the repo root.",
    ],
    fix: "Cover four things: what the project does, how to install it, the commands people run most, and where the main parts of the code live. That is usually well past 1,000 characters.",
  },
  tests: {
    title: "Test suites: why AI coding agents need tests they can find",
    description:
      "Why AI coding agents depend on a test suite, how we detect tests in a repo, and how many popular open source repos pass.",
    what: "This check looks for tests an agent could run: a test directory, or files named the way test files are named in each language.",
    why: "Tests are how an agent learns whether its change worked. An agent with a test suite can edit, run and correct itself. An agent without one hands back code nobody has run. Claude Code's profile weighs tests as heavily as AGENTS.md.",
    scoring: [
      "Full pass: a `tests/`, `test/`, `__tests__/`, `spec/`, `specs/` or `src/test/` directory.",
      "70%: no such directory, but test-named files turn up within three folder levels, such as `*.test.ts`, `test_*.py`, `*_test.go` or `*Test.java`.",
      "Fail: neither. We check that tests exist, not that they pass.",
    ],
    fix: "Keep tests in a conventional directory, and write the command that runs them in AGENTS.md. Tests that sit next to the source score 70%, because an agent has to search for them.",
  },
  ci: {
    title: "CI configuration: what AI coding agents learn from your pipeline",
    description:
      "Why a CI pipeline helps AI coding agents, which CI systems we detect, and how many popular open source repos have one.",
    what: "This check looks for a continuous integration pipeline defined in the repo: GitHub Actions workflows, or a config file for another CI system.",
    why: "A CI config is a written record of how the project is built and tested. An agent can read it to learn which commands a change has to pass and run them before opening a pull request.",
    scoring: [
      "Full pass: at least one `.yml` or `.yaml` file in `.github/workflows/`.",
      "90%: a config for GitLab CI, CircleCI, Azure Pipelines, Travis CI, Jenkins or Buildkite.",
      "Fail: none of these. We do not check what the pipeline runs.",
    ],
    fix: "Add a workflow that runs the tests and the linter on every pull request. Use the same commands you document for local use, so an agent can run them before it pushes.",
  },
  linter: {
    title: "Linter and formatter config: instant feedback for AI coding agents",
    description:
      "Why a committed linter or formatter config helps AI coding agents, which tools we detect, and how many popular open source repos have one.",
    what: "This check looks for a committed linter or formatter config: ESLint, Prettier, Biome, Ruff, rustfmt, Clippy, golangci-lint, RuboCop, clang-format and about twenty others.",
    why: "A linter turns style into something an agent can check. It runs the tool, reads the errors and fixes them, where it would otherwise copy whatever style the nearest file uses. Aider lints after every edit by default, so a repo with no config gives it nothing to lint against.",
    scoring: [
      "Full pass: a config file for a supported tool, or a `[tool.ruff]`, `[tool.black]`, `[tool.flake8]`, `[tool.pylint]` or `[tool.mypy]` section in `pyproject.toml`.",
      "Fail: no config found. We do not run the linter.",
    ],
    fix: "Pick the standard tool for your language, commit its config file, and put the lint command in AGENTS.md. A linter that only runs with default settings leaves no file for this check to find.",
  },
  deps_manifest: {
    title: "Dependency manifests: letting AI coding agents rebuild your environment",
    description:
      "Why AI coding agents need a dependency manifest, which manifest files we detect, and how many popular open source repos have one.",
    what: "This check looks for a file that lists the project's dependencies in a form a package manager can read: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml` and the equivalents for other languages.",
    why: "An agent that works in a fresh sandbox has to install everything before it can run a single test. A manifest makes that one command. Without one, the agent infers dependencies from import statements and gets versions wrong.",
    scoring: [
      "Full pass: a manifest or lockfile at the repo root.",
      "Fail: none found. A lockfile is not required to pass.",
    ],
    fix: "Commit the manifest your package manager expects at the repo root, and commit the lockfile with it so an agent installs the same versions you do.",
  },
  dev_env: {
    title: "Reproducible dev environments: one-command setup for AI coding agents",
    description:
      "Why AI coding agents need a reproducible dev environment, which setup files we detect, and how many popular open source repos have them.",
    what: "This check looks for files that set up the project with one command: a Makefile, a devcontainer, a Dockerfile or compose file, Nix files, a justfile, a Taskfile, `tox.ini`, `noxfile.py`, the Maven or Gradle wrapper, or `bin/setup`.",
    why: "Agents that run in their own machine have to get the project working there first. Devin starts from a virtual machine with the repo, its tools and its dependencies already set up, per Cognition's environment docs, so its profile weighs a runnable environment above CI. A setup that is written down as a file is one an agent can run.",
    scoring: [
      "Full pass: two or more of these files.",
      "70%: exactly one.",
      "60%: none, but `package.json` defines three or more scripts.",
      "Fail: none of the above. We do not check that the setup works.",
    ],
    fix: "Add a Makefile or justfile with `setup`, `test` and `lint` targets, and a devcontainer or Dockerfile that installs the toolchain. Two of these files earn the full pass.",
  },
  type_config: {
    title: "Type configuration: static types help AI coding agents read code",
    description:
      "Why static types help AI coding agents, how we detect type checking in a repo, and how many popular open source repos have it.",
    what: "This check asks whether the code is statically typed: a type-checker config for JavaScript, TypeScript or Python, or a language that is typed by design.",
    why: "Types tell an agent what a function takes and returns without it running anything. It can follow a call across files and catch a wrong argument before the tests do. Cursor's profile gives type config its top weight.",
    scoring: [
      "Full pass: `tsconfig.json`, `jsconfig.json`, `mypy.ini`, `pyrightconfig.json`, or a `[tool.mypy]` or `[tool.pyright]` section in `pyproject.toml`.",
      "Full pass: a build file for a typed language, namely Rust, Go, Java, Kotlin, Scala, Swift, C#, OCaml, Haskell or Zig.",
      "Fail: neither. A typed language whose build file we do not look for, such as C or C++, also fails.",
    ],
    fix: "For TypeScript or JavaScript, commit a `tsconfig.json` or `jsconfig.json`. For Python, add mypy or Pyright and commit its config. Other typed languages pass once their build file is at the repo root.",
  },
  license: {
    title: "License files: what AI coding agents may do with your code",
    description:
      "Why a license file matters when AI coding agents work in a repo, which files we detect, and how many popular open source repos have one.",
    what: "This check looks for a license file at the repo root: `LICENSE` or `COPYING`, with or without a `.md` or `.txt` extension.",
    why: "A license tells an agent, and the person running it, what may be done with the code: copied into another project, modified, redistributed. Every agent's profile gives it a low weight, because it does not change how well an agent edits the code.",
    scoring: ["Full pass: a license file at the repo root.", "Fail: none. We do not read which license it is."],
    fix: "Add a `LICENSE` file at the repo root. A license named only in `package.json` or the README does not pass.",
  },
  contributing: {
    title: "CONTRIBUTING guides: a workflow AI coding agents can follow",
    description:
      "Why a CONTRIBUTING guide helps AI coding agents, where we look for one, and how many popular open source repos have it.",
    what: "This check looks for a contributing guide: `CONTRIBUTING.md`, or the `.rst` or `.adoc` form, at the repo root, in `.github/` or in `docs/`.",
    why: "A contributing guide holds the rules a pull request is judged by: branch names, commit style, which checks must pass. An agent that opens pull requests needs those rules as much as a new contributor does.",
    scoring: [
      "Full pass: a contributing guide in one of those three places.",
      "Fail: none. We do not read its content.",
    ],
    fix: "Add a `CONTRIBUTING.md` that covers branch naming, commit message style, the commands to run before pushing, and how review works. Keep the agent-specific parts in AGENTS.md and link between the two.",
  },
  pre_commit: {
    title: "Pre-commit hooks: catching AI coding agent mistakes before CI",
    description:
      "Why git hooks help AI coding agents, which hook frameworks we detect, and how many popular open source repos use one.",
    what: "This check looks for a git hook framework configured in the repo: pre-commit (`.pre-commit-config.yaml`), Husky (`.husky/`) or Lefthook (`lefthook.yml`).",
    why: "A hook runs the formatter and linter at commit time, so an agent hears about a problem in seconds. Without hooks the same problem surfaces minutes later as a failed CI run, and the agent spends another round fixing it.",
    scoring: [
      "Full pass: a config for pre-commit, Husky or Lefthook.",
      "Fail: none. Hooks set up any other way, such as a script that writes to `.git/hooks`, are not detected.",
    ],
    fix: "Add one of the three frameworks and have it run the formatter and linter on staged files. Keep the hook fast; slow checks belong in CI.",
  },
  size: {
    title: "Codebase size: how large repos strain AI coding agents",
    description:
      "Why very large repos are harder for AI coding agents, how we count files, and how popular open source repos are spread across the size bands.",
    what: "This check counts the files in the repo. It skips dotfiles, anything `.gitignore` excludes, and vendored or build folders such as `node_modules`, `vendor`, `target`, `dist` and `build`.",
    why: "An agent can only hold part of a large codebase in its context at once. The more files there are, the more of its effort goes into finding the right ones, and the easier it is to miss code that a change affects.",
    scoring: [
      "Full pass: 50 to 499 files.",
      "90%: under 50 files.",
      "80%: 500 to 1,999 files.",
      "50%: 2,000 to 4,999 files.",
      "20%: 5,000 files or more.",
    ],
    fix: "Few projects can shrink, and none should for the sake of a score. What helps is telling the agent where to start: name the main entry points in AGENTS.md, and in a monorepo give each package its own instructions file.",
  },
};
