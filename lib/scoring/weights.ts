export type ModelId =
  | "pi"
  | "aider"
  | "cursor"
  | "devin"
  | "kimi-cli"
  | "openhands"
  | "gemini-cli"
  | "claude-code"
  | "gpt-5-codex";

export type ModelProfile = {
  id: ModelId;
  label: string;
  rationale: string;
  sources: string[];
  weights: Record<string, number>;
};

export const MODELS: ModelProfile[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    rationale:
      "Loads CLAUDE.md (or `.claude/CLAUDE.md`) at the start of every session per Anthropic's memory docs, and AGENTS.md only when there is no CLAUDE.md, so the instructions file and a fast test loop carry the most weight. Its skills live in `.claude/skills/`, not `.agents/skills/`.",
    sources: ["https://code.claude.com/docs/en/memory", "https://code.claude.com/docs/en/skills"],
    weights: {
      ci: 0.5,
      size: 0.5,
      tests: 1.0,
      readme: 0.7,
      linter: 0.6,
      dev_env: 0.9,
      license: 0.3,
      gemini_md: 0,
      aider_conf: 0,
      agents_md: 1.0,
      agent_skills: 0,
      cursor_rules: 0,
      pre_commit: 0.4,
      type_config: 0.6,
      contributing: 0.4,
      deps_manifest: 0.7,
      openhands_setup: 0,
    },
  },
  {
    id: "cursor",
    label: "Cursor",
    rationale:
      "Per Cursor's Rules docs, reads `.cursor/rules/*.mdc` (subfolders included) and AGENTS.md as its repo instructions, and loads skills from `.agents/skills/`. Type config and a clear README help its codebase search but aren't the docs-cited signal.",
    sources: ["https://cursor.com/docs/rules", "https://cursor.com/docs/skills"],
    weights: {
      ci: 0.4,
      size: 0.4,
      tests: 0.7,
      linter: 0.8,
      readme: 1.0,
      dev_env: 0.5,
      gemini_md: 0,
      license: 0.3,
      aider_conf: 0,
      agents_md: 0.8,
      agent_skills: 0.4,
      pre_commit: 0.3,
      type_config: 1.0,
      contributing: 0.3,
      cursor_rules: 1.0,
      deps_manifest: 0.8,
      openhands_setup: 0,
    },
  },
  {
    id: "devin",
    label: "Devin",
    rationale:
      "Works in a Linux virtual machine booted from a snapshot that already has the repo cloned and its tools, dependencies, environment variables and secrets set up, then installs, lints, builds and tests like any developer, per Cognition's environment docs; a committed `.devin/blueprint.yaml` defines that environment. CI config files alone aren't what the docs ask for — a runnable dev environment is. Pulls Cursor rule files into its Knowledge and discovers skills in `.agents/skills/`.",
    sources: [
      "https://docs.devin.ai/onboard-devin/environment",
      "https://docs.devin.ai/onboard-devin/knowledge-onboarding",
      "https://docs.devin.ai/product-guides/skills",
    ],
    weights: {
      ci: 0.7,
      size: 0.6,
      tests: 0.9,
      linter: 0.5,
      readme: 0.7,
      dev_env: 1.0,
      license: 0.3,
      gemini_md: 0,
      aider_conf: 0,
      agents_md: 0.6,
      agent_skills: 0.4,
      cursor_rules: 0.3,
      pre_commit: 0.5,
      type_config: 0.5,
      contributing: 0.5,
      deps_manifest: 0.9,
      openhands_setup: 0,
    },
  },
  {
    id: "gpt-5-codex",
    label: "Codex",
    rationale:
      "Reads AGENTS.md before doing any work per OpenAI's Codex docs: one per directory from the repo root down to the working directory, where AGENTS.override.md replaces AGENTS.md, up to 32 KiB combined. Skills load from `.agents/skills/`.",
    sources: [
      "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
      "https://learn.chatgpt.com/docs/build-skills",
    ],
    weights: {
      ci: 0.7,
      size: 0.5,
      tests: 0.8,
      linter: 0.6,
      readme: 0.8,
      dev_env: 0.7,
      license: 0.3,
      gemini_md: 0,
      aider_conf: 0,
      agents_md: 0.9,
      agent_skills: 0.4,
      cursor_rules: 0,
      pre_commit: 0.4,
      type_config: 0.7,
      contributing: 0.4,
      deps_manifest: 0.7,
      openhands_setup: 0,
    },
  },
  {
    id: "kimi-cli",
    label: "Kimi Code CLI",
    rationale:
      "Reads AGENTS.md as its native instruction surface (root or `.kimi-code/AGENTS.md`) per Moonshot's Kimi Code docs, and `/init` generates one. Its docs name no CLAUDE.md fallback, but the check passes on CLAUDE.md too. Skills load from `.agents/skills/`. Runs shell commands step-by-step under approval modes rather than in a sandbox VM, and dispatches `explore` sub-agents with isolated contexts to map a codebase, so a large tree costs it less than a single-context agent.",
    sources: [
      "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/agents.md",
      "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/reference/slash-commands.md",
      "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/skills.md",
    ],
    weights: {
      ci: 0.4,
      size: 0.4,
      tests: 0.9,
      readme: 0.7,
      linter: 0.6,
      dev_env: 0.7,
      license: 0.3,
      gemini_md: 0,
      aider_conf: 0,
      agents_md: 1.0,
      agent_skills: 0.4,
      cursor_rules: 0,
      pre_commit: 0.4,
      type_config: 0.6,
      contributing: 0.4,
      deps_manifest: 0.7,
      openhands_setup: 0,
    },
  },
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    rationale:
      "Loads `GEMINI.md` from the global file and from the workspace and its parent directories and sends it with every prompt, per Gemini CLI's docs; one in a subdirectory loads when a tool first touches that directory. AGENTS.md is read only when listed in the `context.fileName` setting. Skills load from `.agents/skills/`.",
    sources: ["https://geminicli.com/docs/cli/gemini-md/", "https://geminicli.com/docs/cli/skills/"],
    weights: {
      ci: 0.6,
      size: 0.5,
      tests: 0.9,
      linter: 0.7,
      readme: 0.9,
      dev_env: 0.7,
      license: 0.3,
      aider_conf: 0,
      agents_md: 0.7,
      agent_skills: 0.4,
      gemini_md: 1.0,
      cursor_rules: 0,
      pre_commit: 0.4,
      type_config: 0.9,
      contributing: 0.4,
      deps_manifest: 0.8,
      openhands_setup: 0,
    },
  },
  {
    id: "aider",
    label: "Aider",
    rationale:
      "Auto-lints on every edit by default, and runs the test command after edits once both `test-cmd` and `auto-test` are set (per Aider's lint/test docs). It doesn't natively read AGENTS.md or CONVENTIONS.md — those load only when wired via `.aider.conf.yml`'s `read:` — so the config file, a green linter, and a declared test command are what translate into successful commits.",
    sources: ["https://aider.chat/docs/usage/lint-test.html", "https://aider.chat/docs/config/aider_conf.html"],
    weights: {
      ci: 0.3,
      size: 0.4,
      tests: 1.0,
      linter: 1.0,
      readme: 0.6,
      dev_env: 0.5,
      license: 0.2,
      gemini_md: 0,
      agents_md: 0.3,
      agent_skills: 0,
      aider_conf: 1.0,
      cursor_rules: 0,
      pre_commit: 0.3,
      type_config: 0.5,
      contributing: 0.3,
      deps_manifest: 0.7,
      openhands_setup: 0,
    },
  },
  {
    id: "openhands",
    label: "OpenHands",
    rationale:
      "Executes `.openhands/setup.sh` whenever it starts work on a repo, per OpenHands' repo-customization docs; its backend runs on the user's machine by default, or in Docker, a VM or OpenHands Cloud. A root AGENTS.md goes into its system prompt in full; skills live in `.agents/skills/`, with the legacy `.openhands/skills/` and `.openhands/microagents/` still loaded.",
    sources: [
      "https://docs.openhands.dev/openhands/usage/customization/repository",
      "https://docs.openhands.dev/overview/skills",
      "https://docs.openhands.dev/openhands/usage/agent-canvas/overview",
    ],
    weights: {
      ci: 1.0,
      size: 0.7,
      tests: 0.9,
      linter: 0.6,
      readme: 0.7,
      dev_env: 1.0,
      license: 0.4,
      gemini_md: 0,
      aider_conf: 0,
      agents_md: 0.5,
      agent_skills: 0.4,
      cursor_rules: 0,
      pre_commit: 0.6,
      type_config: 0.5,
      contributing: 0.7,
      deps_manifest: 1.0,
      openhands_setup: 1.0,
    },
  },
  {
    id: "pi",
    label: "Pi",
    rationale:
      "Minimal terminal coding harness. Loads `AGENTS.md` (or `CLAUDE.md`) from its agent directory, the working directory and its parent directories, per Pi's configuration docs, and skills from `.agents/skills/`. It has no built-in sandbox; isolation is left to a container the user runs it in.",
    sources: [
      "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/configuration.md",
      "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md",
    ],
    weights: {
      ci: 0.4,
      size: 0.5,
      tests: 0.9,
      linter: 0.8,
      readme: 0.7,
      dev_env: 0.6,
      license: 0.2,
      gemini_md: 0,
      aider_conf: 0,
      agents_md: 1.0,
      agent_skills: 0.4,
      cursor_rules: 0,
      pre_commit: 0.4,
      type_config: 0.6,
      contributing: 0.3,
      deps_manifest: 0.7,
      openhands_setup: 0,
    },
  },
];

export const MODEL_BY_ID: Record<ModelId, ModelProfile> = Object.fromEntries(MODELS.map((m) => [m.id, m])) as Record<
  ModelId,
  ModelProfile
>;
