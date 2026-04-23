import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";

import type { ModelScore } from "./scoring/scorer";
import type { SignalResult } from "./scoring/signals";

const DB_PATH = join(process.cwd(), "data", "rank.db");
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS repo (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    host            TEXT    NOT NULL,
    owner           TEXT    NOT NULL,
    name            TEXT    NOT NULL,
    url             TEXT    NOT NULL UNIQUE,
    default_branch  TEXT,
    stars           INTEGER,
    last_scored_at  INTEGER,
    overall_score   REAL,
    UNIQUE(host, owner, name)
  );
  CREATE TABLE IF NOT EXISTS model_score (
    repo_id    INTEGER NOT NULL REFERENCES repo(id) ON DELETE CASCADE,
    model_id   TEXT    NOT NULL,
    score      REAL    NOT NULL,
    PRIMARY KEY (repo_id, model_id)
  );
  CREATE TABLE IF NOT EXISTS signal_result (
    repo_id      INTEGER NOT NULL REFERENCES repo(id) ON DELETE CASCADE,
    signal_id    TEXT    NOT NULL,
    label        TEXT    NOT NULL,
    pass         REAL    NOT NULL,
    detail       TEXT,
    matched_path TEXT,
    PRIMARY KEY (repo_id, signal_id)
  );
  CREATE INDEX IF NOT EXISTS idx_model_score_model ON model_score(model_id, score DESC);
`);

export type RepoRow = {
  id: number;
  url: string;
  host: string;
  name: string;
  owner: string;
  stars: number | null;
  overall_score: number | null;
  default_branch: string | null;
  last_scored_at: number | null;
};

export function saveScoredRepo(args: {
  url: string;
  host: string;
  name: string;
  owner: string;
  overall: number;
  stars?: number | null;
  signals: SignalResult[];
  modelScores: ModelScore[];
  defaultBranch?: string | null;
}): number {
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO repo (host, owner, name, url, default_branch, stars, last_scored_at, overall_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET
         default_branch = excluded.default_branch,
         stars          = excluded.stars,
         last_scored_at = excluded.last_scored_at,
         overall_score  = excluded.overall_score`,
    ).run(
      args.host,
      args.owner,
      args.name,
      args.url,
      args.defaultBranch ?? null,
      args.stars ?? null,
      Math.floor(Date.now() / 1000),
      args.overall,
    );

    const row = db.prepare("SELECT id FROM repo WHERE url = ?").get(args.url) as { id: number };

    const repoId = row.id;
    db.prepare("DELETE FROM model_score WHERE repo_id = ?").run(repoId);
    db.prepare("DELETE FROM signal_result WHERE repo_id = ?").run(repoId);

    const insM = db.prepare("INSERT INTO model_score (repo_id, model_id, score) VALUES (?, ?, ?)");

    for (const ms of args.modelScores) {
      insM.run(repoId, ms.modelId, ms.score);
    }

    const insS = db.prepare(
      "INSERT INTO signal_result (repo_id, signal_id, label, pass, detail, matched_path) VALUES (?, ?, ?, ?, ?, ?)",
    );

    for (const s of args.signals) {
      insS.run(repoId, s.id, s.label, s.pass, s.detail, s.matchedPath ?? null);
    }

    return repoId;
  });

  return tx() as number;
}

export type LeaderboardRow = RepoRow & { score: number | null };

export type LeaderboardOptions = {
  dir?: "asc" | "desc";
  sort?: "score" | "stars";
  /** Restrict to a single host — "github" / "gitlab" / "bitbucket". */
  host?: string;
  /** "overall" or a specific model id — determines which score column is returned. */
  model: string;
};

// `sort` and `dir` are whitelisted below so they can be safely interpolated into SQL.
export function listLeaderboard(opts: LeaderboardOptions): LeaderboardRow[] {
  const sort = opts.sort === "stars" ? "stars" : "score";
  const dir = opts.dir === "asc" ? "ASC" : "DESC";

  // Secondary sort is always the opposite axis, so equal rows stay stable.
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
export function listLeaderboardForModel(modelId: string): LeaderboardRow[] {
  return listLeaderboard({ model: modelId });
}

export function getRepo(id: number): RepoRow | null {
  return (db.prepare("SELECT * FROM repo WHERE id = ?").get(id) as RepoRow) ?? null;
}

export function getModelScores(repoId: number): Array<{ modelId: string; score: number }> {
  return db.prepare("SELECT model_id AS modelId, score FROM model_score WHERE repo_id = ?").all(repoId) as Array<{
    modelId: string;
    score: number;
  }>;
}

export function getSignalResults(repoId: number): SignalResult[] {
  return db
    .prepare(
      `SELECT signal_id AS id, label, pass, detail, matched_path AS matchedPath
     FROM signal_result WHERE repo_id = ?`,
    )
    .all(repoId) as any as SignalResult[];
}
