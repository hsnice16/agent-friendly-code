import { GUIDE_PATH, guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

const SKILL = [
  "---",
  "name: add-migration",
  "description: Create and test a database migration. Use when a change adds or alters a table, column or index.",
  "---",
  "",
  "# Add a migration",
  "",
  "1. Run `pnpm db:new <short-name>`; it writes `db/migrations/<timestamp>-<short-name>.sql`.",
  "2. Write the up and down SQL. Never edit a migration that has shipped.",
  "3. Run `pnpm db:migrate && pnpm db:rollback && pnpm db:migrate` to prove it reverses.",
  "4. Regenerate types with `pnpm db:types` and commit them with the migration.",
].join("\n");

const TREE = [
  ".agents/skills/",
  "  add-migration/",
  "    SKILL.md          # frontmatter + steps",
  "    scripts/check.sh  # optional files the steps refer to",
  "  cut-release/",
  "    SKILL.md",
].join("\n");

export const AGENTS_MD_VS_SKILLS: Guide = {
  slug: "agents-md-vs-skills",
  name: "AGENTS.md vs skills",
  title: "AGENTS.md vs skills: what goes where",
  description:
    "AGENTS.md and CLAUDE.md load every session; a SKILL.md loads when a task needs it. What goes in each, the SKILL.md format, and where agents find skills.",
  lead: "AGENTS.md (or CLAUDE.md) is always-on context: every session reads it before work starts. A skill is an on-demand procedure: the agent sees only its name and description until a task matches, then loads the full SKILL.md. Put what every task needs in AGENTS.md, and multi-step procedures only some tasks need in skills.",
  published: "2026-11-16",
  updated: "2026-11-25",
  about: ["AGENTS.md", "Agent Skills", "SKILL.md", "CLAUDE.md", "AI coding agents"],
  sections: [
    {
      id: "difference",
      heading: "What is the difference between AGENTS.md and a skill?",
      blocks: [
        {
          kind: "p",
          text: "When they load. An AGENTS.md is read in full at the start of every session, so every line costs context on every task. A skill is a folder with a `SKILL.md`; the agent carries only its frontmatter `description` until a task fits, then reads the body and any files beside it.",
        },
        {
          kind: "p",
          text: "There is no `skills.md` file. The format is the Agent Skills spec: one directory per skill, named after the skill, holding a `SKILL.md` ([spec](https://agentskills.io/specification#directory-structure)). Claude Code's docs draw the same line: rules load every session or when matching files open; task-specific instructions that needn't be in context all the time should be skills ([docs](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/)).",
        },
      ],
    },
    {
      id: "decide",
      heading: "AGENTS.md vs CLAUDE.md vs skills: where does each instruction go?",
      blocks: [
        {
          kind: "table",
          caption: "Where to put an instruction for a coding agent",
          head: ["Put it in", "When", "Example"],
          rows: [
            [
              "AGENTS.md",
              "Every task needs it, and you want every agent to see it",
              "Install, build and test commands; the layout; conventions a reviewer enforces",
            ],
            [
              "CLAUDE.md",
              "Same as AGENTS.md, for Claude Code; best as an `@AGENTS.md` import plus Claude-only lines",
              '"Use plan mode for changes under `src/billing/`"',
            ],
            [
              "A skill",
              "A procedure some tasks need, with steps, scripts or reference files",
              "Adding a migration, cutting a release, reproducing a flaky test",
            ],
            [
              "A path-scoped rule",
              "Rules for one part of the tree, loaded when the agent touches it",
              "`.claude/rules/*.md` with `paths:`, `.github/instructions/*.instructions.md` with `applyTo`, `.cursor/rules/*.mdc` with `globs`",
            ],
            ["A nested AGENTS.md", "A package's own commands in a monorepo", "`packages/web/AGENTS.md`"],
          ],
        },
        {
          kind: "p",
          text: "The test: if an agent would get the task wrong without the line, and it applies to most tasks, it goes in AGENTS.md. If it is step 4 of a 9-step procedure, the whole procedure is a skill.",
        },
      ],
    },
    {
      id: "format",
      heading: "What is the SKILL.md format?",
      blocks: [
        {
          kind: "list",
          items: [
            "`name` (required by the spec): 1 to 64 characters, lowercase letters, digits and hyphens, not starting or ending with a hyphen, no `--`, and the same as the parent folder's name ([spec](https://agentskills.io/specification#name-field)).",
            "`description` (required by the spec): 1 to 1,024 characters saying what the skill does and when to use it. The agent matches tasks against it, so name the trigger ([spec](https://agentskills.io/specification#description-field)).",
            "Optional: `license`, `compatibility` (up to 500 characters), `metadata` (string to string) and the experimental `allowed-tools` ([spec](https://agentskills.io/specification#frontmatter)).",
            "Body: plain Markdown instructions. The spec suggests keeping SKILL.md under 500 lines and the instructions under about 5,000 tokens; move long reference material into files beside it ([spec](https://agentskills.io/specification#progressive-disclosure)).",
          ],
        },
        { kind: "snippet", caption: ".agents/skills/add-migration/SKILL.md", text: SKILL },
        { kind: "snippet", caption: "Skill folder layout", text: TREE },
        {
          kind: "p",
          text: "Strictness varies. Codex requires `name` and `description` ([docs](https://learn.chatgpt.com/docs/build-skills#create-a-skill)). Claude Code treats every field as optional but recommends `description`, and truncates `description` plus `when_to_use` at 1,536 characters ([docs](https://code.claude.com/docs/en/skills#frontmatter-reference)). OpenCode loads a skill without a description but doesn't advertise it to the agent ([docs](https://opencode.ai/docs/skills/#frontmatter)).",
        },
      ],
    },
    {
      id: "where",
      heading: "Where does each agent look for skills?",
      blocks: [
        {
          kind: "table",
          caption: "Project and user skill directories each coding agent's docs name",
          head: ["Agent", "In the repo", "In your home directory"],
          rows: [
            [
              "Claude Code",
              "`.claude/skills/`, and `.claude/skills/` inside subdirectories ([docs](https://code.claude.com/docs/en/skills#where-skills-live))",
              "`~/.claude/skills/`",
            ],
            [
              "Codex",
              "`.agents/skills/` in every directory from the working directory up to the repo root ([docs](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills))",
              "`~/.agents/skills/`; also `/etc/codex/skills`",
            ],
            [
              "Cursor",
              "`.agents/skills/`, `.cursor/skills/`; also `.claude/skills/` and `.codex/skills/` ([docs](https://cursor.com/docs/skills#skill-directories))",
              "The same names under `~`",
            ],
            [
              "Devin",
              "`.agents/skills/`, `.devin/skills/`, `.claude/skills/`, `.cursor/skills/`, `.github/skills/` and five more ([docs](https://docs.devin.ai/product-guides/skills#supported-skill-file-locations))",
              "—",
            ],
            [
              "GitHub Copilot",
              "`.github/skills/`, `.claude/skills/`, `.agents/skills/` ([docs](https://docs.github.com/en/copilot/reference/customization-cheat-sheet#feature-overview))",
              "`~/.copilot/skills`, `~/.agents/skills`",
            ],
            [
              "Gemini CLI",
              "`.gemini/skills/` or `.agents/skills/` (`.agents/` wins) ([docs](https://geminicli.com/docs/cli/skills/#discovery-tiers))",
              "`~/.gemini/skills/` or `~/.agents/skills/`",
            ],
            [
              "OpenCode",
              "`.opencode/skills/`, `.claude/skills/`, `.agents/skills/`, from the working directory up to the project root ([docs](https://opencode.ai/docs/skills/#discovery))",
              "`~/.config/opencode/skills`, `~/.claude/skills`, `~/.agents/skills`",
            ],
            [
              "Kimi Code CLI",
              "`.kimi-code/skills/`, `.agents/skills/` ([docs](https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/skills.md#skill-locations))",
              "`~/.kimi-code/skills/`, `~/.agents/skills/`",
            ],
            [
              "OpenHands",
              "`.agents/skills/`; legacy `.openhands/skills/` and `.openhands/microagents/` ([docs](https://docs.openhands.dev/overview/skills#skill-locations-and-precedence))",
              "—",
            ],
            [
              "Pi",
              "`.pi/skills/` ([docs](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/configuration.md#project-pi-directory)); `.agents/skills/` from the working directory up to the repo root ([docs](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md#add-it-to-pi))",
              "`~/.pi/agent/skills/`, `~/.agents/skills/`",
            ],
          ],
        },
        {
          kind: "p",
          text: "VS Code's Copilot harness lists only `.github/skills/` and `~/.copilot/skills/`; its Local harness also reads `.claude/skills` and `.agents/skills` ([docs](https://code.visualstudio.com/docs/agent-customization/agent-skills#_skill-locations)).",
        },
      ],
    },
    {
      id: "which-dir",
      heading: ".agents/skills or .claude/skills?",
      tone: "tip",
      blocks: [
        {
          kind: "p",
          text: "Pick by who works on the repo. `.agents/skills/` is the cross-tool convention: every agent in the table but Claude Code reads it. The Agent Skills spec leaves location to each tool ([spec](https://agentskills.io/client-implementation/adding-skills-support#where-to-scan)), and Claude Code's docs name only `.claude/skills/`, never `.agents/`. `.claude/skills/` reaches Claude Code, Cursor, Devin, Copilot and OpenCode, but not Codex, Gemini CLI, Kimi Code CLI, OpenHands or Pi.",
        },
        {
          kind: "p",
          text: "Our census of the {{censusRepos}} GitHub repos on the board on {{censusDate}} finds skills under `.agents/skills/` in {{skillsAgentsRepos}} repos and under `.claude/skills/` in {{skillsClaudeRepos}}; only {{skillsBothRepos}} have both. On the scored board, {{skillsRepos}} of {{boardSize}} repos ({{skillsPct}}) have at least one root `.agents/skills/<name>/SKILL.md`.",
        },
      ],
    },
    {
      id: "keep-in-agents-md",
      heading: "What should stay in AGENTS.md once you have skills?",
      blocks: [
        {
          kind: "list",
          items: [
            "The commands every task runs: install, build, test one file, lint.",
            "The map: which directory holds what, and what not to edit.",
            "Conventions that apply to every change.",
            "One line per key skill, so agents without skill support know the procedure exists and where its steps are.",
          ],
        },
        {
          kind: "p",
          text: "Moving procedures out is how a long AGENTS.md gets short again. The median AGENTS.md or CLAUDE.md on our board is {{medianChars}} characters; files far past that usually carry procedures that would load more cheaply as skills.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is there a skills.md file?",
      a: "No. Each skill is a folder holding a `SKILL.md`, such as `.agents/skills/cut-release/SKILL.md`. There's no single skills file at the root.",
    },
    {
      q: "Does Claude Code read .agents/skills?",
      a: "Not according to its docs, which list `~/.claude/skills/`, `.claude/skills/` (including in subdirectories) and plugin skills, and never mention `.agents/`. For Claude Code, use `.claude/skills/`.",
    },
    {
      q: "CLAUDE.md vs skills: which for a release checklist?",
      a: "A skill. CLAUDE.md loads every session, so a checklist used once a month costs context every day. The skill's description tells Claude when to load it.",
    },
    {
      q: "Do skills replace AGENTS.md?",
      a: "No. An agent loads a skill based on its description; AGENTS.md carries what applies to every task, including the commands a skill's steps assume.",
    },
    {
      q: "What are the rules for a skill name?",
      a: "Per the spec: 1 to 64 lowercase letters, digits and hyphens, no leading, trailing or doubled hyphen, matching the folder name. Cursor's and VS Code's docs require the folder match too.",
    },
    {
      q: "How long can a SKILL.md be?",
      a: "The spec recommends under 500 lines and under about 5,000 tokens of instructions, with longer material in separate files the skill points to. `description` is capped at 1,024 characters.",
    },
  ],
  sources: [
    "https://agentskills.io/specification",
    "https://agentskills.io/client-implementation/adding-skills-support",
    "https://code.claude.com/docs/en/skills",
    "https://code.claude.com/docs/en/memory",
    "https://learn.chatgpt.com/docs/build-skills",
    "https://cursor.com/docs/skills",
    "https://docs.devin.ai/product-guides/skills",
    "https://docs.github.com/en/copilot/reference/customization-cheat-sheet",
    "https://geminicli.com/docs/cli/skills/",
    "https://opencode.ai/docs/skills/",
    "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/skills.md",
    "https://docs.openhands.dev/overview/skills",
    "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md",
    "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/configuration.md",
    "https://code.visualstudio.com/docs/agent-customization/agent-skills",
  ],
  related: [
    { href: "/check/agent-skills", label: "Check your agent skills" },
    { href: "/check/agents-md", label: "Check your AGENTS.md" },
    { href: guidePath("claude-md"), label: "CLAUDE.md guide" },
    { href: guidePath("one-file-for-all-agents"), label: "One file for every agent" },
    { href: "/agents", label: "What each agent reads" },
    { href: GUIDE_PATH, label: "All guides" },
  ],
};
