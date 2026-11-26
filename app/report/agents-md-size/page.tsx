import type { Metadata } from "next";

import { AgentsMdExampleTable } from "@/components/AgentsMdExampleTable";
import { CiteThis } from "@/components/CiteThis";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { PROSE } from "@/components/prose-class";
import { ReportStat } from "@/components/ReportStat";
import { SizeBuckets, SizeQuantiles } from "@/components/SizeDistribution";
import { SizeGroupTable } from "@/components/SizeGroupTable";
import { SizeAdvice, SizeDocs } from "@/components/SizeGuidance";
import {
  type AgentsMdSize,
  buildAgentsMdSize,
  CODEX_CAP,
  DEVIN_CAP,
  sizeDescription,
  sizeTitle,
} from "@/lib/agents-md-size";
import { SIZE_GROUP_MIN } from "@/lib/constants/scoring";
import { listLeaderboardOverall } from "@/lib/db";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { sizeReportModified } from "@/lib/page-dates";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { checkPath, languageExamplesPath } from "@/lib/utils/check-path";
import { formatDate, percent } from "@/lib/utils/format";
import { ogImage } from "@/lib/utils/og-image";
import { pageTitle } from "@/lib/utils/page-title";
import { REPORT_PATH, REPORT_TITLE, SIZE_REPORT_PATH } from "@/lib/utils/report-path";
import { APP_NAME, APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const NUMBER = new Intl.NumberFormat("en-US");
const chars = (n: number | null) => (n == null ? "—" : NUMBER.format(n));
const score = (n: number | null) => (n == null ? "—" : String(Math.round(n)));

function getSize(): AgentsMdSize {
  return buildAgentsMdSize(getAgentsMdExamples().rows, listLeaderboardOverall());
}

export function generateMetadata(): Metadata {
  const size = getSize();
  const title = sizeTitle(size.measured);
  const description = sizeDescription(size);
  const image = ogImage(SIZE_REPORT_PATH, title);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: SIZE_REPORT_PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: {
      ...OG_DEFAULTS,
      images: [image],
      title,
      description,
      url: SIZE_REPORT_PATH,
      type: "article",
    },
  };
}

function jsonLd(size: AgentsMdSize, modified: string): Record<string, unknown> {
  return {
    "@type": "Dataset",
    "@id": `${APP_URL}${SIZE_REPORT_PATH}#dataset`,
    name: sizeTitle(size.measured),
    description: `Lengths in characters of the AGENTS.md or CLAUDE.md at the root of ${size.measured} repos on the ${APP_NAME} leaderboard: percentiles, size buckets, and medians by file, stars and language.`,
    url: `${APP_URL}${SIZE_REPORT_PATH}`,
    keywords: ["AGENTS.md", "CLAUDE.md", "AGENTS.md size", "CLAUDE.md length", "AI coding agents"],
    isAccessibleForFree: true,
    dateModified: modified,
    creator: PUBLISHER_JSON_LD,
    license: "https://opensource.org/licenses/MIT",
    isPartOf: { "@id": `${APP_URL}/#dataset` },
    variableMeasured: ["Instruction file length (characters)", "Overall agent-readiness score"],
  };
}

export default function AgentsMdSizePage() {
  const ex = getAgentsMdExamples();
  const size = getSize();
  const q = size.quantiles;
  const median = chars(q?.p50 ?? null);
  const modified = sizeReportModified();
  const asOf = formatDate(Date.parse(modified) / 1000);

  return (
    <>
      <JsonLd data={jsonLd(size, modified)} />
      <PageHeader
        crumbs={{ current: { name: "AGENTS.md size", path: SIZE_REPORT_PATH } }}
        title="How long should an AGENTS.md be?"
        lead={
          <>
            <strong className="text-ink">
              As of {asOf}, the median AGENTS.md or CLAUDE.md in {size.measured} popular open source repos is {median}{" "}
              characters
            </strong>
            {q && (
              <>
                , and half of them fall between {chars(q.p25)} and {chars(q.p75)}
              </>
            )}
            . Below: the spread, the files long enough that an agent loads only part of them, and what the agents&apos;
            own docs advise.
          </>
        }
        updated={modified}
      />

      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <ReportStat label="Median length" value={median} note={`characters, across ${size.measured} files`} />
        {size.byFile.map((f) => (
          <ReportStat
            key={f.label}
            label={`Median ${f.label}`}
            value={chars(f.median)}
            note={`characters, ${f.count} repos`}
          />
        ))}
        <ReportStat
          label="Over Devin's 16 KiB"
          value={percent(size.devin.over, size.devin.of)}
          note={`${size.devin.over} of ${size.devin.of} AGENTS.md files; ${size.codex.over} are over Codex's 32 KiB`}
        />
      </div>

      {q && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Sizes of {size.measured} files, in characters</PanelHeading>
            <SizeQuantiles quantiles={q} />
            <div className="mt-5">
              <SizeBuckets buckets={size.buckets} total={size.measured} />
            </div>
            <p className={`${PROSE} mt-4 text-[13px]`}>
              1K is 1,024 characters, so the last two edges are Devin&apos;s 16 KiB ({NUMBER.format(DEVIN_CAP)}) and
              Codex&apos;s 32 KiB ({NUMBER.format(CODEX_CAP)}). Those caps are in bytes; for plain ASCII text a
              character is a byte, and accents, emoji or CJK text make a file larger in bytes than its count here.
            </p>
          </Panel>
        </div>
      )}

      <div className="mt-3.5 grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
        <Panel>
          <PanelHeading>Median length by stars</PanelHeading>
          <SizeGroupTable
            rows={size.byStars.map((g) => ({ label: g.label, count: g.count, value: chars(g.median) }))}
            caption="Median instructions file length by the repo's stars"
            groupHeading="Stars"
            valueHeading="Median chars"
          />
        </Panel>
        <Panel>
          <PanelHeading>Median length by language</PanelHeading>
          <SizeGroupTable
            rows={size.byLanguage.map((g) => ({
              label: g.label,
              href: languageExamplesPath(g.slug),
              count: g.count,
              value: chars(g.median),
            }))}
            caption="Median instructions file length by the repo's main language"
            groupHeading="Language"
            valueHeading="Median chars"
          />
          <p className={`${PROSE} mt-3 text-[13px]`}>Languages with at least {SIZE_GROUP_MIN} files.</p>
        </Panel>
      </div>

      {ex.longest.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Longest and shortest files that pass</PanelHeading>
            <h3 className="m-0 mb-2 text-[14px] font-semibold text-ink">Longest</h3>
            <AgentsMdExampleTable rows={ex.longest} caption="Longest AGENTS.md or CLAUDE.md files" />
            <h3 className="m-0 mt-5 mb-2 text-[14px] font-semibold text-ink">Shortest at 800+ characters</h3>
            <AgentsMdExampleTable rows={ex.shortest} caption="Shortest AGENTS.md or CLAUDE.md files that pass" />
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel tone="warn">
          <PanelHeading tone="warn" icon="file-text">
            Is longer better?
          </PanelHeading>
          <SizeGroupTable
            rows={[
              ...size.buckets.map((b) => ({ label: b.label, count: b.count, value: score(b.medianScore) })),
              { label: "No file", count: ex.boardSize - ex.rows.length, value: score(size.medianScoreWithout) },
            ]}
            caption="Median overall score by instructions file size"
            groupHeading="Size"
            valueHeading="Median score"
          />
          <p className={`${PROSE} mt-3`}>
            Correlation, not cause. The{" "}
            <IntentLink href={checkPath("agents_md")} className="prose-link">
              AGENTS.md check
            </IntentLink>{" "}
            is part of the score and gives files under 800 characters partial credit, so the gap between no file and a
            file is partly built in. Repos that keep a detailed file may also be the ones with the tests, CI and setup
            the rest of the score counts. Nothing here says a longer file makes an agent work better.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
        <SizeDocs />
        <SizeAdvice median={median} />
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Methodology</PanelHeading>
          <ul className="m-0 ml-5 flex list-disc flex-col gap-1.5 text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              One file per repo: the AGENTS.md or CLAUDE.md the check found at the root, with content. Nested files
              aren&apos;t measured, so a repo under Codex&apos;s cap here can still exceed it once they add up.
            </li>
            <li>
              Length is characters after trimming leading and trailing whitespace. Claude Code&apos;s guidance counts
              lines, which we don&apos;t.
            </li>
            <li>
              A token is roughly four characters of English, so the median file is about{" "}
              {NUMBER.format(Math.round((q?.p50 ?? 0) / 4))} tokens; code and other languages vary.
            </li>
            <li>
              The sample is the leaderboard, rescored daily. Adoption over time:{" "}
              <IntentLink href={REPORT_PATH} className="prose-link">
                {REPORT_TITLE}
              </IntentLink>
              .
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <CiteThis title={sizeTitle(size.measured)} path={SIZE_REPORT_PATH} asOf={asOf} />
      </div>
    </>
  );
}
