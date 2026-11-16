// /check/<slug>/vs-agents-md, for the agent files that sit beside AGENTS.md
// rather than replace it. Every line is something the cited docs state.
export type VsAgentsMd = {
  /** The breadcrumb and the table's column heading. */
  name: string;
  /** The agent that reads it, for link notes elsewhere. */
  agent: string;
  title: string;
  description: string;
  answer: string;
  rows: { aspect: string; theirs: string; agentsMd: string }[];
  steps: string[];
  /** As it appears in `AGENT_READS` files, to count the agents that read it. */
  file: string;
  /** `wrap` for prose, which would otherwise scroll sideways on a phone. */
  snippet: { caption: string; text: string; wrap?: boolean };
  sources: string[];
};

export const VS_AGENTS_MD: Record<string, VsAgentsMd> = {
  cursor_rules: {
    name: "Cursor rules",
    agent: "Cursor",
    title: "Cursor rules vs AGENTS.md: which should you use?",
    description:
      "Cursor reads both. AGENTS.md is plain markdown most agents read; .cursor/rules/*.mdc adds globs and descriptions so a rule loads only when it applies.",
    answer:
      "Use AGENTS.md for what every agent should know, and add `.cursor/rules/*.mdc` only for rules that apply to some files or tasks. Cursor reads both, and a root CLAUDE.md too. A `.cursorrules` file is legacy and will be deprecated.",
    rows: [
      {
        aspect: "Where",
        theirs: "`.cursor/rules/*.mdc`, subfolders allowed. A plain `.md` there is ignored.",
        agentsMd: "The repo root, and any subdirectory.",
      },
      {
        aspect: "Format",
        theirs: "Markdown with `description`, `globs` and `alwaysApply` frontmatter.",
        agentsMd: "Plain markdown, no metadata.",
      },
      {
        aspect: "When Cursor applies it",
        theirs:
          "`alwaysApply: true`: every chat. `globs`: when a matching file is in context. Only a `description`: when the agent judges it relevant. Neither: on @-mention.",
        agentsMd: "Always. A nested one applies to work in its directory, more specific winning.",
      },
      {
        aspect: "When two disagree",
        theirs: "Team Rules, then Project Rules, then User Rules.",
        agentsMd: "The closest file to the edited one wins; a chat prompt overrides everything.",
      },
      {
        aspect: "Size",
        theirs: "Keep each rule under 500 lines; split a large one.",
        agentsMd: "Up to each agent: Codex reads 32 KiB combined, Devin the first 16 KiB of each.",
      },
    ],
    steps: [
      "Put the project, commands and rules every agent needs in AGENTS.md.",
      "Add one `.mdc` rule per topic that only some files need, scoped with `globs`. `/create-rule` in Agent writes one into `.cursor/rules`.",
      "Move `.cursorrules` into an Always Apply rule, its old behaviour, then delete it.",
      "If a rule isn't applied, check its type: Apply Intelligently needs a `description`, Apply to Specific Files `globs` that match.",
    ],
    file: ".cursor/rules/*.mdc",
    snippet: {
      caption: ".cursor/rules/api.mdc",
      wrap: true,
      text: "---\ndescription: Conventions for API route handlers\nglobs: app/api/**/*.ts\nalwaysApply: false\n---\n\n- Return errors as JSON with a status code; never throw to the framework.\n",
    },
    sources: [
      "https://cursor.com/docs/context/rules",
      "https://cursor.com/help/customization/rules",
      "https://cursor.com/docs/cli/using",
      "https://agents.md/",
      "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
      "https://docs.devin.ai/onboard-devin/agents-md",
    ],
  },
  gemini_md: {
    name: "GEMINI.md",
    agent: "Gemini CLI",
    title: "GEMINI.md vs AGENTS.md: do you need both?",
    description:
      "GEMINI.md is Gemini CLI's context file, sent with every prompt. Reuse AGENTS.md: list it in context.fileName, or in a one-line GEMINI.md: @AGENTS.md.",
    answer:
      "No. Keep your instructions in AGENTS.md and point Gemini CLI at it: list it in `context.fileName`, or make GEMINI.md one line, `@AGENTS.md`. Google Antigravity reads both files with no setting.",
    rows: [
      {
        aspect: "Where",
        theirs:
          "`~/.gemini/GEMINI.md`, the workspace and its parent directories, and a directory's own file once a tool reaches it.",
        agentsMd: "The repo root, and any subdirectory, depending on the agent.",
      },
      {
        aspect: "Imports",
        theirs: "`@file.md`, relative or absolute, up to 5 levels deep.",
        agentsMd: "None in the spec; Claude Code and Copilot CLI expand `@path`.",
      },
      {
        aspect: "Change the file name",
        theirs: "`context.fileName` in `settings.json` takes one name or a list.",
        agentsMd: "Fixed by each agent.",
      },
      {
        aspect: "Google Antigravity",
        theirs: "Reads it, or `.agents/GEMINI.md`, in the workspace folder and its parents up to the repo root.",
        agentsMd: "Reads it from the same places, and combines it with GEMINI.md.",
      },
    ],
    steps: [
      "Keep instructions in AGENTS.md.",
      "Commit `.gemini/settings.json` with the setting below; project settings override a user's.",
      "Or add a GEMINI.md containing `@AGENTS.md`, which also passes our check.",
      "Run `/memory show` in Gemini CLI to see what it loaded.",
      "Google Antigravity needs neither: it reads AGENTS.md and GEMINI.md as they are.",
    ],
    file: "GEMINI.md",
    snippet: {
      caption: ".gemini/settings.json",
      text: '{\n  "context": {\n    "fileName": [\n      "AGENTS.md",\n      "GEMINI.md"\n    ]\n  }\n}\n',
    },
    sources: [
      "https://geminicli.com/docs/cli/gemini-md/",
      "https://geminicli.com/docs/reference/configuration/",
      "https://geminicli.com/docs/reference/memport/",
      "https://antigravity.google/docs/rules",
      "https://agents.md/",
    ],
  },
};
