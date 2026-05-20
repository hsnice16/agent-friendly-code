import type { RepoRow } from "@/lib/types/db";
import { compactStars, relativeTime } from "@/lib/utils/format";
import { scoreTier, TIER_TEXT_CLASS } from "@/lib/utils/score";

import { HostPill } from "./HostPill";
import { Panel } from "./Panel";

export function RepoHero({ repo }: { repo: RepoRow }) {
  const overall = repo.overall_score ?? 0;
  const overallTier = scoreTier(overall);

  const prev = repo.previous_overall_score;
  const scoreDiff =
    prev != null && repo.overall_score != null ? Math.round((repo.overall_score - prev) * 10) / 10 : null;

  return (
    <Panel padding={false}>
      <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-6">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 break-words text-[20px] font-semibold tracking-tight sm:text-[22px]">
            {repo.owner}/{repo.name}
            <HostPill host={repo.host} />
          </h1>

          <a
            target="_blank"
            href={repo.url}
            rel="noopener noreferrer"
            className="mt-1 block break-all text-sm text-muted"
            aria-label={`${repo.owner}/${repo.name} on ${repo.host} (new tab)`}
          >
            {repo.url}
          </a>

          <dl className="mt-3.5 flex flex-wrap gap-x-6 gap-y-1 text-[13.5px] text-muted">
            <div>
              <dt className="inline">Stars: </dt>
              <dd className="inline font-medium text-ink">{compactStars(repo.stars, false)}</dd>
            </div>

            <div>
              <dt className="inline">Default branch: </dt>
              <dd className="inline font-medium text-ink">{repo.default_branch ?? "—"}</dd>
            </div>

            <div>
              <dt className="inline">Last scored: </dt>
              <dd className="inline font-medium text-ink">
                {repo.last_scored_at ? relativeTime(repo.last_scored_at) : "—"}
                {scoreDiff != null && prev != null && scoreDiff !== 0 && (
                  <span
                    role="img"
                    className={`ml-2 ${scoreDiff < 0 ? "text-bad" : "text-ok"}`}
                    aria-label={`${scoreDiff > 0 ? "Up" : "Down"} ${Math.abs(scoreDiff).toFixed(1)} points from previous overall ${prev.toFixed(1)} out of 100`}
                  >
                    {scoreDiff > 0 ? "+" : ""}
                    {scoreDiff.toFixed(1)} pts
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="min-w-[110px] shrink-0 text-left sm:text-center">
          <div
            role="img"
            aria-label={`Overall score ${overall.toFixed(1)} out of 100`}
            className={`text-[36px] font-bold leading-none tracking-tight tabular-nums sm:text-[42px] ${TIER_TEXT_CLASS[overallTier]}`}
          >
            {overall.toFixed(1)}
          </div>
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Overall</div>
        </div>
      </div>
    </Panel>
  );
}
