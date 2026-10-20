import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SignalResult } from "../lib/scoring/signals";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "../lib/utils/page-title";
import { repoDescription, repoTitle } from "../lib/utils/repo-meta";
import type { RepoSummary } from "../lib/utils/repo-summary";

const signal = (id: string, label: string, pass: number, matchedPath?: string) =>
  ({ id, label, pass, detail: "", matchedPath }) as SignalResult;

const withAgents = [signal("agents_md", "AGENTS.md / CLAUDE.md", 1, "AGENTS.md")];
const withoutAgents = [signal("agents_md", "AGENTS.md / CLAUDE.md", 0)];

const summary: RepoSummary = {
  passing: 1,
  signalCount: 4,
  best: null,
  worst: null,
  worstGap: null,
  rank: 12,
  total: 371,
  languageRank: { rank: 3, total: 40, language: "Go" },
};

describe("repoTitle", () => {
  it("names the host after the slug, for '<repo> github' searches", () => {
    assert.equal(repoTitle("o/r", 83.84, [], "github"), "o/r GitHub repo: agent readiness 83.8/100");
    assert.equal(repoTitle("o/r", 83.84, [], "gitlab"), "o/r GitLab repo: agent readiness 83.8/100");
    assert.equal(repoTitle("o/r", 83.84), "o/r repo: agent readiness 83.8/100");
  });

  it("drops words, never the slug or score, to stay within the limit", () => {
    const slug = "kubernetes-sigs/cluster-api-provider";
    for (const signals of [[], withAgents, withoutAgents]) {
      const title = repoTitle(slug, 70, signals, "github");
      assert.ok(title.length <= MAX_TITLE_LENGTH, title);
      assert.ok(title.startsWith(slug));
      assert.ok(title.endsWith("70.0/100"));
    }
  });

  it("keeps the host in a form that fits before dropping it", () => {
    assert.equal(
      repoTitle("Significant-Gravitas/AutoGPT", 49.7, withoutAgents, "github"),
      "Significant-Gravitas/AutoGPT on GitHub: agent score 49.7/100",
    );
  });

  it("leads with the AGENTS.md state when it fits", () => {
    assert.equal(
      repoTitle("axios/axios", 91.94, withAgents, "github"),
      "axios/axios GitHub repo: AGENTS.md, agent score 91.9/100",
    );
    assert.equal(
      repoTitle("golang/go", 31.2, withoutAgents, "github"),
      "golang/go GitHub repo: no AGENTS.md, agent score 31.2/100",
    );
    const claude = [signal("agents_md", "AGENTS.md / CLAUDE.md", 0.8, "CLAUDE.md")];
    assert.equal(repoTitle("o/r", 50, claude, "github"), "o/r GitHub repo: CLAUDE.md, agent score 50.0/100");
  });

  it("reads an empty instructions file as none", () => {
    const empty = [signal("agents_md", "AGENTS.md / CLAUDE.md", 0.2, "AGENTS.md")];
    assert.equal(repoTitle("o/r", 50, empty, "github"), "o/r GitHub repo: no AGENTS.md, agent score 50.0/100");
  });

  it("keeps the score when even the slug alone is too long", () => {
    const slug = `${"a".repeat(40)}/${"b".repeat(30)}`;
    const title = repoTitle(slug, 42, withAgents, "github");
    assert.ok(title.length <= MAX_TITLE_LENGTH, title);
    assert.ok(title.startsWith("aaaa") && title.endsWith(" 42.0/100"), title);
  });

  it("gives every slug its own title", () => {
    const slugs = ["o/r", "o/r2", "kicad/code/kicad", "a-long-owner/a-long-repository-name-here"];
    const titles = slugs.flatMap((s) => [
      repoTitle(s, 60, withAgents, "github"),
      repoTitle(`x${s}`, 60, withoutAgents, "gitlab"),
    ]);
    assert.equal(new Set(titles).size, titles.length);
  });

  it("has no score part for an unscored repo", () => {
    assert.equal(repoTitle("o/r", null, [], "github"), "o/r GitHub repo: AI agent readiness");
  });
});

describe("repoDescription", () => {
  const signals = [
    signal("tests", "Test suite", 0),
    signal("pre_commit", "Pre-commit / git hooks", 0),
    signal("aider_conf", ".aider.conf.yml", 0),
    signal("readme", "README", 1),
  ];

  it("leads with the slug, score and both ranks", () => {
    assert.match(
      repoDescription("o/r", summary, 81, signals),
      /^o\/r scores 81\.0\/100 for AI agent readiness: #12 of 371, #3 of 40 in Go\./,
    );
  });

  it("names this repo's missing cross-agent checks, not single-agent files", () => {
    const d = repoDescription("o/r", summary, 81, signals);
    assert.match(d, /Missing: .*Test suite/);
    assert.match(d, /Pre-commit \/ git hooks/);
    assert.doesNotMatch(d, /aider/);
  });

  it("stays within the limit for a long slug and many gaps", () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      signal(["tests", "ci", "readme", "license"][i % 4], `Check ${i}`, 0),
    );
    const d = repoDescription("some-very-long-owner-name/and-a-long-repo-name", summary, 50, many);
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, `${d.length}: ${d}`);
  });

  it("names what it has when nothing shared is missing", () => {
    const all = [
      signal("agents_md", "AGENTS.md / CLAUDE.md", 1, "AGENTS.md"),
      signal("readme", "README", 1),
      signal("tests", "Test suite", 1),
      signal("ci", "CI configuration", 1),
      signal("linter", "Linter / formatter config", 0.5),
      signal("gemini_md", "GEMINI.md", 0),
    ];
    const d = repoDescription("o/r", summary, 90, all);
    assert.match(d, /Has AGENTS\.md, tests, CI, a linter config and a README\./);
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, d);
  });

  it("falls back without a summary", () => {
    assert.match(repoDescription("o/r", null, null, []), /^How ready o\/r is/);
  });

  it("leads with the repo's own description when it fits beside the score", () => {
    const d = repoDescription("o/r", summary, 81, signals, "A tiny HTTP client");
    assert.match(
      d,
      /^o\/r: A tiny HTTP client\. Scores 81\.0\/100 for AI agent readiness: #12 of 371, #3 of 40 in Go\. /,
    );
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, d);

    const fallback = repoDescription("o/r", null, null, [], "A tiny HTTP client.");
    assert.match(fallback, /^How ready o\/r is .* A tiny HTTP client\.$/);
  });

  it("leaves out a description that would not fit whole, and is unchanged without one", () => {
    const without = repoDescription("o/r", summary, 81, signals);
    assert.equal(repoDescription("o/r", summary, 81, signals, "x".repeat(120)), without);
    assert.equal(repoDescription("o/r", summary, 81, signals, null), without);
  });
});
