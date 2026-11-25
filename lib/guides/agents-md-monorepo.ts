import { guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

export const AGENTS_MD_MONOREPO: Guide = {
  slug: "agents-md-monorepo",
  name: "AGENTS.md in a monorepo",
  title: "AGENTS.md in a monorepo: how each agent reads nested files",
  description:
    "Yes, AGENTS.md can be nested. How Claude Code, Codex, Cursor, Copilot, Gemini CLI and others resolve per-package files, and what goes at the root.",
  lead: "Put one AGENTS.md at the repo root for what every package shares, and one in each package for its own commands and rules. Most agents read the file nearest the code they touch, but each finds nested files differently, and a few never look below the root.",
  published: "2026-11-16",
  updated: "2026-11-25",
  about: ["AGENTS.md", "CLAUDE.md", "Monorepo", "AI coding agents"],
  sections: [
    {
      id: "can-it-be-nested",
      heading: "Can AGENTS.md be nested?",
      blocks: [
        {
          kind: "p",
          text: "Yes. The agents.md spec says to place an AGENTS.md in each package: the one closest to the edited file wins, and an explicit instruction in chat overrides everything. The file is plain Markdown with no required fields ([spec](https://agents.md/#faq)), so a package file is just a shorter AGENTS.md.",
        },
        {
          kind: "p",
          text: "The spec doesn't fix when an agent loads a nested file. Some read every file from the root down to the directory you started in; some load a package's file once they open a file in it; some read only the root.",
        },
      ],
    },
    {
      id: "steps",
      heading: "How do I set up AGENTS.md in a monorepo?",
      howTo: true,
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Write the root AGENTS.md: what each top-level directory holds, the one install command, repo-wide rules, and a line saying each package has its own file.",
            "Add an AGENTS.md to each package with its build, test and lint commands, runnable from that directory.",
            "If anyone uses Claude Code, put a one-line CLAUDE.md containing `@AGENTS.md` beside each AGENTS.md.",
            "For Gemini CLI, list AGENTS.md in `context.fileName`; for Aider, list the package files under `read:`.",
            "Keep the root file short: Codex stops at 32 KiB across every file on the path.",
            "Check what loaded: `/memory` in Claude Code, `/memory show` in Gemini CLI.",
          ],
        },
      ],
    },
    {
      id: "per-tool",
      heading: "How does each agent find nested AGENTS.md files?",
      blocks: [
        {
          kind: "table",
          caption: "How each coding agent resolves AGENTS.md files below the repo root",
          head: ["Agent", "Which files it loads", "Below the working directory"],
          rows: [
            [
              "Claude Code",
              "CLAUDE.md, `.claude/CLAUDE.md` and CLAUDE.local.md from the working directory and every directory above it, joined root first ([docs](https://code.claude.com/docs/en/memory#how-claude-md-files-load)). AGENTS.md and `.claude/AGENTS.md` the same way, but only when none of those CLAUDE.md files exist ([docs](https://code.claude.com/docs/en/memory#when-claude-code-reads-agents-md)).",
              "A subdirectory's CLAUDE.md loads once Claude reads, writes or edits a file there ([docs](https://code.claude.com/docs/en/memory#how-claude-md-files-load)); its AGENTS.md loads when Claude reads a file there and that directory has no CLAUDE.md ([docs](https://code.claude.com/docs/en/memory#when-claude-code-reads-agents-md)).",
            ],
            [
              "Codex",
              "From the project root (usually the Git root) down to the working directory, at most one file per directory: `AGENTS.override.md`, else AGENTS.md, else a fallback name. Joined root first; closer files override earlier ones ([docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md#how-codex-discovers-guidance)).",
              "Not read: only directories on the path to where you started count ([docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md#how-codex-discovers-guidance)). Start Codex inside the package.",
            ],
            [
              "Cursor",
              "AGENTS.md in the project root and in subdirectories, combined, the more specific taking precedence ([docs](https://cursor.com/docs/rules#agentsmd)). A CLAUDE.md is read the same way and always applied; the help page describes one at the project root ([help](https://cursor.com/help/customization/rules#how-does-claudemd-work-in-cursor)).",
              "Read. Rules in `.cursor/rules/*.mdc` can also scope to a package with `globs`.",
            ],
            [
              "Copilot cloud agent",
              "Any number of AGENTS.md files anywhere in the repo; the nearest one in the directory tree takes precedence ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#creating-custom-instructions)).",
              "Read.",
            ],
            [
              "Copilot CLI",
              "The repo root, the working directory, every directory between them, and directories on the path to a file it is working on ([docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions#types-of-custom-instructions)).",
              "Read along the path of each file it works on.",
            ],
            [
              "Copilot in VS Code",
              "Copilot harness: root, working directory, intermediate directories and paths to files it works with, combined. Local harness: the root file needs `chat.useAgentsMdFile` ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference#_nested-project-instructions)).",
              "Local harness: only with `chat.useNestedAgentsMdFiles`, which is experimental and off by default ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference#_nested-project-instructions)).",
            ],
            [
              "Gemini CLI",
              "GEMINI.md in the workspace directories and their parents ([docs](https://geminicli.com/docs/cli/gemini-md/#understand-the-context-hierarchy)). AGENTS.md only once listed in `context.fileName` ([docs](https://geminicli.com/docs/cli/gemini-md/#customize-the-context-file-name)).",
              "When a tool touches a file, it scans that directory and its ancestors up to a trusted root ([docs](https://geminicli.com/docs/cli/gemini-md/#understand-the-context-hierarchy)).",
            ],
            [
              "OpenCode",
              "AGENTS.md found by walking up from the current directory; CLAUDE.md if there is no AGENTS.md ([docs](https://opencode.ai/docs/rules/#claudemd-fallback)).",
              "Read: reading a file or listing a directory loads any AGENTS.md between it and the workspace, nearest first ([docs](https://opencode.ai/docs/rules/#discovery)).",
            ],
            [
              "Devin",
              'Looks for AGENTS.md before it starts coding, at the root "or anywhere else", and includes the first 16 KiB of each file ([docs](https://docs.devin.ai/onboard-devin/agents-md#creating-an-agents-md-file)).',
              "Which file wins between nested ones is not documented.",
            ],
            [
              "Devin Desktop (ex-Windsurf)",
              "AGENTS.md, AGENTS.local.md and AGENT.md as always-on rules, in each directory from the workspace root to the working directory ([docs](https://docs.devin.ai/desktop/cascade/memories#agents-md)).",
              "Not documented beyond that path.",
            ],
            [
              "Antigravity",
              "AGENTS.md or GEMINI.md in the folder and its parents up to the repo root, plus `.agents/AGENTS.md` and `.agents/rules/*.md` ([docs](https://antigravity.google/docs/rules#directory-scoped-rules)).",
              "Not loaded ([docs](https://antigravity.google/docs/rules#directory-scoped-rules)). Open the package as the workspace.",
            ],
            [
              "Aider",
              "Nothing automatically. Files load only when listed under `read:` in `.aider.conf.yml` or passed with `--read` ([docs](https://aider.chat/docs/usage/conventions.html#always-load-conventions)).",
              "Only what you list.",
            ],
          ],
        },
        {
          kind: "p",
          text: "The root file is the one every agent sees, so it must stand alone. A package file adds to it and can't rely on being loaded.",
        },
      ],
    },
    {
      id: "codex-limit",
      heading: "Does Codex have a size limit for nested AGENTS.md files?",
      tone: "warn",
      blocks: [
        {
          kind: "p",
          text: "Yes: 32 KiB combined by default (`project_doc_max_bytes`) ([docs](https://learn.chatgpt.com/docs/agent-configuration/agents-md#how-codex-discovers-guidance)). Codex adds files root first and stops at the limit, so a long root file can crowd out the package file closest to your work, the one that matters most. Keep the root short, or raise the limit in your Codex config. Codex skips empty files.",
        },
        {
          kind: "p",
          text: "Devin caps each file instead, at its first 16 KiB ([docs](https://docs.devin.ai/onboard-devin/agents-md#creating-an-agents-md-file)). Claude Code caps files it loads on demand at 40,000 characters each on a 200K context window ([docs](https://code.claude.com/docs/en/memory#claude-ignores-the-end-of-my-subdirectory-claude-md)), and Anthropic suggests under 200 lines per CLAUDE.md ([docs](https://code.claude.com/docs/en/memory#write-effective-instructions)).",
        },
      ],
    },
    {
      id: "root-vs-package",
      heading: "What goes in the root AGENTS.md and what goes in a package?",
      blocks: [
        {
          kind: "table",
          caption: "Splitting instructions between the root and package AGENTS.md files",
          head: ["Root AGENTS.md", "Package AGENTS.md"],
          rows: [
            ["How the workspace is laid out: which directory holds what", "What this package is and who depends on it"],
            ["The package manager and the one install command", "This package's build, test and lint commands"],
            [
              "Repo-wide rules: commit style, CI, generated files never to edit",
              "Its framework, versions and local conventions",
            ],
            [
              "How to run one package's tests from the root (a filter flag)",
              "Traps specific to it: slow tests, fixtures, env vars",
            ],
            ["A pointer: each package has its own AGENTS.md", "Nothing that repeats the root"],
          ],
        },
        {
          kind: "p",
          text: "Don't repeat the root in each package. Agents that concatenate files (Codex, Claude Code, Copilot CLI) see the text twice and spend context on it.",
        },
      ],
    },
    {
      id: "test-commands",
      heading: "How do I give each package its own test command?",
      blocks: [
        {
          kind: "p",
          text: "Write the exact command, runnable from that directory, in the package file, and the root-level equivalent in the root file. An agent that runs a large monorepo's whole suite to check one change wastes minutes; one that guesses the filter syntax wastes a turn.",
        },
        {
          kind: "snippet",
          caption: "packages/api/AGENTS.md",
          text: "# packages/api\n\nHTTP API on Hono. Depends on packages/db; nothing imports it.\n\n## Commands (run from this directory)\n- Test: `pnpm test` (from the root: `pnpm --filter api test`)\n- One file: `pnpm vitest run src/routes/users.test.ts`\n- Typecheck: `pnpm tsc --noEmit`\n\n## Rules\n- Routes live in src/routes/, one file per resource.\n- Tests hit a real Postgres from `docker compose up db`; never mock packages/db.\n",
        },
      ],
    },
    {
      id: "layout",
      heading: "What does a monorepo AGENTS.md layout look like?",
      blocks: [
        {
          kind: "snippet",
          caption: "One root file, one per package, CLAUDE.md files importing them",
          text: "AGENTS.md                  # workspace map, install, repo-wide rules\nCLAUDE.md                  # @AGENTS.md\napps/\n  web/AGENTS.md            # Next.js app: dev server, e2e tests\n  web/CLAUDE.md            # @AGENTS.md\npackages/\n  api/AGENTS.md\n  api/CLAUDE.md            # @AGENTS.md\n  db/AGENTS.md             # migrations: never edit an applied one\n  db/CLAUDE.md             # @AGENTS.md\n",
        },
        {
          kind: "p",
          text: "Claude Code reads AGENTS.md only where it finds no CLAUDE.md, so one CLAUDE.md anywhere above hides every AGENTS.md ([docs](https://code.claude.com/docs/en/memory#when-claude-code-reads-agents-md)). A one-line CLAUDE.md importing `@AGENTS.md` beside each file keeps both loading; Anthropic's docs say the import never makes Claude read the file twice ([docs](https://code.claude.com/docs/en/memory#remove-an-earlier-agents-md-workaround)). A symlink also works, but Git checks it out as a plain text file on Windows unless `core.symlinks` is on ([docs](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)).",
        },
      ],
    },
    {
      id: "claude-code",
      heading: "How do I set up CLAUDE.md for a large monorepo?",
      tone: "tip",
      blocks: [
        {
          kind: "list",
          items: [
            "Keep the root CLAUDE.md (or AGENTS.md) to what every session needs; it loads every time.",
            "Put package detail in that package's file, which loads only once Claude works there ([docs](https://code.claude.com/docs/en/memory#how-claude-md-files-load)).",
            "Use `.claude/rules/*.md` with a `paths:` glob list for rules tied to file types, not directories; such a rule loads when Claude reads, writes or edits a matching file ([docs](https://code.claude.com/docs/en/memory#path-specific-rules)).",
            "Use `claudeMdExcludes` in settings to skip other teams' CLAUDE.md files by path or glob ([docs](https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files)).",
            "Run `/context all` to see which files loaded, under Memory files ([docs](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md)).",
          ],
        },
      ],
    },
    {
      id: "our-data",
      heading: "How many popular repos use nested AGENTS.md files?",
      tone: "info",
      blocks: [
        {
          kind: "p",
          text: "We read the whole file tree of {{censusRepos}} GitHub repos on our board on {{censusDate}}. {{anyAgentsMd}} have an AGENTS.md somewhere, and {{nestedAgentsMd}} of those ({{nestedAgentsMdPct}}) have more than one or keep theirs below the root. The most files: {{mostAgentsMd}}.",
        },
        {
          kind: "p",
          text: "Counts include empty files, and {{censusTruncated}} trees were too large for GitHub to return whole, so these are a floor. The repo pages below show how the top repos score per agent.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Does Codex read AGENTS.md files in subdirectories?",
      a: "Only those on the path from the project root to the directory you started Codex in, one per directory, up to 32 KiB combined. A package's file is read if you start Codex in that package or below it.",
    },
    {
      q: "Does Cursor support nested AGENTS.md?",
      a: "Yes. Cursor reads AGENTS.md in the project root and in subdirectories, combines them, and lets the more specific one take precedence.",
    },
    {
      q: "Which AGENTS.md wins when two conflict?",
      a: "The agents.md spec says the closest one to the edited file, with your chat prompt overriding both. Codex and Copilot document the same; Antigravity combines every file it finds without stating an order.",
    },
    {
      q: "Can I use AGENTS.override.md in a monorepo?",
      a: "In Codex, yes: in any directory it replaces the AGENTS.md beside it. Claude Code doesn't read `AGENTS.override.md`.",
    },
    {
      q: "Should each package have a CLAUDE.md too?",
      a: "Only if your team uses Claude Code and you want it to read the package's AGENTS.md even when a CLAUDE.md exists higher up. A one-line `@AGENTS.md` import does it.",
    },
    {
      q: "Is one big root AGENTS.md better than nested files?",
      a: "For a small repo, yes. In a monorepo a long root file costs every session context, and in Codex it can push the package file past the 32 KiB limit.",
    },
  ],
  sources: [
    "https://agents.md/",
    "https://code.claude.com/docs/en/memory",
    "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
    "https://cursor.com/docs/rules",
    "https://cursor.com/help/customization/rules",
    "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions",
    "https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions",
    "https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference",
    "https://geminicli.com/docs/cli/gemini-md/",
    "https://opencode.ai/docs/rules/",
    "https://docs.devin.ai/onboard-devin/agents-md",
    "https://docs.devin.ai/desktop/cascade/memories",
    "https://antigravity.google/docs/rules",
    "https://aider.chat/docs/usage/conventions.html",
  ],
  related: [
    { href: "/repo/github/BerriAI/litellm", label: "litellm" },
    { href: "/repo/github/medusajs/medusa", label: "medusa" },
    { href: "/repo/github/PostHog/posthog", label: "posthog" },
    { href: "/repo/github/apache/doris", label: "doris" },
    { href: "/repo/github/mastra-ai/mastra", label: "mastra" },
    { href: "/check/agents-md", label: "Check your AGENTS.md" },
    { href: "/check/agents-md/examples", label: "AGENTS.md examples" },
    { href: guidePath("claude-md"), label: "CLAUDE.md guide" },
    { href: guidePath("one-file-for-all-agents"), label: "One file for every agent" },
    { href: "/agents", label: "What each agent reads" },
  ],
  languageExamples: true,
};
