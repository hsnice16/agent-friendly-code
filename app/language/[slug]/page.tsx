import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Panel, PanelHeading } from "@/components/Panel";
import { getHub, getLanguageGroups, type Hub } from "@/lib/language-hubs";
import { checkPath } from "@/lib/utils/check-path";
import { hubPath, hubTitle, isHub } from "@/lib/utils/language";
import { fitDescription, pageTitle } from "@/lib/utils/page-title";
import { repoPath } from "@/lib/utils/repo-path";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getLanguageGroups()
    .filter(isHub)
    .map((g) => ({ slug: g.slug }));
}

function hubDescription(hub: Hub): string {
  const top = `${hub.top.owner}/${hub.top.name}`;
  return fitDescription(
    `${hub.rows.length} ${hub.label} repos ranked by how ready they are for AI coding agents like Claude Code and Cursor.`,
    `Average score ${hub.average.toFixed(1)}.`,
    `${top} leads with ${(hub.top.score ?? 0).toFixed(1)}.`,
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const hub = getHub((await params).slug);
  if (!hub) {
    return {};
  }

  const path = hubPath(hub.slug);
  const title = hubTitle(hub.label);
  const description = hubDescription(hub);

  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: path, type: "website" },
  };
}

export default async function LanguageHubPage({ params }: { params: Promise<Params> }) {
  const hub = getHub((await params).slug);
  if (!hub) {
    notFound();
  }

  const path = hubPath(hub.slug);

  return (
    <>
      <BreadcrumbJsonLd parent={{ name: "Languages", path: "/language" }} current={{ name: hub.label, path }} />

      <Link
        href="/language"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← all languages
      </Link>

      <section className="mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">{hubTitle(hub.label)}</h1>

        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          {hub.rows.length} {hub.label} repos, ranked by overall score (the average across agents). They average{" "}
          <strong className="text-ink">{hub.average.toFixed(1)}</strong>, and{" "}
          <Link href={repoPath(hub.top)} className="text-ink hover:text-ink-soft">
            {hub.top.owner}/{hub.top.name}
          </Link>{" "}
          leads with <strong className="text-ink">{(hub.top.score ?? 0).toFixed(1)}</strong>.
        </p>
      </section>

      {hub.gaps.length > 0 && (
        <div className="mb-3.5">
          <Panel>
            <PanelHeading>What {hub.label} repos most often miss</PanelHeading>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14.5px] text-ink-dim">
              {hub.gaps.map((g) => (
                <li key={g.id}>
                  <Link href={checkPath(g.id)} className="font-medium text-ink hover:text-ink-soft">
                    {g.label}
                  </Link>
                  : {Math.round(g.rate * 100)}% pass rate
                </li>
              ))}
            </ul>
            <p className="mt-3 mb-0 text-[13px] text-muted">
              Leaves out checks only one agent reads, which almost no repo passes. The{" "}
              <Link href="/methodology" className="text-ink-dim hover:text-ink-soft">
                methodology
              </Link>{" "}
              explains each check.
            </p>
          </Panel>
        </div>
      )}

      <LeaderboardTable
        q=""
        page={1}
        host="all"
        startIdx={0}
        totalPages={1}
        rows={hub.rows}
        clearSearchHref={path}
        activeLabel={`${hub.label} repos, overall`}
      />
    </>
  );
}
