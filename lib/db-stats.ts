import { db } from "./db-connection";
import type { LeaderboardStats, SignalFile, SignalPassRate } from "./types/db";

export function getSignalPassRates(repoIds: number[]): SignalPassRate[] {
  if (repoIds.length === 0) return [];
  return db
    .prepare(
      `SELECT signal_id AS id, label, AVG(pass) AS rate FROM signal_result
        WHERE repo_id IN (${repoIds.map(() => "?").join(", ")})
        GROUP BY signal_id ORDER BY rate, signal_id`,
    )
    .all(...repoIds) as SignalPassRate[];
}

export function listSignalPasses(signalId: string): { repoId: number; pass: number }[] {
  const sql = "SELECT repo_id AS repoId, pass FROM signal_result WHERE signal_id = ?";
  return db.prepare(sql).all(signalId) as { repoId: number; pass: number }[];
}

export function listSignalFiles(signalId: string): SignalFile[] {
  const sql =
    "SELECT repo_id AS repoId, pass, detail, matched_path AS matchedPath FROM signal_result WHERE signal_id = ?";
  return db.prepare(sql).all(signalId) as SignalFile[];
}

export function getLeaderboardStats(): LeaderboardStats {
  return db
    .prepare(
      `SELECT COUNT(*) AS count, MAX(last_scored_at) AS lastScoredAt, MAX(content_changed_at) AS contentChangedAt
       FROM repo WHERE overall_score IS NOT NULL`,
    )
    .get() as LeaderboardStats;
}
