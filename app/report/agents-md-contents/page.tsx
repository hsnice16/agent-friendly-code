import type { Metadata } from "next";

import { CiteThis } from "@/components/CiteThis";
import { ContentsShare, ContentsTopicList, SHARE_LIST } from "@/components/ContentsTopicList";
import { ExternalLink } from "@/components/ExternalLink";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { ReportStat } from "@/components/ReportStat";
import { TOPICS } from "@/lib/agents-md-contents";
import { CONTENTS_REPORT } from "@/lib/agents-md-contents-data";
import {
  type ContentsQuote,
  contentsDescription,
  contentsJsonLd,
  contentsTitle,
  quoteHost,
} from "@/lib/agents-md-contents-report";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { formatDay, percent } from "@/lib/utils/format";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { repoFileAtCommitUrl } from "@/lib/utils/repo-file-url";
import {
  CONTENTS_REPORT_CSV_PATH,
  CONTENTS_REPORT_PATH,
  REPORT_PATH,
  REPORT_TITLE,
  SIZE_REPORT_PATH,
} from "@/lib/utils/report-path";
import { OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const CODE = "font-mono text-[13px] text-ink";
const LIST = "m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim";
const NUMBER = new Intl.NumberFormat("en-US");
const chars = (n: number | null) => (n == null ? "—" : NUMBER.format(n));

const COMMAND_QUOTES = new Set<ContentsQuote["kind"]>(["testCommand", "singleTest"]);

const QUOTE_LABEL: Record<ContentsQuote["kind"], string> = {
  testCommand: "A test command",
  singleTest: "One test at a time",
  prohibition: "A rule",
  import: "An import",
};

export function generateMetadata(): Metadata {
  const r = CONTENTS_REPORT;
  const title = contentsTitle(r);
  const description = contentsDescription(r);
  const image = ogImage(CONTENTS_REPORT_PATH, title);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: CONTENTS_REPORT_PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: CONTENTS_REPORT_PATH, type: "article" },
  };
}

export default function AgentsMdContentsPage() {
  const r = CONTENTS_REPORT;
  const day = formatDay(r.date);
  const n = r.files;
  const top3 = r.topics.slice(0, 3);

  return (
    <>
      <JsonLd data={contentsJsonLd(r)} />
      <PageHeader
        crumbs={{ current: { name: "What's in an AGENTS.md", path: CONTENTS_REPORT_PATH } }}
        title={contentsTitle(r)}
        lead={
          <>
            <strong className="text-ink">
              {r.testCommand} of the {n} AGENTS.md or CLAUDE.md files on our board ({percent(r.testCommand, n)}) give an
              exact command to run the tests
            </strong>
            , and {r.singleTest} ({percent(r.singleTest, n)}) show how to run a single test. The most common sections:{" "}
            {top3.map(
              (t, k) =>
                `${k ? (k === top3.length - 1 ? " and " : ", ") : ""}${t.label.toLowerCase()} (${t.files} files)`,
            )}
            . Read on {day}, each file as of the board&apos;s last scoring.
          </>
        }
        updated={r.date}
      />

      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <ReportStat
          label="Exact test command"
          value={percent(r.testCommand, n)}
          note={`${r.testCommand} of ${n} files`}
        />
        <ReportStat
          label="Point to other files"
          value={percent(r.pointsElsewhere, n)}
          note={`${r.pointsElsewhere} of ${n} link, import or name another Markdown file`}
        />
        <ReportStat
          label="Say never or don't"
          value={percent(r.prohibitions, n)}
          note={`${r.prohibitions} of ${n} files; median ${r.medianProhibitions ?? 0} such lines`}
        />
        <ReportStat
          label="No headings at all"
          value={percent(r.noHeadings, n)}
          note={`${r.noHeadings} of ${n} files are flat prose or lists`}
        />
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Which sections appear</PanelHeading>
          <p className={`${PROSE} mb-4`}>
            Share of the {n} files with at least one heading on each topic, and the median length of that topic&apos;s
            sections in the files that have it. A heading can count for two topics (&ldquo;Build and test&rdquo;). Of
            the {NUMBER.format(r.bodyHeadings)} headings below a title, {NUMBER.format(r.classifiedHeadings)} matched a
            topic ({percent(r.classifiedHeadings, r.bodyHeadings)}); the rest name something specific to the project.
          </p>
          <ContentsTopicList topics={r.topics} total={n} />
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
        <Panel>
          <PanelHeading>Commands</PanelHeading>
          <ul className={SHARE_LIST}>
            <ContentsShare label="Has a code block" part={r.codeBlocks} of={n} />
            <ContentsShare label="Gives a test command" part={r.testCommand} of={n} />
            <ContentsShare label="Shows how to run one test" part={r.singleTest} of={n} />
          </ul>
          <p className={`${PROSE} mt-4 text-[13px]`}>
            A test command is code (a block or inline) that calls a test runner, a tool&apos;s test subcommand, or the
            project&apos;s own test script. One test means it narrows to a file, a name or a pattern.
          </p>
        </Panel>
        <Panel>
          <PanelHeading>Pointers to other files</PanelHeading>
          <ul className={SHARE_LIST}>
            <ContentsShare label="Relative Markdown link" part={r.relativeLinks} of={n} />
            <ContentsShare label="An @-import" part={r.imports} of={n} />
            <ContentsShare label="Names another .md file" part={r.mdRefs} of={n} />
            <ContentsShare label="Links to a web page" part={r.externalLinks} of={n} />
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
        <Panel>
          <PanelHeading>CLAUDE.md beside an AGENTS.md</PanelHeading>
          <ul className={SHARE_LIST}>
            <ContentsShare label="No root CLAUDE.md" part={r.claude.none} of={r.agentsMd} />
            <ContentsShare label="Symlink to AGENTS.md" part={r.claude.symlink} of={r.agentsMd} />
            <ContentsShare label="Imports @AGENTS.md" part={r.claude.imports} of={r.agentsMd} />
            <ContentsShare label="Mentions AGENTS.md" part={r.claude.mentions} of={r.agentsMd} />
            <ContentsShare label="Separate file" part={r.claude.separate} of={r.agentsMd} />
          </ul>
          <p className={`${PROSE} mt-4 text-[13px]`}>
            Out of the {r.agentsMd} repos whose file is a root AGENTS.md; in {r.agentsMdLinks} of them the AGENTS.md is
            itself a symlink. When both exist, Claude Code reads only CLAUDE.md unless it imports{" "}
            <code className={CODE}>@AGENTS.md</code>:{" "}
            <IntentLink href={checkSubPath("agents_md", "vs-claude-md")} className="prose-link">
              AGENTS.md vs CLAUDE.md
            </IntentLink>
            .
          </p>
        </Panel>
        <Panel>
          <PanelHeading>Rules and emphasis</PanelHeading>
          <ul className={SHARE_LIST}>
            <ContentsShare label="A never / do not / avoid line" part={r.prohibitions} of={n} />
            <ContentsShare label="All-caps MUST, NEVER or ALWAYS" part={r.capsEmphasis} of={n} />
          </ul>
          <p className={`${PROSE} mt-4 text-[13px]`}>
            Median file: {chars(r.medianChars)} characters over {chars(r.medianLines)} lines, with{" "}
            {r.medianHeadings ?? 0} headings. More on length:{" "}
            <IntentLink href={SIZE_REPORT_PATH} className="prose-link">
              AGENTS.md sizes
            </IntentLink>
            .
          </p>
        </Panel>
      </div>

      {r.quotes.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>From the files</PanelHeading>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {r.quotes.map((q) => (
                <li key={q.kind}>
                  <p className="eyebrow m-0 mb-1 text-[12.5px] text-muted">{QUOTE_LABEL[q.kind]}</p>
                  <blockquote className="m-0 border-l-2 border-line pl-3 text-[14.5px] leading-relaxed text-ink">
                    {COMMAND_QUOTES.has(q.kind) ? (
                      <code className={`${CODE} [overflow-wrap:anywhere]`}>{q.text}</code>
                    ) : (
                      q.text
                    )}
                  </blockquote>
                  <p className="mt-1 mb-0 text-[13px] text-ink-dim">
                    <ExternalLink
                      href={repoFileAtCommitUrl({ url: q.url, host: quoteHost(q.url) }, q.sha, q.path, q.line)}
                    >
                      {q.repo}, {q.path} line {q.line}
                    </ExternalLink>
                  </p>
                </li>
              ))}
            </ul>
            <p className={`${PROSE} mt-4 text-[13px]`}>
              Picked by rule, not by hand: for each kind, the first matching line in the most-starred repo not already
              quoted. Each links to the file at the commit read.
            </p>
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Methodology</PanelHeading>
          <ul className={LIST}>
            <li>
              The sample is every repo on the leaderboard whose{" "}
              <IntentLink href={checkPath("agents_md")} className="prose-link">
                AGENTS.md check
              </IntentLink>{" "}
              found a file with content: a root AGENTS.md, or a CLAUDE.md (root or{" "}
              <code className={CODE}>.claude/</code>) where there is none. {r.attempted} files; {n} were read (
              {r.agentsMd} AGENTS.md, {r.claudeMdOnly} CLAUDE.md), and every share on this page is out of {n} unless it
              says otherwise. Nested files aren&apos;t read.
            </li>
            <li>
              The board stores no file contents or commit, so each file was read at the last commit on the default
              branch before the repo&apos;s last scoring time. {r.sameAsScored} of the {n} came out the exact length the
              board scored, so the commit read is the one scored or holds the same file; {n - r.sameAsScored} did not.{" "}
              {r.attempted - n} could not be read (repo or branch no longer found).
            </li>
            <li>
              Topics come from headings (<code className={CODE}>#</code> to <code className={CODE}>######</code>,
              outside code fences), matched against keyword lists; a file&apos;s first heading is skipped when it is a
              level-1 title. A section runs to the next heading at its level or above. Underlined headings and bold
              lines used as headings aren&apos;t counted, so a file can have a topic in prose that this misses, and a
              keyword can misfire (&ldquo;Important files&rdquo; counts as a rule).
            </li>
            <li>
              Only counts and the {r.quotes.length} short quotes above are stored, never the files:{" "}
              <a href={CONTENTS_REPORT_CSV_PATH} className="prose-link">
                agents-md-contents.csv
              </a>{" "}
              has every file&apos;s row, with the commit read.
            </li>
          </ul>
          <details className="mt-4">
            <summary className="cursor-pointer text-[14px] text-ink">The keyword list for each topic</summary>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0 text-[13px] text-ink-dim">
              {TOPICS.map((t) => (
                <li key={t.id}>
                  <span className="text-ink">{t.label}</span>:{" "}
                  <code className={`${CODE} [overflow-wrap:anywhere] text-[12px]`}>{t.pattern.source}</code>
                </li>
              ))}
            </ul>
          </details>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel tone="tip">
          <PanelHeading tone="tip" icon="file-text">
            Writing your own
          </PanelHeading>
          <p className={PROSE}>
            Only {r.singleTest} of the {n} files show how to run a single test, the quickest check an agent can make
            after an edit; that line is worth adding to yours. Adoption over time is in{" "}
            <IntentLink href={REPORT_PATH} className="prose-link">
              {REPORT_TITLE}
            </IntentLink>
            ; whole files to read are under{" "}
            <IntentLink href={checkSubPath("agents_md", "examples")} className="prose-link">
              AGENTS.md examples
            </IntentLink>
            .
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <CiteThis title={contentsTitle(r)} path={CONTENTS_REPORT_PATH} asOf={day} />
      </div>
    </>
  );
}
