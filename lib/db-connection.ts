import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";

import { applySchema } from "./db-schema";

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

let ownWrites = 0;

/** Every write function calls this after it commits. */
export function noteWrite(): void {
  ownWrites++;
}

// data_version moves only for commits by other connections, so this
// connection's own writes are counted separately.
export function dbVersion(): string {
  return `${db.pragma("data_version", { simple: true })}:${ownWrites}`;
}
