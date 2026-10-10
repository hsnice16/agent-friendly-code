import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";

import { applySchema, ensureRepoAlias } from "./db-schema";
import type { ModelScore } from "./scoring/scorer";
import type { SignalResult } from "./scoring/signals";
import type {
  AlternativeRow,
  LeaderboardOptions,
  LeaderboardRow,
  LeaderboardStats,
  ModelScoreRow,
  RepoRow,
  ScoreTime,
  SeedTarget,
  SignalPassRate,
  TopPackageRow,
} from "./types/db";

const BUNDLED_DB = join(process.cwd(), "data", "rank.db");
// RANK_DB_PATH points tests and local rehearsals at a copy: the bundled file is
// rewritten by the rescore workflow, so a local write to it conflicts on pull.
const DB_PATH = process.env.RANK_DB_PATH ?? (process.env.VERCEL ? "/tmp/rank.db" : BUNDLED_DB);

if (process.env.VERCEL && !process.env.RANK_DB_PATH) {
  if (!existsSync(DB_PATH)) copyFileSync(BUNDLED_DB, DB_PATH);
} else {
  mkdirSync(dirname(DB_PATH), { recursive: true });
}

export const db = new Database(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

applySchema(db);

export function saveScoredRepo(args: {
  url: string;
  host: string;
  name: string;
  owner: string;
  overall: number;
  stars?: number | null;
  badgeEmbedded?: boolean;
  signals: SignalResult[];
  language?: string | null;
  modelScores: ModelScore[];
  defaultBranch?: string | null;
}): number {
  const now = Math.floor(Date.now() / 1000);
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO repo (host, owner, name, url, default_branch, stars, last_scored_at, overall_score, language, badge_embedded, content_changed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(url) DO UPDATE SET
         default_branch         = excluded.default_branch,
         stars                  = excluded.stars,
         last_scored_at         = excluded.last_scored_at,
         previous_overall_score = repo.overall_score,
         overall_score          = excluded.overall_score,
         language               = COALESCE(excluded.language, repo.language),
         badge_embedded         = excluded.badge_embedded,
         content_changed_at     = CASE
           WHEN repo.overall_score IS excluded.overall_score AND repo.badge_embedded IS excluded.badge_embedded
           THEN COALESCE(repo.content_changed_at, excluded.last_scored_at) ELSE excluded.last_scored_at END`,
    ).run(
      args.host,
      args.owner,
      args.name,
      args.url,
      args.defaultBranch ?? null,
      args.stars ?? null,
      now,
      args.overall,
      args.language ?? null,
      args.badgeEmbedded ? 1 : 0,
      now,
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
  return (db.prepare("SELECT * FROM repo WHERE id = ?").get(id) as RepoRow) ?? null;
}

const BY_NAME = "host = ? COLLATE NOCASE AND owner = ? COLLATE NOCASE AND name = ? COLLATE NOCASE";

// NOCASE because the hosts are: github.com/HonoJS/hono and github.com/honojs/hono
// are one repo, and the display casing is what ends up in a pasted link.
// A former name resolves to the renamed row, so a caller that renders a page
// must compare the result with what was asked for and redirect on a mismatch.
export function getRepoByHostOwnerName(host: string, owner: string, name: string): RepoRow | null {
  const row = db.prepare(`SELECT * FROM repo WHERE ${BY_NAME}`).get(host, owner, name);
  // The alias table exists only once a seed run has created it.
  if (row || !db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'repo_alias'").get()) {
    return (row as RepoRow) ?? null;
  }

  const former =
    "SELECT r.* FROM repo_alias a JOIN repo r ON r.id = a.repo_id WHERE a.host = ? AND a.owner = ? AND a.name = ?";
  return (db.prepare(former).get(host, owner, name) as RepoRow) ?? null;
}

// One transaction, renames first — pruned the other way round, a renamed repo
// loses its id, score history and badge flag.
export function reconcileSeeds(seeds: SeedTarget[], maxPrune: number): { renamed: string[]; pruned: string[] } {
  ensureRepoAlias(db);
  const find = db.prepare(`SELECT * FROM repo WHERE ${BY_NAME}`);
  const rename = db.prepare("UPDATE repo SET host = ?, owner = ?, name = ?, url = ? WHERE id = ?");
  const repoint = db.prepare("UPDATE package_alias SET repo_url = ? WHERE repo_url = ?");
  const unalias = db.prepare("DELETE FROM repo_alias WHERE host = ? AND owner = ? AND name = ?");
  const alias = db.prepare("INSERT OR REPLACE INTO repo_alias (host, owner, name, repo_id) VALUES (?, ?, ?, ?)");

  return db.transaction(() => {
    const renamed: string[] = [];

    for (const s of seeds) {
      const row = [s, ...s.was].map((n) => find.get(n.host, n.owner, n.name) as RepoRow | undefined).find(Boolean);
      if (!row) continue;

      if (row.url !== s.url) {
        repoint.run(s.url, row.url);
        rename.run(s.host, s.owner, s.name, s.url, row.id);
        renamed.push(`${row.url} → ${s.url}`);
      }

      unalias.run(s.host, s.owner, s.name);
      for (const w of s.was) alias.run(w.host, w.owner, w.name, row.id);
    }

    const keep = new Set(seeds.map((s) => s.url.toLowerCase()));
    const stale = (db.prepare("SELECT id, url FROM repo ORDER BY url").all() as RepoRow[])
      .filter((r) => !keep.has(r.url.toLowerCase()))
      .map((r) => r.url);

    // A mangled seed list looks exactly like a large removal.
    if (stale.length > maxPrune) {
      throw new Error(`refusing to prune ${stale.length} rows (limit ${maxPrune}): ${stale.join(", ")}`);
    }

    for (const url of stale) db.prepare("DELETE FROM repo WHERE url = ?").run(url);

    return { renamed, pruned: stale };
  })();
}

export function listScoreTimes(): ScoreTime[] {
  return db.prepare("SELECT url, last_scored_at AS lastScoredAt FROM repo ORDER BY url").all() as ScoreTime[];
}

export function getPackageAlias(registry: string, name: string): string | null {
  const row = db.prepare("SELECT repo_url FROM package_alias WHERE registry = ? AND name = ?").get(registry, name) as
    | { repo_url: string }
    | undefined;
  return row?.repo_url ?? null;
}

export function getTopPackagesByRegistry(registry: string, limit: number): TopPackageRow[] {
  return db
    .prepare(
      `SELECT pa.name, r.overall_score AS score, r.owner, r.name AS repoName, r.content_changed_at AS contentChangedAt
         FROM package_alias pa
         JOIN repo r ON r.url = pa.repo_url
        WHERE pa.registry = ?
          AND r.overall_score IS NOT NULL
        ORDER BY r.overall_score DESC
        LIMIT ?`,
    )
    .all(registry, limit) as TopPackageRow[];
}

export function putPackageAlias(registry: string, name: string, repoUrl: string): void {
  db.prepare(
    `INSERT INTO package_alias (registry, name, repo_url, resolved_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(registry, name) DO UPDATE SET
       repo_url    = excluded.repo_url,
       resolved_at = excluded.resolved_at`,
  ).run(registry, name, repoUrl, Math.floor(Date.now() / 1000));
}

export function getModelScores(repoId: number): ModelScoreRow[] {
  return db
    .prepare("SELECT model_id AS modelId, score FROM model_score WHERE repo_id = ?")
    .all(repoId) as ModelScoreRow[];
}

export function getSignalResults(repoId: number): SignalResult[] {
  return db
    .prepare(
      `SELECT signal_id AS id, label, pass, detail, matched_path AS matchedPath
     FROM signal_result WHERE repo_id = ?`,
    )
    .all(repoId) as any as SignalResult[];
}

// Keyed by language + host, not a repo id: a live-scored repo has no row.
// NOCASE because stored casing varies ("java", "Java").
export function getLanguagePeers(
  host: string,
  language: string | null,
  modelId: string,
  excludeId?: number,
): AlternativeRow[] {
  if (!language) return [];

  const skip = excludeId == null ? "" : "AND r.id != ?";
  return db
    .prepare(
      `SELECT r.id, r.host, r.owner, r.name, r.stars, m.score
         FROM repo r
         JOIN model_score m ON m.repo_id = r.id AND m.model_id = ?
        WHERE r.language = ? COLLATE NOCASE AND r.host = ? ${skip}
        ORDER BY m.score DESC, r.id`,
    )
    .all(modelId, language, host, ...(excludeId == null ? [] : [excludeId])) as AlternativeRow[];
}

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

export function getLeaderboardStats(): LeaderboardStats {
  return db
    .prepare(
      `SELECT COUNT(*) AS count, MAX(last_scored_at) AS lastScoredAt, MAX(content_changed_at) AS contentChangedAt
       FROM repo WHERE overall_score IS NOT NULL`,
    )
    .get() as LeaderboardStats;
}
