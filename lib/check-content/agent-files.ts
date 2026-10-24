import type { CheckContent } from "./types";

export const AGENT_FILE_CHECKS: Record<string, CheckContent> = {
  agents_md: {
    title: "AGENTS.md and CLAUDE.md: what they are and how many repos have one",
    metaTitle: "AGENTS.md and CLAUDE.md: how many repos have one",
    description:
      "What an AGENTS.md or CLAUDE.md file is, which AI coding agents read it, how we score it, and how many popular open source repos already have one.",
    what: "AGENTS.md is a markdown file at the repo root written for AI coding agents: what the project is, how it is laid out, which commands build and test it, and which rules to follow. CLAUDE.md is the same file under Claude Code's name.",
    why: "It is the one file most agents load unasked. Claude Code loads CLAUDE.md at the start of every session, or AGENTS.md when there is no CLAUDE.md. Codex reads AGENTS.md before any work, and Cursor, Devin, Kimi Code CLI, OpenHands and Pi read it too. Without it, an agent guesses your build steps and conventions from the code.",
    scoring: [
      "Full pass: the first with content of AGENTS.md, CLAUDE.md and AGENT.md at the repo root, then `.claude/CLAUDE.md` and `.claude/AGENTS.md`, has 800 or more characters.",
      "80%: the file has 200 to 799 characters.",
      "50%: the file has under 200 characters.",
      "20%: the file exists but is empty, as is any other of the five.",
      "Fail: none of the five files exists.",
    ],
    fix: "Add an AGENTS.md at the repo root with the contents above. An existing CLAUDE.md passes as it is, but when a repo has both, Claude Code reads only CLAUDE.md unless it starts with `@AGENTS.md`. Cursor rule files have their own check.",
  },
  cursor_rules: {
    title: "Cursor rules: .cursor/rules and .cursorrules in open source repos",
    metaTitle: "Cursor rules: .cursor/rules in open source repos",
    description:
      "What Cursor rule files are, the difference between .cursor/rules/*.mdc and the older .cursorrules file, how we score them, and which repos ship them.",
    what: "Cursor rules are instruction files Cursor reads from the repo: a `.cursor/rules/` folder of `.mdc` files, one topic each, or the older single `.cursorrules` file at the root.",
    why: "Cursor's Rules docs name `.cursor/rules/*.mdc` and AGENTS.md as its repo instructions. Devin also pulls Cursor rule files into its Knowledge, so the check counts a little for Devin and most for Cursor.",
    scoring: [
      "Full pass: at least one `.mdc` file in `.cursor/rules/`, in a subfolder of it, or in a `.cursor/rules/` folder up to three directories down. A plain `.md` file there does not count: Cursor ignores it.",
      "50%: only the older `.cursorrules` file. Cursor's current docs no longer mention it.",
      "Fail: neither is present.",
    ],
    fix: "Create `.cursor/rules/` with one `.mdc` file per topic: code organisation, naming and style, how to run tests. Move any `.cursorrules` content into them.",
  },
  gemini_md: {
    title: "GEMINI.md: the instructions file Gemini CLI reads",
    description:
      "What GEMINI.md is, how Gemini CLI uses it, how we score it, and how many popular open source repos have one.",
    what: "GEMINI.md is Gemini CLI's AGENTS.md: project goals, layout, setup commands and conventions, in markdown.",
    why: "Gemini CLI's docs describe GEMINI.md as layered, from a global file down to one per component, and sent with every prompt. Of the agents we score, Gemini CLI reads it (OpenHands only when it runs a Gemini model), so this check only affects the Gemini CLI score.",
    scoring: [
      "Full pass: GEMINI.md at the repo root with 800 or more characters, counting an AGENTS.md, CLAUDE.md or AGENT.md it imports with a line like `@AGENTS.md`.",
      "80%: 200 to 799 characters.",
      "50%: under 200 characters.",
      "20%: the file exists but is empty.",
      "Fail: no GEMINI.md at the repo root.",
    ],
    fix: "Add a GEMINI.md at the repo root with what you would put in AGENTS.md, or a single `@AGENTS.md` line to reuse that file. We check only the root file, though Gemini CLI also reads them in subdirectories.",
  },
  openhands_setup: {
    title: ".openhands/setup.sh: the setup script OpenHands runs",
    description:
      "What .openhands/setup.sh does, when OpenHands runs it, how we score it, and how many popular open source repos have one.",
    what: "`.openhands/setup.sh` is a shell script OpenHands runs when it starts working on a repo, to install dependencies and prepare what the tests need.",
    why: "Per its repo-customization docs, OpenHands runs this script every time it begins working with a repo, whether in a container or on the host. With it, the agent starts with a working environment instead of figuring out the install. Only OpenHands reads it, so this check only affects its score.",
    scoring: [
      "Full pass: `.openhands/setup.sh` exists and is not empty.",
      "20%: the file exists but is empty.",
      "Fail: no `.openhands/setup.sh`.",
    ],
    fix: "Put in it the commands a new contributor runs once: install dependencies, build, set up test fixtures. Keep it non-interactive; nobody is there to answer a prompt.",
  },
  aider_conf: {
    title: ".aider.conf.yml: repo-level config for Aider",
    description:
      "What .aider.conf.yml is, which settings matter for an agent-ready repo, how we score it, and how many popular open source repos have one.",
    what: "`.aider.conf.yml` is Aider's config file. Committed at the repo root, it sets options for everyone using Aider there, including the lint command, test command and extra files to read.",
    why: "Per its lint and test docs, Aider lints after every edit by default and runs tests after edits once `test-cmd` and `auto-test` are set. It reads AGENTS.md only when the config's `read:` lists it. So this file is how a repo tells Aider what to run and read. Only Aider reads it, so this check only affects its score.",
    scoring: [
      "Full pass: `.aider.conf.yml` at the repo root that sets `test-cmd`, `lint-cmd`, `auto-test` or `read`.",
      "50%: the file sets none of those, for example only a model.",
      "20%: the file exists but is empty.",
      "Fail: no `.aider.conf.yml`. Aider never looks for a `.aider.conf.yaml`, so that spelling does not count.",
    ],
    fix: "Set `test-cmd` and `lint-cmd` to the commands your CI runs, turn on `auto-test`, and list AGENTS.md under `read:`.",
  },
  agent_skills: {
    title: ".agents/skills: agent skills in open source repos",
    description:
      "What agent skills in .agents/skills are, which AI coding agents load them, how we score them, and how many popular open source repos ship them.",
    what: "An agent skill is a folder in `.agents/skills/` holding a `SKILL.md`: a name and description in its frontmatter, then the steps for one task, such as running a single test or cutting a release. Agents read the descriptions up front and load a skill only when a task matches it.",
    why: "AGENTS.md is loaded in full every time, so it has to stay short. Skills hold the longer task-specific steps without costing context on every task. Codex, Cursor, Devin, Gemini CLI, Kimi Code CLI, OpenHands and Pi all load `.agents/skills/`. Claude Code keeps its skills in `.claude/skills/` instead, and Aider has none, so the check does not count for them. Cursor and Devin also load `.claude/skills/`, but only `.agents/skills/` reaches all seven.",
    scoring: [
      "Full pass: at least one `.agents/skills/<name>/SKILL.md` at the repo root.",
      "Fail: none. We check that the files exist, not what they say.",
    ],
    fix: "Create `.agents/skills/<name>/SKILL.md` for each workflow an agent repeats in this repo, with `name` and `description` frontmatter and the steps below. Point to the skills from AGENTS.md so agents know they exist.",
  },
};
