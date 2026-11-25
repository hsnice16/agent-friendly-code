import type { Metadata } from "next";

import { AdoptionChart } from "@/components/AdoptionChart";
import { AdoptionTable } from "@/components/AdoptionTable";
import { CiteThis } from "@/components/CiteThis";
import { ExternalLink } from "@/components/ExternalLink";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { ReportBar, ReportStat } from "@/components/ReportStat";
import { SERIES_LABEL } from "@/lib/agents-md-adoption";
import { ADOPTION, adoptionDatasetJsonLd } from "@/lib/agents-md-report";
import { CENSUS_SUMMARY } from "@/lib/file-census";
import { getAgentsMdExamples, getInstructionFileCounts, reposWithBoth } from "@/lib/leaderboard-files";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { formatDay, percent } from "@/lib/utils/format";
import { hubPath } from "@/lib/utils/language";
import { ogImage } from "@/lib/utils/og-image";
import {
  AI_POLICY_REPORT_PATH,
  CONTENTS_REPORT_PATH,
  REPORT_CSV_PATH,
  REPORT_PATH,
  REPORT_TITLE,
  SIZE_REPORT_PATH,
} from "@/lib/utils/report-path";
import { REPO_URL } from "@/lib/version";

export const metadata: Metadata = staticPageMetadata(REPORT_PATH, ogImage(REPORT_PATH, REPORT_TITLE));

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const NUMBER = new Intl.NumberFormat("en-US");

// Points are the difference of the rounded shares shown beside them, so the three always add up.
const share = (part: number, total: number) => (total === 0 ? 0 : Math.round((part * 100) / total));
const pts = (d: number) => `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)} pts`;

export default function AgentsMdReportPage() {
  const { points, cohort, minRepos } = ADOPTION;
  const first = points[0];
  const last = points[points.length - 1];
  const asOf = formatDay(last.date);
  const examples = getAgentsMdExamples();
  const counts = getInstructionFileCounts();
  const others = counts.files
    .filter((f) => f.signalId !== "agents_md")
    .map((f) => ({ label: f.file, count: f.count, withInstructions: reposWithBoth(f.signalId) }));

  return (
    <>
      <JsonLd data={adoptionDatasetJsonLd()} />
      <PageHeader
        crumbs={{ current: { name: REPORT_TITLE, path: REPORT_PATH } }}
        title={PAGE_COPY[REPORT_PATH].title}
        lead={
          <>
            <strong className="text-ink">
              As of {asOf}, {last.agentsMd} of the {last.repos} popular open source repos we track (
              {percent(last.agentsMd, last.repos)}) have an AGENTS.md.
            </strong>{" "}
            Empty files don&apos;t count.
          </>
        }
        updated={last.date}
      />

      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {cohort && (
          <ReportStat
            label={`${SERIES_LABEL.agentsMd} since ${formatDay(cohort.since)}`}
            value={pts(share(cohort.agentsMdNow, cohort.repos) - share(cohort.agentsMdThen, cohort.repos))}
            note={`The same ${cohort.repos} repos: ${share(cohort.agentsMdThen, cohort.repos)}% had one then, ${share(cohort.agentsMdNow, cohort.repos)}% now`}
          />
        )}
        <ReportStat
          label={SERIES_LABEL.claudeMd}
          value={percent(last.claudeMd, last.repos)}
          note={`${last.claudeMd} of ${last.repos} repos`}
        />
        <ReportStat
          label={SERIES_LABEL.withFile}
          value={percent(last.withFile, last.repos)}
          note={`${last.withFile} repos with AGENTS.md, CLAUDE.md or another name agents read`}
        />
        {last.medianChars != null && (
          <ReportStat
            label="Median length"
            value={NUMBER.format(last.medianChars)}
            note={`characters, across those ${last.withFile} files`}
          />
        )}
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Share of repos with each file over time</PanelHeading>
          <AdoptionChart points={points} />
          <p className={`${PROSE} mt-4 text-[13px]`}>
            The list grew from {first.repos} repos on {formatDay(first.date)} to {last.repos}, so a step can be new
            repos rather than new files; the same-repos figure above leaves those out.
          </p>
          <AdoptionTable points={points} csvHref={REPORT_CSV_PATH} />
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Instructions file by language</PanelHeading>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-10 p-0 text-[14.5px] text-ink-dim md:grid-cols-2">
            {examples.languages.map((l) => (
              <li key={l.slug} className="grid grid-cols-[minmax(0,1fr)_90px] items-center gap-x-4 link-row">
                <span className="min-w-0">
                  <IntentLink href={hubPath(l.slug)} className={`${LINK} cover-link`}>
                    {l.label}
                  </IntentLink>
                  <span className="tabular-nums text-muted">
                    {" "}
                    · {l.withFile} of {l.total} ({percent(l.withFile, l.total)})
                  </span>
                </span>
                <ReportBar part={l.withFile} total={l.total} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>Other agent files</PanelHeading>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region */}
          <section className="table-wrap" tabIndex={0} aria-label="Other agent files">
            <table className="data-table text-[14px] tabular-nums">
              <caption className="sr-only">
                Repos with each other agent file, and how many also have an instructions file
              </caption>
              <thead>
                <tr>
                  <th scope="col">File</th>
                  <th scope="col" className="text-right">
                    Repos
                  </th>
                  <th scope="col" className="text-right">
                    With instructions file
                  </th>
                </tr>
              </thead>
              <tbody className="text-ink-dim">
                {others.map((o) => (
                  <tr key={o.label}>
                    <th scope="row" className="font-normal">
                      <code className="break-words font-mono text-[13px] text-ink">{o.label}</code>
                    </th>
                    <td className="whitespace-nowrap text-right">
                      {o.count} <span className="text-muted">({percent(o.count, counts.total)})</span>
                    </td>
                    <td className="text-right">{o.withInstructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <p className={`${PROSE} mt-3 text-[13px]`}>
            A repo with both AGENTS.md and CLAUDE.md counts under AGENTS.md: the check stops at the first file with
            content. The file census finds both at the root of {CENSUS_SUMMARY.rootBoth} of the {CENSUS_SUMMARY.repos}{" "}
            GitHub repos, symlinks and empty files included.{" "}
            <IntentLink href={checkSubPath("agents_md", "vs-claude-md")} className="prose-link">
              Which one to use
            </IntentLink>
            .
          </p>
        </Panel>

        <Panel className="h-full">
          <PanelHeading>Methodology</PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              The sample is the leaderboard: a{" "}
              <IntentLink href="/about" className="prose-link">
                curated list
              </IntentLink>{" "}
              of popular public repos on GitHub, GitLab and Bitbucket, rescored daily.
            </li>
            <li>
              A file counts when it has content; an empty AGENTS.md counts as none. AGENTS.md and CLAUDE.md mean the
              file at the repo root.
            </li>
            <li>
              {points.length} snapshot days from {formatDay(first.date)} to {asOf}, each the last{" "}
              <ExternalLink href={`${REPO_URL}/commits/main/data/rank.db`}>committed database</ExternalLink> that day.
              Days with no commit, or fewer than {minRepos} repos while the list was first filled, have no point.
            </li>
            <li>
              How long the files are:{" "}
              <IntentLink href={SIZE_REPORT_PATH} className="prose-link">
                AGENTS.md sizes
              </IntentLink>
              ; what is in them:{" "}
              <IntentLink href={CONTENTS_REPORT_PATH} className="prose-link">
                sections and commands
              </IntentLink>
              ; what projects allow agents to contribute:{" "}
              <IntentLink href={AI_POLICY_REPORT_PATH} className="prose-link">
                AI contribution policies
              </IntentLink>
              .
            </li>
            <li>
              How the{" "}
              <IntentLink href={checkPath("agents_md")} className="prose-link">
                AGENTS.md check
              </IntentLink>{" "}
              scores a file, and the rest of the score:{" "}
              <IntentLink href="/methodology" className="prose-link">
                methodology
              </IntentLink>
              .
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <CiteThis title={REPORT_TITLE} path={REPORT_PATH} asOf={asOf}>
          <p className={`${PROSE} mt-3 text-[13px]`}>
            Every snapshot day is in{" "}
            <a href={REPORT_CSV_PATH} download className="prose-link">
              a CSV
            </a>{" "}
            (MIT-licensed), with the count for each file. The numbers here update with every rescore; give the date you
            read them.
          </p>
        </CiteThis>
      </div>
    </>
  );
}
