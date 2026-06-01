import type { RepoRow } from "@/lib/types/db";
import { compactStars, relativeTime } from "@/lib/utils/format";
import { scoreTier, TIER_TEXT_CLASS } from "@/lib/utils/score";

import { BadgeAdoptedTag } from "./BadgeAdoptedTag";
import { HostPill } from "./HostPill";
import { Panel } from "./Panel";
import { ScoreDeltaPopover } from "./ScoreDeltaPopover";

export function RepoHero({ repo }: { repo: RepoRow }) {
  const overall = repo.overall_score ?? 0;
  const overallTier = scoreTier(overall);

  const prev = repo.previous_overall_score;
  const hasDelta = prev != null && repo.overall_score != null && repo.overall_score !== prev;

  return (
    <Panel padding={false}>
      <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-6">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 break-words text-[20px] font-semibold tracking-tight sm:text-[22px]">
            {repo.owner}/{repo.name}
            <HostPill host={repo.host} />
            {repo.badge_embedded ? <BadgeAdoptedTag /> : null}
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
          {hasDelta && prev != null && repo.overall_score != null && (
            <ScoreDeltaPopover current={repo.overall_score} previous={prev} lastScoredAt={repo.last_scored_at} />
          )}
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Overall</div>
        </div>
      </div>
    </Panel>
  );
}
