import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AgentsMdExampleTable } from "@/components/AgentsMdExampleTable";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CheckRepoList } from "@/components/CheckRepoList";
import { CodeText } from "@/components/CodeText";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { type AgentsMdExamples, examplesDescription, examplesTitle } from "@/lib/agents-md-examples";
import { CHECK_CONTENT } from "@/lib/check-content";
import { getLeaderboardStats } from "@/lib/db";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { SIGNAL_BY_ID } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { checkPath, checkSlug } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { hubPath } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const SIGNAL_ID = "agents_md";
const PATH = `${checkPath(SIGNAL_ID)}/examples`;
const TOP_STARRED = 20;

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";
const LINK = "text-ink underline-offset-4 hover:text-ink-soft hover:underline";

// Only AGENTS.md is common enough to fill an examples page; every other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: checkSlug(SIGNAL_ID) }];
}

export function generateMetadata(): Metadata {
  const ex = getAgentsMdExamples();
  const title = examplesTitle(ex.rows.length);
  const description = examplesDescription(ex);

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: PATH },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: PATH, type: "website" },
  };
}

function jsonLd(ex: AgentsMdExamples, contentChangedAt: number | null) {
  return {
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${APP_URL}${PATH}#page`,
        url: `${APP_URL}${PATH}`,
        name: examplesTitle(ex.rows.length),
        description: examplesDescription(ex),
        about: { "@type": "Thing", name: "AGENTS.md" },
        isPartOf: { "@id": `${APP_URL}/#site` },
        ...(contentChangedAt != null ? { dateModified: new Date(contentChangedAt * 1000).toISOString() } : {}),
        mainEntity: {
          "@type": "ItemList",
          name: "Open source repos with an AGENTS.md or CLAUDE.md",
          numberOfItems: ex.rows.length,
          itemListElement: ex.rows.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${r.owner}/${r.name}`,
            url: `${APP_URL}${repoPath(r)}`,
          })),
        },
      },
    ],
  };
}

export default async function AgentsMdExamplesPage({ params }: { params: Promise<{ slug: string }> }) {
  if ((await params).slug !== checkSlug(SIGNAL_ID)) {
    notFound();
  }

  const ex = getAgentsMdExamples();
  const readers = MODELS.map((m) => ({ m, weight: m.weights[SIGNAL_ID] ?? 0 }))
    .filter((r) => r.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return (
    <>
      <JsonLd data={jsonLd(ex, getLeaderboardStats().contentChangedAt)} />
      <Breadcrumbs
        parents={[
          { name: "Checks", path: "/check" },
          { name: SIGNAL_BY_ID[SIGNAL_ID].label, path: checkPath(SIGNAL_ID) },
        ]}
        current={{ name: "Examples", path: PATH }}
      />

      <section className="mb-7">
        <h1 className="mb-2.5 text-[28px] font-bold leading-[1.18] tracking-tight">
          AGENTS.md examples from {ex.rows.length} open source repos
        </h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] leading-relaxed text-ink-dim">
          Of the {ex.boardSize} repos on the leaderboard, {ex.rows.length} have an AGENTS.md or CLAUDE.md at the root,
          and {ex.passing} of those files are long enough (800 characters or more) to pass the{" "}
          <Link href={checkPath(SIGNAL_ID)} className={LINK}>
            AGENTS.md check
          </Link>{" "}
          in full. Each file name below links to the file on its host, so you can read how a popular project explains
          itself to an agent.
        </p>
      </section>

      <Panel>
        <PanelHeading>Most-starred repos with an AGENTS.md or CLAUDE.md</PanelHeading>
        <AgentsMdExampleTable
          rows={ex.rows.slice(0, TOP_STARRED)}
          caption="Most-starred repos with an AGENTS.md or CLAUDE.md"
        />
      </Panel>

      {ex.longest.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Longest and shortest files that pass</PanelHeading>
            <h3 className="m-0 mb-2 text-[14px] font-semibold text-ink">Longest</h3>
            <AgentsMdExampleTable rows={ex.longest} caption="Longest AGENTS.md or CLAUDE.md files that pass" />
            <h3 className="mt-4 mb-2 text-[14px] font-semibold text-ink">Shortest</h3>
            <AgentsMdExampleTable rows={ex.shortest} caption="Shortest AGENTS.md or CLAUDE.md files that pass" />
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>AGENTS.md or CLAUDE.md: which file repos use</PanelHeading>
          <ul className="m-0 mb-3 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
            {ex.byFile.map((f) => (
              <li key={f.file}>
                <code className="font-mono text-[13px] text-ink">{f.file}</code>: {f.count} repos ({f.passing} pass in
                full)
              </li>
            ))}
          </ul>
          <p className={PROSE}>
            The check accepts AGENTS.md, CLAUDE.md or AGENT.md at the repo root and reads the first one it finds, in
            that order, so a repo with both files is counted under AGENTS.md. Either name passes for every agent.
          </p>
          <p className={`${PROSE} mt-3`}>
            <CodeText text={CHECK_CONTENT[SIGNAL_ID].why} />
          </p>
          <p className="mt-3 mb-1.5 text-[13px] text-muted">The weight each agent gives this check:</p>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1 p-0 text-[14px] text-ink-dim sm:grid-cols-3">
            {readers.map(({ m, weight }) => (
              <li key={m.id} className="flex items-baseline justify-between gap-3">
                <Link href={modelPath(m.id)} className={LINK}>
                  {m.label}
                </Link>
                <span className="tabular-nums">{weight.toFixed(1)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 mb-0 text-[13px] text-muted">
            The{" "}
            <Link href="/methodology" className={LINK}>
              methodology
            </Link>{" "}
            links the docs each agent&apos;s weights come from.
          </p>
        </Panel>
      </div>

      {ex.missing.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Popular repos without one</PanelHeading>
            <CheckRepoList rows={ex.missing} />
          </Panel>
        </div>
      )}

      {ex.languages.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>By language</PanelHeading>
            <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-1.5 p-0 text-[14px] text-ink-dim sm:grid-cols-2 md:grid-cols-3">
              {ex.languages.map((l) => (
                <li key={l.slug} className="flex items-baseline justify-between gap-3">
                  <Link href={hubPath(l.slug)} className={LINK}>
                    {l.label}
                  </Link>
                  <span className="tabular-nums">
                    {l.withFile} of {l.total} ({percent(l.withFile, l.total)})
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Every file ({ex.rows.length})</PanelHeading>
          <AgentsMdExampleTable rows={ex.rows} caption="Every repo on the leaderboard with an AGENTS.md or CLAUDE.md" />
        </Panel>
      </div>
    </>
  );
}
