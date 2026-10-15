import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHECK_CONTENT } from "../lib/check-content";
import { DEFAULT_DIR, DEFAULT_SORT } from "../lib/constants/sort";
import { leaderboardDescription, leaderboardTitle } from "../lib/leaderboard-meta";
import type { LeaderboardView } from "../lib/leaderboard-view";
import { MODELS } from "../lib/scoring/weights";
import type { LeaderboardRow } from "../lib/types/db";
import { fitDescription, MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

function view(over: Partial<LeaderboardView> = {}): LeaderboardView {
  const rows = Array.from({ length: 357 }, (_, i) => ({
    owner: "a-rather-long-organisation",
    name: `an-even-longer-repository-name-${i}`,
    score: 90 - i / 10,
  })) as unknown as LeaderboardRow[];
  return {
    q: "",
    page: 1,
    totalPages: 12,
    dir: DEFAULT_DIR,
    sort: DEFAULT_SORT,
    host: "all",
    model: "overall",
    filtered: false,
    filteredRows: rows,
    ...over,
  };
}

describe("pageTitle", () => {
  it("keeps the brand only while the whole title fits", () => {
    assert.equal(pageTitle("Roadmap").absolute, "Roadmap · Agent Friendly Code");
    const long = "GitHub Action: score every pull request";
    assert.equal(pageTitle(long).absolute, long);
  });
});

describe("fitDescription", () => {
  it("drops the trailing sentences that overflow, never the first", () => {
    assert.equal(fitDescription("One.", "Two."), "One. Two.");
    assert.equal(fitDescription("One.", "x".repeat(MAX_DESCRIPTION_LENGTH)), "One.");
  });
});

describe("check page titles", () => {
  it("fit a search result", () => {
    for (const [id, c] of Object.entries(CHECK_CONTENT)) {
      assert.ok(pageTitle(c.metaTitle ?? c.title).absolute.length <= MAX_TITLE_LENGTH, id);
      assert.ok(c.description.length <= MAX_DESCRIPTION_LENGTH, id);
    }
  });
});

describe("leaderboard metadata", () => {
  it("fits every board and page, with long repo names", () => {
    for (const model of ["overall" as const, ...MODELS.map((m) => m.id)]) {
      for (const page of [1, 12]) {
        for (const host of ["all", "bitbucket"] as const) {
          const v = view({ model, page, host, filtered: host !== "all" });
          assert.ok(leaderboardTitle(v).length <= MAX_TITLE_LENGTH, leaderboardTitle(v));
          assert.ok(leaderboardDescription(v).length <= MAX_DESCRIPTION_LENGTH, leaderboardDescription(v));
        }
      }
    }
  });

  it("names only the host a filtered board shows", () => {
    const d = leaderboardDescription(view({ model: "cursor", host: "github", filtered: true }));
    assert.match(d, /public GitHub repos/);
    assert.doesNotMatch(d, /GitLab|Bitbucket/);
    assert.match(leaderboardDescription(view({ model: "cursor" })), /GitHub, GitLab and Bitbucket/);
  });

  it("gives deeper pages their own title", () => {
    assert.notEqual(leaderboardTitle(view({ model: "aider", page: 2 })), leaderboardTitle(view({ model: "aider" })));
  });
});
