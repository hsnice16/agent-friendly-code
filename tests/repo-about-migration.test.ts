import "./_temp-db";

import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, test } from "node:test";
import Database from "better-sqlite3";

import { db, getRepoByHostOwnerName, saveScoredRepo } from "../lib/db";
import { ensureRepoAbout } from "../lib/db-schema";
import { repoAbout } from "../lib/utils/repo-about";

const columns = (d: Database.Database) =>
  (d.prepare("SELECT name FROM pragma_table_info('repo')").all() as { name: string }[]).map((c) => c.name);

const save = (about?: { description: string | null; topics: string[] }, overall = 50) =>
  saveScoredRepo({
    about,
    overall,
    owner: "o",
    name: "r",
    signals: [],
    host: "github",
    modelScores: [],
    url: "https://github.com/o/r",
  });

const stored = () => getRepoByHostOwnerName("github", "o", "r")!;

describe("ensureRepoAbout", () => {
  const dir = mkdtempSync(join(tmpdir(), "afc-old-db-"));
  after(() => rmSync(dir, { recursive: true, force: true }));

  test("adds nullable columns to an old repo table, keeping its rows, and is idempotent", () => {
    const old = new Database(join(dir, "old.db"));
    old.exec(`CREATE TABLE repo (id INTEGER PRIMARY KEY, host TEXT, owner TEXT, name TEXT, url TEXT UNIQUE);
              INSERT INTO repo (host, owner, name, url) VALUES ('github', 'a', 'b', 'https://github.com/a/b');`);

    ensureRepoAbout(old);
    ensureRepoAbout(old);

    assert.ok(columns(old).includes("description") && columns(old).includes("topics"));
    assert.deepEqual(old.prepare("SELECT url, description, topics FROM repo").all(), [
      { url: "https://github.com/a/b", description: null, topics: null },
    ]);
    old.close();
  });
});

// Opening the DB runs applySchema only, which is the pre-migration shape.
describe("saveScoredRepo with description and topics", () => {
  after(() => db.close());

  test("the app reads a DB without the columns as empty", () => {
    assert.ok(!columns(db).includes("description"));
    db.exec("INSERT INTO repo (host, owner, name, url) VALUES ('github', 'x', 'y', 'https://github.com/x/y')");
    assert.deepEqual(repoAbout(getRepoByHostOwnerName("github", "x", "y")!), { description: null, topics: [] });
  });

  test("the first save migrates, then writes both", () => {
    save({ description: "A thing", topics: ["go", "cli"] });
    assert.ok(columns(db).includes("description"));
    assert.deepEqual(repoAbout(stored()), { description: "A thing", topics: ["go", "cli"] });
  });

  test("a failed fetch keeps the stored values; a fetched empty clears them", () => {
    save(undefined);
    assert.equal(stored().description, "A thing");
    assert.equal(stored().topics, '["go","cli"]');

    save({ description: null, topics: [] });
    assert.equal(stored().description, null);
    assert.equal(stored().topics, null);
  });

  test("a metadata-only change moves content_changed_at; a failed fetch does not", () => {
    db.prepare("UPDATE repo SET content_changed_at = 1 WHERE url = ?").run("https://github.com/o/r");
    save(undefined);
    assert.equal(stored().content_changed_at, 1);
    save({ description: null, topics: [] });
    assert.equal(stored().content_changed_at, 1);
    save({ description: "New", topics: [] });
    assert.notEqual(stored().content_changed_at, 1);
  });
});
