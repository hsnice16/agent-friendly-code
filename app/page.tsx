import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { HomeJsonLd } from "@/components/HomeJsonLd";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { ReleaseAnnouncement } from "@/components/ReleaseAnnouncement";
import { CHANGELOG } from "@/lib/changelog";
import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants/scoring";
import { getLeaderboardStats, listLeaderboardOverall } from "@/lib/db";
import { type LeaderboardSearchParams, resolveLeaderboardView } from "@/lib/leaderboard-view";
import { groupByLanguage, hubPath, isHub } from "@/lib/utils/language";
import { isModelId, leaderboardHref } from "@/lib/utils/leaderboard-href";
import { APP_NAME, APP_VERSION, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const HOME_TITLE = "Agent Friendly Code — is your codebase ready for AI agents?";
const HOME_DESCRIPTION =
  "Public GitHub, GitLab and Bitbucket repos ranked by how ready they are for AI coding agents, with a score for each agent. Or score your own codebase.";

type SearchParams = LeaderboardSearchParams & { model?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const view = resolveLeaderboardView("overall", await searchParams);
  const { page, totalPages, filtered, filteredRows } = view;

  // Every view points at itself. Canonicalising page 2+ back to `/` declared
  // the deeper pages duplicates, which drained the repos only linked from them.
  // A filtered view is a re-cut of rows that already have a home, so it takes
  // `noindex, follow`: crawlable and link-passing, just not indexed. A Disallow
  // would instead hide that directive from the crawler that has to read it.
  const canonical = leaderboardHref(view);

  // Deeper pages are indexed in their own right, so each needs its own title
  // and description or they read as copies of page 1.
  const first = (page - 1) * LEADERBOARD_PAGE_SIZE + 1;
  const last = Math.min(page * LEADERBOARD_PAGE_SIZE, filteredRows.length);
  const title = page > 1 ? `Leaderboard page ${page} of ${totalPages} — ${APP_NAME}` : HOME_TITLE;
  const description =
    page > 1
      ? `Repos ranked ${first} to ${last} of ${filteredRows.length} by how ready they are for AI coding agents, with a score for each agent.`
      : HOME_DESCRIPTION;

  return {
    title,
    description,
    alternates: { canonical },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
    twitter: { ...TWITTER_DEFAULTS, title, description },
    openGraph: { ...OG_DEFAULTS, title, description, url: canonical, type: "website" },
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  // An agent's board used to be `/?model=<id>`; those links are still out there.
  if (isModelId(sp.model)) {
    permanentRedirect(leaderboardHref(resolveLeaderboardView(sp.model, sp)));
  }

  const view = resolveLeaderboardView("overall", sp);
  const stats = getLeaderboardStats();

  const allOverall = listLeaderboardOverall();
  const hubs = groupByLanguage(allOverall).filter(isHub);

  return (
    <>
      <HomeJsonLd allOverall={allOverall} contentChangedAt={stats.contentChangedAt} />

      <section className="mb-5">
        <h1 className="mb-3 text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[32px] sm:leading-[1.18]">
          Which public repos are easiest for AI coding agents to work in?
        </h1>
        <p className="m-0 max-w-[68ch] text-[15px] text-ink-dim sm:text-base">
          Repos from GitHub, GitLab, and Bitbucket, scored on what each agent looks for, then ranked.
        </p>

        <p className="mt-2 max-w-[68ch] text-[13px] text-muted">
          Checking a package you use?{" "}
          <Link
            href="/package"
            className="border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn"
          >
            Check any npm / PyPI / Cargo package
          </Link>{" "}
          by name.
        </p>

        <p className="mt-1.5 max-w-[68ch] text-[13px] text-muted">
          Your own codebase?{" "}
          <Link
            href="/score"
            className="border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn"
          >
            Score any public GitHub repo
          </Link>{" "}
          from its latest commit, run the{" "}
          <Link
            href="/skill"
            className="border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn"
          >
            agent skill
          </Link>{" "}
          inside it, or add the{" "}
          <Link
            href="/action"
            className="border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn"
          >
            GitHub Action
          </Link>{" "}
          to score every pull request.
        </p>
      </section>

      <LeaderboardBoard view={view} stats={stats} />

      {/* Announced only once the release it describes is the one deployed —
          otherwise a version bump ahead of the changelog entry (or behind it)
          would advertise the wrong thing. It sits above the section that
          release is about, so move it when the next one is cut. */}
      {hubs.length > 0 && CHANGELOG[0]?.label === APP_VERSION && (
        <ReleaseAnnouncement version={APP_VERSION} title={CHANGELOG[0].title} />
      )}

      {hubs.length > 0 && (
        <nav
          aria-label="Browse by language"
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted"
        >
          <span>Browse by language:</span>
          {hubs.map((g) => (
            <Link key={g.slug} href={hubPath(g.slug)} className="text-ink-dim hover:text-ink-soft">
              {g.label}
            </Link>
          ))}
          <Link href="/language" className="text-ink-dim hover:text-ink-soft">
            All languages →
          </Link>
        </nav>
      )}
    </>
  );
}
