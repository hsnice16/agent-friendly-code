import { AGENT_SETUP, AGENT_SETUP_SOURCES, type AgentSetup } from "../agent-setup";
import { MODELS } from "../scoring/weights";
import { checkPath, checkSubPath } from "../utils/check-slug";
import { GUIDE_PATH, guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

const rows = (...fields: (keyof Omit<AgentSetup, "setup" | "checks" | "sources">)[]): string[][] =>
  MODELS.map((m) => [m.label, ...fields.map((f) => AGENT_SETUP[m.id][f])]);

const CLAUDE = "https://code.claude.com/docs/en/memory";

export const AGENTS_MD_IGNORED: Guide = {
  slug: "agents-md-ignored",
  name: "AGENTS.md not loading",
  title: "Why is my coding agent ignoring AGENTS.md?",
  description:
    "Which files Claude Code, Codex, Cursor, Gemini CLI, Aider and others read, what outranks AGENTS.md, size caps, and how to check what each agent loaded.",
  lead: "Usually one of four things: the agent doesn't read AGENTS.md without a setting (Gemini CLI, Aider); another file outranks it (a CLAUDE.md in Claude Code, an AGENTS.override.md in Codex or Pi); it sits outside the directories the agent searches; or it's past the agent's size cap (Codex 32 KiB combined, Devin 16 KiB per file). Ask the agent what it loaded before you rewrite the file.",
  published: "2026-11-25",
  updated: "2026-11-27",
  about: ["AGENTS.md", "CLAUDE.md", "AI coding agents", "Troubleshooting"],
  sections: [
    {
      id: "per-agent",
      heading: "Which files does each coding agent read, and does AGENTS.md need a setting?",
      blocks: [
        {
          kind: "p",
          text: "Each line below comes from the agent's own docs, linked beside it, read in November 2026. Where the docs don't say, neither do we.",
        },
        {
          kind: "table",
          caption: "Instruction files each coding agent reads, and whether AGENTS.md needs a setting",
          head: ["Agent", "What it reads, and which wins", "Setting needed for AGENTS.md?"],
          rows: rows("reads", "needs"),
        },
      ],
    },
    {
      id: "steps",
      heading: "How do I fix an agent that ignores AGENTS.md?",
      howTo: true,
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Check the agent reads AGENTS.md at all. Gemini CLI needs it in `context.fileName`; Aider needs it under `read:` in `.aider.conf.yml`.",
            "Check the name and place: `AGENTS.md`, upper case, at the repo root. A Cursor rule must be an `.mdc` file in `.cursor/rules/`.",
            "Look for a file that outranks it: a CLAUDE.md or CLAUDE.local.md on the path (Claude Code), an AGENTS.override.md (Codex, Pi), an empty AGENTS.md beside the CLAUDE.md you meant (Pi).",
            "Start the agent where it searches. Codex and Pi read only from the root down to the working directory, so a package's file loads only when you start inside that package.",
            "Check the size: Codex stops at 32 KiB across the path, Devin reads the first 16 KiB of each file.",
            "Start a new session after editing, or reload: Codex rebuilds its instructions only at launch.",
            "Ask the agent what loaded, using the commands below.",
          ],
        },
      ],
    },
    {
      id: "confirm",
      heading: "How do I check which instruction files an agent loaded?",
      blocks: [
        {
          kind: "table",
          caption: "How to confirm what each agent loaded, and what to do after editing the file",
          head: ["Agent", "How to check", "After editing mid-session"],
          rows: rows("confirm", "reload"),
        },
        {
          kind: "p",
          text: "Where no command is documented, ask the agent to summarize its project instructions. That tests what reached the model, though not which file it came from.",
        },
      ],
    },
    {
      id: "claude-md",
      heading: "Why does Claude Code ignore AGENTS.md when there's a CLAUDE.md?",
      tone: "warn",
      blocks: [
        {
          kind: "p",
          text: `By default Claude Code reads AGENTS.md only when no CLAUDE.md, \`.claude/CLAUDE.md\` or CLAUDE.local.md exists in the working directory or above it. Its docs call this the usual cause of an AGENTS.md that isn't loading ([docs](${CLAUDE}#troubleshoot-memory-issues)).`,
        },
        {
          kind: "p",
          text: "{{rootBothFiles}} of the {{censusRepos}} GitHub repos in our {{censusDate}} census have both a root AGENTS.md and a root CLAUDE.md. In {{twoUnlinkedFiles}} of them the CLAUDE.md is a separate file that neither symlinks to nor imports AGENTS.md, so Claude Code sees only the CLAUDE.md there. {{claudeImportsAgents}} repos import `@AGENTS.md` and {{claudeLinksToAgents}} symlink CLAUDE.md to it.",
        },
        {
          kind: "list",
          items: [
            `A CLAUDE.md that says "read AGENTS.md" in words isn't an import: Claude sees AGENTS.md only if it decides to open it. Write \`@AGENTS.md\` instead ([docs](${CLAUDE}#remove-an-earlier-agents-md-workaround)).`,
            "A CLAUDE.local.md counts as a CLAUDE.md, so adding one for your own notes hides the team's AGENTS.md from you.",
            `Or set Project instructions in \`/config\` to \`claude-md-and-agents-md\`, which loads both and skips an AGENTS.md already imported ([docs](${CLAUDE}#choose-which-instruction-files-load)).`,
            `Claude Code before v2.1.277, or a session where the built-in AGENTS.md plugin is disabled, reads CLAUDE.md only; the Project instructions setting is then missing from \`/config\` ([docs](${CLAUDE}#when-agents-md-support-is-unavailable)).`,
          ],
        },
      ],
    },
    {
      id: "size",
      heading: "Is there a size limit on AGENTS.md?",
      blocks: [
        {
          kind: "table",
          caption: "Documented size limits on instruction files, per agent",
          head: ["Agent", "Limit"],
          rows: rows("limit"),
        },
        {
          kind: "p",
          text: "A file cut off at a cap fails quietly: the agent follows the top and never sees the rest. Put the commands and the never-do rules first.",
        },
      ],
    },
    {
      id: "symlinks",
      heading: "Do symlinked AGENTS.md or CLAUDE.md files work?",
      blocks: [
        {
          kind: "p",
          text: `Claude Code reads CLAUDE.md through a symlink, but its Edit and Write tools refuse to write through one and edit the target instead. On Windows, Git checks a committed symlink out as a one-line text file unless \`core.symlinks\` is on, which is why Anthropic suggests the \`@AGENTS.md\` import for teams with Windows users ([docs](${CLAUDE}#share-one-file-with-other-coding-tools)). It doesn't follow a link to a network path such as \`\\\\server\\share\` ([docs](${CLAUDE}#share-rules-across-projects-with-symlinks)).`,
        },
        {
          kind: "p",
          text: `The other agents' docs don't cover symlinks. Pi's loader accepts a link that resolves to a regular file. If you rely on a link, check it on each OS your contributors use, or use the [one-file setup](${guidePath("one-file-for-all-agents")}) that suits your agents.`,
        },
      ],
    },
    {
      id: "case",
      heading: "Does the AGENTS.md filename have to be upper case?",
      blocks: [
        {
          kind: "p",
          text: `Name it exactly \`AGENTS.md\`. Every agent's docs use that spelling, and none of the docs linked here promises to find \`agents.md\`. Pi's loader looks for \`AGENTS.md\` and \`AGENTS.MD\` only, so on Linux, where file names are case-sensitive, a lowercase file is skipped. Our [AGENTS.md check](${checkPath("agents_md")}) matches any case, so a passing score doesn't prove every agent finds the file.`,
        },
      ],
    },
    {
      id: "monorepo",
      heading: "Why isn't the AGENTS.md in my package loading?",
      blocks: [
        {
          kind: "p",
          text: `Agents find nested files differently: Codex and Pi read only the directories on the path to where you started, Claude Code loads a subdirectory's file once it reads a file there, Cursor combines them all, Devin CLI loads one once it reaches that directory, and Kimi Code CLI and OpenHands don't document it. The [monorepo guide](${guidePath("agents-md-monorepo")}) covers each agent and what to put at the root.`,
        },
      ],
    },
    {
      id: "not-followed",
      heading: "AGENTS.md loaded but the agent still doesn't follow it?",
      tone: "tip",
      blocks: [
        {
          kind: "p",
          text: `Then it's the wording, not the loading. Claude Code delivers CLAUDE.md as a user message after the system prompt, with no guarantee of strict compliance; Anthropic's fixes are concrete instructions, no conflicts between files, and a hook for anything that must run every time ([docs](${CLAUDE}#troubleshoot-memory-issues)). The same advice holds for any agent: "Run \`pnpm test\` before committing" is followed more often than "test your changes".`,
        },
      ],
    },
  ],
  faq: [
    {
      q: "Does Claude Code read AGENTS.md?",
      a: "Yes, from v2.1.277, but only when there's no CLAUDE.md, `.claude/CLAUDE.md` or CLAUDE.local.md in the working directory or above it. Import `@AGENTS.md` from your CLAUDE.md to load both.",
    },
    {
      q: "Does Gemini CLI read AGENTS.md?",
      a: "Only when it's listed in the `context.fileName` setting; by default it reads GEMINI.md. Antigravity CLI, which replaced it for unpaid and Google One users on June 18, 2026, reads both.",
    },
    {
      q: "Does Aider read AGENTS.md?",
      a: "Not on its own. List it under `read:` in `.aider.conf.yml`, pass `--read AGENTS.md`, or run `/read AGENTS.md` in the chat.",
    },
    {
      q: "Why does Codex skip the AGENTS.md in my package?",
      a: "Codex reads one file per directory from the project root down to where you started it, and nothing below. Start Codex inside the package, and keep the files on that path under 32 KiB combined.",
    },
    {
      q: "Do I need to restart the agent after editing AGENTS.md?",
      a: "For Codex, yes: it builds its instructions once per run. Gemini CLI has `/memory reload`, Pi has `/reload`, and Kimi Code CLI reloads AGENTS.md on its own. The other agents' docs don't say, so start a new session to be sure.",
    },
    {
      q: "Is AGENTS.md case-sensitive?",
      a: "Treat it as such. Every agent documents the name `AGENTS.md`, and Pi looks only for `AGENTS.md` and `AGENTS.MD`, so a lowercase `agents.md` is skipped on Linux.",
    },
  ],
  sources: AGENT_SETUP_SOURCES,
  related: [
    { href: guidePath("agents-md-monorepo"), label: "AGENTS.md in a monorepo" },
    { href: guidePath("one-file-for-all-agents"), label: "One file for every agent" },
    { href: guidePath("claude-md"), label: "CLAUDE.md guide" },
    { href: checkSubPath("agents_md", "vs-claude-md"), label: "CLAUDE.md vs AGENTS.md" },
    { href: checkPath("agents_md"), label: "Check your AGENTS.md" },
    { href: GUIDE_PATH, label: "All guides" },
  ],
};
