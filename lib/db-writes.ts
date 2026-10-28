import { db, noteWrite } from "./db-connection";
import { BY_NAME } from "./db-repos";
import { ensureIndexes, ensureRepoAbout, ensureRepoAlias } from "./db-schema";
import type { ModelScore } from "./scoring/scorer";
import type { SignalResult } from "./scoring/signals";
import type { RepoRow, SeedTarget } from "./types/db";
import { topicsColumn } from "./utils/repo-about";

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
  /** Omitted to keep the stored values. */
  about?: { description: string | null; topics: string[] };
}): number {
  ensureRepoAbout(db);
  ensureIndexes(db);
  const now = Math.floor(Date.now() / 1000);
  const tx = db.transaction(() => {
    // Not COALESCE like language: a cleared description must clear here too, so only an omitted `about`
    // (@known = 0) keeps the stored one. Either changing changes the page, so content_changed_at moves.
    const { id: repoId } = db
      .prepare(
        `INSERT INTO repo (host, owner, name, url, default_branch, stars, last_scored_at, overall_score, language, badge_embedded, content_changed_at, description, topics)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(url) DO UPDATE SET
           default_branch         = excluded.default_branch,
           stars                  = excluded.stars,
           last_scored_at         = excluded.last_scored_at,
           previous_overall_score = repo.overall_score,
           overall_score          = excluded.overall_score,
           language               = COALESCE(excluded.language, repo.language),
           badge_embedded         = excluded.badge_embedded,
           description            = CASE WHEN @known THEN excluded.description ELSE repo.description END,
           topics                 = CASE WHEN @known THEN excluded.topics ELSE repo.topics END,
           content_changed_at     = CASE
             WHEN repo.overall_score IS excluded.overall_score AND repo.badge_embedded IS excluded.badge_embedded
              AND (NOT @known OR (repo.description IS excluded.description AND repo.topics IS excluded.topics))
             THEN COALESCE(repo.content_changed_at, excluded.last_scored_at) ELSE excluded.last_scored_at END
         RETURNING id`,
      )
      .get(
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
        ...(args.about ? [args.about.description, topicsColumn(args.about.topics)] : [null, null]),
        { known: args.about ? 1 : 0 },
      ) as { id: number };

    db.prepare("DELETE FROM model_score WHERE repo_id = ?").run(repoId);
    db.prepare("DELETE FROM signal_result WHERE repo_id = ?").run(repoId);

    const insertModel = db.prepare("INSERT INTO model_score (repo_id, model_id, score) VALUES (?, ?, ?)");
    for (const ms of args.modelScores) {
      insertModel.run(repoId, ms.modelId, ms.score);
    }

    const insertSignal = db.prepare(
      "INSERT INTO signal_result (repo_id, signal_id, label, pass, detail, matched_path) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const s of args.signals) {
      insertSignal.run(repoId, s.id, s.label, s.pass, s.detail, s.matchedPath ?? null);
    }

    return repoId;
  });

  const repoId = tx();
  noteWrite();
  return repoId;
}

// One transaction, renames first — pruned the other way round, a renamed repo
// loses its id, score history and badge flag.
export function reconcileSeeds(seeds: SeedTarget[], maxPrune: number): { renamed: string[]; pruned: string[] } {
  ensureRepoAlias(db);
  ensureIndexes(db);
  const find = db.prepare(`SELECT * FROM repo WHERE ${BY_NAME}`);
  const rename = db.prepare("UPDATE repo SET host = ?, owner = ?, name = ?, url = ? WHERE id = ?");
  const repoint = db.prepare("UPDATE package_alias SET repo_url = ? WHERE repo_url = ?");
  const unalias = db.prepare("DELETE FROM repo_alias WHERE host = ? AND owner = ? AND name = ?");
  const alias = db.prepare("INSERT OR REPLACE INTO repo_alias (host, owner, name, repo_id) VALUES (?, ?, ?, ?)");

  const result = db.transaction(() => {
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
      for (const w of s.was) {
        alias.run(w.host, w.owner, w.name, row.id);
      }
    }

    const keep = new Set(seeds.map((s) => s.url.toLowerCase()));
    const stale = (db.prepare("SELECT id, url FROM repo ORDER BY url").all() as RepoRow[])
      .filter((r) => !keep.has(r.url.toLowerCase()))
      .map((r) => r.url);

    // A mangled seed list looks exactly like a large removal.
    if (stale.length > maxPrune) {
      throw new Error(`refusing to prune ${stale.length} rows (limit ${maxPrune}): ${stale.join(", ")}`);
    }

    const prune = db.prepare("DELETE FROM repo WHERE url = ?");
    for (const url of stale) {
      prune.run(url);
    }

    return { renamed, pruned: stale };
  })();

  noteWrite();
  return result;
}
