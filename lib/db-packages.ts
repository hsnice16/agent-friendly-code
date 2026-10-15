import { db, noteWrite } from "./db-connection";
import type { TopPackageRow } from "./types/db";

export function getPackageAlias(registry: string, name: string): string | null {
  const row = db.prepare("SELECT repo_url FROM package_alias WHERE registry = ? AND name = ?").get(registry, name) as
    | { repo_url: string }
    | undefined;
  return row?.repo_url ?? null;
}

export function getTopPackagesByRegistry(registry: string, limit: number): TopPackageRow[] {
  return db
    .prepare(
      `SELECT pa.name, r.overall_score AS score, r.host, r.owner, r.name AS repoName
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
  noteWrite();
}
