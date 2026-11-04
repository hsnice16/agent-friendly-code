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
        `SELECT r.url, s.signal_id AS signalId, s.pass, ${col("detail", "detail")}, ${col("matched_path", "matchedPath")}
         FROM repo r
         LEFT JOIN signal_result s ON s.repo_id = r.id AND s.signal_id IN (${AGENT_FILE_SIGNAL_IDS.map(() => "?").join(", ")})
         WHERE ${score}`,
      )
      .all(...AGENT_FILE_SIGNAL_IDS) as SnapshotRow[];
  } finally {
    db.close();
  }
}
