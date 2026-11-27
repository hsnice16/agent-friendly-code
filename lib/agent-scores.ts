import { AGENT_READS } from "./agent-reads";
import { LANGUAGE_AGENTS_MIN_REPOS } from "./constants/scoring";
import { exclusiveSignal } from "./leaderboard-model-panel";
import { MODELS, type ModelId, type ModelProfile } from "./scoring/weights";
import type { LeaderboardRow } from "./types/db";
import { OTHER_FILES } from "./utils/agent-instructions";
import { groupByLanguage, type LanguageGroup } from "./utils/language";
import { median } from "./utils/median";

export type ScoredRepo = LeaderboardRow & { scores: Partial<Record<ModelId, number>> };

// Scores are stored to one decimal; anything closer than this is the same score.
const SAME = 0.05;

/** Overall board order, with each agent's board folded in by repo id. */
export function buildScoredRepos(
  overall: LeaderboardRow[],
  perModel: { id: ModelId; rows: LeaderboardRow[] }[],
): ScoredRepo[] {
  const scores = new Map<number, Partial<Record<ModelId, number>>>();
  for (const { id, rows } of perModel) {
    for (const r of rows) {
      if (r.score == null) continue;
      const s = scores.get(r.id) ?? {};
      s[id] = r.score;
      scores.set(r.id, s);
    }
  }
  return overall.map((r) => ({ ...r, scores: scores.get(r.id) ?? {} }));
}

export type PairSplit = { n: number; avgA: number; avgB: number; aHigher: number; bHigher: number; ties: number };
type PairGap = { a: number; b: number };

function split(rows: PairGap[]): PairSplit {
  const n = rows.length;
  const avg = (f: (g: PairGap) => number) => (n === 0 ? 0 : rows.reduce((s, g) => s + f(g), 0) / n);
  return {
    n,
    avgA: avg((g) => g.a),
    avgB: avg((g) => g.b),
    aHigher: rows.filter((g) => g.a - g.b >= SAME).length,
    bHigher: rows.filter((g) => g.b - g.a >= SAME).length,
    ties: rows.filter((g) => Math.abs(g.a - g.b) < SAME).length,
  };
}

// Only repos scored for both agents count, so the two averages cover the same repos.
function pairGaps(rows: ScoredRepo[], a: ModelId, b: ModelId): PairGap[] {
  return rows.flatMap((repo) => {
    const sa = repo.scores[a];
    const sb = repo.scores[b];
    return sa == null || sb == null ? [] : [{ a: sa, b: sb }];
  });
}

export function pairSplit(rows: ScoredRepo[], a: ModelId, b: ModelId): PairSplit {
  return split(pairGaps(rows, a, b));
}

export type AgentStanding = { model: ModelProfile; average: number; median: number | null; top: number };

/** Every agent tied for a repo's highest score, in MODELS order. */
export function bestAgents(repo: Pick<ScoredRepo, "scores">): ModelProfile[] {
  const values = MODELS.flatMap((m) => repo.scores[m.id] ?? []);
  if (values.length === 0) return [];
  const max = Math.max(...values);
  return MODELS.filter((m) => {
    const s = repo.scores[m.id];
    return s != null && max - s < SAME;
  });
}

/** `top` counts a repo for every agent tied at its highest score. */
export function agentStandings(rows: ScoredRepo[]): AgentStanding[] {
  const best = rows.map((r) => new Set(bestAgents(r).map((m) => m.id)));
  return MODELS.map((model) => {
    const scores = rows.flatMap((r) => r.scores[model.id] ?? []);
    const average = scores.length === 0 ? 0 : scores.reduce((s, x) => s + x, 0) / scores.length;
    // Tenths, because median() rounds a between-two middle to a whole number.
    const mid = median(scores.map((s) => Math.round(s * 10)));
    return { model, average, median: mid == null ? null : mid / 10, top: best.filter((b) => b.has(model.id)).length };
  }).sort((x, y) => y.average - x.average || y.top - x.top);
}

/**
 * The instructions file that is the agent's own, as `getInstructionFileCounts`
 * and `FILE_KINDS` name it: a file only it weighs in full, else CLAUDE.md for an agent that
 * looks for it first, else AGENTS.md.
 */
export function ownFile(model: ModelProfile): { file: string; signalId: string } {
  const other = OTHER_FILES.find((f) => f.signalId === exclusiveSignal(model));
  if (other) return { file: other.label, signalId: other.signalId };
  return { file: AGENT_READS[model.id].files[0] === "CLAUDE.md" ? "CLAUDE.md" : "AGENTS.md", signalId: "agents_md" };
}

/** Languages with enough repos for a hub agents section, most repos first. */
export function agentLanguages(rows: ScoredRepo[]): LanguageGroup<ScoredRepo>[] {
  return groupByLanguage(rows).filter((g) => g.rows.length >= LANGUAGE_AGENTS_MIN_REPOS);
}
