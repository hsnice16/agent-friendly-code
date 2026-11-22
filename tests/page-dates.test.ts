import "./_temp-db";

import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { db, getLeaderboardStats, saveScoredRepo } from "../lib/db";
import { boardModified, frameworkModified, rowsModified } from "../lib/page-dates";

after(() => db.close());

const at = (iso: string) => ({ content_changed_at: Date.parse(iso) / 1000 });

describe("page dates", () => {
  it("rowsModified is the newest row's change, or null when none has one", () => {
    assert.equal(rowsModified([]), null);
    assert.equal(rowsModified([{ content_changed_at: null }]), null);
    assert.equal(
      rowsModified([at("2026-11-01T00:00:00Z"), { content_changed_at: null }, at("2026-11-20T12:00:00Z")]),
      "2026-11-20T12:00:00.000Z",
    );
  });

  it("frameworkModified never predates the guide text", () => {
    const guide = frameworkModified({ rows: [] });
    assert.ok(Date.parse(guide) > 0);
    assert.equal(frameworkModified({ rows: [at("2020-01-01T00:00:00Z")] }), guide);
    assert.equal(frameworkModified({ rows: [at("2030-01-01T00:00:00Z")] }), "2030-01-01T00:00:00.000Z");
  });

  it("boardModified follows the board's last content change", () => {
    assert.equal(boardModified(), null);
    saveScoredRepo({
      name: "r",
      owner: "o",
      host: "github",
      language: "Go",
      overall: 50,
      modelScores: [],
      url: "https://github.com/o/r",
      signals: [],
      about: { description: null, topics: [] },
    });
    const { contentChangedAt } = getLeaderboardStats();
    assert.ok(contentChangedAt != null);
    assert.equal(boardModified(), new Date(contentChangedAt * 1000).toISOString());
  });
});
