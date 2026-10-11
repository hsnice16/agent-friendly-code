import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants/scoring";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import type { LeaderboardStats } from "@/lib/types/db";
import { relativeTime } from "@/lib/utils/format";
import { leaderboardHref } from "@/lib/utils/leaderboard-href";
import { HostSelect } from "./HostSelect";
import { LeaderboardTable } from "./LeaderboardTable";
import { ModelPills } from "./ModelPills";
import { Pagination } from "./Pagination";
import { SearchBar } from "./SearchBar";
import { SortSelect } from "./SortSelect";

export function LeaderboardBoard({ view, stats }: { view: LeaderboardView; stats: LeaderboardStats }) {
  const { q, page, totalPages, dir, sort, host, model, filteredRows } = view;

  const startIdx = (page - 1) * LEADERBOARD_PAGE_SIZE;
  const rows = filteredRows.slice(startIdx, startIdx + LEADERBOARD_PAGE_SIZE);

  const activeLabel = model === "overall" ? "Overall (average of all agents)" : MODEL_BY_ID[model].label;
  const rationale = model === "overall" ? "The average of every agent's score." : MODEL_BY_ID[model].rationale;

  return (
    <>
      <ModelPills includeOverall selected={model} hrefFor={(id) => leaderboardHref({ ...view, model: id, page: 1 })} />
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
        clearSearchHref={leaderboardHref({ ...view, q: "", page: 1 })}
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
          hrefFor={(p) => leaderboardHref({ ...view, page: p })}
        />
      </div>
    </>
  );
}
