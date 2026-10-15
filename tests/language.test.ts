import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LANGUAGE_HUB_MIN_REPOS } from "../lib/constants/scoring";
import { averageScore, groupByLanguage, isHub, languageSlug } from "../lib/utils/language";

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

describe("isHub", () => {
  it("starts at exactly the minimum repo count", () => {
    assert.equal(isHub({ rows: Array(LANGUAGE_HUB_MIN_REPOS).fill(0) }), true);
    assert.equal(isHub({ rows: Array(LANGUAGE_HUB_MIN_REPOS - 1).fill(0) }), false);
  });
});

describe("averageScore", () => {
  it("is 0, not NaN, for no rows", () => {
    assert.equal(averageScore([]), 0);
    assert.equal(averageScore([{ score: 40 }, { score: null }, { score: 80 }]), 40);
  });
});
