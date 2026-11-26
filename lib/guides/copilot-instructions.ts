import { GUIDE_PATH, guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

const STARTER = [
  "# Copilot instructions",
  "",
  "Shared project rules live in AGENTS.md. This file repeats the essentials for",
  "Copilot features that don't read AGENTS.md, plus Copilot-only notes.",
  "",
  "- Build: `npm ci && npm run build`",
  "- Test: `npm test`; run a single file with `npm test -- path/to/file`",
  "- TypeScript strict mode; no `any` in new code.",
  "- In code review, flag any SQL built by string concatenation.",
].join("\n");

const PATH_FILE = [
  "---",
  'applyTo: "**/*.ts,**/*.tsx"',
  'excludeAgent: "code-review"',
  "---",
  "",
  "- Components are function components with named exports.",
  "- Co-locate tests as `*.test.tsx` next to the component.",
].join("\n");

export const COPILOT_INSTRUCTIONS: Guide = {
  slug: "copilot-instructions",
  name: "copilot-instructions.md",
  title: "copilot-instructions.md: setup, examples, AGENTS.md",
  description:
    "Where copilot-instructions.md goes, which Copilot features read it, applyTo path files, AGENTS.md and CLAUDE.md support, and why instructions get ignored.",
  lead: "GitHub Copilot reads repository instructions from `.github/copilot-instructions.md`. Its cloud agent, code review, CLI and VS Code also read AGENTS.md, so keep shared rules there and use copilot-instructions.md for the essentials and Copilot-only notes.",
  published: "2026-11-16",
  updated: "2026-11-27",
  about: ["GitHub Copilot", "copilot-instructions.md", "AGENTS.md", "AI coding agents"],
  sections: [
    {
      id: "location",
      heading: "Where does copilot-instructions.md go?",
      blocks: [
        {
          kind: "p",
          text: "`.github/copilot-instructions.md`, at the repository root. Plain Markdown, no frontmatter, applied to every request in the repo. Path-specific files go beside it in `.github/instructions/` ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#creating-custom-instructions)).",
        },
        {
          kind: "p",
          text: "In our census of the {{censusRepos}} GitHub repos on the board on {{censusDate}}, {{copilotRepos}} ({{copilotPct}}) have a `.github/copilot-instructions.md`, and {{copilotAndAgentsMd}} of those also have a root AGENTS.md. Census counts include empty files.",
        },
      ],
    },
    {
      id: "surfaces",
      heading: "Which Copilot features read which instruction files?",
      blocks: [
        {
          kind: "table",
          caption: "Repository instruction files each GitHub Copilot surface supports, per GitHub's support matrix",
          head: [
            "Copilot surface",
            "copilot-instructions.md",
            "Path-specific .instructions.md",
            "AGENTS.md, CLAUDE.md, GEMINI.md",
          ],
          rows: [
            ["Cloud agent (any IDE or github.com)", "Yes", "Yes", "Yes"],
            ["Code review on github.com", "Yes", "Yes", "Yes, plus REVIEW.md"],
            ["Copilot CLI", "Yes", "Yes", "Yes"],
            ["Chat on github.com", "Yes", "—", "—"],
            ["VS Code Chat", "Yes", "Yes", "AGENTS.md only"],
            ["VS Code code review", "Yes", "—", "—"],
            ["Visual Studio Chat", "Yes", "Yes", "—"],
            ["JetBrains Chat", "Yes", "Yes", "—"],
            ["Xcode Chat and code review", "Yes", "Yes", "—"],
            ["Eclipse Chat", "Yes", "—", "—"],
          ],
        },
        {
          kind: "p",
          text: "— means the matrix doesn't list it for that surface. Eclipse code review supports no custom instructions ([docs](https://docs.github.com/en/copilot/reference/custom-instructions-support#eclipse)). Personal instructions (`~/.copilot/copilot-instructions.md` for the CLI) and organization instructions sit on top of these ([docs](https://docs.github.com/en/copilot/reference/custom-instructions-support)).",
        },
      ],
    },
    {
      id: "path-specific",
      heading: "How do applyTo and .instructions.md files work?",
      blocks: [
        {
          kind: "p",
          text: "Put `NAME.instructions.md` files in or below `.github/instructions/`. The `applyTo` frontmatter takes comma-separated globs: `**/*.py` for every Python file, `src/*.py` for that folder only, `src/**/*.py` for it and its subfolders ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#creating-path-specific-custom-instructions)). A matching file's instructions are added to the repo-wide ones, not swapped in ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#creating-custom-instructions)).",
        },
        {
          kind: "p",
          text: '`excludeAgent` keeps a file from one agent: `"code-review"` or `"cloud-agent"`. Without it both use the file ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#creating-path-specific-custom-instructions)). In VS Code the frontmatter can also carry `name` and `description` ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference#_instructions-file-fields)).',
        },
        { kind: "snippet", caption: ".github/instructions/react.instructions.md", text: PATH_FILE },
        {
          kind: "p",
          text: "Few repos use them: {{copilotPathFiles}} path-specific files across {{copilotPathRepos}} repos in our census, most in microsoft/vscode, dotnet/runtime, dotnet/maui and PowerShell/PowerShell.",
        },
      ],
    },
    {
      id: "agents-md",
      heading: "Does GitHub Copilot read AGENTS.md?",
      blocks: [
        {
          kind: "p",
          text: "Yes, on the cloud agent, code review, the CLI and VS Code. AGENTS.md files can sit anywhere in the repo; the nearest one in the directory tree takes precedence. Alternatively Copilot takes a single CLAUDE.md or GEMINI.md at the repo root ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#creating-custom-instructions)). Code review also reads CLAUDE.md, GEMINI.md and REVIEW.md ([docs](https://docs.github.com/en/copilot/reference/custom-instructions-support#githubcom)), from the pull request's head branch ([docs](https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions#using-custom-instructions)).",
        },
        {
          kind: "list",
          items: [
            "Copilot CLI reads instruction files at the repo root, the working directory, every directory between, and directories on the path of a file it works on; it also reads `.claude/CLAUDE.md` ([docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions#types-of-custom-instructions)). `@relative/path` references work in copilot-instructions.md, AGENTS.md and CLAUDE.md, not in GEMINI.md or `.instructions.md` files ([docs](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions#referencing-other-files)).",
            "VS Code's Copilot harness finds AGENTS.md at the repo root, the working directory, the directories between, and along the paths of files it works with, and combines them ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference#_nested-project-instructions)).",
            "VS Code's Local harness reads the root AGENTS.md only with `chat.useAgentsMdFile` on; nested files also need `chat.useNestedAgentsMdFiles`, experimental and off by default ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference#_nested-project-instructions)). `chat.useClaudeMdFile` adds CLAUDE.md, `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md` and CLAUDE.local.md ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference#_local-harness-settings)). The Local harness is deprecated and will be removed in February 2027 ([docs](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference)).",
          ],
        },
      ],
    },
    {
      id: "vs-agents-md",
      heading: "copilot-instructions.md vs AGENTS.md: which should you use?",
      tone: "tip",
      blocks: [
        {
          kind: "p",
          text: "Both, split by job. Codex, Cursor, Devin and most other agents read AGENTS.md too, so the project's rules belong there once. copilot-instructions.md is the only file every Copilot surface reads: Chat on github.com, Visual Studio, JetBrains, Xcode and Eclipse don't list AGENTS.md ([docs](https://docs.github.com/en/copilot/reference/custom-instructions-support)). Keep it short: the build and test commands and the few rules that matter most, repeated, plus anything only Copilot needs, such as what code review should flag.",
        },
        { kind: "snippet", caption: ".github/copilot-instructions.md (starter)", text: STARTER },
        {
          kind: "p",
          text: "GitHub advises short, self-contained statements ([docs](https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions#writing-effective-custom-instructions)). There's no documented length limit; GitHub's prompt for generating the file asks for at most two pages ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#asking-copilot-cloud-agent-to-generate-a-copilot-instructionsmd-file)).",
        },
      ],
    },
    {
      id: "prompts-agents-skills",
      heading: "What about Copilot prompt files, custom agents and skills?",
      blocks: [
        {
          kind: "table",
          caption: "Other repository files GitHub Copilot reads",
          head: ["File", "Where", "Notes"],
          rows: [
            [
              "Prompt files",
              "`.github/prompts/*.prompt.md`",
              "Reusable prompts. VS Code and Visual Studio; preview in JetBrains and Xcode; not on github.com, Eclipse or the CLI ([docs](https://docs.github.com/en/copilot/reference/customization-cheat-sheet#ide-and-surface-support)). In VS Code only the Local harness runs them; for the Copilot harness, convert them to skills ([docs](https://code.visualstudio.com/docs/agent-customization/prompt-files)).",
            ],
            [
              "Custom agents",
              "`.github/agents/NAME.md` or `NAME.agent.md`",
              "The file name minus `.md` or `.agent.md` identifies it; `name` is optional ([docs](https://docs.github.com/en/copilot/reference/custom-agents-configuration#yaml-frontmatter-properties)). Organization agents go in `/agents/` of the org's `.github` or `.github-private` repo ([docs](https://docs.github.com/en/copilot/reference/customization-cheat-sheet#feature-overview)).",
            ],
            [
              "Skills",
              "`.github/skills/`, `.claude/skills/` or `.agents/skills/`",
              "One folder per skill with a SKILL.md. Personal skills: `~/.copilot/skills` or `~/.agents/skills` ([docs](https://docs.github.com/en/copilot/reference/customization-cheat-sheet#feature-overview)). VS Code's Copilot harness lists only `.github/skills/` ([docs](https://code.visualstudio.com/docs/agent-customization/agent-skills#_skill-locations)).",
            ],
          ],
        },
      ],
    },
    {
      id: "not-working",
      heading: "Why are my Copilot instructions not working?",
      tone: "warn",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Check it loaded: in Chat, expand the references list at the top of a response and look for `.github/copilot-instructions.md` ([docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions#custom-instructions-in-use)). In VS Code, References shows the file was included, not that it was followed; Discovery events in the Agent Debug Logs show whether it was loaded, skipped or rejected ([docs](https://code.visualstudio.com/docs/agents/agent-troubleshooting/chat-debug-view#_instructions-or-a-prompt-file-are-not-applied)).",
            "Check the path and name: `.github/copilot-instructions.md` at the repo root, and path files ending in `.instructions.md` under `.github/instructions/`.",
            "Check the surface reads that file (table above). A path file or AGENTS.md does nothing in Chat on github.com.",
            "Check the `applyTo` glob matches the file being edited: `src/*.py` misses `src/api/app.py`.",
            "In VS Code's Local harness, turn on `chat.useAgentsMdFile` if your rules live in AGENTS.md.",
            "Code review reads instructions from the pull request's head branch, so a change counts only once it's on that branch ([docs](https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions#using-custom-instructions)).",
            "Look for conflicts. Copilot gets every relevant set of instructions. Only Chat on github.com documents an order (personal, then repository, then organization); the CLI, VS Code and Visual Studio combine them with no general order ([docs](https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions#precedence-of-custom-instructions)).",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "copilot-instructions.md vs CLAUDE.md?",
      a: "Copilot's cloud agent, code review and CLI read a root CLAUDE.md; Chat in the IDEs doesn't, except VS Code's Local harness with `chat.useClaudeMdFile` on. If your rules are in CLAUDE.md for Claude Code, point both files at an AGENTS.md or repeat the essentials in copilot-instructions.md.",
    },
    {
      q: "Can applyTo take more than one pattern?",
      a: 'Yes, comma-separated in one string: `applyTo: "**/*.ts,**/*.tsx"`.',
    },
    {
      q: "Does Copilot code review use copilot-instructions.md?",
      a: 'Yes, on github.com and in every IDE except Eclipse. On github.com it also reads path-specific files, AGENTS.md, CLAUDE.md, GEMINI.md and REVIEW.md. Use `excludeAgent: "code-review"` to keep a path file out of reviews.',
    },
    {
      q: "Is there a copilot-instructions.md length limit?",
      a: "Not in GitHub's current docs. Keep to short, self-contained statements; long files cost context on every request.",
    },
    {
      q: "Which wins when instructions conflict?",
      a: "In Chat on github.com, personal, then repository, then organization. The CLI, VS Code and Visual Studio combine them with no general order. Copilot gets every relevant set either way, so remove the conflict rather than rely on an order.",
    },
    {
      q: "Can one repo serve Copilot and other agents from the same file?",
      a: "For the cloud agent, code review, the CLI and VS Code, yes: AGENTS.md. Some repos go further: lit/lit symlinks both AGENTS.md and CLAUDE.md to `.github/copilot-instructions.md`. See the one-file guide.",
    },
  ],
  sources: [
    "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions",
    "https://docs.github.com/en/copilot/reference/custom-instructions-support",
    "https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions",
    "https://docs.github.com/en/copilot/reference/customization-cheat-sheet",
    "https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference",
    "https://code.visualstudio.com/docs/agent-customization/agent-skills",
    "https://code.visualstudio.com/docs/agent-customization/prompt-files",
    "https://code.visualstudio.com/docs/agents/agent-troubleshooting/chat-debug-view",
    "https://docs.github.com/en/copilot/reference/custom-agents-configuration",
    "https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions",
  ],
  related: [
    { href: "/check/agents-md", label: "Check your AGENTS.md" },
    { href: guidePath("one-file-for-all-agents"), label: "One file for every agent" },
    { href: guidePath("claude-md"), label: "CLAUDE.md guide" },
    { href: guidePath("agents-md-vs-skills"), label: "AGENTS.md vs skills" },
    { href: "/agents", label: "What each agent reads" },
    { href: GUIDE_PATH, label: "All guides" },
  ],
};
