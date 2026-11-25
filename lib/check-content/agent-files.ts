import type { CheckContent } from "./types";

export const AGENT_FILE_CHECKS: Record<string, CheckContent> = {
  agents_md: {
    published: "2026-10-12",
    updated: "2026-11-22",
    title: "What is AGENTS.md? Format, best practices and a template",
    description:
      "AGENTS.md is plain markdown that tells AI coding agents how to work in your repo. What to put in it, a template, which agents read it, and who has one.",
    what: "AGENTS.md is an open format for guiding AI coding agents: a markdown file at the repo root saying what the project is, how it is laid out, which commands build and test it, and which rules to follow. No fields or headings are required. The Agentic AI Foundation, under the Linux Foundation, stewards it. CLAUDE.md is the same file under Claude Code's name.",
    why: "It is the one file most agents load unasked. Claude Code loads CLAUDE.md every session, or AGENTS.md when there is no CLAUDE.md. Codex reads AGENTS.md before any work, as do Cursor, Devin, Kimi Code CLI, OpenHands and Pi. Without it, an agent guesses your build steps and conventions from the code.",
    scoring: [
      "Full pass: the first with content of AGENTS.md, CLAUDE.md and AGENT.md at the repo root, then `.claude/CLAUDE.md` and `.claude/AGENTS.md`, has 800 or more characters.",
      "80%: the file has 200 to 799 characters.",
      "50%: the file has under 200 characters.",
      "20%: the file exists but is empty, as is any other of the five.",
      "Fail: none of the five files exists.",
    ],
    fix: "Add an AGENTS.md at the repo root with the contents above. An existing CLAUDE.md passes as is, but when a repo has both, Claude Code reads only CLAUDE.md unless it imports `@AGENTS.md`. Cursor rule files have their own check.",
  },
  cursor_rules: {
    published: "2026-10-12",
    updated: "2026-11-25",
    title: "Cursor rules: .mdc format, .cursor/rules and .cursorrules",
    description:
      "Cursor rules are .mdc files in .cursor/rules: the description, globs and alwaysApply fields, rule types, legacy .cursorrules, and why a rule isn't applied.",
    what: "Cursor rules are instruction files Cursor reads from the repo: `.mdc` files in `.cursor/rules/`, subfolders allowed, each markdown with `description`, `globs` and `alwaysApply` frontmatter. Those fields pick the rule type: Always Apply, Apply Intelligently (from the description), Apply to Specific Files (from the globs) or Apply Manually (on @-mention). The root `.cursorrules` file is legacy and will be deprecated.",
    why: "Cursor's Rules docs name `.cursor/rules/*.mdc` and AGENTS.md as its repo instructions, with Team Rules, then Project Rules, then User Rules winning a conflict. A rule scoped by globs or a description loads only when it applies, costing no context on other tasks. Devin also pulls Cursor rule files into its Knowledge (deprecated, moving to Skills), so the check counts a little for Devin and most for Cursor.",
    scoring: [
      "Full pass: at least one `.mdc` file in `.cursor/rules/`, in a subfolder of it, or in a `.cursor/rules/` folder up to three directories down. A plain `.md` file there does not count: Cursor ignores it.",
      "50%: only the older `.cursorrules` file, which Cursor's help says is legacy and will be deprecated.",
      "Fail: neither is present.",
    ],
    fix: "Type `/create-rule` in Cursor's Agent, or create `.cursor/rules/` by hand, with one `.mdc` file per topic, each under 500 lines. Move `.cursorrules` into a rule with `alwaysApply: true`. If a rule isn't applied, check its type: Apply Intelligently needs a `description`, and Apply to Specific Files needs `globs` that match the file.",
  },
  gemini_md: {
    published: "2026-10-12",
    updated: "2026-11-16",
    title: "GEMINI.md: the file Gemini CLI and Antigravity read",
    description:
      "What GEMINI.md is, how Gemini CLI and Google Antigravity use it, how we score it, and how many popular open source repos have one.",
    what: "GEMINI.md is Gemini CLI's AGENTS.md: project goals, layout, setup commands and conventions, in markdown.",
    why: "Gemini CLI's docs describe GEMINI.md as layered, from a global file down to one per component, and sent with every prompt. Of the agents we score, only Gemini CLI reads it (OpenHands only when running a Gemini model), so this check only affects the Gemini CLI score. Google Antigravity, which we don't score, reads and combines GEMINI.md and AGENTS.md from the workspace and its parent folders.",
    scoring: [
      "Full pass: GEMINI.md at the repo root with 800 or more characters, counting an AGENTS.md, CLAUDE.md or AGENT.md it imports with a line like `@AGENTS.md`.",
      "80%: 200 to 799 characters.",
      "50%: under 200 characters.",
      "20%: the file exists but is empty.",
      "Fail: no GEMINI.md at the repo root.",
    ],
    fix: "Add a root GEMINI.md with what you would put in AGENTS.md, or a single `@AGENTS.md` line to reuse that file. We check only the root file, though Gemini CLI also reads them in subdirectories.",
  },
  openhands_setup: {
    published: "2026-10-12",
    updated: "2026-11-16",
    title: ".openhands/setup.sh: the setup script OpenHands runs",
    description:
      "What .openhands/setup.sh does, when OpenHands runs it, how we score it, and how many popular open source repos have one.",
    what: "`.openhands/setup.sh` is a shell script OpenHands runs on starting work in a repo, to install dependencies and prepare what the tests need.",
    why: "Per its repo-customization docs, OpenHands runs this script every time it begins work in a repo, in a container or on the host, so the agent starts with a working environment instead of figuring out the install. Only OpenHands reads it, so this check only affects its score.",
    scoring: [
      "Full pass: `.openhands/setup.sh` exists and is not empty.",
      "20%: the file exists but is empty.",
      "Fail: no `.openhands/setup.sh`.",
    ],
    fix: "Put in it the commands a new contributor runs once: install dependencies, build, set up test fixtures. Keep it non-interactive; nobody answers prompts.",
  },
  aider_conf: {
    published: "2026-10-12",
    updated: "2026-11-25",
    title: ".aider.conf.yml: repo-level config for Aider",
    description:
      "What .aider.conf.yml is, which settings matter for an agent-ready repo, how we score it, and how many popular open source repos have one.",
    what: "`.aider.conf.yml` is Aider's config file. Committed at the repo root, it sets options for everyone using Aider there, including the lint and test commands and extra files to read.",
    why: "Per its lint and test docs, Aider lints after every edit by default and runs tests after edits once `test-cmd` and `auto-test` are set. It reads AGENTS.md only when the config's `read:` lists it, so this file is how a repo tells Aider what to run and read. Only Aider reads it, so this check only affects its score.",
    scoring: [
      "Full pass: `.aider.conf.yml` at the repo root that sets `test-cmd` or `lint-cmd`, `auto-test: true`, or a non-empty `read`.",
      "50%: the file sets none of those, for example only a model or `auto-test: false`.",
      "20%: the file exists but is empty.",
      "Fail: no `.aider.conf.yml`. Aider's docs name only `.aider.conf.yml`, so a `.aider.conf.yaml` does not count.",
    ],
    fix: "Set `test-cmd` and `lint-cmd` to the commands your CI runs, turn on `auto-test`, and list AGENTS.md under `read:`.",
  },
  agent_skills: {
    published: "2026-10-24",
    updated: "2026-11-22",
    title: "What are agent skills? SKILL.md, installing, and examples",
    description:
      "Agent skills are folders with a SKILL.md that agents load when a task matches: how to install one, which agents read .agents/skills, and who ships them.",
    what: "An agent skill is a folder holding a `SKILL.md`: a `name` and `description` in its frontmatter, then the steps for one task, such as running a single test or cutting a release. Agents read only the descriptions up front and load a skill when a task matches. Install one with `npx skills add <owner>/<repo>`, or `gh skill install <owner>/<repo> <skill>` in GitHub CLI 2.90 or later; a repo's own skills go in `.agents/skills/`.",
    why: "AGENTS.md loads in full every time, so it must stay short. Skills hold longer task-specific steps without costing context on every task. Codex, Cursor, Devin, Gemini CLI, Kimi Code CLI, OpenHands and Pi all load `.agents/skills/`. Claude Code keeps its skills in `.claude/skills/` instead, and Aider has none, so the check does not count for them. Cursor and Devin also load `.claude/skills/`, but only `.agents/skills/` reaches all seven.",
    scoring: [
      "Full pass: at least one `.agents/skills/<name>/SKILL.md` at the repo root.",
      "Fail: none. We check that the files exist, not what they say.",
    ],
    fix: "Create `.agents/skills/<name>/SKILL.md` for each workflow an agent repeats in this repo, with `name` and `description` frontmatter and the steps below. Point to them from AGENTS.md so agents know they exist.",
  },
};
