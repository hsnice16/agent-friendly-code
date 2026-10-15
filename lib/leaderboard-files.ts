import { cache } from "react";

import { type AgentsMdExamples, buildAgentsMdExamples } from "./agents-md-examples";
import { getCheckStats } from "./check-stats";
import { listLeaderboardOverall, listSignalFiles } from "./db";
import { buildModelPanel, type ModelPanel } from "./leaderboard-model-panel";
import type { ModelProfile } from "./scoring/weights";

export const getAgentsMdExamples = cache(
  (): AgentsMdExamples => buildAgentsMdExamples(listLeaderboardOverall(), listSignalFiles("agents_md")),
);

export function getModelPanel(model: ModelProfile): ModelPanel {
  const claudeMd = getAgentsMdExamples()
    .byFile.filter((f) => f.file.toLowerCase() === "claude.md")
    .reduce((n, f) => n + f.count, 0);
  return buildModelPanel(model, { countsOf: (id) => getCheckStats(id), claudeMd });
}
