import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTRIBUTE_LANGUAGE_TOP, LANGUAGE_AGENTS_MIN_REPOS } from "../lib/constants/scoring";
import {
  buildContributeList,
  CONTRIBUTE_SIGNAL_IDS,
  CONTRIBUTE_TITLE,
  type ContributeSignals,
  contributeDescription,
  hasPolicies,
} from "../lib/contribute";
import type { LeaderboardRow, SignalFile } from "../lib/types/db";
import { contributeAnchor, contributeLanguageHref } from "../lib/utils/contribute-path";
import { OWN_REPO } from "../lib/utils/own-repo";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

function repo(id: number, over: Partial<LeaderboardRow> = {}): LeaderboardRow {
  return {
    id,
    host: "github",
    owner: "o",
    name: `r${id}`,
    url: `https://github.com/o/r${id}`,
    stars: 1000,
    language: "Go",
    score: 100 - id,
    overall_score: 100 - id,
    default_branch: "main",
    badge_embedded: 0,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
    ...over,
  };
}

const sf = (repoId: number, pass: number, matchedPath: string | null = null): SignalFile => ({
  repoId,
  pass,
  matchedPath,
  detail: null,
});

/** Every repo passes everything unless `over` says otherwise. */
function signals(ids: number[], over: Partial<Record<keyof ContributeSignals, SignalFile[]>> = {}): ContributeSignals {
  const all = Object.fromEntries(
    CONTRIBUTE_SIGNAL_IDS.map((s) => [s, ids.map((id) => sf(id, 1, s === "agents_md" ? "AGENTS.md" : null))]),
  ) as ContributeSignals;
  return { ...all, ...over };
}

describe("buildContributeList", () => {
  it("needs CONTRIBUTING, tests and CI, and keeps board order", () => {
    const board = [1, 2, 3, 4].map((id) => repo(id));
    const list = buildContributeList(
      board,
      signals([1, 2, 3, 4], {
        contributing: [sf(1, 1), sf(2, 0), sf(3, 1), sf(4, 1)],
        tests: [sf(1, 0.7), sf(2, 1), sf(3, 0), sf(4, 1)],
      }),
    );
    assert.deepEqual(
      list.eligible.map((r) => r.id),
      [1, 4],
    );
  });

  it("marks agent file, dev setup and pre-commit from their checks", () => {
    const list = buildContributeList(
      [repo(1), repo(2)],
      signals([1, 2], {
        agents_md: [sf(1, 1, "CLAUDE.md"), sf(2, 0.2, "AGENTS.md")],
        dev_env: [sf(1, 0.6), sf(2, 0.7)],
        pre_commit: [sf(1, 1)],
      }),
    );
    const [a, b] = list.eligible;
    assert.equal(a.agentFile, "CLAUDE.md");
    assert.equal(b.agentFile, null, "an empty file is not an agent file");
    assert.deepEqual([a.devSetup, b.devSetup], [false, true]);
    assert.deepEqual([a.preCommit, b.preCommit], [true, false]);
  });

  it("leaves out the author's own repos", () => {
    const own = repo(1, { host: OWN_REPO.host, owner: OWN_REPO.owner, name: "anything" });
    const list = buildContributeList([own, repo(2)], signals([1, 2]));
    assert.deepEqual(
      list.eligible.map((r) => r.id),
      [2],
    );
    assert.equal(list.withWorkflow, 2);
  });

  it("gives a language a section of its top picks once it has enough board repos", () => {
    const go = Array.from({ length: LANGUAGE_AGENTS_MIN_REPOS }, (_, i) => repo(i + 1));
    const rust = Array.from({ length: LANGUAGE_AGENTS_MIN_REPOS - 1 }, (_, i) => repo(100 + i, { language: "Rust" }));
    const board = [...go, ...rust];
    const list = buildContributeList(board, signals(board.map((r) => r.id)));
    assert.deepEqual(
      list.languages.map((l) => [l.slug, l.eligible, l.rows.length]),
      [["go", LANGUAGE_AGENTS_MIN_REPOS, CONTRIBUTE_LANGUAGE_TOP]],
    );
  });

  it("carries a policy only where the map has one, and shows the column only then", () => {
    const board = [repo(1), repo(2)];
    assert.equal(hasPolicies(buildContributeList(board, signals([1, 2])).eligible), false);
    const list = buildContributeList(board, signals([1, 2]), new Map([[2, { label: "Disclose AI use", url: null }]]));
    assert.deepEqual(
      list.eligible.map((r) => r.policy?.label ?? null),
      [null, "Disclose AI use"],
    );
    assert.equal(hasPolicies(list.eligible), true);
  });
});

describe("contribute page copy", () => {
  it("fits the search-result limits", () => {
    assert.ok(pageTitle(CONTRIBUTE_TITLE).absolute.length <= MAX_TITLE_LENGTH);
    const languages = ["TypeScript", "JavaScript", "Python", "Rust"].map((label) => ({
      slug: label.toLowerCase(),
      label,
      eligible: 1,
      rows: [],
    }));
    const d = contributeDescription({ eligible: Array(9999).fill(null), languages });
    assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, d);
  });

  it("links a language to its own section", () => {
    assert.equal(contributeLanguageHref("cpp"), `/contribute#${contributeAnchor("cpp")}`);
  });
});

describe("contribute list with policies", () => {
  it("leaves out a project whose policy refuses AI contributions, and counts it", () => {
    const row = (id: number) =>
      ({ id, host: "github", owner: "o", name: `r${id}`, score: 80, stars: 1, language: "Go" }) as never;
    const pass = (repoId: number) => ({ repoId, pass: 1, detail: null, matchedPath: "x" }) as never;
    const signals = {
      contributing: [pass(1), pass(2)],
      tests: [pass(1), pass(2)],
      ci: [pass(1), pass(2)],
      agents_md: [],
      dev_env: [],
      pre_commit: [],
    };
    const list = buildContributeList(
      [row(1), row(2)],
      signals,
      new Map([[2, { label: "Bans", url: null, refusesAi: true }]]),
    );
    assert.deepEqual(
      list.eligible.map((r) => r.id),
      [1],
    );
    assert.equal(list.refused, 1);
  });
});
