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
      rank={"rank" in summary ? { rank: summary.rank, total: summary.total, note: rankNote(summary) } : undefined}
      passing={passing}
      signalCount={signalCount}
      best={
        best && {
          label: best.tiedWith > 0 ? `${best.model.label} + ${best.tiedWith} more` : best.model.label,
          score: best.score,
        }
      }
      worst={
        worst && {
          label: worst.model.label,
          score: worst.score,
          fix: worstGap ? `Biggest fix: ${worstGap.label} (+${worstGap.scoreGain.toFixed(1)} pts)` : null,
        }
      }
    />
  );
}
