import { GUIDE_PATH, guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

export const DEVIN_DESKTOP_RULES: Guide = {
  slug: "devin-desktop-rules",
  name: "Windsurf rules (Devin Desktop)",
  title: "Windsurf rules are now Devin rules: where they go",
  description:
    "Windsurf became Devin Desktop on June 2, 2026. Where rules go now, what still reads .windsurfrules, the trigger frontmatter, and when AGENTS.md is enough.",
  lead: "Windsurf became Devin Desktop on June 2, 2026. Project rules now go in `.devin/rules/*.md`; `.windsurf/rules/` and a root `.windsurfrules` are still read as fallbacks, so nothing you have breaks. For rules your team shares across agents, an AGENTS.md does the same job, and most other agents read it too.",
  published: "2026-11-16",
  updated: "2026-11-16",
  about: ["Windsurf", "Devin Desktop", "Cascade", "AGENTS.md", "AI coding agents"],
  sections: [
    {
      id: "what-changed",
      heading: "What happened to Windsurf rules?",
      blocks: [
        {
          kind: "p",
          text: 'The Windsurf app became Devin Desktop through an over-the-air update. Its FAQ says it "continues to read all of your existing Windsurf rules" and nothing needs to change. What changed is the preferred location: `.devin/` is now the primary workspace directory, `.windsurf/` the fallback.',
        },
        {
          kind: "p",
          text: "docs.windsurf.com redirects to docs.devin.ai/desktop, which documents rules under Devin Local Customizations.",
        },
      ],
    },
    {
      id: "where",
      heading: "Where do Windsurf (Devin Desktop) rules go?",
      blocks: [
        {
          kind: "table",
          caption: "Rule file locations Devin Desktop reads",
          head: ["Path", "Scope", "Status"],
          rows: [
            [
              "`.devin/rules/*.md`",
              "Project, one rule per file",
              "Preferred; takes precedence over `.windsurf/rules/`",
            ],
            ["`.devin/global_rules.md`", "Project, one always-on file", "Current"],
            ["`~/.devin/rules/*.md`, `~/.devin/global_rules.md`", "You, in every project", "Current"],
            [
              "`AGENTS.md`, `AGENT.md`, `AGENTS.local.md`",
              "Always-on rules, per directory",
              "Current; read from the workspace root down to the working directory",
            ],
            ["`.windsurf/rules/*.md`, `.windsurf/global_rules.md`", "Project", "Legacy; imported by default"],
            [
              "`.windsurfrules`",
              "Project, single file at the workspace root",
              "Legacy; still read, with no `.devinrules` equivalent",
            ],
          ],
        },
        {
          kind: "p",
          text: "System-wide rules that enterprise admins deploy move from the Windsurf system directories (on macOS, `/Library/Application Support/Windsurf/`) to the Devin ones (`/Library/Application Support/Devin/`); both are read.",
        },
      ],
    },
    {
      id: "format",
      heading: "How do I write a Windsurf rule file?",
      blocks: [
        {
          kind: "p",
          text: "Each rule is a Markdown file whose `trigger:` frontmatter decides when it applies:",
        },
        {
          kind: "table",
          caption: "Values of the trigger frontmatter in Devin Desktop rule files",
          head: ["`trigger`", "Applies"],
          rows: [
            ["`always_on`", "Every session"],
            ["`glob`", "When the agent works with files matching `globs`"],
            ["`model_decision`", "When the agent decides the rule's `description` is relevant"],
            ["`manual`", "Only when you invoke it"],
          ],
        },
        {
          kind: "snippet",
          caption: ".devin/rules/tests.md (the example from Devin's docs)",
          text: '---\ntrigger: glob\nglobs: "**/*.test.ts"\n---\n\nAll test files must use `describe`/`it` blocks and mock external API calls.\n',
        },
        {
          kind: "p",
          text: "A `model_decision` rule needs a `description`, since that is what the agent judges. The current docs state no character limit for rules; older Windsurf docs' per-rule limits are gone.",
        },
      ],
    },
    {
      id: "template",
      heading: "What does a Windsurf rules directory look like?",
      blocks: [
        {
          kind: "snippet",
          caption: "A rules directory that leaves shared rules in AGENTS.md",
          text: 'AGENTS.md                     # commands, layout, conventions: read by most agents\n.devin/\n  rules/\n    migrations.md               # trigger: glob, globs: "db/migrations/**"\n    release.md                  # trigger: manual\n  workflows/\n    deploy-preview.md           # run as /deploy-preview\n',
        },
        {
          kind: "p",
          text: "Both directories hold one Markdown file per rule, so moving from `.windsurf/rules/` is a directory rename. Devin Desktop can also import `.cursor/rules` `.mdc` files into `.devin/rules/`.",
        },
      ],
    },
    {
      id: "vs-agents-md",
      heading: "Windsurf rules vs AGENTS.md: which should I use?",
      tone: "tip",
      blocks: [
        {
          kind: "p",
          text: "Use AGENTS.md for what always applies: build and test commands, layout, conventions. Devin Desktop reads it as an always-on rule, per directory, as do Codex, Cursor, Copilot, Devin cloud and others, so a teammate on another agent gets the same instructions. `.devin/rules/` adds what AGENTS.md can't: rules that load only for matching files, only when relevant, or only on request.",
        },
        {
          kind: "p",
          text: "AGENTS.local.md is read too, for personal rules kept out of version control.",
        },
      ],
    },
    {
      id: "workflows",
      heading: "Where do Windsurf workflows go?",
      blocks: [
        {
          kind: "p",
          text: "In `.devin/workflows/` (or the legacy `.windsurf/workflows/`), one Markdown file each, capped at 12,000 characters. Run one in Cascade with `/name-of-workflow`. Personal global workflows stay in `~/.codeium/windsurf/global_workflows/`.",
        },
      ],
    },
    {
      id: "devin-cloud",
      heading: "Does Devin (the cloud agent) read Windsurf rules?",
      blocks: [
        {
          kind: "p",
          text: "It pulls them into its Knowledge: Devin's docs list `.windsurf`, `.rules`, `.mdc`, `.cursorrules`, CLAUDE.md and AGENTS.md among the files it reads. It also looks for AGENTS.md before it starts coding and includes the first 16 KiB of each.",
        },
      ],
    },
    {
      id: "our-data",
      heading: "Do popular repos commit Windsurf rules?",
      tone: "info",
      blocks: [
        {
          kind: "p",
          text: "Almost none. We read the whole file tree of {{censusRepos}} GitHub repos on our board on {{censusDate}} and counted repos with each file:",
        },
        {
          kind: "table",
          caption: "Board repos that commit each rules file",
          head: ["File", "Repos"],
          rows: [
            ["`.windsurf/rules/`", "{{windsurfRepos}}"],
            ["`.windsurfrules`", "{{windsurfLegacy}}"],
            ["`.cursor/rules/*.mdc`", "{{cursorRulesRepos}}"],
            ["AGENTS.md, anywhere in the tree", "{{anyAgentsMd}}"],
          ],
        },
        {
          kind: "p",
          text: "The census didn't look for `.devin/rules/`, which is only months old. What these projects commit for every agent is in AGENTS.md.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is .windsurfrules deprecated?",
      a: "Legacy, but still read at the workspace root. There is no single-file `.devinrules`; new rules go in `.devin/rules/`, one per file.",
    },
    {
      q: "Where are Windsurf global rules now?",
      a: "`~/.devin/rules/*.md` or `~/.devin/global_rules.md`.",
    },
    {
      q: "Do I need to rename .windsurf to .devin?",
      a: "No. Devin Desktop falls back to `.windsurf/`. If both exist, `.devin/rules/` takes precedence.",
    },
    {
      q: "Does Devin Desktop read AGENTS.md?",
      a: "Yes, as always-on rules: `AGENTS.md`, `AGENT.md` and `AGENTS.local.md`, in each directory from the workspace root to the one it works in.",
    },
    {
      q: "Is there a character limit on Windsurf rules?",
      a: "Devin Desktop's current docs state none for rules. Workflows are capped at 12,000 characters each.",
    },
  ],
  sources: [
    "https://docs.devin.ai/desktop/devin-desktop-faq",
    "https://docs.devin.ai/desktop/cascade/memories",
    "https://docs.devin.ai/desktop/cascade/workflows",
    "https://docs.devin.ai/onboard-devin/knowledge-onboarding",
    "https://docs.devin.ai/onboard-devin/agents-md",
  ],
  related: [
    { href: "/check/agents-md", label: "Check your AGENTS.md" },
    { href: "/check/cursor-rules/vs-agents-md", label: "Cursor rules vs AGENTS.md" },
    { href: guidePath("one-file-for-all-agents"), label: "One file for every agent" },
    { href: "/agents", label: "What each agent reads" },
    { href: GUIDE_PATH, label: "All guides" },
  ],
};
