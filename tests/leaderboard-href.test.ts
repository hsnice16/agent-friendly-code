import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_DIR, DEFAULT_SORT } from "../lib/constants/sort";
import { type LeaderboardHrefParts, leaderboardHref } from "../lib/utils/leaderboard-href";
import { isModelId } from "../lib/utils/model-id";

const DEFAULTS: LeaderboardHrefParts = { model: "overall", host: "all", sort: DEFAULT_SORT, dir: DEFAULT_DIR, page: 1 };

describe("leaderboardHref", () => {
  it("gives each unfiltered board one address", () => {
    assert.equal(leaderboardHref(DEFAULTS), "/");
    assert.equal(leaderboardHref({ ...DEFAULTS, model: "claude-code" }), "/model/claude-code");
  });

  it("gives an uncut page its prerendered path", () => {
    assert.equal(leaderboardHref({ ...DEFAULTS, page: 2 }), "/page/2");
    assert.equal(leaderboardHref({ ...DEFAULTS, model: "aider", page: 7 }), "/model/aider/page/7");
  });

  it("keeps the agent in the path and the re-cuts in the query", () => {
    assert.equal(
      leaderboardHref({ ...DEFAULTS, model: "cursor", host: "github", q: "next", page: 3 }),
      "/model/cursor?host=github&q=next&page=3",
    );
  });
});

describe("isModelId", () => {
  it("rejects inherited object keys", () => {
    assert.equal(isModelId("claude-code"), true);
    assert.equal(isModelId("constructor"), false);
    assert.equal(isModelId(undefined), false);
  });
});
