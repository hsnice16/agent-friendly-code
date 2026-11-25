// Pure: the /report/agents-md-contents generator runs this over files fetched
// from the board's repos, and the tests run it over fixtures. The input is an
// untrusted file: patterns are linear, or quadratic only within LINE_MAX.

export const TOPICS = [
  {
    id: "overview",
    label: "Project overview",
    pattern: /\b(overview|about|introduction|intro|purpose|summary|context|background|what is|mission|goals?)\b/,
  },
  {
    id: "setup",
    label: "Setup and install",
    pattern:
      /\b(setup|set up|install\w*|getting started|prerequisites?|requirements|environment|dependencies|quick ?start|bootstrap\w*|toolchain|local development)\b/,
  },
  {
    id: "commands",
    label: "Build and run commands",
    pattern:
      /\b(build\w*|compil\w*|commands?|scripts?|run|running|makefile|cli usage|dev(elopment)? (workflow|loop|server))\b/,
  },
  {
    id: "testing",
    label: "Testing",
    pattern: /\b(test\w*|qa|verif\w*|validat\w*|checks?|ci|continuous integration|coverage)\b/,
  },
  {
    id: "style",
    label: "Code style and conventions",
    pattern:
      /\b(style|styling|conventions?|format\w*|lint\w*|naming|best practices?|standards?|code quality|idioms?|patterns?|typing|error handling|comments|(code|coding|development|general|implementation|programming|engineering) (guidelines?|rules|practices|principles))\b/,
  },
  {
    id: "architecture",
    label: "Architecture and layout",
    pattern:
      /\b(architecture|structure|layout|organi[sz]ation|director(y|ies)|folders?|modules?|codebase|project map|key (files|paths|concepts)|design|packages|monorepo|crates|where things live)\b/,
  },
  {
    id: "git",
    label: "Commits, PRs and review",
    pattern:
      /\b(pull requests?|prs?|commits?|git|branch\w*|changelog|code review|reviews?|contribut\w*|releases?|merging|versioning|changesets?)\b/,
  },
  {
    id: "boundaries",
    label: "Rules, limits and gotchas",
    pattern:
      /\b(don'?t|do not|never|avoid|boundar\w*|restrictions?|limits|constraints|gotchas?|pitfalls?|caveats?|warnings?|important|mistakes|anti ?patterns?|forbidden|rules|must)\b/,
  },
  {
    id: "security",
    label: "Security",
    pattern: /\b(security|secrets?|credentials?|safety|permissions?|vulnerabilit\w*|sensitive|privacy|secure)\b/,
  },
  {
    id: "docs",
    label: "Documentation",
    pattern: /\b(documentation|docs|readme|docstrings?)\b/,
  },
  {
    id: "agents",
    label: "AI agents and skills",
    pattern: /\b(agents?|ai|llms?|assistants?|claude|copilot|codex|cursor|gemini|mcp|prompts?|skills?)\b/,
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting and debugging",
    pattern: /\b(troubleshoot\w*|debug\w*|faq|common (issues|problems|errors)|known issues)\b/,
  },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export type Heading = { level: number; text: string; line: number };

export type FileAnatomy = {
  chars: number;
  lines: number;
  /** Every ATX heading outside code fences, the title included. */
  headings: number;
  /** The first heading is a level-1 title, which isn't classified. */
  titled: boolean;
  /** Headings below the title that matched at least one topic. */
  classified: number;
  topics: TopicId[];
  /** Characters under each topic's headings, subsections included, each line counted once per topic. */
  topicChars: Partial<Record<TopicId, number>>;
  testCommand: boolean;
  singleTest: boolean;
  relativeLinks: number;
  externalLinks: number;
  imports: number;
  /** Other Markdown files named in the text, linked or not. */
  mdRefs: number;
  prohibitions: number;
  capsEmphasis: number;
  codeBlocks: number;
  quotes: Partial<Record<QuoteKind, { line: number; text: string }>>;
};

export type QuoteKind = "testCommand" | "singleTest" | "prohibition" | "import";

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
// Closing `#`s are stripped by hand: a lazy `(.*?)` before them backtracks quadratically.
const ATX = /^\s{0,3}(#{1,6})[ \t]+(.*)$/;

function atxText(raw: string): string {
  const t = raw.trimEnd();
  let i = t.length;
  while (i > 0 && t[i - 1] === "#") i--;
  return i > 0 && i < t.length && (t[i - 1] === " " || t[i - 1] === "\t") ? t.slice(0, i).trimEnd() : t;
}

function normalizeHeading(text: string): string {
  return text
    .replace(/\[([^[\]]*)\]\([^)[]*\)/g, "$1")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9']+/g, " ")
    .trim();
}

export function headingTopics(text: string): TopicId[] {
  const h = normalizeHeading(text);
  return TOPICS.filter((t) => t.pattern.test(h)).map((t) => t.id);
}

const TEST_RUNNER =
  // Not part of a file name: `vitest.ts`, `jest.config.js`, `pytest.ini`.
  /(?<![\w.-])(pytest|py\.test|nox|tox|jest|vitest|mocha|phpunit|pest|rspec|ctest|nextest|unittest|playwright test|cypress run|karma start|node --test)\b(?![.-]\w)/;
const TEST_SUBCOMMAND =
  /\b(go|cargo|npm|pnpm|yarn|bun|deno|dotnet|swift|mix|mvn|mvnw|gradle|gradlew|make|just|bazel|bazelisk|buck2|rake|nx|turbo|hatch|composer|sbt|lein|stack|cabal|zig|flutter|dart|meson|ninja|rush|moon|task|x\.py|uv run|poetry run|bundle exec|npx|pnpx|bunx|php artisan|bin\/rails|rails)\b[^\n`]*?(?<!\w|--)(test|tests|test:[\w:-]+|test-[\w-]+|spec)\b(?![./]\w)/;
// Gradle names test tasks freely: `:core:test_h2`, `jvmTest`, `{variant}Test`.
const GRADLE_TEST = /\bgradlew?\b[^\n`]*?[\s:}](\w*Test|test\w*)\b/;
const ONE_TEST =
  /(\s-k[\s=]|\s-run[\s=]|::|dotnet test\b.*--filter[\s=]|\s-t\s+["'<]|--test-name-pattern|--testNamePattern|--grep[\s=]|\s-Dtest=|--tests?[\s=]\S|<test[-_ ]?(name|file|path|pattern)>|\[test[-_ ]?(name|file|path)\]|\S\.(test|spec)\.[cm]?[jt]sx?\b|\S_test\.(go|py|rb|exs?)\b|\btest_\w+\.py\b|\STest\.(java|kt|php)\b|\btests?\/\S+\.\w+)/;

// A project's own script: `./run_tests.sh`, `bin/test`. Not under `tests/`,
// where an extension-less name is as often a directory as a script.
const TEST_SCRIPT =
  /(^|&&|;|\|)\s*(\.{1,2}\/([\w.-]+\/)*[\w.-]*test[\w.-]*|(bin|scripts?|tools|ci|dev)\/([\w.-]+\/)*[\w-]*test[\w-]*|[\w-]*test[\w-]*\.sh)(\s|$)/;

/** A code line that runs a project's tests. */
export function isTestCommand(code: string): boolean {
  // A trailing shell comment ("# the tree CI tests") describes the command; it doesn't run anything.
  const cmd = code.replace(/(^|\s)#.*$/, "");
  return TEST_RUNNER.test(cmd) || TEST_SUBCOMMAND.test(cmd) || GRADLE_TEST.test(cmd) || TEST_SCRIPT.test(cmd);
}

/** A test command narrowed to one test, file or name pattern. */
export function isSingleTestCommand(code: string): boolean {
  return isTestCommand(code) && ONE_TEST.test(` ${code.replace(/(^|\s)#.*$/, "")}`);
}

// A scan from one `[` or `(` stops at the next, so hostile openers stay linear.
const MD_LINK = /\[[^[\]\n]*\]\(\s*<?((?:[^()\s>]|\([^()\s]*\))+)>?(?:\s+"[^"\n]*")?\s*\)/g;
const IMPORT = /(?:^|\s)@(?:~\/|\.{1,2}\/)?[\w.-]+(?:\/[\w.-]+)*\.(?:md|mdc|txt)\b/;
const MD_FILE = /(?:^|[\s`(["'/])((?:[\w.-]+\/)*[\w.-]+\.(?:md|mdx|mdc))\b/gi;
const PROHIBITION = /\b(never|do not|don't|must not|mustn't|should not|shouldn't|avoid|forbidden)\b/i;
const CAPS = /\b(MUST|NEVER|ALWAYS|IMPORTANT|CRITICAL|DO NOT)\b/;
const INLINE_CODE = /(`+)([^`\n]+?)\1/g;
const QUOTE_MAX = 160;
const LIST_MARKER = /^\s*([-*+]|\d+[.)])\s+/;
// Commands and prose lines are short; capping what the patterns see keeps a
// hostile megabyte-long line from turning their scans quadratic.
const LINE_MAX = 2000;

const quotable = (s: string) => {
  const t = s.trim();
  return t.length >= 12 && t.length <= QUOTE_MAX ? t : null;
};

function sectionEnd(heads: Heading[], k: number, total: number): number {
  for (let j = k + 1; j < heads.length; j++) if (heads[j].level <= heads[k].level) return heads[j].line;
  return total;
}

export function analyzeAgentsMd(raw: string, selfName = "AGENTS.md"): FileAnatomy {
  const text = raw.replace(/\r\n?/g, "\n");
  const lines = text.split("\n");
  const heads: Heading[] = [];
  const inCode: boolean[] = [];
  let fence: string | null = null;
  let codeBlocks = 0;

  lines.forEach((line, i) => {
    const f = line.match(FENCE);
    if (f) {
      if (!fence) {
        fence = f[1][0];
        codeBlocks++;
      } else if (f[1][0] === fence) fence = null;
      inCode.push(true);
      return;
    }
    inCode.push(fence !== null);
    if (fence) return;
    const h = line.slice(0, LINE_MAX).match(ATX);
    if (h) heads.push({ level: h[1].length, text: atxText(h[2]), line: i });
  });

  // A first-level heading first in the file is the document's title, not a section.
  const titled = heads.length > 0 && heads[0].level === 1;
  const covered = new Map<TopicId, Set<number>>();
  let classified = 0;
  for (let k = titled ? 1 : 0; k < heads.length; k++) {
    const h = heads[k];
    const topics = headingTopics(h.text);
    if (!topics.length) continue;
    classified++;
    const end = sectionEnd(heads, k, lines.length);
    for (const t of topics) {
      const set = covered.get(t) ?? new Set<number>();
      for (let i = h.line + 1; i < end; i++) set.add(i);
      covered.set(t, set);
    }
  }
  const topicChars: FileAnatomy["topicChars"] = {};
  for (const [t, set] of covered) {
    topicChars[t] = [...set].reduce((n, i) => n + lines[i].trim().length, 0);
  }

  const a: FileAnatomy = {
    chars: text.trim().length,
    lines: text.trim() ? text.trim().split("\n").length : 0,
    headings: heads.length,
    titled,
    classified,
    topics: TOPICS.map((t) => t.id).filter((t) => covered.has(t)),
    topicChars,
    testCommand: false,
    singleTest: false,
    relativeLinks: 0,
    externalLinks: 0,
    imports: 0,
    mdRefs: 0,
    prohibitions: 0,
    capsEmphasis: 0,
    codeBlocks,
    quotes: {},
  };

  const self = selfName.toLowerCase().split("/").pop();
  const mdFiles = new Set<string>();
  const quote = (kind: QuoteKind, i: number, s: string) => {
    const q = quotable(s);
    if (q && !a.quotes[kind]) a.quotes[kind] = { line: i + 1, text: q };
  };

  lines.forEach((full, i) => {
    const line = full.slice(0, LINE_MAX);
    const codes = inCode[i] ? (FENCE.test(line) ? [] : [line]) : [...line.matchAll(INLINE_CODE)].map((m) => m[2]);
    for (const code of codes) {
      if (!isTestCommand(code)) continue;
      a.testCommand = true;
      quote("testCommand", i, code);
      if (isSingleTestCommand(code)) {
        a.singleTest = true;
        quote("singleTest", i, code);
      }
    }
    for (const m of line.matchAll(MD_FILE)) {
      const name = m[1].toLowerCase();
      if (name.split("/").pop() !== self) mdFiles.add(name);
    }
    if (inCode[i]) return;

    const prose = line.replace(INLINE_CODE, " ");
    for (const m of prose.matchAll(MD_LINK)) {
      const target = m[1];
      if (/^(https?:|mailto:)/i.test(target)) a.externalLinks++;
      else if (!target.startsWith("#")) a.relativeLinks++;
    }
    if (IMPORT.test(prose)) {
      a.imports++;
      quote("import", i, line.replace(LIST_MARKER, ""));
    }
    if (PROHIBITION.test(prose) && !ATX.test(line)) {
      a.prohibitions++;
      quote("prohibition", i, line.replace(LIST_MARKER, ""));
    }
    if (CAPS.test(prose)) a.capsEmphasis++;
  });
  a.mdRefs = mdFiles.size;
  return a;
}

export type ClaudeMdRelation = "none" | "symlink" | "imports" | "mentions" | "separate";

/** How a repo's root CLAUDE.md relates to its AGENTS.md. */
export function claudeMdRelation(claude: { link: string | null; text: string | null } | null): ClaudeMdRelation {
  if (!claude) return "none";
  if (claude.link != null) return /(^|\/)agents\.md$/i.test(claude.link.trim()) ? "symlink" : "separate";
  const text = claude.text ?? "";
  // [ \t], not \s: with `m`, \s spans newlines and a file of blank lines goes quadratic.
  if (/^[ \t]*@(\.\/)?agents\.md\b/im.test(text)) return "imports";
  return /\bagents\.md\b/i.test(text) ? "mentions" : "separate";
}
