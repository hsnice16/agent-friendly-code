import { GUIDE_PATH, guidePath } from "../utils/guide-path";
import type { Guide } from "./types";

export const LLMS_TXT_VS_AGENTS_MD: Guide = {
  slug: "llms-txt-vs-agents-md",
  name: "llms.txt vs AGENTS.md",
  title: "llms.txt vs AGENTS.md: what each file is for",
  description:
    "llms.txt is a website file that points LLMs to your docs. AGENTS.md is a repo file coding agents read before they work. When each is worth writing.",
  lead: "llms.txt is a Markdown file at a website's root that tells a language model where the useful pages are. AGENTS.md is a Markdown file in a code repository that coding agents load before they change anything. Different readers: someone's model reading your docs, and an agent working in your code.",
  published: "2026-11-16",
  updated: "2026-11-16",
  about: ["llms.txt", "AGENTS.md", "AI coding agents", "Documentation"],
  sections: [
    {
      id: "what-is-llms-txt",
      heading: "What is llms.txt?",
      blocks: [
        {
          kind: "p",
          text: "A proposal by Jeremy Howard (llmstxt.org, September 2024) for a `/llms.txt` Markdown file that gives websites LLM-friendly content. It sits at the site root, or at a path within it covering the pages below. Its spec notes it is used most for software documentation, where coding agents follow it to API references and tutorials.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "An H1 with the project or site name: the only required section.",
            "A blockquote with a short summary.",
            "Optional paragraphs of detail, without headings.",
            "H2 sections of link lists: `[name](url): notes`.",
            "An optional `## Optional` section for links a reader can skip.",
          ],
        },
        {
          kind: "p",
          text: "The same proposal suggests serving a Markdown copy of each page at its URL plus `.md`.",
        },
      ],
    },
    {
      id: "compare",
      heading: "llms.txt vs AGENTS.md: what's the difference?",
      blocks: [
        {
          kind: "table",
          caption: "llms.txt and AGENTS.md compared",
          head: ["", "llms.txt", "AGENTS.md"],
          rows: [
            ["Lives at", "`https://your-site/llms.txt`", "The repo root, and optionally each package"],
            ["Reader", "A model or tool fetching your website", "A coding agent working in a checkout of the repo"],
            [
              "Content",
              "A curated index of links to your docs",
              "Commands, layout, conventions and traps for changing the code",
            ],
            ["Format", "Markdown with a fixed order: H1, summary, link lists", "Plain Markdown, no required fields"],
            ["Spec", "llmstxt.org", "agents.md"],
            [
              "Loaded how",
              "Fetched over HTTP when a tool decides to",
              "Read automatically by most coding agents before they work",
            ],
          ],
        },
      ],
    },
    {
      id: "agents-read-it",
      heading: "Do coding agents read llms.txt in a GitHub repo?",
      tone: "warn",
      blocks: [
        {
          kind: "p",
          text: "Not as an instruction file. None of the agents we checked (Claude Code, Codex, Cursor, Copilot, Gemini CLI, OpenCode, Devin, Aider, Kiro, Antigravity) document reading an `llms.txt` from your repository. Their docs name the files they load (AGENTS.md, CLAUDE.md, GEMINI.md, rule directories), and llms.txt isn't one.",
        },
        {
          kind: "p",
          text: "An agent may still open it like any other file, or fetch a library's llms.txt from the web when looking up docs. To have an agent in your repo use it, give its path and purpose in AGENTS.md.",
        },
      ],
    },
    {
      id: "in-a-repo",
      heading: "Where does llms.txt go in a GitHub repo?",
      blocks: [
        {
          kind: "p",
          text: "In the folder your docs site serves at its root (`public/`, `static/`), so the build publishes it at `/llms.txt`. A copy at the repo root is served by nothing; GitHub just shows it as a file.",
        },
        {
          kind: "snippet",
          caption: "A docs site that ships llms.txt, beside the repo's AGENTS.md",
          text: "AGENTS.md                # for agents changing this code\ndocs/\n  static/\n    llms.txt             # served at https://docs.example.com/llms.txt\n  src/...\n",
        },
      ],
    },
    {
      id: "our-data",
      heading: "How many popular repos ship an llms.txt?",
      tone: "info",
      blocks: [
        {
          kind: "p",
          text: "We read the whole file tree of {{censusRepos}} GitHub repos on our board on {{censusDate}}. {{llmsTxtRepos}} contain an `llms.txt` or `llms-full.txt` somewhere; {{llmsTxtRootRepos}} of them keep one at the repo root, the rest in subfolders, mostly a docs site's `public/` or `static/`. {{anyAgentsMd}} have an AGENTS.md.",
        },
        {
          kind: "p",
          text: "So projects that write an llms.txt mostly treat it as part of their website, which it is.",
        },
      ],
    },
    {
      id: "when",
      heading: "When is each one worth writing?",
      tone: "tip",
      blocks: [
        {
          kind: "list",
          items: [
            "Write AGENTS.md if anyone works on the repo with a coding agent. The agent reads it first, and it pays back on every task.",
            "Write llms.txt if you publish docs other people's agents read (a library, an API, a CLI). It helps a model find the right page without crawling the site.",
            "A library with a docs site wants both. An app with no public docs needs only AGENTS.md.",
            "Don't copy one into the other. llms.txt lists links for users of your software; AGENTS.md tells contributors' agents how to build and test it.",
          ],
        },
      ],
    },
    {
      id: "mcp",
      heading: "llms.txt vs MCP?",
      blocks: [
        {
          kind: "p",
          text: "llms.txt is a static file a model can fetch. MCP (Model Context Protocol) is an open standard for connecting AI applications to external systems, such as data sources and tools, to query or act through. A docs MCP server can answer searches; an llms.txt only points to pages.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is llms.txt a standard?",
      a: "It is a proposal published at llmstxt.org, not a standards-body standard. Some documentation sites publish one, but no tool requires it or AGENTS.md.",
    },
    {
      q: "Does Claude Code read llms.txt?",
      a: "Its memory docs don't list it among the files it loads. A CLAUDE.md can import any file with `@path`, so `@docs/static/llms.txt` would load it, at a context cost every session.",
    },
    {
      q: "Should I put llms.txt in the root of my repo?",
      a: "Only if your website is served from the repo root, as on some static hosts. Otherwise put it where your docs site serves files at its root.",
    },
    {
      q: "Can AGENTS.md replace llms.txt?",
      a: "No. AGENTS.md is read from a checkout of your repo; a model reading your documentation website never sees it.",
    },
    {
      q: "What is llms-full.txt?",
      a: "A name some sites use for one file holding their full docs as Markdown. The llms.txt proposal doesn't define it.",
    },
  ],
  sources: [
    "https://llmstxt.org/",
    "https://agents.md/",
    "https://modelcontextprotocol.io/docs/getting-started/intro",
    "https://code.claude.com/docs/en/memory",
    "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
  ],
  related: [
    { href: "/check/agents-md", label: "Check your AGENTS.md" },
    { href: "/check/agents-md/examples", label: "AGENTS.md examples" },
    { href: "/agents", label: "What each agent reads" },
    { href: guidePath("one-file-for-all-agents"), label: "One file for every agent" },
    { href: GUIDE_PATH, label: "All guides" },
  ],
};
