import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ExampleRow } from "../lib/agents-md-examples";
import { buildAgentsMdSize, CODEX_CAP, DEVIN_CAP, percentile, sizeDescription, sizeTitle } from "../lib/agents-md-size";
import { SIZE_GROUP_MIN } from "../lib/constants/scoring";
import type { LeaderboardRow } from "../lib/types/db";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

function repo(id: number, over: Partial<LeaderboardRow> = {}): LeaderboardRow {
  return {
    id,
    host: "github",
    owner: "o",
    name: `r${id}`,
    url: `https://github.com/o/r${id}`,
    stars: 20_000,
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

const row = (id: number, length: number | null, over: Partial<ExampleRow> = {}): ExampleRow => ({
  ...repo(id),
  file: "AGENTS.md",
  length,
  pass: 1,
  fileUrl: null,
  ...over,
});

describe("percentile", () => {
  it("takes the nearest rank, clamped to the list", () => {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    assert.equal(percentile(xs, 10), 1);
    assert.equal(percentile(xs, 25), 3);
    assert.equal(percentile(xs, 90), 9);
    assert.equal(percentile(xs, 0), 1);
    assert.equal(percentile(xs, 100), 10);
  });
});

describe("buildAgentsMdSize", () => {
  it("buckets on half-open edges that meet the agents' caps", () => {
    const rows = [500, 1024, 4095, 8192, DEVIN_CAP, CODEX_CAP, CODEX_CAP + 1].map((n, i) => row(i + 1, n));
    const s = buildAgentsMdSize(rows, rows);
    assert.deepEqual(
      s.buckets.map((b) => b.count),
      [1, 2, 0, 1, 1, 2],
    );
    assert.equal(s.measured, 7);
  });

  it("counts only root AGENTS.md files against Devin's and Codex's caps", () => {
    const rows = [
      row(1, DEVIN_CAP + 1),
      row(2, CODEX_CAP + 1),
      row(3, CODEX_CAP + 1, { file: "CLAUDE.md" }),
      row(4, 100, { file: "agents.md" }),
    ];
    const s = buildAgentsMdSize(rows, rows);
    assert.deepEqual(s.devin, { over: 2, of: 3 });
    assert.deepEqual(s.codex, { over: 1, of: 3 });
    assert.deepEqual(
      s.byFile.map((f) => [f.label, f.count]),
      [
        ["AGENTS.md", 3],
        ["CLAUDE.md only", 1],
      ],
    );
  });

  it("leaves unmeasured files out and gives languages a median only past the minimum", () => {
    const rust = Array.from({ length: SIZE_GROUP_MIN }, (_, i) => row(i + 1, 1000 * (i + 1), { language: "Rust" }));
    const few = row(100, 5000, { language: "Zig" });
    const s = buildAgentsMdSize([...rust, few, row(200, null)], []);
    assert.equal(s.measured, SIZE_GROUP_MIN + 1);
    assert.deepEqual(
      s.byLanguage.map((l) => [l.label, l.slug, l.count]),
      [["Rust", "rust", SIZE_GROUP_MIN]],
    );
  });

  it("puts each repo in one star tier and scores repos without a file apart", () => {
    const rows = [row(1, 900, { stars: 5_000, score: 40 }), row(2, 20_000, { stars: 150_000, score: 80 })];
    const board = [...rows, repo(3, { score: 30 }), repo(4, { score: 50 })];
    const s = buildAgentsMdSize(rows, board);
    assert.deepEqual(
      s.byStars.map((t) => [t.label, t.count]),
      [
        ["Under 10k ★", 1],
        ["100k+ ★", 1],
      ],
    );
    assert.equal(s.medianScoreWithout, 40);
    assert.equal(s.buckets[0].medianScore, 40);
  });

  it("has no quantiles without a measured file", () => {
    assert.equal(buildAgentsMdSize([], []).quantiles, null);
  });
});

describe("size page copy", () => {
  it("fits the search-result limits at a realistic count", () => {
    for (const n of [9, 226, 9999]) {
      assert.ok(sizeTitle(n).length <= MAX_TITLE_LENGTH, sizeTitle(n));
      assert.ok(pageTitle(sizeTitle(n)).absolute.length <= MAX_TITLE_LENGTH);
      const d = sizeDescription({ measured: n, quantiles: { p10: 1, p25: 2, p50: 123_456, p75: 4, p90: 5 } });
      assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, d);
    }
  });
});
