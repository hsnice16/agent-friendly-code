import "./_temp-db";

import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { db, saveScoredRepo } from "../lib/db";
import { resolveLeaderboardView } from "../lib/leaderboard-view";

for (const [i, name] of ["alpha", "beta", "gamma"].entries()) {
  saveScoredRepo({
    name,
    owner: "o",
    host: i === 2 ? "gitlab" : "github",
    overall: 50 + i,
    modelScores: [],
    url: `https://example.com/o/${name}`,
    signals: [],
  });
}

after(() => db.close());

describe("resolveLeaderboardView", () => {
  it("lists the whole board in rank order", () => {
    assert.deepEqual(
      resolveLeaderboardView("overall").allRows.map((r) => r.name),
      ["gamma", "beta", "alpha"],
    );
  });

  it("clamps an out-of-range or junk page", () => {
    assert.equal(resolveLeaderboardView("overall", 99).page, 1);
    assert.equal(resolveLeaderboardView("overall", Number("abc")).page, 1);
  });
});
