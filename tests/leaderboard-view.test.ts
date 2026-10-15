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
  it("reads the first value of a repeated key instead of throwing", () => {
    const view = resolveLeaderboardView("overall", { q: ["alp", "zzz"], host: ["github", "gitlab"], page: ["1"] });
    assert.deepEqual(
      view.filteredRows.map((r) => r.name),
      ["alpha"],
    );
    assert.equal(view.host, "github");
  });

  it("a blank search is no search, so the view is not marked filtered", () => {
    const view = resolveLeaderboardView("overall", { q: "   " });
    assert.equal(view.q, "");
    assert.equal(view.filtered, false);
    assert.equal(view.filteredRows.length, 3);
  });

  it("clamps an out-of-range or junk page", () => {
    assert.equal(resolveLeaderboardView("overall", { page: "99" }).page, 1);
    assert.equal(resolveLeaderboardView("overall", { page: "abc" }).page, 1);
  });
});
