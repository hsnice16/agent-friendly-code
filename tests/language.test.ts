import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LANGUAGE_HUB_MIN_REPOS } from "../lib/constants/scoring";
import {
  averageScore,
  groupByLanguage,
  hubAgentsPath,
  isHub,
  languageRedirect,
  languageSlug,
} from "../lib/utils/language";

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

describe("languageRedirect", () => {
  it("sends a spelling to its canonical hub and leaves the canonical one alone", () => {
    assert.deepEqual(languageRedirect("/language/C%2B%2B"), { pathname: "/language/cpp", hash: "" });
    assert.deepEqual(languageRedirect("/language/TypeScript"), { pathname: "/language/typescript", hash: "" });
    assert.equal(languageRedirect("/language/typescript"), null);
  });

  it("sends the retired agents page, in any spelling, to the hub section in one hop", () => {
    const agents = { pathname: "/language/kotlin", hash: "agents" };
    assert.deepEqual(languageRedirect("/language/kotlin/agents"), agents);
    assert.deepEqual(languageRedirect("/language/Kotlin/agents"), agents);
    assert.equal(hubAgentsPath("kotlin"), `${agents.pathname}#${agents.hash}`);
  });

  it("serves a path it cannot decode or slug as is", () => {
    assert.equal(languageRedirect("/language/%E0%A4%A"), null);
    assert.equal(languageRedirect("/language/%2B%2B/agents"), null);
  });
});
