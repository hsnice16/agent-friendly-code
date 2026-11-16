import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeText } from "@/components/CodeText";
import { CompareReads } from "@/components/CompareReads";
import { LanguageLeadTable, WeightGapTable } from "@/components/CompareTables";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { ScoreGapList } from "@/components/ScoreGapList";
import { AGENT_READS } from "@/lib/agent-reads";
import { comparePair, ownFile, weightGaps } from "@/lib/agent-scores";
import { getScoredRepos } from "@/lib/agent-scores-data";
import { SETUP_TIP } from "@/lib/agent-setup-tips";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { compareAnswer, compareDescription, compareTitle } from "@/lib/compare-copy";
import { COMPARE_PAIRS, type ComparePair, pairBySlug } from "@/lib/compare-pairs";
import { LANGUAGE_AGENTS_MIN_REPOS } from "@/lib/constants/scoring";
import { getLeaderboardStats } from "@/lib/db";
import { getInstructionFileCounts } from "@/lib/leaderboard-files";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { MODEL_BY_ID, type ModelProfile } from "@/lib/scoring/weights";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { COMPARE_CRUMB, comparePath } from "@/lib/utils/compare-path";
import { percent } from "@/lib/utils/format";
import { GUIDE_PATH } from "@/lib/utils/guide-path";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = Promise<{ pair: string }>;

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARE_PAIRS.map((p) => ({ pair: p.slug }));
}

function load(pair: ComparePair) {
  return comparePair(getScoredRepos(), pair.a, pair.b, LANGUAGE_AGENTS_MIN_REPOS);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const pair = pairBySlug((await params).pair);
  if (!pair) return {};
  const title = compareTitle(pair);
  const description = compareDescription(pair, load(pair));
  const path = comparePath(pair.slug);

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "article" },
  };
}

export default async function ComparePage({ params }: { params: Params }) {
  const pair = pairBySlug((await params).pair);
  if (!pair) notFound();

  const a = MODEL_BY_ID[pair.a];
  const b = MODEL_BY_ID[pair.b];
  const path = comparePath(pair.slug);
  const title = compareTitle(pair);
  const stats = load(pair);
  const gaps = weightGaps(a, b);
  const files = getInstructionFileCounts();
  const sources = [...new Set([a, b].flatMap((m) => [...m.sources, ...(AGENT_READS[m.id].sources ?? [])]))];
  const { contentChangedAt } = getLeaderboardStats();
  const others = COMPARE_PAIRS.filter((p) => p.slug !== pair.slug);

  const ownFileRow = {
    aspect: "Repos with its own file",
    cell: (m: ModelProfile) => {
      const own = ownFile(m);
      const row = files.files.find((f) => f.file === own.file);
      const count = row?.count ?? 0;
      return (
        <>
          <Link href={checkPath(own.signalId)} className="prose-link">
            {own.file}
          </Link>
          {row?.qualifier && ` ${row.qualifier}`}: {count} of {files.total} ({percent(count, files.total)})
        </>
      );
    },
  };

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: title,
          description: compareDescription(pair, stats),
          url: `${APP_URL}${path}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: [a, b].map((m) => ({ "@type": "SoftwareApplication", name: m.label })),
          citation: sources,
          datePublished: "2026-11-16",
          ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
          author: AUTHOR_JSON_LD,
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      <PageHeader
        crumbs={{ parents: [COMPARE_CRUMB], current: { name: `${a.label} vs ${b.label}`, path } }}
        title={title}
        lead={compareAnswer(pair, stats)}
      >
        <p className={`mt-2.5 ${PAGE_LEAD}`}>
          Scores measure how well each repo is set up for an agent: instruction files, tests, CI and the other checks,
          weighted by what each agent&apos;s docs say it uses, not which agent writes better code.
        </p>
      </PageHeader>

      <Panel>
        <PanelHeading>Which files does each one read?</PanelHeading>
        <CompareReads a={a} b={b} extra={[ownFileRow]} />
        <p className={`${PROSE} mt-3 text-[13px]`}>
          AGENTS.md and CLAUDE.md mean the file at the repo root; a repo with both counts under AGENTS.md, and empty
          files don&apos;t count.{" "}
          <Link href="/agents" className="prose-link">
            Every agent&apos;s files
          </Link>
          .
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Which checks does each weigh more?</PanelHeading>
          <WeightGapTable a={a} b={b} gaps={gaps} />
          <p className={`${PROSE} mt-3 text-[13px]`}>
            Each figure is the check&apos;s share of the agent&apos;s total weight, from the docs linked below. A check
            few repos pass, such as an agent&apos;s own file, lowers that agent&apos;s scores wherever it carries
            weight. The{" "}
            <Link href="/methodology" className="prose-link">
              methodology
            </Link>{" "}
            lists every weight.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        {(["a", "b"] as const).map((side) => {
          const [ahead, behind] = side === "a" ? [a, b] : [b, a];
          return (
            <Panel key={side} className="h-full">
              <PanelHeading>
                Which repos are set up better for {ahead.label} than {behind.label}?
              </PanelHeading>
              <ScoreGapList gaps={side === "a" ? stats.aAhead : stats.bAhead} ahead={side} behind={behind.label} />
            </Panel>
          );
        })}
      </div>

      {stats.languages.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Which one leads in each language?</PanelHeading>
            <LanguageLeadTable a={a} b={b} languages={stats.languages} />
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel tone="tip">
          <PanelHeading tone="tip">What if I use both?</PanelHeading>
          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              Write the shared instructions once, in AGENTS.md at the repo root.{" "}
              <Link href={checkPath("agents_md")} className="prose-link">
                What to put in it
              </Link>
              .
            </li>
            {[a, b].map((m) => (
              <li key={m.id}>
                <CodeText text={SETUP_TIP[m.id]} />
              </li>
            ))}
          </ol>
          <p className={`${PROSE} mt-3 text-[13px]`}>
            <Link href={checkSubPath("agents_md", "vs-claude-md")} className="prose-link">
              AGENTS.md vs CLAUDE.md
            </Link>{" "}
            ·{" "}
            <Link href="/agents" className="prose-link">
              Which files each agent reads
            </Link>{" "}
            ·{" "}
            <Link href={GUIDE_PATH} className="prose-link">
              Make a repo agent-ready
            </Link>
          </p>
        </Panel>
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        From the docs:{" "}
        {distinctSourceLabels(sources).map((label, i) => (
          <span key={sources[i]}>
            {i > 0 && " · "}
            <ExternalLink href={sources[i]} title={sources[i]}>
              {label}
            </ExternalLink>
          </span>
        ))}
      </p>
      <p className="mt-2 mb-0 text-[13px] text-muted">
        Boards:{" "}
        <Link href={modelPath(a.id)} className={LINK}>
          best set up for {a.label}
        </Link>
        {" · "}
        <Link href={modelPath(b.id)} className={LINK}>
          best set up for {b.label}
        </Link>
      </p>
      <p className="mt-2 mb-0 text-[13px] text-muted">
        More comparisons:{" "}
        {others.map((p, i) => (
          <span key={p.slug}>
            {i > 0 && " · "}
            <Link href={comparePath(p.slug)} className={LINK}>
              {MODEL_BY_ID[p.a].label} vs {MODEL_BY_ID[p.b].label}
            </Link>
          </span>
        ))}
      </p>
    </>
  );
}
