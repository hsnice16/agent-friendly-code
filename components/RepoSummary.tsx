import { pageOfRank } from "@/lib/board";
import { checkPath } from "@/lib/utils/check-slug";
import { boardPagePath, modelPath } from "@/lib/utils/leaderboard-href";
import { type ScoreSummary, type RepoSummary as Summary, topPercent } from "@/lib/utils/repo-summary";

import { RepoSummaryView } from "./RepoSummaryView";

function rankNote(summary: Summary): string {
  const { languageRank } = summary;
  const top = topPercent(summary);
  return [
    top != null ? `Top ${top}%` : null,
    languageRank ? `#${languageRank.rank} of ${languageRank.total} ${languageRank.language} repos` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** The summary's fits carry whole model profiles; the view gets their labels. */
export function RepoSummary({ summary }: { summary: Summary | ScoreSummary }) {
  const { passing, signalCount, best, worst, worstGap } = summary;

  return (
    <RepoSummaryView
      rank={
        "rank" in summary
          ? {
              rank: summary.rank,
              total: summary.total,
              note: rankNote(summary),
              href: boardPagePath("overall", pageOfRank(summary.rank)),
            }
          : undefined
      }
      passing={passing}
      signalCount={signalCount}
      best={
        best && {
          label: best.tiedWith > 0 ? `${best.model.label} + ${best.tiedWith} more` : best.model.label,
          score: best.score,
          href: modelPath(best.model.id),
        }
      }
      worst={
        worst && {
          label: worst.model.label,
          score: worst.score,
          fix: worstGap ? `Biggest fix: ${worstGap.label} (+${worstGap.scoreGain.toFixed(1)} pts)` : null,
          href: worstGap ? checkPath(worstGap.signalId) : modelPath(worst.model.id),
        }
      }
    />
  );
}
