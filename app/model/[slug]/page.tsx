import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants/scoring";
import { getLeaderboardStats } from "@/lib/db";
import { type LeaderboardSearchParams, resolveLeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import { isModelId, leaderboardHref, modelPath } from "@/lib/utils/leaderboard-href";
import { repoPath } from "@/lib/utils/repo-path";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<LeaderboardSearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isModelId(slug)) {
    return {};
  }

  const view = resolveLeaderboardView(slug, await searchParams);
  const { page, totalPages, filtered, filteredRows } = view;
  const { label } = MODEL_BY_ID[slug];
  const canonical = leaderboardHref(view);

  const first = (page - 1) * LEADERBOARD_PAGE_SIZE + 1;
  const last = Math.min(page * LEADERBOARD_PAGE_SIZE, filteredRows.length);
  const top = filteredRows[0];

  const title =
    page > 1 ? `${label} leaderboard page ${page} of ${totalPages}` : `Most ${label}-ready open source repos`;
  const description =
    page > 1
      ? `Repos ranked ${first} to ${last} of ${filteredRows.length} by how easy they are for ${label} to work in.`
      : `${filteredRows.length} public GitHub, GitLab and Bitbucket repos ranked by how easy they are for ${label} to work in, scored on what ${label} looks for.${
          top && !filtered ? ` ${top.owner}/${top.name} leads with ${(top.score ?? 0).toFixed(1)}.` : ""
        }`;

  // Same indexing rules as the overall board in app/page.tsx.
  return {
    title,
    description,
    alternates: { canonical },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description, url: canonical, type: "website" },
  };
}

export default async function ModelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isModelId(slug)) {
    notFound();
  }

  const view = resolveLeaderboardView(slug, await searchParams);
  const { label } = MODEL_BY_ID[slug];
  const top = view.filtered ? undefined : view.filteredRows[0];

  return (
    <>
      <BreadcrumbJsonLd current={{ name: label, path: modelPath(slug) }} />

      <section className="mb-5">
        <h1 className="mb-3 text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[32px] sm:leading-[1.18]">
          Which public repos are easiest for {label} to work in?
        </h1>

        <p className="m-0 max-w-[68ch] text-[15px] text-ink-dim sm:text-base">
          Repos from GitHub, GitLab, and Bitbucket, ranked by their {label} score rather than the average across every
          agent.
          {top && (
            <>
              {" "}
              <Link href={repoPath(top)} className="text-ink hover:text-ink-soft">
                {top.owner}/{top.name}
              </Link>{" "}
              leads with <strong className="text-ink">{(top.score ?? 0).toFixed(1)}</strong>.
            </>
          )}
        </p>

        <p className="mt-2 max-w-[68ch] text-[13px] text-muted">
          The{" "}
          <Link
            href="/methodology"
            className="border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn"
          >
            methodology
          </Link>{" "}
          lists the weight {label} gives each check and the documentation it comes from.
        </p>
      </section>

      <LeaderboardBoard view={view} stats={getLeaderboardStats()} />
    </>
  );
}
