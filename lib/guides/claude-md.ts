import { GUIDE_PATH, guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

const TEMPLATE = [
  "# CLAUDE.md",
  "",
  "<!-- Stripped before Claude reads it: notes for maintainers go here. -->",
  "",
  "## Commands",
  "- Install: `pnpm install`",
  "- Test one file: `pnpm test path/to/file.test.ts`",
  "- Lint and types: `pnpm lint && pnpm typecheck` (run both before committing)",
  "",
  "## Layout",
  "- `src/api/handlers/`: HTTP handlers, one file per route",
  "- `src/db/`: the only place SQL is written",
  "",
  "## Conventions",
  "- Use 2-space indentation and named exports.",
  "- New endpoints need a test in `tests/api/`.",
  "",
  "## Don't",
  "- Edit `src/generated/`; run `pnpm codegen` instead.",
].join("\n");

const RULE = [
  "---",
  "paths:",
  '  - "src/api/**/*.ts"',
  "---",
  "",
  "# API rules",
  "",
  "- Validate every request body with the schema in `src/api/schemas/`.",
  "- Return errors in the shape of `ApiError`.",
].join("\n");

const IMPORTS = [
  "See @README.md for the project overview and @package.json for scripts.",
  "",
  "## Git workflow",
  "@docs/git-workflow.md",
  "",
  "## Personal notes, shared across worktrees",
  "@~/.claude/my-project-notes.md",
].join("\n");

export const CLAUDE_MD: Guide = {
  slug: "claude-md",
  name: "CLAUDE.md",
  title: "CLAUDE.md: where it goes and what to put in it",
  description:
    "Where CLAUDE.md goes, how Claude Code loads it, @imports, .claude/rules, the 200-line guidance, a starter template and real CLAUDE.md files.",
  lead: "CLAUDE.md is the Markdown file Claude Code loads into every session as project instructions. Put it at the repo root (or in `.claude/`), keep it under about 200 lines of concrete commands and conventions, and move what matters only for part of the codebase into `.claude/rules/` or a nested CLAUDE.md.",
  published: "2026-11-16",
  updated: "2026-11-16",
  about: ["CLAUDE.md", "Claude Code", "AGENTS.md", "AI coding agents"],
  sections: [
    {
      id: "what-is-it",
      heading: "What is CLAUDE.md?",
      blocks: [
        {
          kind: "p",
          text: "A plain Markdown file Claude Code reads at the start of every session: build and test commands, where things live, the conventions a reviewer would otherwise repeat. No required structure, no frontmatter.",
        },
        {
          kind: "p",
          text: "Claude treats it as context, not enforced configuration ([docs](https://code.claude.com/docs/en/memory#write-effective-instructions)). What must happen every time, such as a check before each commit, belongs in a hook; what must never happen, in `permissions.deny`.",
        },
        {
          kind: "p",
          text: "In our census of the {{censusRepos}} GitHub repos on the board on {{censusDate}}, {{anyClaudeMd}} have a CLAUDE.md somewhere in the tree and {{rootClaudeMd}} have one at the root (census counts include empty files and symlinks). {{nestedClaudeMd}} keep one in a subdirectory.",
        },
      ],
    },
    {
      id: "location",
      heading: "Where does CLAUDE.md go?",
      blocks: [
        {
          kind: "table",
          caption: "CLAUDE.md locations in Claude Code, broadest scope first",
          head: ["Scope", "Location", "Shared with"],
          rows: [
            [
              "Managed policy",
              "macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux and WSL `/etc/claude-code/CLAUDE.md`, Windows `C:\\Program Files\\ClaudeCode\\CLAUDE.md`",
              "Everyone on the machine; can't be excluded",
            ],
            ["User (global)", "`~/.claude/CLAUDE.md`, plus `~/.claude/rules/`", "Only you, in every project"],
            ["Project", "`./CLAUDE.md` or `./.claude/CLAUDE.md`, plus `.claude/rules/`", "The team, through git"],
            ["Local", "`./CLAUDE.local.md`, added to `.gitignore`", "Only you, in this project"],
            ["Subdirectory", "`packages/web/CLAUDE.md` and so on", "The team; loads on demand"],
          ],
        },
        {
          kind: "p",
          text: "At launch Claude Code loads CLAUDE.md and CLAUDE.local.md from the working directory and every directory above it, joined root first, so a project instruction lands after a user one. A subdirectory's CLAUDE.md loads once Claude reads, writes or edits a file there ([docs](https://code.claude.com/docs/en/memory#how-claude-md-files-load)). Files that load on demand are capped at 40,000 characters each on a 200K context window; past that Claude gets only the start ([docs](https://code.claude.com/docs/en/memory#claude-ignores-the-end-of-my-subdirectory-claude-md)).",
        },
        {
          kind: "p",
          text: "CLAUDE.local.md loads alongside CLAUDE.md and is treated the same; it's for your sandbox URLs and test data ([docs](https://code.claude.com/docs/en/memory#choose-where-to-put-claude-md-files)). Trap: it counts as a CLAUDE.md, so adding one stops Claude Code reading the repo's AGENTS.md in its place ([docs](https://code.claude.com/docs/en/memory#when-claude-code-reads-agents-md)).",
        },
      ],
    },
    {
      id: "write",
      heading: "How do you write a good CLAUDE.md?",
      blocks: [
        {
          kind: "list",
          items: [
            'Write instructions concrete enough to check: "Run `npm test` before committing", not "Test your changes"; "API handlers live in `src/api/handlers/`", not "Keep files organized" ([docs](https://code.claude.com/docs/en/memory#write-effective-instructions)).',
            "Group lines under headings and bullets; Anthropic's docs say Claude follows organised sections better than dense paragraphs ([docs](https://code.claude.com/docs/en/memory#write-effective-instructions)).",
            "Remove contradictions: of two conflicting instructions, Claude may pick either ([docs](https://code.claude.com/docs/en/memory#write-effective-instructions)). `/doctor prompt-audit` (v2.1.283 and later) reports stale and conflicting lines across your instruction files without editing them ([docs](https://code.claude.com/docs/en/memory#audit-your-instruction-files)).",
            "Leave out what Claude finds by reading the code. The file is for what it can't discover: the one test command that works, the directory nobody should touch.",
            "Block-level HTML comments are stripped before the file reaches Claude, so maintainer notes cost no context ([docs](https://code.claude.com/docs/en/memory#how-claude-md-files-load)).",
          ],
        },
        {
          kind: "p",
          text: "`/init` drafts one from the codebase (build commands, test instructions, conventions it finds); where a CLAUDE.md exists it suggests improvements instead of overwriting ([docs](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md)). With `CLAUDE_CODE_NEW_INIT=1` it also reads AGENTS.md, `.devin/rules/`, `.windsurf/rules/`, `.windsurfrules` and `.clinerules` and folds in what applies ([docs](https://code.claude.com/docs/en/memory#migrate-instructions-from-other-tools)).",
        },
        { kind: "snippet", caption: "CLAUDE.md (starter template)", text: TEMPLATE },
      ],
    },
    {
      id: "size",
      heading: "How long should CLAUDE.md be?",
      tone: "tip",
      blocks: [
        {
          kind: "p",
          text: "Anthropic's target is under 200 lines per file: longer files use more context and are followed less closely ([docs](https://code.claude.com/docs/en/memory#write-effective-instructions)). The only hard limit: Claude Code skips a file over 4 MiB ([docs](https://code.claude.com/docs/en/memory#my-claude-md-is-too-large)). Splitting into `@imports` tidies a file but saves nothing, since imports load with the file that imports them. What saves context is moving rules for part of the codebase into path-scoped `.claude/rules/` files or subdirectory CLAUDE.md files, which load only when Claude works there.",
        },
        {
          kind: "p",
          text: "For scale: the median AGENTS.md or CLAUDE.md across the {{withFile}} board repos that have one is {{medianChars}} characters.",
        },
      ],
    },
    {
      id: "imports",
      heading: "How does the CLAUDE.md import syntax work?",
      blocks: [
        {
          kind: "p",
          text: "Write `@path/to/file` anywhere in a CLAUDE.md and that file is expanded into context beside it. Relative paths resolve from the importing file, not the working directory; absolute and `~/` paths work too. Imports can nest up to four hops. A path in a code span or fenced block isn't imported, so backticks keep it as text. The first time a project imports a file from outside the working directory, Claude Code asks you to approve it ([docs](https://code.claude.com/docs/en/memory#import-additional-files)).",
        },
        { kind: "snippet", caption: "CLAUDE.md with imports", text: IMPORTS },
        {
          kind: "p",
          text: "The import we count is `@AGENTS.md`: {{claudeImportsAgents}} of the {{censusRepos}} repos in our census keep their shared rules in AGENTS.md and import it from CLAUDE.md. The one-file guide covers that setup.",
        },
      ],
    },
    {
      id: "rules",
      heading: "How do .claude/rules files work?",
      blocks: [
        {
          kind: "p",
          text: "Every `.md` file under `.claude/rules/` is found recursively. A rule without frontmatter loads at launch with the same priority as `.claude/CLAUDE.md` ([docs](https://code.claude.com/docs/en/memory#set-up-rules)). A rule with a `paths:` glob list loads only when Claude reads, writes or edits a matching file, so it costs nothing in sessions that never touch those files ([docs](https://code.claude.com/docs/en/memory#path-specific-rules)). `~/.claude/rules/` does the same for every project on your machine ([docs](https://code.claude.com/docs/en/memory#user-level-rules)).",
        },
        { kind: "snippet", caption: ".claude/rules/api.md", text: RULE },
        {
          kind: "p",
          text: "Rules still load every session or on every matching file. For a procedure Claude needs only sometimes, like cutting a release, a skill is cheaper: see AGENTS.md vs skills.",
        },
      ],
    },
    {
      id: "check",
      heading: "How do you check which CLAUDE.md files loaded?",
      blocks: [
        {
          kind: "list",
          items: [
            "`/memory` lists CLAUDE.md, CLAUDE.local.md and other memory file locations, and opens one to edit ([docs](https://code.claude.com/docs/en/memory#view-and-edit-with-%2Fmemory)).",
            "`/context all` shows the loaded files under Memory files ([docs](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md)).",
            "The `InstructionsLoaded` hook logs which CLAUDE.md and rules files load, when and why: useful for path-scoped rules and subdirectory files ([docs](https://code.claude.com/docs/en/memory#troubleshoot-memory-issues)).",
            "In a monorepo, the `claudeMdExcludes` setting skips other teams' CLAUDE.md files by path or glob. It can't exclude the managed file ([docs](https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files)).",
          ],
        },
      ],
    },
    {
      id: "examples",
      heading: "What do real CLAUDE.md files look like?",
      blocks: [
        {
          kind: "p",
          text: "Board repos where CLAUDE.md is the instructions file our scorer reads (it prefers AGENTS.md when both have content, so repos with both are under AGENTS.md examples). Each shows the layout a maintained project settled on.",
        },
        { kind: "examples", file: "CLAUDE.md", limit: 10 },
      ],
    },
  ],
  faq: [
    {
      q: "Where is the global CLAUDE.md?",
      a: "`~/.claude/CLAUDE.md`. It applies to every project on your machine and loads before the project's files; neither overrides the other. Personal path-scoped rules go in `~/.claude/rules/`.",
    },
    {
      q: "CLAUDE.local.md vs CLAUDE.md: which one?",
      a: "CLAUDE.md is committed and shared with the team. CLAUDE.local.md sits at the project root, is gitignored, and holds what only you need. Both load together, and a CLAUDE.local.md stops Claude Code falling back to the repo's AGENTS.md.",
    },
    {
      q: "Is there a CLAUDE.md size limit?",
      a: "None you'll hit: Claude Code skips only files over 4 MiB. The guidance is under 200 lines per file, and files that load on demand are cut at 40,000 characters on a 200K context window.",
    },
    {
      q: "CLAUDE.md vs AGENTS.md: do I need both?",
      a: "Not usually. Claude Code reads AGENTS.md only when no CLAUDE.md exists; most other agents read AGENTS.md, only some CLAUDE.md. Keep shared rules in AGENTS.md and import it from CLAUDE.md or symlink CLAUDE.md to it. Full comparison: the CLAUDE.md vs AGENTS.md page.",
    },
    {
      q: "Does /init overwrite an existing CLAUDE.md?",
      a: "No. It suggests improvements instead.",
    },
    {
      q: "Can CLAUDE.md enforce a rule?",
      a: "No. It's context Claude weighs, not configuration it must obey. To guarantee something runs, use a hook; to block an action, use `permissions.deny` in settings.",
    },
    {
      q: "What is the Karpathy CLAUDE.md?",
      a: "A single CLAUDE.md published on GitHub as `andrej-karpathy-skills`. Its README says it is \"derived from Andrej Karpathy's observations on LLM coding pitfalls\"; Karpathy didn't write it. It sets four principles: think before coding, simplicity first, surgical changes, goal-driven execution. Behaviour rules like these complement, not replace, the project facts (commands, layout) a CLAUDE.md is for.",
    },
  ],
  sources: ["https://code.claude.com/docs/en/memory", "https://github.com/multica-ai/andrej-karpathy-skills"],
  related: [
    { href: "/check/agents-md/vs-claude-md", label: "CLAUDE.md vs AGENTS.md" },
    { href: guidePath("one-file-for-all-agents"), label: "One file for every agent" },
    { href: guidePath("agents-md-vs-skills"), label: "AGENTS.md vs skills" },
    { href: "/check/agents-md/examples", label: "AGENTS.md examples" },
    { href: "/check/agents-md", label: "Check your AGENTS.md" },
    { href: GUIDE_PATH, label: "All guides" },
  ],
};
