import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CodeText } from "@/components/CodeText";
import { CopySnippet } from "@/components/CopySnippet";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { agentsReading, agentsUsingAgentsMd } from "@/lib/agent-reads";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { getCheckStats } from "@/lib/check-stats";
import { getLeaderboardStats } from "@/lib/db";
import { getInstructionFileCounts, reposWithBoth } from "@/lib/leaderboard-files";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { MODELS } from "@/lib/scoring/weights";
import { agentList } from "@/lib/utils/agent-list";
import { CHECKS_CRUMB, checkCrumb, checkPath, checkSlug, checkSubPath, signalIdFromSlug } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = Promise<{ slug: string }>;

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const COLS = "sm:grid-cols-[minmax(7rem,0.8fr)_1fr_1fr] sm:gap-x-4";
// Each cell's column name: shown when the row stacks, kept for screen readers once the header row shows.
const CELL_LABEL = "font-medium text-muted sm:sr-only";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(VS_AGENTS_MD).map((id) => ({ slug: checkSlug(id) }));
}

async function idOf(params: Params): Promise<string | null> {
  const id = signalIdFromSlug((await params).slug);
  return id && Object.hasOwn(VS_AGENTS_MD, id) ? id : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const id = await idOf(params);
  if (!id) return {};
  const { title, description } = VS_AGENTS_MD[id];
  const path = checkSubPath(id, "vs-agents-md");

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "article" },
  };
}

export default async function VsAgentsMdPage({ params }: { params: Params }) {
  const id = await idOf(params);
  if (!id) notFound();

  const c = VS_AGENTS_MD[id];
  const path = checkSubPath(id, "vs-agents-md");
  const stats = getCheckStats(id);
  const both = reposWithBoth(id);
  const { contentChangedAt } = getLeaderboardStats();
  const files = getInstructionFileCounts();
  const agentsMdRepos = files.files.find((f) => f.file === "AGENTS.md")?.count ?? 0;
  const readers = agentsReading(c.file);
  const rows: { aspect: string; theirs: ReactNode; agentsMd: ReactNode }[] = [
    ...c.rows.map((r) => ({ ...r, theirs: <CodeText text={r.theirs} />, agentsMd: <CodeText text={r.agentsMd} /> })),
    {
      aspect: "Repos with one",
      theirs: `${stats.present} of ${stats.total} (${percent(stats.present, stats.total)})`,
      agentsMd: `${agentsMdRepos} of ${files.total} (${percent(agentsMdRepos, files.total)})`,
    },
    {
      aspect: "Agents that read it",
      theirs: `${readers.length} of ${MODELS.length}: ${agentList(readers)}`,
      agentsMd: (
        <>
          {agentsUsingAgentsMd("always").length} of {MODELS.length};{" "}
          <Link href="/agents" className="prose-link">
            which ones
          </Link>
        </>
      ),
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@type": "TechArticle",
          headline: c.title,
          description: c.description,
          url: `${APP_URL}${path}`,
          image: `${APP_URL}${DEFAULT_OG_IMAGE.url}`,
          about: [
            { "@type": "Thing", name: c.name },
            { "@type": "Thing", name: "AGENTS.md" },
          ],
          citation: c.sources,
          datePublished: "2026-11-04",
          ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
          author: AUTHOR_JSON_LD,
          publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
        }}
      />
      <PageHeader
        crumbs={{ parents: [CHECKS_CRUMB, checkCrumb(id)], current: { name: `${c.name} vs AGENTS.md`, path } }}
        title={c.title}
        lead={<CodeText text={c.answer} />}
      />

      <Panel>
        <PanelHeading>How do they differ?</PanelHeading>
        {/* A <dl>, not a table: below sm each row stacks, labelling its own cells, so no column clips on a phone. */}
        <div aria-hidden="true" className={`hidden border-b border-line py-2 text-[12.5px] text-muted sm:grid ${COLS}`}>
          <span />
          <span className="font-medium">{c.name}</span>
          <span className="font-medium">AGENTS.md</span>
        </div>
        <dl className="m-0 text-[14px]">
          {rows.map((r) => (
            <div key={r.aspect} className={`grid gap-1 border-b border-line py-2.5 last:border-b-0 sm:gap-y-0 ${COLS}`}>
              <dt className="font-medium text-ink">{r.aspect}</dt>
              <dd className="m-0 text-ink-dim">
                <span className={CELL_LABEL}>{c.name}: </span>
                {r.theirs}
              </dd>
              <dd className="m-0 text-ink-dim">
                <span className={CELL_LABEL}>AGENTS.md: </span>
                {r.agentsMd}
              </dd>
            </div>
          ))}
        </dl>
        <p className={`${PROSE} mt-3 text-[13px]`}>
          {both} of the {stats.present} repos with {c.name} also have an AGENTS.md or CLAUDE.md. Empty files don&apos;t
          count.
        </p>
      </Panel>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>How do I use both?</PanelHeading>
          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            {c.steps.map((s) => (
              <li key={s}>
                <CodeText text={s} />
              </li>
            ))}
          </ol>
        </Panel>

        <Panel className="h-full">
          <PanelHeading>What does it look like?</PanelHeading>
          <p className="m-0 mb-1.5 text-[12.5px] font-medium text-muted">
            {c.agent} · <code className="text-ink-dim">{c.snippet.caption}</code>
          </p>
          <CopySnippet text={c.snippet.text} wrap={c.snippet.wrap} />
        </Panel>
      </div>

      <p className="mt-5 mb-0 text-[13px] text-muted">
        From the docs:{" "}
        {distinctSourceLabels(c.sources).map((label, i) => (
          <span key={c.sources[i]}>
            {i > 0 && " · "}
            <ExternalLink href={c.sources[i]} title={c.sources[i]}>
              {label}
            </ExternalLink>
          </span>
        ))}
      </p>
      <p className="mt-2 mb-0 text-[13px] text-muted">
        <Link href={checkPath(id)} className={LINK}>
          How we score {c.name}
        </Link>
        {" · "}
        <Link href={checkSubPath("agents_md", "vs-claude-md")} className={LINK}>
          AGENTS.md vs CLAUDE.md
        </Link>
        {" · "}
        <Link href="/guide" className={LINK}>
          Make a repo agent-ready
        </Link>
      </p>
    </>
  );
}
