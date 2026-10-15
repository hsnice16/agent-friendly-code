import { cache } from "react";

import { getCheckStats } from "@/lib/check-stats";
import {
  dbVersion,
  getModelScores,
  getRepoByHostOwnerName,
  getSignalResults,
  listLeaderboard,
  listLeaderboardOverall,
} from "@/lib/db";
import { MODELS } from "@/lib/scoring/weights";
import type { RepoRow } from "@/lib/types/db";
import type { AgentFileShare } from "@/lib/utils/agent-instructions";
import { languageSlug } from "@/lib/utils/language";
import { repoAbout } from "@/lib/utils/repo-about";
import { summarizeRepo } from "@/lib/utils/repo-summary";

// generateMetadata and the page each ask for these. cache() keys on argument
// identity, so the summary and about only hit because loadRepo hands both the
// same row object.
export const loadBoard = cache(listLeaderboardOverall);
export const loadRepo = cache(getRepoByHostOwnerName);
export const loadSignals = cache(getSignalResults);
export const loadAbout = cache((repo: RepoRow) => repoAbout(repo));
export const loadSummary = cache((repo: RepoRow) =>
  summarizeRepo(repo, loadBoard(), getModelScores(repo.id), loadSignals(repo.id)),
);

export function agentFileShare(language: string | null): AgentFileShare {
  const stats = getCheckStats("agents_md");
  const slug = language ? languageSlug(language) : null;
  const l = stats.languages.find((x) => x.slug === slug);
  return {
    has: stats.present,
    total: stats.total,
    language: l ? { label: l.label, has: l.counts.present, total: l.counts.total } : null,
  };
}

type BoardRank = { rank: number; total: number };

// Per process, not React cache: that resets per page, and a static build asks
// for every repo's rank on every board. Keyed on dbVersion like getCheckStats:
// the board's stats can stay the same across a same-second save.
let boards: { key: string; byModel: Map<string, { position: Map<number, number>; total: number }> } | null = null;

/** The repo's place on each agent's board, numbered as the board numbers it. */
export function boardRanks(repoId: number): Record<string, BoardRank> {
  const key = dbVersion();
  if (boards?.key !== key) boards = { key, byModel: new Map() };

  const out: Record<string, BoardRank> = {};
  for (const m of MODELS) {
    let board = boards.byModel.get(m.id);
    if (!board) {
      const rows = listLeaderboard({ model: m.id });
      board = { position: new Map(rows.map((r, i) => [r.id, i + 1])), total: rows.length };
      boards.byModel.set(m.id, board);
    }
    const rank = board.position.get(repoId);
    if (rank) out[m.id] = { rank, total: board.total };
  }
  return out;
}
