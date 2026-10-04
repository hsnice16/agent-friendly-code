import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import type { SignalResult } from "../lib/scoring/signals";
import { MODEL_BY_ID } from "../lib/scoring/weights";
import type { LeaderboardRow } from "../lib/types/db";
import { keySignals, summarizeRepo, summaryDescription, topPercent } from "../lib/utils/repo-summary";

function row(id: number, score: number | null, language: string | null): LeaderboardRow {
  return {
    id,
    score,
    language,
    url: `https://github.com/o/r${id}`,
    host: "github",
    owner: "o",
    name: `r${id}`,
    stars: null,
    overall_score: score,
    badge_embedded: 0,
    default_branch: null,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
  };
}

function signal(id: string, pass: number): SignalResult {
  return { id, label: id, pass, detail: "" } as SignalResult;
}

// Already in leaderboard order, as listLeaderboardOverall returns it (ties by stars).
const board = [row(1, 90, "Go"), row(4, 80, "Go"), row(2, 80, "Go"), row(3, 70, "Rust")];
const signals = [signal("agents_md", 1), signal("tests", 1), signal("aider_conf", 0), signal("gemini_md", 0)];

describe("summarizeRepo", () => {
  test("returns null for an unscored repo", () => {
    assert.equal(summarizeRepo(row(9, null, "Go"), board, [], signals), null);
  });

  test("rank is the leaderboard position, so ties match the table", () => {
    const s = summarizeRepo(board[2], board, [], signals);
    assert.equal(s?.rank, 3);
    assert.equal(s?.total, 4);
    assert.deepEqual(s?.languageRank, { rank: 3, total: 3, language: "Go" });
  });

  test("returns null for a repo missing from the leaderboard", () => {
    assert.equal(summarizeRepo(row(9, 50, "Go"), board, [], signals), null);
  });

  test("omits the language rank when the repo is alone in its language", () => {
    assert.equal(summarizeRepo(board[3], board, [], signals)?.languageRank, null);
  });

  test("names best and worst agent, and the worst one's biggest gap", () => {
    const scores = [
      { modelId: "claude-code", score: 88 },
      { modelId: "aider", score: 60 },
    ];
    const s = summarizeRepo(board[0], board, scores, signals);
    assert.equal(s?.best?.model.id, "claude-code");
    assert.equal(s?.worst?.model.id, "aider");
    assert.equal(s?.worstGap?.label, "aider_conf");
    assert.equal(s?.best?.tiedWith, 0);
    assert.equal(s?.passing, 2);
  });

  test("has no worst agent when every agent scores the same", () => {
    const scores = [
      { modelId: "claude-code", score: 70 },
      { modelId: "aider", score: 70 },
    ];
    const s = summarizeRepo(board[0], board, scores, signals);
    assert.equal(s?.worst, null);
    assert.equal(s?.best?.tiedWith, 1);
    assert.doesNotMatch(summaryDescription("o/r1", s, 90), /Works best/);
  });
});

describe("topPercent", () => {
  test("only shown for the top half", () => {
    const s = summarizeRepo(board[0], board, [], signals);
    assert.ok(s);
    assert.equal(topPercent({ ...s, rank: 1, total: 372 }), 1);
    assert.equal(topPercent({ ...s, rank: 186, total: 372 }), 50);
    assert.equal(topPercent({ ...s, rank: 300, total: 372 }), null);
  });
});

describe("keySignals", () => {
  test("skips signals the model does not weigh", () => {
    const ids = keySignals(MODEL_BY_ID["claude-code"], signals).map((s) => s.id);
    assert.deepEqual(ids, ["agents_md", "tests"]);
  });
});

describe("summaryDescription", () => {
  test("is repo-specific when a summary exists", () => {
    const s = summarizeRepo(board[0], board, [], signals);
    assert.match(summaryDescription("o/r1", s, 90), /^o\/r1 scores 90\.0 out of 100 .* #1 of 4\./);
  });
});
