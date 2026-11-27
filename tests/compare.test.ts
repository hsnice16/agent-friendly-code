import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildFilePresence, fileShares } from "../lib/agent-files";
import {
  agentLanguages,
  agentStandings,
  bestAgents,
  buildScoredRepos,
  ownFile,
  pairSplit,
  type ScoredRepo,
} from "../lib/agent-scores";
import { COMPARE_PAIRS } from "../lib/compare-pairs";
import { LANGUAGE_AGENTS_MIN_REPOS } from "../lib/constants/scoring";
import { MODEL_BY_ID, type ModelId } from "../lib/scoring/weights";
import type { LeaderboardRow } from "../lib/types/db";

function repo(id: number, language: string | null, scores: Partial<Record<ModelId, number>>, stars = 0): ScoredRepo {
  return {
    id,
    language,
    stars,
    scores,
    url: `https://github.com/o/r${id}`,
    host: "github",
    owner: "o",
    name: `r${id}`,
    score: 50,
    overall_score: 50,
    badge_embedded: null,
    default_branch: null,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
  };
}

describe("COMPARE_PAIRS", () => {
  it("names two different known agents per pair, and no pair twice in either order", () => {
    for (const p of COMPARE_PAIRS) {
      assert.ok(MODEL_BY_ID[p.a] && MODEL_BY_ID[p.b], `${p.a} ${p.b}`);
      assert.notEqual(p.a, p.b);
    }
    const keys = COMPARE_PAIRS.map((p) => [p.a, p.b].sort().join("|"));
    assert.equal(new Set(keys).size, COMPARE_PAIRS.length);
  });
});

describe("buildScoredRepos", () => {
  it("keeps overall order and folds in each agent's score by id", () => {
    const base = (id: number, score: number) => ({ ...repo(id, null, {}), score }) as LeaderboardRow;
    const rows = buildScoredRepos(
      [base(2, 90), base(1, 80)],
      [
        { id: "cursor", rows: [base(1, 70), base(2, 60)] },
        { id: "aider", rows: [base(2, 50)] },
      ],
    );
    assert.deepEqual(
      rows.map((r) => [r.id, r.scores]),
      [
        [2, { cursor: 60, aider: 50 }],
        [1, { cursor: 70 }],
      ],
    );
  });
});

describe("pairSplit", () => {
  const rows = [
    repo(1, "Rust", { "claude-code": 90, cursor: 60 }),
    repo(2, "Rust", { "claude-code": 70, cursor: 80 }),
    repo(3, "Go", { "claude-code": 50, cursor: 50 }),
    repo(4, "Go", { "claude-code": 40 }),
  ];

  it("averages and counts only repos scored for both", () => {
    const s = pairSplit(rows, "claude-code", "cursor");
    assert.equal(s.n, 3);
    assert.equal(s.avgA, 70);
    assert.ok(Math.abs(s.avgB - 190 / 3) < 1e-9);
    assert.deepEqual([s.aHigher, s.bHigher, s.ties], [1, 1, 1]);
  });
});

describe("agentStandings and bestAgents", () => {
  const rows = [
    repo(1, null, { "claude-code": 80, cursor: 80, aider: 10 }),
    repo(2, null, { "claude-code": 60, cursor: 70 }),
  ];

  it("counts a tied top score for each agent in the tie", () => {
    assert.deepEqual(
      bestAgents(rows[0]).map((m) => m.id),
      ["claude-code", "cursor"],
    );
    const s = agentStandings(rows);
    const by = Object.fromEntries(s.map((x) => [x.model.id, x]));
    assert.equal(s[0].model.id, "cursor");
    assert.equal(by.cursor.top, 2);
    assert.equal(by["claude-code"].top, 1);
    assert.equal(by["claude-code"].median, 70);
    assert.equal(by.pi.median, null);
  });

  it("keeps a tenth in the median", () => {
    const s = agentStandings([repo(1, null, { pi: 70.1 }), repo(2, null, { pi: 70.4 })]);
    assert.equal(s.find((x) => x.model.id === "pi")?.median, 70.3);
  });
});

describe("agentLanguages", () => {
  it("keeps only languages at or above the threshold", () => {
    const rows = [
      ...Array.from({ length: LANGUAGE_AGENTS_MIN_REPOS }, (_, i) => repo(i, "Rust", {})),
      ...Array.from({ length: LANGUAGE_AGENTS_MIN_REPOS - 1 }, (_, i) => repo(100 + i, "Go", {})),
    ];
    assert.deepEqual(
      agentLanguages(rows).map((g) => g.slug),
      ["rust"],
    );
  });
});

describe("ownFile", () => {
  it("names a file the instruction-file counts know", () => {
    assert.deepEqual(ownFile(MODEL_BY_ID["claude-code"]), { file: "CLAUDE.md", signalId: "agents_md" });
    assert.equal(ownFile(MODEL_BY_ID.cursor).signalId, "cursor_rules");
    assert.equal(ownFile(MODEL_BY_ID["gemini-cli"]).file, "GEMINI.md");
    assert.equal(ownFile(MODEL_BY_ID["gpt-5-codex"]).file, "AGENTS.md");
  });
});

describe("buildFilePresence", () => {
  it("counts root files only, as getInstructionFileCounts does, and drops empty files", () => {
    const f = (repoId: number, matchedPath: string, pass = 1) => ({ repoId, pass, matchedPath, detail: null });
    const p = buildFilePresence({
      agents_md: [
        f(1, "AGENTS.md"),
        f(2, "CLAUDE.md"),
        f(3, ".claude/CLAUDE.md"),
        f(4, "AGENTS.md", 0.2),
        f(5, "AGENT.md"),
        f(6, "agents.md"),
      ],
      gemini_md: [f(1, "GEMINI.md")],
    });
    assert.deepEqual([...p.agentsMd], [1, 6]);
    assert.deepEqual([...p.claudeMdOnly], [2]);
    const shares = Object.fromEntries(fileShares([1, 2, 4], p).map((s) => [s.file, s.count]));
    assert.equal(shares["AGENTS.md"], 1);
    assert.equal(shares["CLAUDE.md only"], 1);
    assert.equal(shares["GEMINI.md"], 1);
    assert.equal(shares[".cursor/rules"], 0);
  });
});
