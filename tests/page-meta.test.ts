import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHECK_CONTENT } from "../lib/check-content";
import { VS_AGENTS_MD } from "../lib/check-content/vs-agents-md";
import { LEAD_MIN_STARS, LEADERBOARD_FIRST_PAGE_SIZE, LEADERBOARD_PAGE_SIZE } from "../lib/constants/scoring";
import {
  boardLeader,
  leaderboardDescription,
  leaderboardMetadata,
  leaderboardTitle,
  meetsLeadFloor,
  pageRanks,
} from "../lib/leaderboard-meta";
import type { LeaderboardView } from "../lib/leaderboard-view";
import { MODELS } from "../lib/scoring/weights";
import type { LeaderboardRow } from "../lib/types/db";
import { fitDescription, MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

function view(over: Partial<LeaderboardView> = {}): LeaderboardView {
  const rows = Array.from({ length: 357 }, (_, i) => ({
    owner: "a-rather-long-organisation",
    name: `an-even-longer-repository-name-${i}`,
    score: 90 - i / 10,
    stars: 50_000,
  })) as unknown as LeaderboardRow[];
  return { page: 1, totalPages: 12, model: "overall", allRows: rows, ...over };
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

  it("fit a search result on the vs-agents-md pages", () => {
    for (const [id, c] of Object.entries(VS_AGENTS_MD)) {
      assert.ok(pageTitle(c.title).absolute.length <= MAX_TITLE_LENGTH, id);
      assert.ok(c.description.length <= MAX_DESCRIPTION_LENGTH, id);
    }
  });
});

describe("leaderboard metadata", () => {
  it("fits every board and page, with long repo names", () => {
    for (const model of ["overall" as const, ...MODELS.map((m) => m.id)]) {
      for (const page of [1, 12]) {
        const v = view({ model, page });
        assert.ok(leaderboardTitle(v).length <= MAX_TITLE_LENGTH, leaderboardTitle(v));
        assert.ok(leaderboardDescription(v).length <= MAX_DESCRIPTION_LENGTH, leaderboardDescription(v));
      }
    }
  });

  it("words every agent board the same, for the searches that reach it", () => {
    for (const m of MODELS) {
      const t = leaderboardTitle(view({ model: m.id }));
      assert.equal(t, `Best GitHub repos for ${m.label}: ranked leaderboard`);
      assert.match(leaderboardDescription(view({ model: m.id })), new RegExp(`^The ${m.label} leaderboard: `));
    }
  });

  it("gives deeper pages their own title", () => {
    assert.notEqual(leaderboardTitle(view({ model: "aider", page: 2 })), leaderboardTitle(view({ model: "aider" })));
  });

  it("names the best repo above the star floor, not a tiny one ranked first", () => {
    const rows = [
      { owner: "tiny", name: "one", score: 100, stars: 2 },
      { owner: "big", name: "two", score: 92.5, stars: LEAD_MIN_STARS },
    ] as unknown as LeaderboardRow[];
    assert.equal(boardLeader(rows)?.owner, "big");
    assert.equal(boardLeader(rows.slice(0, 1)), undefined);
    assert.deepEqual(rows.map(meetsLeadFloor), [false, true]);

    const d = leaderboardDescription(view({ model: "claude-code", allRows: rows }));
    assert.match(d, /big\/two \(92.5\)/);
    assert.doesNotMatch(d, /tiny\/one/);
  });

  it("keeps page 2+ out of the index but crawlable, each its own canonical", () => {
    assert.equal(leaderboardMetadata(view({ model: "cursor" })).robots, undefined);
    for (const model of ["overall" as const, "cursor" as const]) {
      const meta = leaderboardMetadata(view({ model, page: 2 }));
      assert.deepEqual(meta.robots, { index: false, follow: true });
      assert.equal(meta.alternates?.canonical, model === "overall" ? "/page/2" : "/model/cursor/page/2");
    }
  });
});

describe("pageRanks", () => {
  it("gives the 1-based ranks each page shows, the last page cut short", () => {
    const allRows = view().allRows;
    assert.deepEqual(pageRanks({ page: 1, allRows }), { first: 1, last: LEADERBOARD_FIRST_PAGE_SIZE });
    assert.deepEqual(pageRanks({ page: 2, allRows }), {
      first: LEADERBOARD_FIRST_PAGE_SIZE + 1,
      last: Math.min(allRows.length, LEADERBOARD_FIRST_PAGE_SIZE + LEADERBOARD_PAGE_SIZE),
    });
    assert.deepEqual(pageRanks({ page: 1, allRows: allRows.slice(0, 3) }), { first: 1, last: 3 });
  });
});
