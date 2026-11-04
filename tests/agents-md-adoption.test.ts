import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import Database from "better-sqlite3";

import committed from "../data/agents-md-adoption.json";
import {
  adoptionCsv,
  buildCohort,
  lastPerDay,
  MIN_REPOS,
  monthlyPoints,
  parseAdoption,
  repoFlags,
  type SnapshotRow,
  snapshotPoint,
} from "../lib/agents-md-adoption";
import { readSnapshotRows } from "../lib/db-snapshot";

function row(
  url: string,
  signalId: string | null,
  pass = 1,
  matchedPath: string | null = null,
  detail = "",
): SnapshotRow {
  return { url, signalId, pass: signalId ? pass : null, detail, matchedPath };
}

const ROWS: SnapshotRow[] = [
  row("https://github.com/a/one", "agents_md", 1, "AGENTS.md", "Substantive (1,000 characters)"),
  row("https://github.com/a/two", "agents_md", 0.8, "agents.md", "File exists (300 chars)"),
  row("https://github.com/a/three", "agents_md", 1, "CLAUDE.md", "Substantive (2,000 characters)"),
  row("https://github.com/a/four", "agents_md", 0.2, "AGENTS.md", "File exists but empty"),
  row("https://github.com/a/five", null),
  row("https://github.com/a/one", "cursor_rules", 1, ".cursor/rules/a.mdc"),
  row("https://github.com/a/four", "cursor_rules", 0),
];

describe("snapshotPoint", () => {
  const p = snapshotPoint("2026-05-01", ROWS);

  it("counts each repo once, and an empty file as none", () => {
    assert.equal(p.repos, 5);
    assert.equal(p.withFile, 3);
    assert.equal(p.agentsMd, 2);
    assert.equal(p.claudeMd, 1);
  });

  it("takes the median length across both length formats", () => {
    assert.equal(p.medianChars, 1000);
  });

  it("leaves a check with no rows in the snapshot unknown, not zero", () => {
    assert.equal(p.cursorRules, 1);
    assert.equal(p.geminiMd, null);
  });
});

describe("buildCohort", () => {
  it("follows only the repos on the board at both ends, matching URLs case-insensitively", () => {
    const then = repoFlags(ROWS);
    const now = repoFlags([
      row("https://github.com/A/Four", "agents_md", 1, "AGENTS.md"),
      row("https://github.com/a/five", "agents_md", 1, "CLAUDE.md"),
      row("https://github.com/a/one", "agents_md", 1, "AGENTS.md"),
      row("https://github.com/new/repo", "agents_md", 1, "AGENTS.md"),
    ]);
    assert.deepEqual(buildCohort("2026-05-01", then, now), {
      since: "2026-05-01",
      repos: 3,
      withFileThen: 1,
      withFileNow: 3,
      agentsMdThen: 1,
      agentsMdNow: 2,
    });
  });
});

describe("lastPerDay", () => {
  it("keeps the last snapshot of each UTC day", () => {
    const days = lastPerDay([
      { at: new Date("2026-05-01T10:00:00+05:30"), id: 1 },
      { at: new Date("2026-05-01T23:00:00+05:30"), id: 2 },
      { at: new Date("2026-05-02T04:00:00+05:30"), id: 3 },
    ]);
    assert.deepEqual(
      days.map((d) => [d.date, d.id]),
      [["2026-05-01", 3]],
    );
  });
});

describe("monthlyPoints", () => {
  it("keeps the first point of each month and the latest", () => {
    const points = ["2026-04-24", "2026-04-30", "2026-05-02", "2026-05-20", "2026-06-01", "2026-06-03"].map((d) =>
      snapshotPoint(d, ROWS),
    );
    assert.deepEqual(
      monthlyPoints(points).map((p) => p.date),
      ["2026-04-24", "2026-05-02", "2026-06-01", "2026-06-03"],
    );
    assert.deepEqual(
      monthlyPoints(points.slice(0, 1)).map((p) => p.date),
      ["2026-04-24"],
    );
  });
});

describe("adoptionCsv", () => {
  it("writes a blank cell for a check that didn't exist yet", () => {
    const [header, line] = adoptionCsv([snapshotPoint("2026-05-01", ROWS)])
      .trim()
      .split("\n");
    assert.equal(header.split(",").length, line.split(",").length);
    assert.match(line, /^2026-05-01,5,3,2,1,,1,/);
  });
});

describe("parseAdoption", () => {
  it("refuses anything but dates and counts", () => {
    const p = snapshotPoint("2026-05-01", ROWS);
    assert.doesNotThrow(() => parseAdoption({ minRepos: 1, points: [p], cohort: null }));
    assert.throws(() => parseAdoption({ minRepos: 1, points: [{ ...p, repos: "<script>" }], cohort: null }));
    assert.throws(() => parseAdoption({ minRepos: 1, points: [{ ...p, date: "May 1" }], cohort: null }));
    assert.throws(() => parseAdoption({ minRepos: 1, points: [], cohort: null }));
    assert.throws(() => parseAdoption({ minRepos: 1, points: [p] }));
    assert.throws(() => parseAdoption({ minRepos: 1, points: [p], cohort: { since: "2026-05-01", repos: -1 } }));
  });

  it("copies out only the known keys", () => {
    const p = { ...snapshotPoint("2026-05-01", ROWS), note: "<script>" };
    const s = parseAdoption({ minRepos: 1, points: [p], cohort: null, extra: { x: 1 } });
    assert.deepEqual(Object.keys(s).sort(), ["cohort", "minRepos", "points"]);
    assert.ok(!("note" in s.points[0]));
  });

  it("refuses dates out of order or repeated", () => {
    const at = (d: string) => snapshotPoint(d, ROWS);
    assert.throws(() => parseAdoption({ minRepos: 1, points: [at("2026-05-02"), at("2026-05-01")], cohort: null }));
    assert.throws(() => parseAdoption({ minRepos: 1, points: [at("2026-05-01"), at("2026-05-01")], cohort: null }));
  });

  it("accepts the committed series, none below the floor", () => {
    const s = parseAdoption(committed);
    assert.ok(s.points.every((p) => p.repos >= MIN_REPOS && p.agentsMd + p.claudeMd <= p.withFile));
  });
});

describe("readSnapshotRows", () => {
  const dir = mkdtempSync(join(tmpdir(), "afc-snapshot-"));
  after(() => rmSync(dir, { recursive: true, force: true }));

  it("reads a snapshot from before signal_result had detail or matched_path", () => {
    const file = join(dir, "old.db");
    const db = new Database(file);
    db.exec(`
      CREATE TABLE repo (id INTEGER PRIMARY KEY, url TEXT, overall_score REAL);
      CREATE TABLE signal_result (repo_id INTEGER, signal_id TEXT, label TEXT, pass REAL);
      INSERT INTO repo VALUES (1, 'https://github.com/a/one', 50), (2, 'https://github.com/a/off', NULL);
      INSERT INTO signal_result VALUES (1, 'agents_md', 'x', 1), (1, 'readme', 'x', 1);
    `);
    db.close();

    assert.deepEqual(readSnapshotRows(file), [
      { url: "https://github.com/a/one", signalId: "agents_md", pass: 1, detail: null, matchedPath: null },
    ]);
  });
});
