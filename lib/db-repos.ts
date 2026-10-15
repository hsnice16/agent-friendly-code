import { db } from "./db-connection";
import type { SignalResult } from "./scoring/signals";
import type {
  LeaderboardOptions,
  LeaderboardRow,
  ModelScoreRow,
  RepoRow,
  ScoreTime,
  SignalResultRow,
} from "./types/db";

// NOCASE because the hosts are: github.com/HonoJS/hono and github.com/honojs/hono
// are one repo, and the display casing is what ends up in a pasted link.
export const BY_NAME = "host = ? COLLATE NOCASE AND owner = ? COLLATE NOCASE AND name = ? COLLATE NOCASE";

export function listLeaderboard(opts: LeaderboardOptions): LeaderboardRow[] {
  const dir = opts.dir === "asc" ? "ASC" : "DESC";
  const sort = opts.sort === "stars" ? "stars" : "score";
  const secondary = sort === "stars" ? "score DESC" : "stars DESC";
  const hostFilter = opts.host ? "AND r.host = ?" : "";
  const hostArgs = opts.host ? [opts.host] : [];

  if (opts.model === "overall") {
    const sortCol = sort === "stars" ? "r.stars" : "r.overall_score";
    return db
      .prepare(
        `SELECT r.*, r.overall_score AS score FROM repo r
         WHERE r.overall_score IS NOT NULL ${hostFilter}
         ORDER BY ${sortCol} ${dir}, ${secondary}`,
      )
      .all(...hostArgs) as LeaderboardRow[];
  }

  const sortCol = sort === "stars" ? "r.stars" : "m.score";
  return db
    .prepare(
      `SELECT r.*, m.score AS score FROM repo r
       JOIN model_score m ON m.repo_id = r.id AND m.model_id = ?
       WHERE 1=1 ${hostFilter}
       ORDER BY ${sortCol} ${dir}, ${secondary}`,
    )
    .all(opts.model, ...hostArgs) as LeaderboardRow[];
}

export function listLeaderboardOverall(): LeaderboardRow[] {
  return listLeaderboard({ model: "overall" });
}

export function getRepo(id: number): RepoRow | null {
  return (db.prepare("SELECT * FROM repo WHERE id = ?").get(id) as RepoRow | undefined) ?? null;
}

// A former name resolves to the renamed row, so a caller that renders a page
// must compare the result with what was asked for and redirect on a mismatch.
export function getRepoByHostOwnerName(host: string, owner: string, name: string): RepoRow | null {
  const row = db.prepare(`SELECT * FROM repo WHERE ${BY_NAME}`).get(host, owner, name) as RepoRow | undefined;
  // The alias table exists only once a seed run has created it.
  if (row || !db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'repo_alias'").get()) {
    return row ?? null;
  }

  const former =
    "SELECT r.* FROM repo_alias a JOIN repo r ON r.id = a.repo_id WHERE a.host = ? AND a.owner = ? AND a.name = ?";
  return (db.prepare(former).get(host, owner, name) as RepoRow | undefined) ?? null;
}

export function listScoreTimes(): ScoreTime[] {
  return db.prepare("SELECT url, last_scored_at AS lastScoredAt FROM repo ORDER BY url").all() as ScoreTime[];
}

export function getModelScores(repoId: number): ModelScoreRow[] {
  return db
    .prepare("SELECT model_id AS modelId, score FROM model_score WHERE repo_id = ?")
    .all(repoId) as ModelScoreRow[];
}

export function getSignalResults(repoId: number): SignalResult[] {
  const rows = db
    .prepare(
      `SELECT signal_id AS id, label, pass, detail, matched_path AS matchedPath
         FROM signal_result WHERE repo_id = ?`,
    )
    .all(repoId) as SignalResultRow[];
  return rows.map((r) => ({ ...r, matchedPath: r.matchedPath ?? undefined }));
}
