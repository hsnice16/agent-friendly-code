import { agentStandings, ownFile } from "../agent-scores";
import { getScoredRepos } from "../agent-scores-data";
import { getLeaderboardStats } from "../db";
import { getInstructionFileCounts } from "../leaderboard-files";
import type { ModelId } from "../scoring/weights";

export type AgentBoardRow = {
  id: ModelId;
  label: string;
  average: number;
  median: number | null;
  file: string;
  fileCount: number;
};

export type AgentBoard = { rows: AgentBoardRow[]; total: number; scoredOn: string | null };

/** The agentBoard block's live columns, best-set-up agent first. */
export function getAgentBoard(): AgentBoard {
  const files = getInstructionFileCounts();
  const at = getLeaderboardStats().lastScoredAt;
  const rows = agentStandings(getScoredRepos()).map(({ model, average, median }) => {
    const own = ownFile(model);
    const count = files.files.find((f) => f.file === own.file)?.count ?? 0;
    // The AGENTS.md check stops at the first file, so CLAUDE.md is only countable where there is no AGENTS.md.
    const file = own.file === "CLAUDE.md" ? "CLAUDE.md, no AGENTS.md" : own.file;
    return { id: model.id, label: model.label, average, median, file, fileCount: count };
  });
  return { rows, total: files.total, scoredOn: at ? new Date(at * 1000).toISOString().slice(0, 10) : null };
}
