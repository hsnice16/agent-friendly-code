import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SignalResult } from "../lib/scoring/signals";
import type { LeaderboardRow } from "../lib/types/db";
import { buildRepoReport } from "../lib/utils/repo-report";
import { summarizeRepo } from "../lib/utils/repo-summary";

function row(id: number, score: number, language: string, stars: number): LeaderboardRow {
  return {
    id,
    score,
    language,
    stars,
    host: "github",
    url: `https://github.com/o/r${id}`,
    owner: "o",
    name: `r${id}`,
    overall_score: score,
    badge_embedded: 0,
    default_branch: null,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
  };
}

const signals = [
  {
    id: "agents_md",
    label: "AGENTS.md / CLAUDE.md",
    pass: 0.8,
    detail: "File exists (358 chars)",
    matchedPath: "CLAUDE.md",
  },
  { id: "readme", label: "README", pass: 1, detail: "README detailed (5295 chars)", matchedPath: "README.md" },
  { id: "pre_commit", label: "Pre-commit / git hooks", pass: 0, detail: "No pre-commit found" },
  { id: "gemini_md", label: "GEMINI.md", pass: 0, detail: "No GEMINI.md at repo root" },
] as SignalResult[];

const board = [row(1, 90, "Go", 10), row(2, 80, "Go", 500), row(3, 60, "Rust", 5)];
const scores = [
  { modelId: "claude-code", score: 82 },
  { modelId: "gemini-cli", score: 61 },
];
const summary = summarizeRepo(board[1], board, scores, signals);
assert.ok(summary);

const rates = {
  agents_md: { all: 0.5, language: 0.4 },
  readme: { all: 0.3, language: null },
  pre_commit: { all: 0.31, language: 0.25 },
  gemini_md: { all: 0.02, language: 0 },
};
const report = buildRepoReport({ repo: board[1], summary, board, signals, rates });

describe("buildRepoReport", () => {
  it("compares the repo with the leaderboard and its language average", () => {
    assert.deepEqual(
      report.comparisons.map((c) => [c.against, c.average.toFixed(1), c.diff.toFixed(1)]),
      [
        ["leaderboard average", "76.7", "3.3"],
        ["Go average", "85.0", "-5.0"],
      ],
    );
    assert.deepEqual(report.starsRank, { rank: 1, total: 2, language: "Go" });
  });

  it("lists shared gaps with their pass rates and skips single-agent files", () => {
    assert.deepEqual(report.missing, [{ label: "Pre-commit / git hooks", all: 0.31, language: 0.25 }]);
  });

  it("leaves AGENTS.md to the agent instructions panel", () => {
    const without = signals.map((x) => (x.id === "agents_md" ? { ...x, pass: 0, matchedPath: undefined } : x));
    const r = buildRepoReport({ repo: board[1], summary, board, signals: without, rates });
    assert.ok(!r.missing.some((m) => m.label.startsWith("AGENTS.md")));
  });

  it("lists checks it passes that fewer than half of repos do", () => {
    assert.deepEqual(report.rare, [{ label: "README", all: 0.3 }]);
  });

  it("names the fix that helps the most agents", () => {
    assert.ok(report.lift);
    assert.ok(report.lift.agents > 1 && report.lift.maxGain > 0);
  });

  it("leaves out the language comparison for a repo without a language hub", () => {
    const lone = { ...board[2] };
    const s = summarizeRepo(lone, board, scores, signals);
    assert.ok(s);
    const r = buildRepoReport({ repo: lone, summary: s, board, signals, rates });
    assert.equal(r.comparisons.length, 1);
    assert.equal(r.starsRank, null);
  });
});
