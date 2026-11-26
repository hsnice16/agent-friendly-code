import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CodeText } from "@/components/CodeText";
import { CompareGrid, type CompareGridRow } from "@/components/CompareGrid";
import { CopySnippet } from "@/components/CopySnippet";
import { ExternalLink } from "@/components/ExternalLink";
import { IntentLink } from "@/components/IntentLink";
import { JsonLd } from "@/components/JsonLd";
import { LINK } from "@/components/link-class";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { PROSE } from "@/components/prose-class";
import { agentsReading, agentsUsingAgentsMd } from "@/lib/agent-reads";
import { AUTHOR_JSON_LD } from "@/lib/author";
import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { getCheckStats } from "@/lib/check-stats";
import { CENSUS } from "@/lib/file-census";
import { getInstructionFileCounts, reposWithBoth } from "@/lib/leaderboard-files";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";
import { vsAgentsMdModified } from "@/lib/page-dates";
import { MODELS } from "@/lib/scoring/weights";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { agentList } from "@/lib/utils/agent-list";
import { CHECKS_CRUMB, checkCrumb, checkPath, checkSlug, checkSubPath, signalIdFromSlug } from "@/lib/utils/check-path";
import { formatDay, percent } from "@/lib/utils/format";
import { pageTitle } from "@/lib/utils/page-title";
import { APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = Promise<{ slug: string }>;

// The census records root symlinks and GEMINI.md paths, but no Cursor rule paths.
function rootLinksToAgentsMd(file: string): { count: number; of: number; date: string } | null {
  if (file !== "GEMINI.md") return null;
  const withRoot = CENSUS.repos.filter((r) => !r.error && r.geminiMd.some((p) => p.toLowerCase() === "gemini.md"));
  if (withRoot.length === 0) return null;
  const count = withRoot.filter((r) => /agents\.md$/i.test(r.rootLinks[file] ?? "")).length;
  return { count, of: withRoot.length, date: CENSUS.generatedAt.slice(0, 10) };
}

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
  const modified = vsAgentsMdModified(id);
  const linked = rootLinksToAgentsMd(c.file);
  const files = getInstructionFileCounts();
  const agentsMdRepos = files.files.find((f) => f.file === "AGENTS.md")?.count ?? 0;
  const readers = agentsReading(c.file);
  const rows: CompareGridRow[] = [
    ...c.rows.map((r) => ({ aspect: r.aspect, a: <CodeText text={r.theirs} />, b: <CodeText text={r.agentsMd} /> })),
    {
      aspect: "Repos with one",
      a: `${stats.present} of ${stats.total} (${percent(stats.present, stats.total)})`,
      b: `${agentsMdRepos} of ${files.total} (${percent(agentsMdRepos, files.total)})`,
    },
    {
      aspect: "Agents that read it",
      a: `${readers.length} of ${MODELS.length}: ${agentList(readers)}`,
      b: (
        <>
          {agentsUsingAgentsMd("always").length} of {MODELS.length};{" "}
          <IntentLink href="/agents" className="prose-link">
            which ones
          </IntentLink>
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
          dateModified: modified,
          author: AUTHOR_JSON_LD,
          publisher: PUBLISHER_JSON_LD,
        }}
      />
      <PageHeader
        crumbs={{ parents: [CHECKS_CRUMB, checkCrumb(id)], current: { name: `${c.name} vs AGENTS.md`, path } }}
        title={c.title}
        lead={<CodeText text={c.answer} />}
        updated={modified}
      />

      <Panel>
        <PanelHeading>How do they differ?</PanelHeading>
        <CompareGrid heads={[c.name, "AGENTS.md"]} rows={rows} />
        <p className={`${PROSE} mt-3 text-[13px]`}>
          {both} of the {stats.present} repos with {c.name} also have an AGENTS.md or CLAUDE.md. Empty files don&apos;t
          count.
          {linked && (
            <>
              {" "}
              On {formatDay(linked.date)}, {linked.count} of the {linked.of} GitHub repos with a root {c.file} made it a
              symlink to an AGENTS.md.
            </>
          )}
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
        <IntentLink href={checkPath(id)} className={LINK}>
          How we score {c.name}
        </IntentLink>
        {" · "}
        <IntentLink href={checkSubPath("agents_md", "vs-claude-md")} className={LINK}>
          AGENTS.md vs CLAUDE.md
        </IntentLink>
        {" · "}
        <IntentLink href="/guide" className={LINK}>
          Make a repo agent-ready
        </IntentLink>
      </p>
    </>
  );
}
