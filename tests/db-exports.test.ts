import "./_temp-db";

import { strict as assert } from "node:assert";
import { test } from "node:test";

// Callers import these from lib/db; the split behind it must not drop one.
const FUNCTIONS = [
  "dbVersion",
  "getLeaderboardStats",
  "getModelScores",
  "getPackageAlias",
  "getRepo",
  "getRepoByHostOwnerName",
  "getSignalPassRates",
  "getSignalResults",
  "getTopPackagesByRegistry",
  "listLeaderboard",
  "listLeaderboardOverall",
  "listScoreTimes",
  "listSignalFiles",
  "listSignalPasses",
  "putPackageAlias",
  "reconcileSeeds",
  "saveScoredRepo",
] as const;

test("every lib/db export resolves", async () => {
  const dbModule: Record<string, unknown> = await import("../lib/db");
  for (const name of FUNCTIONS) {
    assert.equal(typeof dbModule[name], "function", name);
  }
  assert.equal((dbModule.db as { open: boolean }).open, true);
  assert.deepEqual(Object.keys(dbModule).sort(), [...FUNCTIONS, "db"].sort());
});
