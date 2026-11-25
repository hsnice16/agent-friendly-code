import { GUIDE_PATH, guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

const SYMLINK = ["ln -s AGENTS.md CLAUDE.md", "git add CLAUDE.md", 'git commit -m "Link CLAUDE.md to AGENTS.md"'].join(
  "\n",
);

const IMPORT = ["@AGENTS.md", "", "## Claude Code", "", "Use plan mode for changes under `src/billing/`."].join("\n");

const GEMINI = ["{", '  "context": {', '    "fileName": ["AGENTS.md", "GEMINI.md"]', "  }", "}"].join("\n");

const AIDER = "read: AGENTS.md";

export const ONE_FILE_FOR_ALL_AGENTS: Guide = {
  slug: "one-file-for-all-agents",
  name: "One file for every agent",
  title: "One instructions file for every AI coding agent",
  description:
    "Keep one AGENTS.md for Claude Code, Codex, Cursor, Copilot, Gemini CLI and Aider: symlink or @import CLAUDE.md, and the settings the rest need.",
  lead: "Write the rules once in AGENTS.md. Most agents read it as is; for Claude Code, add a CLAUDE.md that contains `@AGENTS.md` (or is a symlink to it); for Gemini CLI and Aider, name AGENTS.md in their settings. Of {{censusRepos}} popular GitHub repos, {{claudeImportsAgents}} import AGENTS.md from CLAUDE.md and {{claudeLinksToAgents}} symlink it.",
  published: "2026-11-16",
  updated: "2026-11-16",
  about: ["AGENTS.md", "CLAUDE.md", "Symlink", "AI coding agents"],
  sections: [
    {
      id: "who-reads",
      heading: "Can one instructions file work for every coding agent?",
      blocks: [
        {
          kind: "p",
          text: "Nearly. Most agents already read AGENTS.md, so keep that one. What each needs beyond the file:",
        },
        {
          kind: "table",
          caption: "What each coding agent needs to read a repo's AGENTS.md",
          head: ["Agent", "Reads AGENTS.md", "What to add"],
          rows: [
            ["Codex, Cursor, Devin, Kimi CLI, OpenHands, Pi, OpenCode", "Always", "Nothing"],
            [
              "GitHub Copilot",
              "Cloud agent, code review, CLI and VS Code ([docs](https://docs.github.com/en/copilot/reference/custom-instructions-support))",
              "A short `.github/copilot-instructions.md` for Chat on github.com and the other IDEs",
            ],
            [
              "Claude Code",
              "Only when no CLAUDE.md, `.claude/CLAUDE.md` or CLAUDE.local.md exists (v2.1.277 and later) ([docs](https://code.claude.com/docs/en/memory#when-claude-code-reads-agents-md))",
              "A CLAUDE.md with `@AGENTS.md`, or a symlink",
            ],
            [
              "Gemini CLI",
              "Once named in `context.fileName` ([docs](https://geminicli.com/docs/cli/gemini-md/#customize-the-context-file-name))",
              "A `settings.json` entry",
            ],
            [
              "Aider",
              "Once listed under `read:` ([docs](https://aider.chat/docs/usage/conventions.html#always-load-conventions))",
              "A line in `.aider.conf.yml`",
            ],
          ],
        },
      ],
    },
    {
      id: "options",
      heading: "Symlink, import or setting: what are the options for Claude Code?",
      blocks: [
        {
          kind: "table",
          caption: "Ways to make Claude Code read a repo's AGENTS.md",
          head: ["Approach", "How", "Trade-off"],
          rows: [
            [
              "Import",
              "A CLAUDE.md containing `@AGENTS.md`, plus any Claude-only lines below it",
              "Works on every OS and in sessions that read only CLAUDE.md ([docs](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)); one extra small file",
            ],
            [
              "Symlink",
              "`ln -s AGENTS.md CLAUDE.md`",
              "No second file to read, but breaks on Windows clones without `core.symlinks` ([docs](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks)); no room for Claude-only lines",
            ],
            [
              "No CLAUDE.md",
              "Rely on Claude Code reading AGENTS.md when no CLAUDE.md exists",
              "Needs v2.1.277+; any CLAUDE.local.md turns it off; before v2.1.281, Bedrock and telemetry-disabled sessions read only CLAUDE.md ([docs](https://code.claude.com/docs/en/memory#when-agents-md-support-is-unavailable))",
            ],
            [
              "Setting",
              "Set Project instructions in `/config` to `claude-md-and-agents-md` ([docs](https://code.claude.com/docs/en/memory#choose-which-instruction-files-load))",
              "Per user, not per repo: contributors who don't set it don't get it",
            ],
          ],
        },
      ],
    },
    {
      id: "import",
      heading: "How do you import AGENTS.md into CLAUDE.md?",
      tone: "tip",
      blocks: [
        {
          kind: "p",
          text: "Put `@AGENTS.md` in a CLAUDE.md beside it. Claude reads the imported file first, then the rest of CLAUDE.md, so Claude-only instructions go below the import ([docs](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)). Anthropic's docs say the import never makes Claude read AGENTS.md twice, whatever the Project instructions setting ([docs](https://code.claude.com/docs/en/memory#remove-an-earlier-agents-md-workaround)).",
        },
        { kind: "snippet", caption: "CLAUDE.md", text: IMPORT },
      ],
    },
    {
      id: "symlink",
      heading: "How do you symlink CLAUDE.md to AGENTS.md?",
      blocks: [
        { kind: "snippet", caption: "macOS or Linux, at the repo root", text: SYMLINK },
        {
          kind: "list",
          items: [
            "Windows: creating a symlink needs Administrator rights or Developer Mode, and unless `core.symlinks` is enabled Git checks a committed symlink out as a plain file holding the link text, so that clone's CLAUDE.md is the one line `AGENTS.md` ([docs](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)). Git probes and may set `core.symlinks` to false on clone ([docs](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks)). If anyone works on Windows, use the import.",
            "Editing: Claude reads through the link, but its Edit and Write tools won't write through a symlink; they edit the target, AGENTS.md, instead ([docs](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)).",
            "Symlinks to network or UNC paths aren't followed ([docs](https://code.claude.com/docs/en/memory#share-rules-across-projects-with-symlinks)).",
          ],
        },
      ],
    },
    {
      id: "other-agents",
      heading: "How do Gemini CLI, Aider and Copilot pick up the same file?",
      blocks: [
        {
          kind: "p",
          text: "Gemini CLI reads GEMINI.md by default; `context.fileName` in `settings.json` takes a name or a list ([docs](https://geminicli.com/docs/cli/gemini-md/#customize-the-context-file-name)). Keep GEMINI.md in the list if you have one.",
        },
        { kind: "snippet", caption: "settings.json (Gemini CLI)", text: GEMINI },
        {
          kind: "p",
          text: "Aider's docs describe no file it finds on its own. List AGENTS.md under `read:` in `.aider.conf.yml` (a list takes several), or pass `--read AGENTS.md` ([docs](https://aider.chat/docs/usage/conventions.html#always-load-conventions)).",
        },
        { kind: "snippet", caption: ".aider.conf.yml", text: AIDER },
        {
          kind: "p",
          text: "Copilot's cloud agent, code review and CLI read AGENTS.md and also a root CLAUDE.md or GEMINI.md, and VS Code reads AGENTS.md (its Local harness once `chat.useAgentsMdFile` is on) ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference#_nested-project-instructions)). Chat on github.com, Visual Studio, JetBrains, Xcode and Eclipse don't list AGENTS.md ([docs](https://docs.github.com/en/copilot/reference/custom-instructions-support)); they read `.github/copilot-instructions.md`, so keep a short one with the essentials. The Copilot guide has the per-surface table.",
        },
      ],
    },
    {
      id: "real-repos",
      heading: "What do real repos do?",
      blocks: [
        {
          kind: "p",
          text: "From our census of the {{censusRepos}} GitHub repos on the board on {{censusDate}}: {{claudeImportsAgents}} have a CLAUDE.md that imports `@AGENTS.md`, {{claudeLinksToAgents}} have a root CLAUDE.md symlinked to an AGENTS.md, and {{twoUnlinkedFiles}} keep AGENTS.md and CLAUDE.md as separate files with no link or import. {{anyRootLink}} repos have a root AGENTS.md or CLAUDE.md that is a symlink to something.",
        },
        {
          kind: "table",
          caption: "Repos on the board by how they share one instructions file",
          head: ["Approach", "Examples"],
          rows: [
            [
              "CLAUDE.md imports @AGENTS.md",
              "astral-sh/ruff, grafana/grafana, supabase/supabase, n8n-io/n8n, prometheus/prometheus",
            ],
            ["CLAUDE.md → AGENTS.md symlink", "apache/airflow, sveltejs/kit, colinhacks/zod, pnpm/pnpm, moby/moby"],
            ["AGENTS.md → CLAUDE.md symlink", "oven-sh/bun, pytorch/pytorch, vitessio/vitess, milvus-io/milvus"],
            [
              "Both linked to a third file",
              "huggingface/transformers (`.ai/AGENTS.md`), discourse/discourse (`AI-AGENTS.md`), lit/lit (`.github/copilot-instructions.md`)",
            ],
            ["GEMINI.md linked too", "apache/superset (CLAUDE.md and GEMINI.md → AGENTS.md)"],
            ["Two separate files", "ollama/ollama, mui/material-ui, nrwl/nx, ggml-org/llama.cpp"],
          ],
        },
      ],
    },
    {
      id: "pick",
      heading: "Which approach should you pick?",
      tone: "tip",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Import by default. `@AGENTS.md` works on Windows, on older Claude Code, and in sessions that can't load AGENTS.md, and leaves room for Claude-only lines.",
            "Symlink only if every contributor is on macOS or Linux and you have nothing Claude-specific to say.",
            "Keep two separate files only if their content truly differs; otherwise they drift, and each agent follows whichever copy it reads.",
            "Add `context.fileName` for Gemini CLI and `read:` for Aider if your contributors use them, and a short copilot-instructions.md if they use Copilot Chat outside VS Code.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "What is the GitHub Copilot equivalent of CLAUDE.md?",
      a: "`.github/copilot-instructions.md`. But Copilot's cloud agent, code review and CLI also read AGENTS.md and a root CLAUDE.md, and VS Code reads AGENTS.md, so those may not need a Copilot-only file.",
    },
    {
      q: "Will Claude Code read AGENTS.md twice if CLAUDE.md imports it?",
      a: "No. Anthropic's docs say the import never causes a second read, whatever the Project instructions setting. A symlinked CLAUDE.md is also read once.",
    },
    {
      q: "Does a CLAUDE.md symlink work on Windows?",
      a: "Only if the clone has `core.symlinks` enabled and the user can create symlinks (Administrator or Developer Mode). Otherwise the checkout is a one-line file holding the link target, and Claude sees that line instead of your instructions.",
    },
    {
      q: "Can I symlink AGENTS.md to CLAUDE.md instead?",
      a: "Yes; oven-sh/bun and pytorch/pytorch do. Either direction gives every tool the same content.",
    },
    {
      q: "Do I still need CLAUDE.md if Claude Code reads AGENTS.md?",
      a: "Not on Claude Code v2.1.277 or later with the default setting, as long as no CLAUDE.md, `.claude/CLAUDE.md` or CLAUDE.local.md exists. A CLAUDE.md with `@AGENTS.md` makes it work for everyone else too.",
    },
  ],
  sources: [
    "https://code.claude.com/docs/en/memory",
    "https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks",
    "https://geminicli.com/docs/cli/gemini-md/",
    "https://aider.chat/docs/usage/conventions.html",
    "https://docs.github.com/en/copilot/reference/custom-instructions-support",
    "https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference",
    "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions",
    "https://agents.md/",
  ],
  related: [
    { href: "/check/agents-md/vs-claude-md", label: "CLAUDE.md vs AGENTS.md" },
    { href: "/check/gemini-md/vs-agents-md", label: "GEMINI.md vs AGENTS.md" },
    { href: "/check/cursor-rules/vs-agents-md", label: "Cursor rules vs AGENTS.md" },
    { href: guidePath("claude-md"), label: "CLAUDE.md guide" },
    { href: guidePath("copilot-instructions"), label: "copilot-instructions.md guide" },
    { href: "/agents", label: "What each agent reads" },
    { href: GUIDE_PATH, label: "All guides" },
  ],
};
