import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { LeaderboardRow } from "../lib/types/db";
import { similarNote, similarRepos } from "../lib/utils/similar-repos";

function row(id: number, score: number, language: string | null, host = "github"): LeaderboardRow {
  return {
    id,
    score,
    language,
    host,
    url: `https://${host}.com/o/r${id}`,
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

const ids = (rows: LeaderboardRow[]) => rows.map((r) => r.id);

describe("similarRepos", () => {
  it("prefers same language and host, nearest by score, in leaderboard order", () => {
    const repo = row(1, 70, "Go");
    const board = [row(2, 95, "Go"), row(3, 75, "Go"), repo, row(4, 66, "Go"), row(5, 30, "Go"), row(6, 70, "Rust")];
    assert.deepEqual(ids(similarRepos(repo, board, 2)), [3, 4]);
  });

  it("falls back to the same language on another host, matching case-insensitively", () => {
    const repo = row(1, 70, "C++", "gitlab");
    const board = [row(2, 72, "c++", "github"), row(3, 71, "Rust", "gitlab"), repo];
    assert.deepEqual(ids(similarRepos(repo, board, 1)), [2]);
  });

  it("fills the rest with the closest overall scores, never the repo itself", () => {
    const repo = row(1, 70, "Erlang", "bitbucket");
    const board = [row(2, 90, "Go"), row(3, 72, "Rust"), repo, row(4, 69, "Go"), row(5, 10, "Erlang", "github")];
    const picked = ids(similarRepos(repo, board, 3));
    assert.deepEqual(picked, [3, 4, 5]);
    assert.ok(!picked.includes(1));
  });

  it("returns every other repo when the board is smaller than the limit", () => {
    const repo = row(1, 70, null);
    assert.deepEqual(ids(similarRepos(repo, [repo, row(2, 50, "Go")], 6)), [2]);
  });
});

describe("similarNote", () => {
  const repo = row(1, 70, "Go");
  const sameHost = row(2, 70, "go");
  const otherHost = row(3, 70, "Go", "gitlab");
  const otherLanguage = row(4, 70, "Rust");

  const cases: [string, LeaderboardRow[], string][] = [
    ["no rows", [], ""],
    ["same language and host only", [sameHost], "Same language and host as this repo, closest in overall score."],
    [
      "same language, other hosts only",
      [otherHost],
      "Same language as this repo on other hosts, closest in overall score.",
    ],
    ["closest score only", [otherLanguage], "The repos closest to it in overall score."],
    [
      "same host, then other hosts",
      [otherHost, sameHost],
      "Same language and host first, then same language on other hosts, closest in overall score.",
    ],
    [
      "same host, then closest score",
      [sameHost, otherLanguage],
      "Same language and host first, then the repos closest in overall score.",
    ],
    [
      "other hosts, then closest score",
      [otherLanguage, otherHost],
      "Same language on other hosts first, then the repos closest in overall score.",
    ],
    [
      "all three tiers",
      [sameHost, otherHost, otherLanguage],
      "Same language and host first, then same language on other hosts, then the repos closest in overall score.",
    ],
  ];

  for (const [name, rows, note] of cases) {
    it(name, () => assert.equal(similarNote(repo, rows), note));
  }

  it("treats every row as a score match when the repo has no language", () => {
    assert.equal(similarNote(row(1, 70, null), [row(2, 70, null)]), "The repos closest to it in overall score.");
  });
});
