import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
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
import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants/scoring";
import { DEFAULT_DIR, DEFAULT_SORT, isSortDir, isSortKey, type SortDir, type SortKey } from "@/lib/constants/sort";
import { type LeaderboardRow, listLeaderboard } from "@/lib/db";
import { MODEL_BY_ID, MODELS, type ModelId } from "@/lib/scoring/weights";
import { compactStars } from "@/lib/utils/format";

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

  const baseRows = listLeaderboard({
    dir,
    sort,
    model: selected,
    host: host === "all" ? undefined : host,
  });
  const filteredRows = q ? baseRows.filter((r) => matchesQuery(r, q)) : baseRows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / LEADERBOARD_PAGE_SIZE));

  const parsedPage = Number(sp.page);
  const page = Number.isFinite(parsedPage) ? Math.min(totalPages, Math.max(1, Math.floor(parsedPage))) : 1;

  const startIdx = (page - 1) * LEADERBOARD_PAGE_SIZE;
  const rows = filteredRows.slice(startIdx, startIdx + LEADERBOARD_PAGE_SIZE);

  const activeLabel =
    selected === "overall"
      ? "Overall (average across models)"
      : (MODELS.find((m) => m.id === selected)?.label ?? selected);

  const rationale =
    selected === "overall"
      ? "Simple average of every per-model score."
      : (MODELS.find((m) => m.id === selected)?.rationale ?? "");

  return (
    <>
      <section className="mb-5">
        <h1 className="mb-3 text-[26px] font-bold leading-[1.2] tracking-tight sm:text-[32px] sm:leading-[1.18]">
          Which public repos are friendliest to an AI coding agent?
        </h1>
        <p className="m-0 max-w-[68ch] text-[15px] text-ink-dim sm:text-base">
          Ranked per model across GitHub, GitLab, and Bitbucket — because agents aren&apos;t interchangeable.
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

      {/* Toolbar — search grows, filters + pagination beside it. Wraps on mobile. */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar />

        <div className="flex flex-wrap items-center gap-2">
          <HostSelect value={host} />
          <SortSelect sort={sort} dir={dir} />

          <Pagination
            page={page}
            size="compact"
            totalPages={totalPages}
            label="Leaderboard pages"
            hrefFor={(p) => buildHref({ model: selected, host, q, sort, dir, page: p })}
          />
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
                    key={r.id}
                    className="[&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-[13px] [&>td]:text-[15px] hover:[&>td]:bg-surface-hover last:[&>td]:border-b-0 sm:[&>td]:px-[18px]"
                  >
                    <td className="tabular-nums text-muted">
                      <Medal rank={rank} />
                    </td>
                    <td>
                      <Link href={`/repo/${r.id}`} className="font-medium text-ink hover:text-ink-soft">
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
                        rel="noopener"
                        target="_blank"
                        aria-label={`Open ${r.owner}/${r.name} on ${r.host} (new tab)`}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-ink-dim hover:text-ink-soft"
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
    </>
  );
}
