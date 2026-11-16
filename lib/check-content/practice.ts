// The "how do I do this with an agent" panel on some /check pages, for the
// searches that land there ("claude code pre commit hook", "claude code
// devcontainer"). Every item restates one of `sources`; nothing here is ours.
export type CheckPractice = {
  heading: string;
  items: string[];
  snippet?: { caption: string; text: string };
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
    snippet: {
      caption: ".claude/settings.json",
      text: '{\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Edit|Write",\n        "hooks": [\n          { "type": "command", "command": "f=$(jq -r \'.tool_input.file_path\') && npx prettier --write --ignore-unknown \\"$f\\"" }\n        ]\n      }\n    ]\n  }\n}\n',
    },
    sources: [CLAUDE_HOOKS, CLAUDE_BEST_PRACTICES, "https://aider.chat/docs/usage/lint-test.html"],
  },
  pre_commit: {
    heading: "Do pre-commit hooks run when an AI agent commits?",
    items: [
      "Yes, when the agent runs `git commit`: git runs the pre-commit hook first and aborts the commit if it exits non-zero.",
      "`git commit --no-verify` skips the hook, so say in AGENTS.md that it is off limits.",
      "Git hooks run at commit time; Claude Code hooks run inside the agent's loop. A `PostToolUse` hook formats each file as it is edited; a `Stop` hook keeps Claude working until a check passes.",
      "OpenHands' docs move `.openhands/pre-commit.sh` checks into Stop hooks in `.openhands/hooks.json`.",
    ],
    sources: [
      "https://git-scm.com/docs/githooks",
      CLAUDE_HOOKS,
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
    snippet: {
      caption: ".devcontainer/devcontainer.json",
      text: '{\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": {\n    "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {}\n  }\n}\n',
    },
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
};
