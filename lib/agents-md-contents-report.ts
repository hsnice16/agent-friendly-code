import { type ClaudeMdRelation, type FileAnatomy, type QuoteKind, TOPICS, type TopicId } from "./agents-md-contents";
import { AUTHOR_JSON_LD } from "./author";
import { PUBLISHER_JSON_LD } from "./site-json-ld";
import { csvField } from "./utils/csv";
import { median } from "./utils/median";
import { ogImage } from "./utils/og-image";
import { repoOwnership } from "./utils/own-repo";
import { fitDescription } from "./utils/page-title";
import { CONTENTS_REPORT_CSV_PATH, CONTENTS_REPORT_PATH } from "./utils/report-path";
import { APP_NAME, APP_URL } from "./version";

export type ContentsRepo = {
  host: string;
  owner: string;
  name: string;
  /** The path the AGENTS.md check matched. */
  path: string;
  sha: string | null;
  /** The check's own length, to confirm the pinned commit holds the file it scored. */
  scoredChars: number | null;
  /** Set when the matched path is a symlink, to what it points at. */
  linkTarget: string | null;
  /** Only for a root AGENTS.md. */
  claudeMd: ClaudeMdRelation | null;
  error?: string;
} & Partial<Omit<FileAnatomy, "quotes">>;

export type ContentsQuote = {
  kind: QuoteKind;
  repo: string;
  url: string;
  path: string;
  sha: string;
  line: number;
  text: string;
};

export type QuoteCandidate = ContentsQuote & { stars: number | null };

export type ContentsData = { generatedAt: string; quotes: ContentsQuote[]; repos: ContentsRepo[] };

export type ContentsRead = ContentsRepo & Omit<FileAnatomy, "quotes">;

export type TopicRow = { id: TopicId; label: string; files: number; medianChars: number | null };

export type ContentsReport = {
  date: string;
  /** Files the AGENTS.md check matched with content on the board. */
  attempted: number;
  /** Of those, the files read at their pinned commit: the denominator of every share. */
  files: number;
  agentsMd: number;
  claudeMdOnly: number;
  /** Files whose fetched length equals the length the board scored. */
  sameAsScored: number;
  medianChars: number | null;
  medianLines: number | null;
  medianHeadings: number | null;
  noHeadings: number;
  /** Headings below the title that matched a topic, of all headings below the title. */
  classifiedHeadings: number;
  bodyHeadings: number;
  topics: TopicRow[];
  testCommand: number;
  singleTest: number;
  codeBlocks: number;
  relativeLinks: number;
  imports: number;
  mdRefs: number;
  externalLinks: number;
  pointsElsewhere: number;
  prohibitions: number;
  medianProhibitions: number | null;
  capsEmphasis: number;
  /** Root AGENTS.md files only. */
  claude: Record<ClaudeMdRelation, number>;
  agentsMdLinks: number;
  quotes: ContentsQuote[];
};

export const isRead = (r: ContentsRepo): r is ContentsRead => !r.error && r.chars != null;
const count = (rows: ContentsRead[], f: (r: ContentsRead) => boolean) => rows.filter(f).length;
const isAgentsMd = (r: Pick<ContentsRepo, "path">) => r.path.toLowerCase() === "agents.md";
const bodyHeadings = (r: ContentsRead) => r.headings - (r.titled ? 1 : 0);

export function buildContentsReport(data: ContentsData): ContentsReport {
  const rows = data.repos.filter(isRead);
  const agents = rows.filter(isAgentsMd);
  const claude = { none: 0, symlink: 0, imports: 0, mentions: 0, separate: 0 } as Record<ClaudeMdRelation, number>;
  for (const r of agents) if (r.claudeMd) claude[r.claudeMd]++;
  const withProhibitions = rows.filter((r) => r.prohibitions > 0);

  return {
    date: data.generatedAt.slice(0, 10),
    attempted: data.repos.length,
    files: rows.length,
    agentsMd: agents.length,
    claudeMdOnly: rows.length - agents.length,
    sameAsScored: count(rows, (r) => r.scoredChars === r.chars),
    medianChars: median(rows.map((r) => r.chars)),
    medianLines: median(rows.map((r) => r.lines)),
    medianHeadings: median(rows.map((r) => r.headings)),
    noHeadings: count(rows, (r) => r.headings === 0),
    classifiedHeadings: rows.reduce((n, r) => n + r.classified, 0),
    bodyHeadings: rows.reduce((n, r) => n + bodyHeadings(r), 0),
    topics: TOPICS.map((t) => {
      const has = rows.filter((r) => r.topics.includes(t.id));
      return {
        id: t.id,
        label: t.label,
        files: has.length,
        medianChars: median(has.map((r) => r.topicChars[t.id] ?? 0)),
      };
    }).sort((a, b) => b.files - a.files),
    testCommand: count(rows, (r) => r.testCommand),
    singleTest: count(rows, (r) => r.singleTest),
    codeBlocks: count(rows, (r) => r.codeBlocks > 0),
    relativeLinks: count(rows, (r) => r.relativeLinks > 0),
    imports: count(rows, (r) => r.imports > 0),
    mdRefs: count(rows, (r) => r.mdRefs > 0),
    externalLinks: count(rows, (r) => r.externalLinks > 0),
    pointsElsewhere: count(rows, (r) => r.relativeLinks > 0 || r.imports > 0 || r.mdRefs > 0),
    prohibitions: withProhibitions.length,
    medianProhibitions: median(withProhibitions.map((r) => r.prohibitions)),
    capsEmphasis: count(rows, (r) => r.capsEmphasis > 0),
    claude,
    agentsMdLinks: count(agents, (r) => r.linkTarget != null),
    quotes: data.quotes,
  };
}

export const quoteHost = (url: string) =>
  url.includes("gitlab.com") ? "gitlab" : url.includes("bitbucket.org") ? "bitbucket" : "github";

const QUOTE_ORDER: QuoteKind[] = ["testCommand", "singleTest", "prohibition", "import"];

/** One quote per kind, from the most-starred repo not already quoted; the author's own repos are skipped. */
export function pickQuotes(candidates: QuoteCandidate[]): ContentsQuote[] {
  const used = new Set<string>();
  const picked: ContentsQuote[] = [];
  const byStars = [...candidates].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || a.repo.localeCompare(b.repo));
  for (const kind of QUOTE_ORDER) {
    const c = byStars.find((q) => {
      const [owner, name] = q.repo.split("/");
      return q.kind === kind && !used.has(q.repo) && !repoOwnership({ host: quoteHost(q.url), owner, name });
    });
    if (!c) continue;
    used.add(c.repo);
    const { stars: _, ...quote } = c;
    picked.push(quote);
  }
  return picked;
}

export function contentsTitle(r: Pick<ContentsReport, "files">): string {
  return `What's in an AGENTS.md? ${r.files} real files, section by section`;
}

export function contentsDescription(r: ContentsReport): string {
  const top = r.topics[0];
  return fitDescription(
    `Of ${r.files} AGENTS.md or CLAUDE.md files in popular open source repos, ${r.testCommand} name an exact test command and ${top?.files ?? 0} have a ${top?.label.toLowerCase() ?? ""} section.`,
    "Which sections appear, how long they run, and how files point to each other.",
  );
}

export function contentsJsonLd(r: ContentsReport): Record<string, unknown> {
  const url = `${APP_URL}${CONTENTS_REPORT_PATH}`;
  const title = contentsTitle(r);
  return {
    "@graph": [
      {
        "@type": "TechArticle",
        headline: title,
        description: contentsDescription(r),
        url,
        image: `${APP_URL}${ogImage(CONTENTS_REPORT_PATH, title).url}`,
        datePublished: r.date,
        dateModified: r.date,
        author: AUTHOR_JSON_LD,
        publisher: PUBLISHER_JSON_LD,
        about: [{ "@type": "Thing", name: "AGENTS.md" }],
      },
      {
        "@type": "Dataset",
        "@id": `${url}#dataset`,
        name: `${title}, per repo`,
        description: `Section topics, test commands, links and rules in the AGENTS.md or CLAUDE.md of ${r.files} repos on the ${APP_NAME} leaderboard, each read at the commit it was scored at.`,
        url,
        keywords: ["AGENTS.md", "CLAUDE.md", "AGENTS.md sections", "AGENTS.md examples", "AI coding agents"],
        isAccessibleForFree: true,
        dateModified: r.date,
        creator: PUBLISHER_JSON_LD,
        license: "https://opensource.org/licenses/MIT",
        distribution: {
          "@type": "DataDownload",
          encodingFormat: "text/csv",
          contentUrl: `${APP_URL}${CONTENTS_REPORT_CSV_PATH}`,
        },
        isPartOf: { "@id": `${APP_URL}/#dataset` },
      },
    ],
  };
}

export function contentsCsv(repos: ContentsRepo[]): string {
  const head = ["repo", "host", "file", "commit", "chars", "headings", ...TOPICS.map((t) => t.id)];
  const tail = [
    "test_command",
    "single_test_command",
    "relative_links",
    "imports",
    "md_refs",
    "prohibitions",
    "claude_md",
  ];
  const lines = repos
    .filter(isRead)
    .map((r) =>
      [
        `${r.owner}/${r.name}`,
        r.host,
        r.path,
        r.sha,
        r.chars,
        r.headings,
        ...TOPICS.map((t) => (r.topics.includes(t.id) ? 1 : 0)),
        r.testCommand ? 1 : 0,
        r.singleTest ? 1 : 0,
        r.relativeLinks,
        r.imports,
        r.mdRefs,
        r.prohibitions,
        r.claudeMd,
      ]
        .map(csvField)
        .join(","),
    );
  return `${[...head, ...tail].join(",")}\n${lines.join("\n")}\n`;
}
