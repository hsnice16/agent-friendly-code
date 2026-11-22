// /check/agents-md/vs-claude-md. Every claim restates one of SOURCES.

export type InstructionSetup = "import" | "symlink" | "separate";

export const SETUPS: { id: InstructionSetup; name: string; note: string; caption?: string; snippet?: string }[] = [
  {
    id: "import",
    name: "A CLAUDE.md that imports AGENTS.md",
    note: "The setup Anthropic's docs recommend. Works on every OS, and leaves room for Claude-only notes under the import.",
    caption: "CLAUDE.md",
    snippet: "@AGENTS.md\n\n## Claude Code only\n- Run /memory to check both files loaded.\n",
  },
  {
    id: "symlink",
    name: "CLAUDE.md as a symlink",
    note: "One file on disk. But Claude's Edit and Write tools won't write through a symlink, and Git checks it out as a plain text file on Windows unless `core.symlinks` is on.",
    caption: "Terminal",
    snippet: "ln -s AGENTS.md CLAUDE.md\ngit add CLAUDE.md\n",
  },
  {
    id: "separate",
    name: "Two separate files",
    note: "Claude Code reads only CLAUDE.md, the other agents only AGENTS.md, and the two drift apart. Only worth it when the content really differs.",
  },
];

export const CHECK_SNIPPET =
  "git ls-files | grep -iE '(^|/)(AGENTS|CLAUDE)\\.md$'\nls -l CLAUDE.md    # CLAUDE.md -> AGENTS.md: a symlink\nhead -1 CLAUDE.md  # @AGENTS.md: an import\n";

export const VS_CLAUDE_MD_FAQ = [
  {
    q: "Can Claude Code read both files without an import?",
    a: "Yes: set Project instructions in `/config` to `claude-md-and-agents-md`. It is a user setting, ignored in a repo's project settings, so it changes only your machine; the import fixes it for everyone who clones the repo.",
  },
  {
    q: "Does CLAUDE.local.md count as a CLAUDE.md?",
    a: "Yes. A CLAUDE.local.md or `.claude/CLAUDE.md` in the working directory or above it also stops Claude Code reading AGENTS.md, even when the repo has no CLAUDE.md.",
  },
  {
    q: "Does Codex read CLAUDE.md?",
    a: "Not by default. Codex reads AGENTS.md, and another name only when it is listed in `project_doc_fallback_filenames` in its config.",
  },
  {
    q: "Does Gemini CLI read either file?",
    a: "Neither, by default: it reads GEMINI.md. List AGENTS.md in `context.fileName`, or make GEMINI.md the line `@AGENTS.md`.",
  },
];

export const VS_CLAUDE_MD_SOURCES = [
  "https://code.claude.com/docs/en/memory#agents-md",
  "https://agents.md/",
  "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
  "https://cursor.com/docs/context/rules",
  "https://docs.github.com/en/copilot/reference/custom-instructions-support",
  "https://geminicli.com/docs/cli/gemini-md/",
  "https://docs.devin.ai/onboard-devin/agents-md",
  "https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks",
];
