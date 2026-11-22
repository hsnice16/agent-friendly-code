import type { CheckPractice } from "@/lib/check-content/practice";
import { distinctSourceLabels } from "@/lib/leaderboard-model-panel";

import { CheckPracticePanelView } from "./CheckPracticePanelView";

export function CheckPracticePanel({
  practice,
  stats,
}: {
  practice: CheckPractice;
  stats: { full: number; total: number };
}) {
  return (
    <CheckPracticePanelView
      practice={practice}
      sourceLabels={distinctSourceLabels(practice.sources)}
      stats={{ full: stats.full, total: stats.total }}
    />
  );
}
