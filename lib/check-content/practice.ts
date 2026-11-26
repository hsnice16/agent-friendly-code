// The "how do I do this with an agent" panel on some /check pages, for the
// searches that land there ("claude code pre commit hook", "claude code
// devcontainer"). Every item restates one of `sources`; nothing here is ours.
export type CheckPractice = {
  heading: string;
  items: string[];
  snippets?: { caption: string; text: string }[];
  /** The first row is the header; each row's first cell labels it. */
  table?: { caption: string; rows: string[][] };
  sources: string[];
};

const CLAUDE_BEST_PRACTICES = "https://code.claude.com/docs/en/best-practices";
const CLAUDE_HOOKS = "https://code.claude.com/docs/en/hooks-guide";
const COPILOT_SETUP =
  "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment";

export const CHECK_PRACTICE: Record<string, CheckPractice> = {
  tests: {
    heading: "How do I get Claude Code and other agents to test their work?",
    items: [
      "Put the test command, and how to run one test file, in AGENTS.md or CLAUDE.md. Claude Code's docs call the command that runs your check the most useful line in CLAUDE.md.",
      "For a bug, ask for a failing test first: the docs' example prompt has Claude write a test reproducing it, then fix it.",
      "Ask it to run the tests until they pass. With a pass-or-fail check, the agent makes the change, runs it, and fixes what broke.",
      "To enforce it, a `Stop` hook in `.claude/settings.json` exiting with code 2 sends Claude back to work until the command passes.",
      'Ask for evidence: the command it ran and its output. "All tests pass" alone tells you little.',
    ],
    sources: [CLAUDE_BEST_PRACTICES],
  },
  linter: {
    heading: "How do I make Claude Code run the linter after every edit?",
    items: [
      "Put the lint and format commands in AGENTS.md so any agent can run them as a check.",
      "For a rule with no exceptions, use a hook: Claude Code runs a `PostToolUse` hook after each tool call; the `Edit|Write` matcher limits it to file edits. The docs' example formats each edited file with Prettier.",
      "Committed in `.claude/settings.json`, it applies to everyone in the repo once they trust the folder.",
      "Aider needs no hook: it lints the files it edits by default, and `lint-cmd` in `.aider.conf.yml` swaps in your own linter.",
    ],
    snippets: [
      {
        caption: ".claude/settings.json",
        text: '{\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Edit|Write",\n        "hooks": [\n          { "type": "command", "command": "f=$(jq -r \'.tool_input.file_path\') && npx prettier --write --ignore-unknown \\"$f\\"" }\n        ]\n      }\n    ]\n  }\n}\n',
      },
    ],
    sources: [CLAUDE_HOOKS, CLAUDE_BEST_PRACTICES, "https://aider.chat/docs/usage/lint-test.html"],
  },
  pre_commit: {
    heading: "How do I stop an agent skipping the hooks?",
    items: [
      "Say in AGENTS.md that `--no-verify` is off limits: when a hook fails, fix the cause and commit again.",
      "To enforce it in Claude Code, a `PreToolUse` hook on `Bash` that exits with code 2 blocks the command and sends its stderr back to Claude (last snippet below).",
      'In Cursor, a `beforeShellExecution` hook in `.cursor/hooks.json` can answer `"permission": "deny"` to the same command.',
      "Agent hooks also catch problems before commit time: Claude Code's `PostToolUse` or Cursor's `afterFileEdit` can format each file as it is edited, and a `Stop` hook keeps Claude working until a check passes.",
      "OpenHands' docs move `.openhands/pre-commit.sh` checks into Stop hooks in `.openhands/hooks.json`.",
    ],
    table: {
      caption: "Git hooks compared with Claude Code and Cursor hooks",
      rows: [
        ["", "Git pre-commit hook", "Claude Code hook", "Cursor hook"],
        [
          "Config",
          "`.pre-commit-config.yaml`, `.husky/`, `lefthook.yml`",
          "`.claude/settings.json`",
          "`.cursor/hooks.json`",
        ],
        [
          "Runs",
          "On `git commit`, whoever commits",
          "On agent events: `PreToolUse`, `PostToolUse`, `Stop`",
          "On agent events: `beforeShellExecution`, `afterFileEdit`, `stop`",
        ],
        ["Skipped by", "`--no-verify` or `-n`", "No flag", "No flag"],
      ],
    },
    snippets: [
      {
        caption: ".pre-commit-config.yaml",
        text: "repos:\n  - repo: https://github.com/pre-commit/pre-commit-hooks\n    rev: v5.0.0\n    hooks:\n      - id: trailing-whitespace\n      - id: end-of-file-fixer\n  - repo: https://github.com/astral-sh/ruff-pre-commit\n    rev: v0.8.0\n    hooks:\n      - id: ruff\n      - id: ruff-format\n",
      },
      {
        caption: "Husky + lint-staged",
        text: 'npx husky init\necho "npx lint-staged" > .husky/pre-commit\n\n# package.json\n"lint-staged": { "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"] }\n',
      },
      {
        caption: "lefthook.yml",
        text: 'pre-commit:\n  commands:\n    lint:\n      glob: "*.{js,ts,tsx}"\n      run: npx eslint --fix {staged_files}\n      stage_fixed: true\n',
      },
      {
        caption: ".claude/settings.json",
        text: `${JSON.stringify(
          {
            hooks: {
              PreToolUse: [
                {
                  matcher: "Bash",
                  hooks: [
                    {
                      type: "command",
                      command:
                        "jq -r '.tool_input.command' | grep -q -- '--no-verify' && { echo 'Fix the failing hook instead of skipping it' >&2; exit 2; } || exit 0",
                    },
                  ],
                },
              ],
            },
          },
          null,
          2,
        )}\n`,
      },
    ],
    sources: [
      "https://git-scm.com/docs/githooks",
      "https://code.claude.com/docs/en/hooks",
      "https://cursor.com/docs/agent/hooks",
      "https://pre-commit.com/",
      "https://typicode.github.io/husky/get-started.html",
      "https://github.com/lint-staged/lint-staged",
      "https://lefthook.dev/configuration/",
      "https://docs.openhands.dev/openhands/usage/customization/repository",
    ],
  },
  dev_env: {
    heading: "Should AI coding agents run in a dev container?",
    items: [
      "A dev container defines one isolated environment everyone runs. With Claude Code installed in it, Claude's commands execute in the container, not on your machine, while its edits appear in your local repo.",
      "Claude Code installs through its Dev Container Feature in `.devcontainer/devcontainer.json`, below. Anthropic's reference container adds `init-firewall.sh` to limit outbound traffic.",
      "Inside the container, as a non-root user, you can run `--dangerously-skip-permissions`. The docs warn this doesn't stop a malicious project taking anything the container can reach, so use it only with trusted repos.",
      "Cloud agents read their own setup file: Copilot's cloud agent runs `.github/workflows/copilot-setup-steps.yml` (the job must be named `copilot-setup-steps`), and Devin reads `.devin/blueprint.yaml`.",
    ],
    snippets: [
      {
        caption: ".devcontainer/devcontainer.json",
        text: '{\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": {\n    "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {}\n  }\n}\n',
      },
    ],
    sources: [
      "https://code.claude.com/docs/en/devcontainer",
      "https://containers.dev/",
      COPILOT_SETUP,
      "https://docs.devin.ai/onboard-devin/environment/git-backed-blueprints",
    ],
  },
  ci: {
    heading: "How do AI coding agents use your CI?",
    items: [
      "CI records what a change must pass. Claude Code's docs list tests, the typecheck and CI as how you know work is done.",
      "Copy CI's exact install, lint and test commands into AGENTS.md, so the agent runs them before pushing instead of learning from a red build.",
      "Copilot's cloud agent can build the project and run its tests and linters in its own environment; `copilot-setup-steps.yml` installs what they need first.",
      "An agent can also watch CI. Claude Code's docs show `/loop 15m check CI on this branch, and if it's red pull the failing job's log, fix it and push`.",
    ],
    sources: [CLAUDE_BEST_PRACTICES, COPILOT_SETUP],
  },
  // Searches landing here ask for the spec's frontmatter fields by name.
  agent_skills: {
    heading: "What goes in a SKILL.md? The format and frontmatter fields",
    items: [
      "A skill is a folder named after the skill, holding `SKILL.md`: YAML frontmatter, then Markdown instructions in any format. Optional `scripts/`, `references/` and `assets/` folders hold code, docs and templates it points to.",
      "Only `name` and `description` are required. `name` must match the folder name: 1-64 lowercase letters, digits and hyphens, with no hyphen at either end or two in a row.",
      "The description says what the skill does and when to use it, in up to 1,024 characters. Agents load every skill's name and description at startup, so its keywords decide when a skill is picked.",
      "The body loads only once a skill is picked, and files in its folders only when needed. The spec advises keeping `SKILL.md` under 500 lines and its instructions under 5,000 tokens; move the rest into `references/`.",
    ],
    table: {
      caption: "SKILL.md frontmatter fields in the Agent Skills spec",
      rows: [
        ["Field", "Required", "What it holds"],
        ["`name`", "Yes", "1-64 lowercase letters, digits and hyphens; matches the folder name"],
        ["`description`", "Yes", "1-1,024 characters: what the skill does and when to use it"],
        ["`license`", "No", "A license name or the name of a bundled license file"],
        ["`compatibility`", "No", "Up to 500 characters of environment needs; most skills don't need it"],
        ["`metadata`", "No", "A map of string keys to string values, for properties the spec doesn't define"],
        ["`allowed-tools`", "No", "Space-separated tools pre-approved to run; experimental, support varies by agent"],
      ],
    },
    snippets: [
      {
        caption: ".agents/skills/run-one-test/SKILL.md",
        text: "---\nname: run-one-test\ndescription: Run a single test file and report failures. Use when asked to test one file or debug a failing test.\n---\n\nRun `bun run test path/to/file.test.ts` and report the failing assertions.\n",
      },
    ],
    sources: ["https://agentskills.io/specification"],
  },
  license: {
    heading: "What does a license decide when agents copy or contribute code?",
    items: [
      "With no license, default copyright applies: no one may reproduce, distribute or create derivative works from the code. GitHub's terms still let others view and fork a public repo.",
      "On GitHub, content added to a repo with a license notice is licensed under the same terms, and whoever adds it states they have the right to. That covers code an agent wrote.",
      "The Apache Software Foundation accepts AI output only if the tool's terms let you license it, and any third-party code in it is used with permission, such as under a compatible license.",
      "Benchmarks pick repos by license too: SWE-Bench Pro's public and held-out repos carry strong copyleft licenses such as the GPL, to reduce contamination.",
    ],
    sources: [
      "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository",
      "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service",
      "https://www.apache.org/legal/generative-tooling.html",
      "https://labs.scale.com/leaderboard/swe_bench_pro",
    ],
  },
};
