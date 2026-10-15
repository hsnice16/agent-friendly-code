import type Database from "better-sqlite3";

export function applySchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS repo (
      id                     INTEGER PRIMARY KEY AUTOINCREMENT,
      host                   TEXT    NOT NULL,
      owner                  TEXT    NOT NULL,
      name                   TEXT    NOT NULL,
      url                    TEXT    NOT NULL UNIQUE,
      default_branch         TEXT,
      stars                  INTEGER,
      last_scored_at         INTEGER,
      overall_score          REAL,
      previous_overall_score REAL,
      language               TEXT,
      badge_embedded         INTEGER,
      content_changed_at     INTEGER,
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
    CREATE TABLE IF NOT EXISTS package_alias (
      registry    TEXT    NOT NULL,
      name        TEXT    NOT NULL,
      repo_url    TEXT    NOT NULL,
      resolved_at INTEGER NOT NULL,
      PRIMARY KEY (registry, name)
    );
  `);

  // Immediate + re-check: two processes opening an old DB at once must not both ALTER.
  db.transaction(() => {
    if (!db.prepare("SELECT 1 FROM pragma_table_info('repo') WHERE name = 'content_changed_at'").get()) {
      db.exec("ALTER TABLE repo ADD COLUMN content_changed_at INTEGER");
      db.exec("UPDATE repo SET content_changed_at = last_scored_at");
    }
  }).immediate();
}

// Former names of a renamed repo. Pages, badges and API lookups under the old
// name are already in READMEs and search indexes and must keep resolving.
//
// Created by the seed run rather than on open: the app would otherwise add the
// table to a developer's data/rank.db the first time it starts, and that file
// then conflicts with the next rescore commit.
export function ensureRepoAlias(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS repo_alias (
      host    TEXT    NOT NULL COLLATE NOCASE,
      owner   TEXT    NOT NULL COLLATE NOCASE,
      name    TEXT    NOT NULL COLLATE NOCASE,
      repo_id INTEGER NOT NULL REFERENCES repo(id) ON DELETE CASCADE,
      PRIMARY KEY (host, owner, name)
    );
  `);
}

// Added by the write paths (scoring, init-db), not on open, for the same reason
// as repo_alias. Until then reads get rows without the columns, which
// repoAbout treats as empty.
export function ensureRepoAbout(db: Database.Database): void {
  db.transaction(() => {
    const has = db.prepare("SELECT 1 FROM pragma_table_info('repo') WHERE name = ?");
    if (!has.get("description")) db.exec("ALTER TABLE repo ADD COLUMN description TEXT");
    if (!has.get("topics")) db.exec("ALTER TABLE repo ADD COLUMN topics TEXT");
  }).immediate();
}

// On the write paths and init-db, for the same reason as repo_alias.
// The NOCASE index serves name lookups, which UNIQUE(host, owner, name) cannot:
// its index compares with BINARY.
export function ensureIndexes(db: Database.Database): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_repo_name_nocase
      ON repo(host COLLATE NOCASE, owner COLLATE NOCASE, name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_signal_result_signal ON signal_result(signal_id);
  `);
}
