import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAgentsMdExamples, LENGTH_LIST_LIMIT } from "../lib/agents-md-examples";
import type { LeaderboardRow, SignalFile } from "../lib/types/db";
import { fileLength } from "../lib/utils/agent-instructions";

function repo(id: number, over: Partial<LeaderboardRow> = {}): LeaderboardRow {
  return {
    id,
    host: "github",
    owner: "o",
    name: `r${id}`,
    url: `https://github.com/o/r${id}`,
    stars: id * 10,
    language: "Go",
    score: 50,
    overall_score: 50,
    default_branch: "main",
    badge_embedded: 0,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
    ...over,
  };
}

const file = (repoId: number, matchedPath: string | null, chars: number | null, pass: number): SignalFile => ({
  repoId,
  pass,
  matchedPath,
  detail: chars == null ? "No agent instructions file found" : `Substantive (${chars} chars)`,
});

describe("fileLength", () => {
  it("reads the count from every detail the check writes", () => {
    assert.equal(fileLength("Substantive (30632 chars)"), 30632);
    assert.equal(fileLength("File exists (150 chars) — thin"), 150);
    assert.equal(fileLength("Substantive (14,688 characters)"), 14688);
    assert.equal(fileLength("File exists but empty"), null);
    assert.equal(fileLength(null), null);
  });
});

describe("buildAgentsMdExamples", () => {
  const board = Array.from({ length: 12 }, (_, i) => repo(i + 1));
  const files = [
    ...board.slice(0, 8).map((r, i) => file(r.id, "AGENTS.md", 1000 + i * 100, 1)),
    file(9, "CLAUDE.md", 900, 1),
    file(10, "AGENTS.md", 300, 0.8),
    file(11, null, null, 0),
    file(12, null, null, 0),
  ];
  const ex = buildAgentsMdExamples(board, files);

  it("lists every repo with a file, most-starred first", () => {
    assert.equal(ex.rows.length, 10);
    assert.deepEqual(
      ex.rows.map((r) => r.id),
      [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    );
    assert.equal(ex.boardSize, 12);
    assert.equal(ex.passing, 9);
  });

  it("ranks length among full passes only", () => {
    assert.equal(ex.longest.length, LENGTH_LIST_LIMIT);
    assert.equal(ex.longest[0].length, 1700);
    assert.equal(ex.shortest[0].length, 900);
    assert.ok(!ex.shortest.some((r) => r.pass < 1));
  });

  it("keeps longest and shortest disjoint when there are fewer than twice the limit", () => {
    const longest = new Set(ex.longest.map((r) => r.id));
    assert.equal(ex.shortest.length, 4);
    assert.ok(!ex.shortest.some((r) => longest.has(r.id)));
  });

  it("counts each file name", () => {
    assert.deepEqual(ex.byFile, [
      { file: "AGENTS.md", count: 9, passing: 8 },
      { file: "CLAUDE.md", count: 1, passing: 1 },
    ]);
  });

  it("lists popular repos without a file, and language hubs with their share", () => {
    assert.deepEqual(
      ex.missing.map((r) => r.id),
      [12, 11],
    );
    assert.deepEqual(ex.languages, [{ slug: "go", label: "Go", total: 12, withFile: 10 }]);
  });

  it("leaves out empty files, and the author's repos from the length lists", () => {
    const own = repo(13, { owner: "hsnice16", name: "tula", stars: 0, language: "Rust" });
    const withEmpty = buildAgentsMdExamples(
      [...board, own, repo(14)],
      [
        ...files,
        file(13, "AGENTS.md", 90_000, 1),
        { repoId: 14, pass: 0.2, matchedPath: "AGENTS.md", detail: "File exists but empty" },
      ],
    );
    assert.ok(!withEmpty.rows.some((r) => r.id === 14));
    assert.ok(withEmpty.missing.some((r) => r.id === 14));
    assert.ok(withEmpty.rows.some((r) => r.id === 13));
    assert.ok(!withEmpty.longest.some((r) => r.id === 13));
    assert.equal(withEmpty.longest[0].length, 1700);
  });

  it("takes the median length over every file with one", () => {
    assert.equal(ex.medianLength, 1250);
    assert.equal(buildAgentsMdExamples(board, []).medianLength, null);
  });

  it("links each file on its host", () => {
    assert.equal(ex.rows[0].fileUrl, "https://github.com/o/r10/blob/main/AGENTS.md");
  });
});
