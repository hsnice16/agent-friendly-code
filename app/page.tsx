import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
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
import { LEADERBOARD_PAGE_SIZE, LEADERBOARD_PAGE_SIZE_MOBILE } from "@/lib/constants/scoring";
import { DEFAULT_DIR, DEFAULT_SORT, isSortDir, isSortKey, type SortDir, type SortKey } from "@/lib/constants/sort";
import { getLeaderboardStats, listLeaderboard, listLeaderboardOverall } from "@/lib/db";
import { MODEL_BY_ID, MODELS, type ModelId } from "@/lib/scoring/weights";
import type { LeaderboardRow } from "@/lib/types/db";
import { relativeTime } from "@/lib/utils/format";
import { APP_VERSION, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const HOME_TITLE =
  "Agent Friendly Code — AI coding agent friendliness leaderboard for Claude Code, Cursor, Devin, Codex, Gemini, Kimi, Aider, OpenHands, Pi";
const HOME_DESCRIPTION =
  "Public leaderboard ranking GitHub, GitLab, and Bitbucket repos by how agent-friendly they are for Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, and Pi — per model, with AGENTS.md / CLAUDE.md, CI, tests, and dev-env signals.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  twitter: { ...TWITTER_DEFAULTS, title: HOME_TITLE, description: HOME_DESCRIPTION },
  openGraph: { ...OG_DEFAULTS, title: HOME_TITLE, description: HOME_DESCRIPTION, url: "/", type: "website" },
};

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
  p.set("model", parts.model);

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

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const selected: ModelId | "overall" = sp.model && sp.model in MODEL_BY_ID ? (sp.model as ModelId) : "overall";

  const q = sp.q ?? "";
  const host: Host | "all" = isHost(sp.host) ? sp.host : "all";
  const dir: SortDir = isSortDir(sp.dir) ? sp.dir : DEFAULT_DIR;
  const sort: SortKey = isSortKey(sp.sort) ? sp.sort : DEFAULT_SORT;

  const ua = (await headers()).get("user-agent") ?? "";
  const isMobile = /Mobi|Android|iPhone|iPod/i.test(ua);
  const pageSize = isMobile ? LEADERBOARD_PAGE_SIZE_MOBILE : LEADERBOARD_PAGE_SIZE;

  const baseRows = listLeaderboard({
    dir,
    sort,
    model: selected,
    host: host === "all" ? undefined : host,
  });

  const filteredRows = q ? baseRows.filter((r) => matchesQuery(r, q)) : baseRows;

  const stats = getLeaderboardStats();
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const parsedPage = Number(sp.page);
  const page = Number.isFinite(parsedPage) ? Math.min(totalPages, Math.max(1, Math.floor(parsedPage))) : 1;

  const startIdx = (page - 1) * pageSize;
  const rows = filteredRows.slice(startIdx, startIdx + pageSize);

  const activeLabel =
    selected === "overall"
      ? "Overall (average across models)"
      : (MODELS.find((m) => m.id === selected)?.label ?? selected);

  const rationale =
    selected === "overall"
      ? "Simple average of every per-model score."
      : (MODELS.find((m) => m.id === selected)?.rationale ?? "");

  const allOverall = listLeaderboardOverall();

  return (
    <>
      <HomeJsonLd allOverall={allOverall} lastScoredAt={stats.lastScoredAt} />

      {/* Announced only once the release it describes is the one deployed —
          otherwise a version bump ahead of the changelog entry (or behind it)
          would advertise the wrong thing. */}
      {CHANGELOG[0]?.label === APP_VERSION && (
        <ReleaseAnnouncement anchorHref="/score" version={APP_VERSION} title={CHANGELOG[0].title} />
      )}
      <section className="mb-5">
        <h1 className="mb-3 text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[32px] sm:leading-[1.18]">
          Which public repos are friendliest to an AI coding agent?
        </h1>
        <p className="m-0 max-w-[68ch] text-[15px] text-ink-dim sm:text-base">
          Ranked per model across GitHub, GitLab, and Bitbucket — because agents aren&apos;t interchangeable.
        </p>

        <p className="mt-2 max-w-[68ch] text-[13px] text-muted">
          Looking up a dependency?{" "}
          <Link
            href="/package"
            className="border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn"
          >
            Check any npm / PyPI / Cargo package
          </Link>{" "}
          by name.
        </p>

        <p className="mt-1.5 max-w-[68ch] text-[13px] text-muted">
          Repo not on the board?{" "}
          <Link
            href="/score"
            className="border-b border-dotted border-warn/60 text-warn hover:border-warn hover:text-warn"
          >
            Score any public GitHub repo live
          </Link>{" "}
          from its current commit.
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
    </>
  );
}
