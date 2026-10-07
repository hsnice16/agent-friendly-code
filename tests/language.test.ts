import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LANGUAGE_HUB_MIN_REPOS } from "../lib/constants/scoring";
import { groupByLanguage, isHub, languageSlug, nearestByScore } from "../lib/utils/language";

describe("languageSlug", () => {
  it("spells out languages whose names are only punctuation apart", () => {
    assert.equal(languageSlug("C++"), "cpp");
    assert.equal(languageSlug("C#"), "csharp");
    assert.equal(languageSlug("C"), "c");
  });

  it("hyphenates multi-word names", () => {
    assert.equal(languageSlug("Jupyter Notebook"), "jupyter-notebook");
  });
});

describe("groupByLanguage", () => {
  const row = (id: number, language: string | null) => ({ id, language });

  it("merges casing variants under the most common spelling", () => {
    const groups = groupByLanguage([row(1, "Java"), row(2, "java"), row(3, "Java")]);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].label, "Java");
    assert.deepEqual(
      groups[0].rows.map((r) => r.id),
      [1, 2, 3],
    );
  });

  it("breaks a spelling tie toward the capitalised form", () => {
    assert.equal(groupByLanguage([row(1, "java"), row(2, "Java")])[0].label, "Java");
  });

  it("drops rows with no language and orders groups largest first", () => {
    const groups = groupByLanguage([row(1, "Go"), row(2, null), row(3, "Rust"), row(4, "Rust")]);
    assert.deepEqual(
      groups.map((g) => g.slug),
      ["rust", "go"],
    );
  });
});

describe("nearestByScore", () => {
  const peers = [90, 80, 70, 60, 50, 40].map((score, id) => ({ id, score }));

  it("picks the peers on either side of the score, not the top of the list", () => {
    assert.deepEqual(
      nearestByScore(peers, 65, 3).map((p) => p.score),
      [70, 60, 50],
    );
  });

  it("clamps the window at either end", () => {
    assert.deepEqual(
      nearestByScore(peers, 99, 3).map((p) => p.score),
      [90, 80, 70],
    );
    assert.deepEqual(
      nearestByScore(peers, 10, 3).map((p) => p.score),
      [60, 50, 40],
    );
  });

  it("returns every peer when there are no more than the limit", () => {
    assert.equal(nearestByScore(peers.slice(0, 2), 50, 3).length, 2);
  });

  it("links every peer from at least one other page", () => {
    const linked = new Set<number>();
    for (const p of peers) {
      const others = peers.filter((o) => o.id !== p.id);
      for (const n of nearestByScore(others, p.score, 3)) linked.add(n.id);
    }
    assert.equal(linked.size, peers.length);
  });

  it("places a score after the peers it ties with", () => {
    const tied = [80, 70, 70, 70, 60].map((score, id) => ({ id, score }));
    assert.deepEqual(
      nearestByScore(tied, 70, 3).map((p) => p.id),
      [2, 3, 4],
    );
  });
});

describe("isHub", () => {
  it("starts at exactly the minimum repo count", () => {
    assert.equal(isHub({ rows: Array(LANGUAGE_HUB_MIN_REPOS).fill(0) }), true);
    assert.equal(isHub({ rows: Array(LANGUAGE_HUB_MIN_REPOS - 1).fill(0) }), false);
  });
});
