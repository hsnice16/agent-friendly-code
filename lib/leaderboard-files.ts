import { cache } from "react";

import { type AgentsMdExamples, buildAgentsMdExamples } from "./agents-md-examples";
import { getCheckStats } from "./check-stats";
import { listLeaderboardOverall, listSignalFiles } from "./db";
import { buildModelPanel, type ModelPanel } from "./leaderboard-model-panel";
import type { ModelProfile } from "./scoring/weights";
import { hasAgentFile, OTHER_FILES } from "./utils/agent-instructions";

export const getAgentsMdExamples = cache(
  (): AgentsMdExamples => buildAgentsMdExamples(listLeaderboardOverall(), listSignalFiles("agents_md")),
);

// The check matches case-insensitively, so one name can be stored in several spellings.
function reposWithFile(name: string): number {
  return getAgentsMdExamples()
    .byFile.filter((f) => f.file.toLowerCase() === name.toLowerCase())
    .reduce((n, f) => n + f.count, 0);
}

export function getModelPanel(model: ModelProfile): ModelPanel {
  return buildModelPanel(model, { countsOf: (id) => getCheckStats(id), claudeMd: reposWithFile("CLAUDE.md") });
}

export type InstructionFileCount = { file: string; signalId: string; count: number };

/** Repos on the board with each agent instructions file, content in it. */
export function getInstructionFileCounts(): { total: number; files: InstructionFileCount[] } {
  const files: InstructionFileCount[] = [
    { file: "AGENTS.md", signalId: "agents_md", count: reposWithFile("AGENTS.md") },
    { file: "CLAUDE.md", signalId: "agents_md", count: reposWithFile("CLAUDE.md") },
    ...OTHER_FILES.map((f) => ({ file: f.label, signalId: f.signalId, count: getCheckStats(f.signalId).present })),
  ];
  return { total: getAgentsMdExamples().boardSize, files: files.sort((a, b) => b.count - a.count) };
}

/** Board repos with content in both an AGENTS.md or CLAUDE.md and the given check's file. */
export function reposWithBoth(signalId: string): number {
  const withMain = new Set(getAgentsMdExamples().rows.map((r) => r.id));
  return listSignalFiles(signalId).filter((f) => hasAgentFile(f) && withMain.has(f.repoId)).length;
}
