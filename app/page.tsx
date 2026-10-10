import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { HomeJsonLd } from "@/components/HomeJsonLd";
import { HostSelect } from "@/components/HostSelect";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { ModelPills } from "@/components/ModelPills";
import { Pagination } from "@/components/Pagination";
import { ReleaseAnnouncement } from "@/components/ReleaseAnnouncement";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { CHANGELOG } from "@/lib/changelog";
import { type Host, isHost } from "@/lib/constants/hosts";
import { LEADERBOARD_PAGE_SIZE, MAX_SEARCH_LENGTH } from "@/lib/constants/scoring";
import { DEFAULT_DIR, DEFAULT_SORT, isSortDir, isSortKey, type SortDir, type SortKey } from "@/lib/constants/sort";
import { getLeaderboardStats, listLeaderboard, listLeaderboardOverall } from "@/lib/db";
import { MODEL_BY_ID, MODELS, type ModelId } from "@/lib/scoring/weights";
import type { LeaderboardRow } from "@/lib/types/db";
import { relativeTime } from "@/lib/utils/format";
import { groupByLanguage, hubPath, isHub } from "@/lib/utils/language";
import { APP_NAME, APP_VERSION, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const HOME_TITLE = "Agent Friendly Code — is your codebase ready for AI agents?";
const HOME_DESCRIPTION =
  "Public GitHub, GitLab and Bitbucket repos ranked by how ready they are for AI coding agents, with a score for each agent. Or score your own codebase.";

type SearchParams = {
  q?: string;
  dir?: string;
  host?: string;
  page?: string;
  sort?: string;
  model?: string;
};

type HrefParts = {
  q?: string;
  dir: SortDir;
  page: number;
  sort: SortKey;
  host: Host | "all";
  model: ModelId | "overall";
};

function buildHref(parts: HrefParts): string {
  const p = new URLSearchParams();

  // Defaults stay out of the URL so the unfiltered board has one address —
  // `/`, never a second copy of it at `/?model=overall`.
  if (parts.model !== "overall") {
    p.set("model", parts.model);
  }
  if (parts.host !== "all") {
    p.set("host", parts.host);
  }
  if (parts.q) {
    p.set("q", parts.q);
  }
  if (parts.sort !== DEFAULT_SORT) {
    p.set("sort", parts.sort);
  }
  if (parts.dir !== DEFAULT_DIR) {
    p.set("dir", parts.dir);
  }
  if (parts.page > 1) {
    p.set("page", String(parts.page));
  }

  const s = p.toString();
  return s ? `/?${s}` : "/";
}

function matchesQuery(row: LeaderboardRow, q: string): boolean {
  return `${row.owner}/${row.name}`.toLowerCase().includes(q.trim().toLowerCase());
}

type View = {
  q: string;
  page: number;
  totalPages: number;
  dir: SortDir;
  sort: SortKey;
  host: Host | "all";
  selected: ModelId | "overall";
  filteredRows: LeaderboardRow[];
};

// Shared by generateMetadata and the page body, which run in one request
// scope — without this the whole board is queried and filtered twice.
const resolveView = cache(async (sp: SearchParams): Promise<View> => {
  const selected: ModelId | "overall" = sp.model && sp.model in MODEL_BY_ID ? (sp.model as ModelId) : "overall";

  const q = (sp.q ?? "").slice(0, MAX_SEARCH_LENGTH);
  const host: Host | "all" = isHost(sp.host) ? sp.host : "all";
  const dir: SortDir = isSortDir(sp.dir) ? sp.dir : DEFAULT_DIR;
  const sort: SortKey = isSortKey(sp.sort) ? sp.sort : DEFAULT_SORT;

  const baseRows = listLeaderboard({
    dir,
    sort,
    model: selected,
    host: host === "all" ? undefined : host,
  });

  const filteredRows = q ? baseRows.filter((r) => matchesQuery(r, q)) : baseRows;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / LEADERBOARD_PAGE_SIZE));

  // Out-of-range clamps rather than 404s, so a stale or hand-typed page number
  // still lands on rows; the canonical below folds it onto the page it shows.
  const parsedPage = Number(sp.page);
  const page = Number.isFinite(parsedPage) ? Math.min(totalPages, Math.max(1, Math.floor(parsedPage))) : 1;

  return { q, page, totalPages, dir, sort, host, selected, filteredRows };
});

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const { q, page, totalPages, dir, sort, host, selected, filteredRows } = await resolveView(await searchParams);
  const canonical = buildHref({ model: selected, host, q, sort, dir, page });

  // Every view points at itself. Canonicalising page 2+ back to `/` declared
  // the deeper pages duplicates, which drained the repos only linked from them.
  // A filtered view is a re-cut of rows that already have a home, so it takes
  // `noindex, follow`: crawlable and link-passing, just not indexed. A Disallow
  // would instead hide that directive from the crawler that has to read it.
  const filtered = selected !== "overall" || host !== "all" || q !== "" || sort !== DEFAULT_SORT || dir !== DEFAULT_DIR;

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
  const { q, page, totalPages, dir, sort, host, selected, filteredRows } = await resolveView(await searchParams);

  const stats = getLeaderboardStats();
  const startIdx = (page - 1) * LEADERBOARD_PAGE_SIZE;
  const rows = filteredRows.slice(startIdx, startIdx + LEADERBOARD_PAGE_SIZE);

  const activeLabel =
    selected === "overall"
      ? "Overall (average of all agents)"
      : (MODELS.find((m) => m.id === selected)?.label ?? selected);

  const rationale =
    selected === "overall"
      ? "The average of every agent's score."
      : (MODELS.find((m) => m.id === selected)?.rationale ?? "");

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

      <ModelPills
        includeOverall
        selected={selected}
        hrefFor={(id) => buildHref({ model: id, host, q, sort, dir, page: 1 })}
      />
      <div className="mx-0.5 mb-5 -mt-0.5 max-w-[80ch] text-[13px] leading-[1.55] text-muted">
        <strong className="text-ink-dim">{activeLabel}</strong> — {rationale}
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar />

        <div className="flex flex-wrap items-center gap-2">
          <HostSelect value={host} />
          <SortSelect sort={sort} dir={dir} />
        </div>
      </div>

      <LeaderboardTable
        q={q}
        host={host}
        page={page}
        rows={rows}
        startIdx={startIdx}
        totalPages={totalPages}
        activeLabel={activeLabel}
        clearSearchHref={buildHref({ dir, host, sort, page: 1, model: selected })}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-[12.5px] text-muted">
          Tracking <strong className="font-medium text-ink-dim">{stats.count}</strong>{" "}
          {stats.count === 1 ? "repo" : "repos"}
          {stats.lastScoredAt != null && (
            <>
              {" · "}last updated{" "}
              <time dateTime={new Date(stats.lastScoredAt * 1000).toISOString()}>
                {relativeTime(stats.lastScoredAt)}
              </time>
            </>
          )}
        </p>

        <Pagination
          page={page}
          size="compact"
          totalPages={totalPages}
          label="Leaderboard pages"
          hrefFor={(p) => buildHref({ model: selected, host, q, sort, dir, page: p })}
        />
      </div>

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
