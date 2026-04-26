import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { HostPill } from "@/components/HostPill";
import { HostSelect } from "@/components/HostSelect";
import { Medal } from "@/components/Medal";
import { ModelPills } from "@/components/ModelPills";
import { Pagination } from "@/components/Pagination";
import { ScoreCell } from "@/components/ScoreCell";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { type Host, isHost } from "@/lib/constants/hosts";
import { LEADERBOARD_PAGE_SIZE, LEADERBOARD_PAGE_SIZE_MOBILE } from "@/lib/constants/scoring";
import { DEFAULT_DIR, DEFAULT_SORT, isSortDir, isSortKey, type SortDir, type SortKey } from "@/lib/constants/sort";
import { getLeaderboardStats, type LeaderboardRow, listLeaderboard, listLeaderboardOverall } from "@/lib/db";
import { MODEL_BY_ID, MODELS, type ModelId } from "@/lib/scoring/weights";
import { compactStars, relativeTime } from "@/lib/utils/format";
import { APP_URL } from "@/lib/version";

const HOME_TITLE =
  "Agent Friendly Code — AI coding agent friendliness leaderboard for Claude Code, Cursor, Devin, Codex, Gemini, Aider, OpenHands, Pi";
const HOME_DESCRIPTION =
  "Public leaderboard ranking GitHub, GitLab, and Bitbucket repos by how agent-friendly they are for Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, and Pi — per model, with AGENTS.md / CLAUDE.md, CI, tests, and dev-env signals.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  twitter: { title: HOME_TITLE, description: HOME_DESCRIPTION },
  openGraph: { title: HOME_TITLE, description: HOME_DESCRIPTION, url: "/" },
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
  const itemListJsonLd = {
    "@type": "ItemList",
    "@context": "https://schema.org",
    numberOfItems: allOverall.length,
    name: "Agent-friendliness leaderboard",
    itemListElement: allOverall.map((row, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `${row.owner}/${row.name}`,
      url: `${APP_URL}/repo/${row.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
            className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
          >
            Check any npm / PyPI / Cargo package
          </Link>{" "}
          by name.
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

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full border-separate border-spacing-0">
          <caption className="sr-only">
            Leaderboard — page {page} of {totalPages} for {activeLabel}
            {host !== "all" ? `, host=${host}` : ""}
            {q ? `, filtered by "${q}"` : ""}
          </caption>

          <thead>
            <tr className="bg-surface-2 [&>th]:border-b [&>th]:border-line [&>th]:px-3 [&>th]:py-3 [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-muted sm:[&>th]:px-[18px]">
              <th scope="col" className="w-[56px] text-left">
                <span className="sr-only">Rank</span>
              </th>
              <th scope="col" className="text-left">
                Repo
              </th>
              <th scope="col" className="text-right">
                Stars
              </th>
              <th scope="col" className="text-right">
                Score
              </th>
              <th scope="col" className="w-[90px] text-left">
                <span className="sr-only">External link</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-11 text-center text-[13px] text-muted">
                  {q ? (
                    <>
                      No repos match &ldquo;
                      <strong className="text-ink">{q}</strong>&rdquo;.{" "}
                      <Link
                        href={buildHref({
                          dir,
                          host,
                          sort,
                          page: 1,
                          model: selected,
                        })}
                        className="text-ink-dim hover:text-ink-soft"
                      >
                        Clear search
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      No repos yet. Run <code>bun run seed</code>.
                    </>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const rank = startIdx + i + 1;
                return (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable position keeps ScoreBar mounted so width transitions animate across re-renders
                    key={i}
                    className="relative cursor-pointer [&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-[13px] [&>td]:text-[15px] hover:[&>td]:bg-surface-hover last:[&>td]:border-b-0 sm:[&>td]:px-[18px]"
                  >
                    <td className="tabular-nums text-muted">
                      <Medal rank={rank} />
                    </td>
                    <td>
                      <Link
                        href={`/repo/${r.id}`}
                        aria-label={`View ${r.owner}/${r.name} details`}
                        className="font-medium text-ink hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
                      >
                        {r.owner}/{r.name}
                      </Link>
                      <HostPill host={r.host} />
                    </td>
                    <td className="text-right tabular-nums text-ink-dim">{compactStars(r.stars)}</td>
                    <td className="text-right">
                      <ScoreCell score={r.score} />
                    </td>
                    <td>
                      <a
                        href={r.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        aria-label={`Open ${r.owner}/${r.name} on ${r.host} (new tab)`}
                        className="relative inline-flex items-center gap-1 whitespace-nowrap text-ink-dim hover:text-ink-soft"
                      >
                        open <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
