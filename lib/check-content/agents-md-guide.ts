import { guidePath } from "../utils/guide-path";
import { SIZE_REPORT_PATH } from "../utils/report-path";

// The /check/agents-md answer to "what should I put in an AGENTS.md?". Every
// item is something an agent can't work out from the code, or gets wrong when
// it tries; that test is what keeps items off the list too.
export const AGENTS_MD_INCLUDE: { label: string; text: string }[] = [
  {
    label: "What the project is",
    text: "A sentence or two, plus languages, frameworks and package manager (`pnpm`, not npm; `uv`, not pip).",
  },
  {
    label: "Exact commands",
    text: "Setup, build, test, lint and type check, copy-pasteable with flags. Include running one test file; an agent does that most.",
  },
  {
    label: "Where things are",
    text: "Only what a directory listing doesn't say: where generated code and fixtures live, which package is the entry point.",
  },
  {
    label: "Rules a reviewer would repeat",
    text: "Conventions the linter doesn't enforce: naming, error handling, which module owns database access.",
  },
  {
    label: "Boundaries",
    text: "What never to touch (generated files, lockfiles, secrets) and what to ask about first (migrations, new dependencies).",
  },
  {
    label: "When a change is done",
    text: "The checks that must pass, usually the ones CI runs.",
  },
];

export const AGENTS_MD_LEAVE_OUT: string[] = [
  "Style rules a linter or formatter already enforces.",
  "A full file tree: it goes stale, and the agent can list the directory.",
  "Secrets, tokens or internal URLs: the file is committed.",
  "Long how-tos for one part of the code. Link a doc, or put an AGENTS.md in that directory.",
];

export type Practice = { label: string; text: string; link?: { href: string; label: string }; sources: string[] };

// Each from the agents.md site or an agent's own docs; the sources are what to re-read when an agent changes.
export const AGENTS_MD_PRACTICES: Practice[] = [
  {
    label: "Keep it short",
    text: "Claude Code's docs target under 200 lines per CLAUDE.md, Codex stops adding files at 32 KiB combined, and Devin reads the first 16 KiB of each.",
    link: { href: SIZE_REPORT_PATH, label: "How long real ones are" },
    sources: [
      "https://code.claude.com/docs/en/memory",
      "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
      "https://docs.devin.ai/onboard-devin/agents-md",
    ],
  },
  {
    label: "One per package in a monorepo",
    text: "The closest AGENTS.md to the edited file wins, and an explicit chat prompt overrides everything.",
    link: { href: guidePath("agents-md-monorepo"), label: "AGENTS.md in a monorepo" },
    sources: ["https://agents.md/"],
  },
  {
    label: "Write it once for every agent",
    text: "Claude Code skips AGENTS.md when a CLAUDE.md exists, so import `@AGENTS.md` there. Gemini CLI needs AGENTS.md in `context.fileName`, Aider under `read:`.",
    link: { href: guidePath("one-file-for-all-agents"), label: "One file for all agents" },
    sources: ["https://code.claude.com/docs/en/memory", "https://agents.md/"],
  },
  {
    label: "Any headings work",
    text: "Standard markdown, no required fields. Common sections: project overview, build and test commands, code style, testing instructions, security considerations.",
    sources: ["https://agents.md/"],
  },
  {
    label: "Keep it current",
    text: "The agents.md site calls it living documentation: change it in the same commit as the commands it describes.",
    sources: ["https://agents.md/"],
  },
  {
    label: "Check what loaded",
    text: "Run `/memory` in Claude Code or `/memory show` in Gemini CLI, or ask Codex to list the instruction sources it loaded.",
    sources: [
      "https://code.claude.com/docs/en/memory",
      "https://geminicli.com/docs/cli/gemini-md/",
      "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
    ],
  },
];

// Mirrors AGENTS_MD_INCLUDE, section for section, with placeholders a reader replaces.
export const AGENTS_MD_TEMPLATE = `# AGENTS.md

## Project
One or two sentences on what this is. TypeScript, Next.js, pnpm.

## Commands
- Install: \`pnpm install\`
- Test all: \`pnpm test\`
- Test one file: \`pnpm test path/to/file.test.ts\`
- Lint and type check: \`pnpm lint && pnpm typecheck\`

## Layout
- \`src/generated/\` comes from \`pnpm codegen\`; never edit it by hand.
- Only \`src/db/\` talks to the database.

## Conventions
- Return errors as values; don't throw across modules.

## Boundaries
- Never commit secrets or edit the lockfile by hand.
- Ask before adding a dependency or a migration.

## Done means
- \`pnpm lint\`, \`pnpm typecheck\` and \`pnpm test\` pass, as in CI.
`;
