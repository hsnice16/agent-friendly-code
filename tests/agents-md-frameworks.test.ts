import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAgentsMdExamples } from "../lib/agents-md-examples";
import {
  examplesByFramework,
  FRAMEWORK_EXAMPLES_MIN,
  frameworkExamplesDescription,
  frameworkExamplesTitle,
} from "../lib/agents-md-frameworks";
import { LINGUIST_NAMES } from "../lib/clients/language";
import { FRAMEWORKS } from "../lib/framework-guides";
import type { FrameworkGuide } from "../lib/framework-guides/types";
import type { LeaderboardRow, SignalFile } from "../lib/types/db";
import { languageSlug } from "../lib/utils/language";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

function repo(id: number, name: string, over: Partial<LeaderboardRow> = {}): LeaderboardRow {
  return {
    id,
    host: "github",
    owner: "o",
    name,
    url: `https://github.com/o/${name}`,
    stars: id * 10,
    language: "TypeScript",
    score: 50,
    overall_score: 50,
    default_branch: "main",
    badge_embedded: 0,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
    ...over,
  };
}

const file = (repoId: number, pass = 1): SignalFile => ({
  repoId,
  pass,
  matchedPath: "AGENTS.md",
  detail: pass >= 0.5 ? "Substantive (1000 chars)" : "File exists but empty",
});

const guide = (over: Partial<FrameworkGuide>): FrameworkGuide => ({
  ...FRAMEWORKS[0],
  repos: ["github/o/a", "github/O/B", "github/o/c", "github/o/d"],
  frameworkRepo: "github/o/fw",
  ...over,
});

describe("examplesByFramework", () => {
  const board = ["a", "b", "c", "d", "fw"].map((n, i) => repo(i + 1, n));
  const ex = buildAgentsMdExamples(board, [file(1), file(2), file(3, 0.8), file(4, 0.2), file(5)]);

  it("keeps listed repos with a file, case-insensitively, most-starred first", () => {
    const [f] = examplesByFramework(ex, [guide({ languages: ["TypeScript"] })]);
    assert.deepEqual(
      f.rows.map((r) => r.name),
      ["c", "b", "a"],
    );
    assert.equal(f.passing, 2);
    assert.equal(f.own?.name, "fw");
  });

  it("lists repos in the framework's language before others", () => {
    const mixed = buildAgentsMdExamples(
      [repo(1, "a"), repo(2, "b", { language: "Python" }), repo(3, "c")],
      [file(1), file(2), file(3)],
    );
    const [f] = examplesByFramework(mixed, [guide({ languages: ["TypeScript"] })]);
    assert.deepEqual(
      f.rows.map((r) => r.name),
      ["c", "a", "b"],
    );
  });

  it("drops a framework below the minimum", () => {
    assert.equal(FRAMEWORK_EXAMPLES_MIN, 3);
    assert.deepEqual(examplesByFramework(ex, [guide({ repos: ["github/o/a", "github/o/b"] })]), []);
  });
});

describe("framework guides", () => {
  it("never share a slug with a language page", () => {
    const languages = new Set(LINGUIST_NAMES.map(languageSlug));
    for (const f of FRAMEWORKS) assert.ok(!languages.has(f.slug), f.slug);
    assert.equal(new Set(FRAMEWORKS.map((f) => f.slug)).size, FRAMEWORKS.length);
  });

  it("cite official docs and list no repo twice", () => {
    for (const f of FRAMEWORKS) {
      assert.ok(f.sources.length > 0, f.slug);
      assert.ok(
        f.sources.every((u) => u.startsWith("https://")),
        f.slug,
      );
      assert.equal(new Set(f.repos.map((r) => r.toLowerCase())).size, f.repos.length, f.slug);
    }
  });

  it("fit a search result with a three-digit count", () => {
    for (const g of FRAMEWORKS) {
      const f = { guide: g, rows: Array(100).fill(null), passing: 100, own: null };
      assert.ok(pageTitle(frameworkExamplesTitle(f)).absolute.length <= MAX_TITLE_LENGTH, g.slug);
      assert.ok(frameworkExamplesDescription(f).length <= MAX_DESCRIPTION_LENGTH, g.slug);
    }
  });
});
