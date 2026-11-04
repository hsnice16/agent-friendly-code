import { AGENT_FILE_SIGNAL_IDS } from "./utils/agent-instructions";

// The /guide's grouping of the checks. Each `action` is what to do, not what
// the check is: the /check page under it has the what and why, and repeating
// them here is a second copy to keep in step. tests/guide-content.test.ts holds
// every signal to exactly one theme.
export type GuideTheme = {
  id: string;
  title: string;
  intro: string;
  checks: { id: string; action: string }[];
};

// For these the question is whether a repo has the file; a partial pass is a
// thin or older-form file, so "pass" would undercount it. Every other check's
// figure is the full pass rate, as on /check.
export const FILE_CHECKS = new Set(AGENT_FILE_SIGNAL_IDS);

export const GUIDE_THEMES: GuideTheme[] = [
  {
    id: "explain",
    title: "Tell the agent what it can't read from the code",
    intro: "An agent starts every session knowing nothing. These files are what it reads first.",
    checks: [
      {
        id: "agents_md",
        action: "Write an AGENTS.md: exact commands, rules a reviewer would repeat, what never to touch.",
      },
      { id: "readme", action: "Say what the project does, how to install it and where the main code lives." },
      { id: "contributing", action: "Write down branch, commit and review rules; link it from AGENTS.md." },
      { id: "license", action: "Add a LICENSE file at the root, so it's clear what the code may be used for." },
    ],
  },
  {
    id: "verify",
    title: "Let it check its own work",
    intro: "An agent that can run the checks fixes its own mistakes before you see them.",
    checks: [
      {
        id: "tests",
        action: "Keep tests in a conventional directory, and put the command that runs one file in AGENTS.md.",
      },
      { id: "ci", action: "Define CI in the repo, so the agent can see and run what a change must pass." },
      { id: "linter", action: "Commit the linter config, so style is checked rather than copied from nearby files." },
      { id: "type_config", action: "Commit a type-checker config: a wrong argument fails before the tests run." },
      {
        id: "pre_commit",
        action: "Run the formatter and linter on commit, so problems show in seconds, not after CI.",
      },
    ],
  },
  {
    id: "setup",
    title: "Make setup one command",
    intro: "Cloud agents start in a fresh machine and must install everything before they can run a test.",
    checks: [
      {
        id: "deps_manifest",
        action: "Commit the manifest and its lockfile, so the agent installs the versions you do.",
      },
      {
        id: "dev_env",
        action: "Add a Makefile or justfile with setup, test and lint targets, and a devcontainer or Dockerfile.",
      },
      { id: "openhands_setup", action: "For OpenHands: put the one-time install steps in `.openhands/setup.sh`." },
    ],
  },
  {
    id: "per-agent",
    title: "Add the files your agents read",
    intro: "AGENTS.md reaches most agents. A few read their own file, or need one to find AGENTS.md.",
    checks: [
      { id: "cursor_rules", action: "For Cursor: scoped rules in `.cursor/rules/*.mdc`." },
      { id: "gemini_md", action: "For Gemini CLI: a GEMINI.md, which can be a single `@AGENTS.md` line." },
      { id: "aider_conf", action: "For Aider: `.aider.conf.yml` with your test and lint commands, reading AGENTS.md." },
      { id: "agent_skills", action: "Move long, task-specific steps out of AGENTS.md into `.agents/skills/`." },
    ],
  },
  {
    id: "size",
    title: "Point it at the right code",
    intro: "Size isn't something to fix, but a large repo needs directions.",
    checks: [{ id: "size", action: "Name the entry points in AGENTS.md, and give each monorepo package its own." }],
  },
];
