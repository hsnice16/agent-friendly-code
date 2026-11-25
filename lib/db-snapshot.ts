import Database from "better-sqlite3";

import type { SnapshotRow } from "./agents-md-adoption";
import { AGENT_FILE_SIGNAL_IDS } from "./utils/agent-instructions";

/**
 * The agent-file rows of every leaderboard repo in a copy of rank.db, any age.
 * Not re-exported from db.ts: importing that opens and migrates data/rank.db,
 * and this reads old snapshots read-only, as they were.
 */
export function readSnapshotRows(file: string): SnapshotRow[] {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const has = (table: string, col: string) =>
      !!db.prepare(`SELECT 1 FROM pragma_table_info('${table}') WHERE name = ?`).get(col);
    const col = (name: string, alias: string) => `${has("signal_result", name) ? `s.${name}` : "NULL"} AS ${alias}`;
    const score = has("repo", "overall_score") ? "r.overall_score IS NOT NULL" : "1";

    return db
      .prepare(
        `SELECT r.id AS repoId, r.url, s.signal_id AS signalId, s.pass, ${col("detail", "detail")}, ${col("matched_path", "matchedPath")}
         FROM repo r
         LEFT JOIN signal_result s ON s.repo_id = r.id AND s.signal_id IN (${AGENT_FILE_SIGNAL_IDS.map(() => "?").join(", ")})
         WHERE ${score}`,
      )
      .all(...AGENT_FILE_SIGNAL_IDS) as SnapshotRow[];
  } finally {
    db.close();
  }
}

export type BoardRepo = { host: string; owner: string; name: string; branch: string | null };

export function readBoardRepos(file: string): BoardRepo[] {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    return db
      .prepare("SELECT host, owner, name, default_branch AS branch FROM repo ORDER BY host, owner, name")
      .all() as BoardRepo[];
  } finally {
    db.close();
  }
}

export type InstructionFileRow = BoardRepo & {
  url: string;
  stars: number | null;
  path: string;
  pass: number;
  detail: string | null;
  scoredAt: number | null;
};

/** Every scored repo's AGENTS.md / CLAUDE.md as the check matched it, empty files included. */
export function readInstructionFiles(file: string): InstructionFileRow[] {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    return db
      .prepare(
        `SELECT r.host, r.owner, r.name, r.url, r.default_branch AS branch, r.stars, r.last_scored_at AS scoredAt,
                s.matched_path AS path, s.pass, s.detail
         FROM repo r JOIN signal_result s ON s.repo_id = r.id AND s.signal_id = 'agents_md'
         WHERE r.overall_score IS NOT NULL AND s.matched_path IS NOT NULL
         ORDER BY r.host, r.owner, r.name`,
      )
      .all() as InstructionFileRow[];
  } finally {
    db.close();
  }
}
