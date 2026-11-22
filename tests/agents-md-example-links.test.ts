import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  exampleLinksForRepo,
  frameworkLinksForLanguage,
  languageLinksForFramework,
} from "../lib/agents-md-example-links";
import { buildAgentsMdExamples } from "../lib/agents-md-examples";
import { DJANGO } from "../lib/framework-guides/django";
import type { LeaderboardRow, SignalFile } from "../lib/types/db";

function repo(id: number, owner: string, name: string, language: string): LeaderboardRow {
  return {
    id,
    host: "github",
    owner,
    name,
    url: `https://github.com/${owner}/${name}`,
    stars: id,
    language,
    score: 50,
    overall_score: 50,
    default_branch: "main",
    badge_embedded: 0,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
  };
}

const file = (repoId: number): SignalFile => ({
  repoId,
  pass: 1,
  matchedPath: "AGENTS.md",
  detail: "Substantive (1000 chars)",
});

// Django's hand-picked repos plus two more Python repos: enough for a Python page and a Django page.
const python = [
  ...DJANGO.repos.map((k, i) => {
    const [, owner, name] = k.split("/");
    return repo(i + 1, owner, name, "Python");
  }),
  repo(10, "o", "py1", "Python"),
  repo(11, "o", "py2", "Python"),
];
const go = [1, 2, 3].map((i) => repo(20 + i, "o", `go${i}`, "Go"));
const board = [...python, ...go];
const ex = buildAgentsMdExamples(
  board,
  board.map((r) => file(r.id)),
);

describe("exampleLinksForRepo", () => {
  it("links the repo's language page, then its framework page", () => {
    const [owner, name] = DJANGO.repos[0].split("/").slice(1);
    assert.deepEqual(
      exampleLinksForRepo(ex, { host: "github", owner: owner.toLowerCase(), name, language: "Python" }).map(
        (l) => l.href,
      ),
      ["/check/agents-md/examples/python", "/check/agents-md/examples/django"],
    );
  });

  it("links nothing for a language too small for a page", () => {
    assert.deepEqual(exampleLinksForRepo(ex, { host: "github", owner: "o", name: "go1", language: "Go" }), []);
  });
});

describe("language and framework cross-links", () => {
  it("links a language to its frameworks and back", () => {
    assert.ok(frameworkLinksForLanguage(ex, "python").some((l) => l.label === "Django"));
    assert.deepEqual(frameworkLinksForLanguage(ex, "go"), []);
    assert.deepEqual(
      languageLinksForFramework(ex, DJANGO).map((l) => l.href),
      ["/check/agents-md/examples/python"],
    );
  });
});
