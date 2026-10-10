import "./_temp-db";

import { strict as assert } from "node:assert";
import { after, beforeEach, describe, test } from "node:test";

import {
  db,
  getModelScores,
  getRepoByHostOwnerName,
  getTopPackagesByRegistry,
  putPackageAlias,
  reconcileSeeds,
  saveScoredRepo,
} from "../lib/db";
import { seedTargets } from "../lib/seeds";

function score(owner: string, name: string, overall = 50): number {
  return saveScoredRepo({
    owner,
    name,
    overall,
    signals: [],
    host: "github",
    badgeEmbedded: true,
    url: `https://github.com/${owner}/${name}`,
    modelScores: [{ modelId: "claude-code", modelLabel: "Claude Code", score: overall, contributions: [] }],
  });
}

const urls = () => (db.prepare("SELECT url FROM repo ORDER BY url").all() as { url: string }[]).map((r) => r.url);

describe("reconcileSeeds", () => {
  beforeEach(() => {
    db.exec("DELETE FROM repo; DELETE FROM package_alias;");
  });

  after(() => db.close());

  // First on purpose: the committed database has no alias table until a seed
  // run creates one, and the site has to serve from it in the meantime.
  test("before any seed run, the old name is served directly and the new one is simply absent", () => {
    assert.equal(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'repo_alias'").get(), undefined);
    const id = score("facebook", "react");

    const row = getRepoByHostOwnerName("github", "facebook", "react");
    assert.equal(row?.id, id);
    assert.equal(row?.owner, "facebook");
    assert.equal(getRepoByHostOwnerName("github", "react", "react"), null);
  });

  test("prunes rows that are not seeds, with their scores", () => {
    const gone = score("DefiLlama", "defillama-app");
    score("honojs", "hono");

    const result = reconcileSeeds(seedTargets([{ url: "https://github.com/HonoJS/Hono" }]), 10);

    assert.deepEqual(result.pruned, ["https://github.com/DefiLlama/defillama-app"]);
    assert.deepEqual(getModelScores(gone), [], "model_score rows must cascade");
    assert.equal(getRepoByHostOwnerName("github", "DefiLlama", "defillama-app"), null);
  });

  test("a seed spelled in another case keeps its row and takes the seed's spelling", () => {
    const id = score("honojs", "hono");

    const result = reconcileSeeds(seedTargets([{ url: "https://github.com/HonoJS/hono" }]), 10);

    assert.deepEqual(result.pruned, []);
    assert.deepEqual(urls(), ["https://github.com/HonoJS/hono"]);
    assert.equal(getRepoByHostOwnerName("github", "honojs", "hono")?.id, id);
  });

  test("renames in place: id, history and package links survive, and the old name resolves", () => {
    score("facebook", "react", 40);
    const id = score("facebook", "react", 60);
    putPackageAlias("npm", "react", "https://github.com/facebook/react");

    const seeds = seedTargets([{ url: "https://github.com/react/react", was: ["https://github.com/facebook/react"] }]);
    const result = reconcileSeeds(seeds, 0);

    assert.deepEqual(result.renamed, ["https://github.com/facebook/react → https://github.com/react/react"]);
    assert.deepEqual(result.pruned, []);

    const row = getRepoByHostOwnerName("github", "react", "react");
    assert.equal(row?.id, id);
    assert.equal(row?.previous_overall_score, 40);
    assert.equal(row?.badge_embedded, 1);
    assert.equal(getModelScores(id).length, 1);
    assert.equal(getTopPackagesByRegistry("npm", 5)[0]?.repoName, "react");

    const viaOldName = getRepoByHostOwnerName("github", "FACEBOOK", "React");
    assert.equal(viaOldName?.id, id);
    assert.equal(viaOldName?.owner, "react", "callers redirect on this mismatch");

    assert.equal(score("react", "react", 61), id, "the next score updates the renamed row");
    assert.deepEqual(reconcileSeeds(seeds, 0), { renamed: [], pruned: [] });
  });

  test("a row scored under the new name wins; the leftover old row is pruned and aliased", () => {
    score("facebook", "react");
    const kept = score("react", "react");

    const result = reconcileSeeds(
      seedTargets([{ url: "https://github.com/react/react", was: ["https://github.com/facebook/react"] }]),
      10,
    );

    assert.deepEqual(result.renamed, []);
    assert.deepEqual(result.pruned, ["https://github.com/facebook/react"]);
    assert.equal(getRepoByHostOwnerName("github", "facebook", "react")?.id, kept);
  });

  test("an alias dies with its repo", () => {
    score("facebook", "react");
    reconcileSeeds(
      seedTargets([{ url: "https://github.com/react/react", was: ["https://github.com/facebook/react"] }]),
      0,
    );
    score("honojs", "hono");

    reconcileSeeds(seedTargets([{ url: "https://github.com/honojs/hono" }]), 10);

    assert.equal(getRepoByHostOwnerName("github", "facebook", "react"), null);
  });

  test("refuses to prune past the limit and leaves every row, renames included", () => {
    score("facebook", "react");
    score("honojs", "hono");
    score("vercel", "next.js");

    assert.throws(
      () =>
        reconcileSeeds(
          seedTargets([{ url: "https://github.com/react/react", was: ["https://github.com/facebook/react"] }]),
          1,
        ),
      /refusing to prune 2 rows/,
    );
    assert.equal(urls().length, 3);
    assert.ok(urls().includes("https://github.com/facebook/react"));
  });
});
