import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AgentStandingsTable } from "@/components/AgentStandingsTable";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PAGE_LEAD, PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { RepoBestAgentTable } from "@/components/RepoBestAgentTable";
import { fileShares } from "@/lib/agent-files";
import { agentStandings } from "@/lib/agent-scores";
import { getAgentLanguages, getFilePresence } from "@/lib/agent-scores-data";
import { examplesByLanguage } from "@/lib/agents-md-examples";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { languageAgentsDescription, languageAgentsTitle } from "@/lib/compare-copy";
import { COMPARE_PAIRS } from "@/lib/compare-pairs";
import { getLeaderboardStats } from "@/lib/db";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import { checkPath, languageExamplesPath } from "@/lib/utils/check-path";
import { COMPARE_PATH, comparePath } from "@/lib/utils/compare-path";
import { percent } from "@/lib/utils/format";
import { GUIDE_PATH } from "@/lib/utils/guide-path";
import { hubPath, languageAgentsPath } from "@/lib/utils/language";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = Promise<{ slug: string }>;

const TOP_REPOS = 10;
const CODE = "font-mono text-[13px] text-ink";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAgentLanguages().map((g) => ({ slug: g.slug }));
}

async function load(params: Params) {
  const slug = (await params).slug;
  const group = getAgentLanguages().find((g) => g.slug === slug);
  if (!group) return null;
  const standings = agentStandings(group.rows);
  const title = languageAgentsTitle(group.label, group.rows.length);
  const description = languageAgentsDescription(group.label, group.rows.length, {
    label: standings[0].model.label,
    average: standings[0].average,
  });
  return { ...group, standings, title, description, path: languageAgentsPath(group.slug) };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const page = await load(params);
  if (!page) return {};
  const { title, description, path } = page;

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "article" },
  };
}

export default async function LanguageAgentsPage({ params }: { params: Params }) {
  const page = await load(params);
  if (!page) notFound();

  const { label, rows, standings, title, description, path } = page;
  const [first, second] = standings;
  const shares = fileShares(
    rows.map((r) => r.id),
    getFilePresence(),
  );
  const examples = examplesByLanguage(getAgentsMdExamples()).find((l) => l.slug === page.slug);
  const others = getAgentLanguages().filter((g) => g.slug !== page.slug);
  const { contentChangedAt } = getLeaderboardStats();

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: title,
          description,
          url: `${APP_URL}${path}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: [{ "@type": "ComputerLanguage", name: label }],
          datePublished: "2026-11-16",
          ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
          author: AUTHOR_JSON_LD,
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      <PageHeader
        crumbs={{
          parents: [
            { name: "Languages", path: "/language" },
            { name: label, path: hubPath(page.slug) },
          ],
          current: { name: "AI coding agents", path },
        }}
        title={title}
        lead={
          <>
            Among the {rows.length} {label} repos on our board,{" "}
            <strong className="text-ink">{first.model.label}</strong> is the agent they&apos;re best set up for on
            average, at {first.average.toFixed(1)}
            {second && (
              <>
                , ahead of {second.model.label} at {second.average.toFixed(1)}
              </>
            )}
            .
          </>
        }
      >
        <p className={`mt-2.5 ${PAGE_LEAD}`}>
          Each agent&apos;s score measures how well a repo is set up for it: instruction files, tests, CI and the other
          checks, weighted by what the agent&apos;s docs say it uses, not which agent writes better {label}.
        </p>
      </PageHeader>

      <Panel>
        <PanelHeading>How well are {label} repos set up for each agent?</PanelHeading>
        <AgentStandingsTable standings={standings} label={label} />
        <p className="mt-3 mb-0 text-[13px] text-muted">
          &ldquo;Top for&rdquo; counts the repos where the agent has the highest score; a tie counts for each agent in
          it. An agent that weighs its own file, which few repos have, scores lower in every language.
        </p>
      </Panel>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>Which agent files do {label} repos have?</PanelHeading>
          <ul className="link-list">
            {shares.map((f) => (
              <li key={f.file} className="flex items-baseline justify-between gap-3 link-row">
                <Link href={checkPath(f.signalId)} className={`${LINK} cover-link`}>
                  <code className={CODE}>{f.file}</code>
                </Link>
                <span className="tabular-nums">
                  {f.count} of {rows.length} ({percent(f.count, rows.length)})
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 mb-0 text-[13px] text-muted">
            AGENTS.md and CLAUDE.md mean the file at the repo root; a repo with both counts under AGENTS.md, and empty
            files don&apos;t count.
          </p>
        </Panel>

        <Panel tone="tip" className="h-full">
          <PanelHeading tone="tip" icon="wrench">
            How do I set up a {label} repo for agents?
          </PanelHeading>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14.5px]">
            {examples && (
              <li>
                <Link href={languageExamplesPath(page.slug)} className="arrow-link whitespace-normal">
                  {examples.guide ? `AGENTS.md for ${label}: guide and examples` : `${label} AGENTS.md examples`} →
                </Link>
              </li>
            )}
            <li>
              <Link href={hubPath(page.slug)} className="arrow-link whitespace-normal">
                Most agent-friendly {label} repos →
              </Link>
            </li>
            <li>
              <Link href="/agents" className="arrow-link whitespace-normal">
                Which files each agent reads →
              </Link>
            </li>
            <li>
              <Link href={GUIDE_PATH} className="arrow-link whitespace-normal">
                Make a repo agent-ready →
              </Link>
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Which agent is each top {label} repo best set up for?</PanelHeading>
          <RepoBestAgentTable rows={rows.slice(0, TOP_REPOS)} label={label} />
        </Panel>
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        Compare two agents:{" "}
        {COMPARE_PAIRS.map((p, i) => (
          <span key={p.slug}>
            {i > 0 && " · "}
            <Link href={comparePath(p.slug)} className={LINK}>
              {MODEL_BY_ID[p.a].label} vs {MODEL_BY_ID[p.b].label}
            </Link>
          </span>
        ))}
        {" · "}
        <Link href={COMPARE_PATH} className={LINK}>
          All comparisons
        </Link>
      </p>
      {others.length > 0 && (
        <p className="mt-2 mb-0 text-[13px] text-muted">
          Other languages:{" "}
          {others.map((g, i) => (
            <span key={g.slug}>
              {i > 0 && " · "}
              <Link href={languageAgentsPath(g.slug)} className={LINK}>
                {g.label}
              </Link>
            </span>
          ))}
        </p>
      )}
    </>
  );
}
