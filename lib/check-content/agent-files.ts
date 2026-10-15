import type { CheckContent } from "./types";

export const AGENT_FILE_CHECKS: Record<string, CheckContent> = {
  agents_md: {
    title: "AGENTS.md and CLAUDE.md: what they are and how many repos have one",
    metaTitle: "AGENTS.md and CLAUDE.md: how many repos have one",
    description:
      "What an AGENTS.md or CLAUDE.md file is, which AI coding agents read it, how we score it, and how many popular open source repos already have one.",
    what: "AGENTS.md is a markdown file at the top of a repo, written for AI coding agents instead of people. It says what the project is, how it is laid out, which commands build and test it, and which rules to follow. CLAUDE.md is the same idea under the name Claude Code looks for.",
    why: "It is the one file most agents load without being asked. Claude Code loads CLAUDE.md at the start of every conversation. GPT-5 Codex reads AGENTS.md before it does any work. Cursor, Kimi CLI, OpenHands and Pi read AGENTS.md too. Without it, an agent has to work out your build steps and conventions by reading code, and it guesses.",
    scoring: [
      "Full pass: AGENTS.md, CLAUDE.md or AGENT.md at the repo root with 800 or more characters.",
      "80%: the file has 200 to 799 characters.",
      "50%: the file has under 200 characters.",
      "20%: the file exists but is empty.",
      "Fail: none of the three files is at the repo root.",
    ],
    fix: "Add an AGENTS.md at the repo root. Cover what the project does, the directory layout, the exact setup, test and lint commands, and the conventions a reviewer would otherwise have to point out. If you already keep a CLAUDE.md, that passes as it is. Cursor rule files do not count here; they have their own check.",
  },
  cursor_rules: {
    title: "Cursor rules: .cursor/rules and .cursorrules in open source repos",
    metaTitle: "Cursor rules: .cursor/rules in open source repos",
    description:
      "What Cursor rule files are, the difference between .cursor/rules/*.mdc and the legacy .cursorrules file, how we score them, and which repos ship them.",
    what: "Cursor rules are instruction files that Cursor reads from the repo. The current form is a `.cursor/rules/` folder of `.mdc` files, each covering one topic such as architecture or naming. The older form is a single `.cursorrules` file at the repo root.",
    why: "Cursor's Rules docs name `.cursor/rules/*.mdc` and AGENTS.md as the places it takes repo instructions from. No other agent we score reads the Cursor files, so this check only affects the Cursor score.",
    scoring: [
      "Full pass: a `.cursor/rules/` folder with at least one `.mdc` file.",
      "50%: only the legacy `.cursorrules` file. Cursor still reads it, but it is deprecated.",
      "Fail: neither is present.",
    ],
    fix: "Create `.cursor/rules/` and add one `.mdc` file per topic: how the code is organised, naming and style rules, how to run tests. If you have a `.cursorrules` file, move its content into `.mdc` files.",
  },
  gemini_md: {
    title: "GEMINI.md: the instructions file Gemini CLI reads",
    description:
      "What GEMINI.md is, how Gemini CLI uses it, how we score it, and how many popular open source repos have one.",
    what: "GEMINI.md is Gemini CLI's instructions file. It plays the role AGENTS.md plays for other agents: project goals, layout, setup commands and conventions, in markdown.",
    why: "Gemini CLI's docs describe GEMINI.md files as layered, from a global file down to one per component, and loaded on every prompt. Only Gemini CLI reads it, so this check only affects the Gemini CLI score.",
    scoring: [
      "Full pass: GEMINI.md at the repo root with 800 or more characters.",
      "80%: 200 to 799 characters.",
      "50%: under 200 characters.",
      "20%: the file exists but is empty.",
      "Fail: no GEMINI.md at the repo root.",
    ],
    fix: "Add a GEMINI.md at the repo root with the same content you would put in AGENTS.md. We only check the root file, though Gemini CLI also reads GEMINI.md files in subdirectories.",
  },
  openhands_setup: {
    title: ".openhands/setup.sh: the setup script OpenHands runs",
    description:
      "What .openhands/setup.sh does, when OpenHands runs it, how we score it, and how many popular open source repos have one.",
    what: "`.openhands/setup.sh` is a shell script that OpenHands runs when a session starts. It is where a repo installs its dependencies and prepares anything the tests need.",
    why: "OpenHands works inside a sandboxed container, and its repo-customization docs say it runs this script at session start. With it, the agent begins with a working environment. Without it, the agent spends its first steps working out how to install the project. Only OpenHands reads it, so this check only affects the OpenHands score.",
    scoring: [
      "Full pass: `.openhands/setup.sh` exists and is not empty.",
      "20%: the file exists but is empty.",
      "Fail: no `.openhands/setup.sh`.",
    ],
    fix: "Add `.openhands/setup.sh` with the commands a new contributor runs once: install dependencies, build what needs building, set up test fixtures. Keep it non-interactive, since nobody is there to answer a prompt.",
  },
  aider_conf: {
    title: ".aider.conf.yml: repo-level config for Aider",
    description:
      "What .aider.conf.yml is, which settings matter for an agent-ready repo, how we score it, and how many popular open source repos have one.",
    what: "`.aider.conf.yml` is Aider's config file. Committed at the repo root, it sets Aider's options for everyone who uses it in that repo, including the lint command, the test command and extra files to read.",
    why: "Aider lints after every edit by default and runs tests after edits once a test command is set, per its lint and test docs. It does not read AGENTS.md on its own; that file only loads when the config's `read:` setting lists it. So this file is how a repo tells Aider what to run and what to read. Only Aider reads it, so this check only affects the Aider score.",
    scoring: [
      "Full pass: `.aider.conf.yml` or `.aider.conf.yaml` at the repo root.",
      "Fail: neither file is present. We do not look at what the file contains.",
    ],
    fix: "Add `.aider.conf.yml` at the repo root. Set `test-cmd` and `lint-cmd` to the commands your CI runs, and list AGENTS.md under `read:` so Aider loads it.",
  },
};
