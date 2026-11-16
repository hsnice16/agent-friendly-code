import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildFilePresence, fileShares } from "../lib/agent-files";
import {
  agentLanguages,
  agentStandings,
  bestAgents,
  buildScoredRepos,
  comparePair,
  ownFile,
  type ScoredRepo,
  weightGaps,
} from "../lib/agent-scores";
import { SETUP_TIP } from "../lib/agent-setup-tips";
import {
  COMPARE_HUB_DESCRIPTION,
  compareDescription,
  compareHubTitle,
  compareTitle,
  languageAgentsDescription,
  languageAgentsTitle,
} from "../lib/compare-copy";
import { COMPARE_PAIRS, pairBySlug } from "../lib/compare-pairs";
import { LANGUAGE_AGENTS_MIN_REPOS } from "../lib/constants/scoring";
import { SIGNAL_BY_ID } from "../lib/scoring/signals";
import { MODEL_BY_ID, MODELS, type ModelId } from "../lib/scoring/weights";
import type { LeaderboardRow } from "../lib/types/db";
import { comparePath } from "../lib/utils/compare-path";
import { languageAgentsPath } from "../lib/utils/language";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "../lib/utils/page-title";

// How each id is spelled in a slug: people search "codex", not "gpt-5-codex".
const SLUG_NAME: Partial<Record<ModelId, string>> = { "gpt-5-codex": "codex" };

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
  it("names two different known agents per pair, in the order its slug does", () => {
    for (const p of COMPARE_PAIRS) {
      assert.ok(MODEL_BY_ID[p.a] && MODEL_BY_ID[p.b], p.slug);
      assert.notEqual(p.a, p.b, p.slug);
      assert.equal(p.slug, `${SLUG_NAME[p.a] ?? p.a}-vs-${SLUG_NAME[p.b] ?? p.b}`);
      assert.equal(pairBySlug(p.slug), p);
    }
  });

  it("has no duplicate slug and no pair twice in either order", () => {
    const keys = COMPARE_PAIRS.map((p) => [p.a, p.b].sort().join("|"));
    assert.equal(new Set(keys).size, COMPARE_PAIRS.length);
    assert.equal(new Set(COMPARE_PAIRS.map((p) => p.slug)).size, COMPARE_PAIRS.length);
    assert.equal(pairBySlug("cursor-vs-claude-code"), null);
  });

  it("builds one path per page", () => {
    assert.equal(comparePath("claude-code-vs-cursor"), "/compare/claude-code-vs-cursor");
    assert.equal(languageAgentsPath("cpp"), "/language/cpp/agents");
  });
});

describe("page copy", () => {
  // Worst case for length: three-digit counts and averages.
  const split = { n: 999, avgA: 100, avgB: 100, aHigher: 999, bHigher: 999, ties: 999 };

  it("keeps every compare title and description inside the search-result limits", () => {
    for (const p of COMPARE_PAIRS) {
      const title = compareTitle(p);
      assert.ok(title.length <= MAX_TITLE_LENGTH, title);
      assert.ok(title.startsWith(`${MODEL_BY_ID[p.a].label} vs ${MODEL_BY_ID[p.b].label}`), title);
      const description = compareDescription(p, split);
      assert.ok(description.length <= MAX_DESCRIPTION_LENGTH, description);
      assert.match(description, /set up/);
    }
    assert.equal(new Set(COMPARE_PAIRS.map(compareTitle)).size, COMPARE_PAIRS.length);
    assert.ok(compareHubTitle(9999).length <= MAX_TITLE_LENGTH);
    assert.ok(COMPARE_HUB_DESCRIPTION.length <= MAX_DESCRIPTION_LENGTH);
  });

  it("keeps language titles and descriptions inside the limits, even for a long name", () => {
    for (const label of ["Rust", "C++", "JavaScript", "Jupyter Notebook", "A".repeat(80)]) {
      const title = languageAgentsTitle(label, 999);
      if (label.length < 40) assert.ok(title.length <= MAX_TITLE_LENGTH, title);
      const top = { label: "Kimi Code CLI", average: 100 };
      if (label.length < 40) assert.ok(languageAgentsDescription(label, 999, top).length <= MAX_DESCRIPTION_LENGTH);
    }
    assert.equal(languageAgentsTitle("Rust", 45), "Which AI coding agent are 45 Rust repos set up for?");
  });

  it("has a setup tip for every agent", () => {
    for (const m of MODELS) assert.ok(SETUP_TIP[m.id].startsWith(m.label), m.id);
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

describe("comparePair", () => {
  const rows = [
    repo(1, "Rust", { "claude-code": 90, cursor: 60 }),
    repo(2, "Rust", { "claude-code": 70, cursor: 80 }),
    repo(3, "Go", { "claude-code": 50, cursor: 50 }),
    repo(4, "Go", { "claude-code": 40 }),
  ];

  it("averages and counts only repos scored for both", () => {
    const s = comparePair(rows, "claude-code", "cursor", 2);
    assert.equal(s.n, 3);
    assert.equal(s.avgA, 70);
    assert.ok(Math.abs(s.avgB - 190 / 3) < 1e-9);
    assert.deepEqual([s.aHigher, s.bHigher, s.ties], [1, 1, 1]);
    assert.deepEqual(
      s.aAhead.map((g) => g.repo.id),
      [1],
    );
    assert.deepEqual(
      s.bAhead.map((g) => g.repo.id),
      [2],
    );
  });

  it("splits by language only above the threshold it is given", () => {
    const s = comparePair(rows, "claude-code", "cursor", 2);
    assert.deepEqual(
      s.languages.map((l) => [l.label, l.n, l.avgA, l.avgB]),
      [["Rust", 2, 80, 70]],
    );
  });

  it("orders gaps widest first, then by stars", () => {
    const s = comparePair(
      [
        repo(1, null, { aider: 60, pi: 50 }, 1),
        repo(2, null, { aider: 60, pi: 50 }, 9),
        repo(3, null, { aider: 90, pi: 50 }),
      ],
      "aider",
      "pi",
      1,
    );
    assert.deepEqual(
      s.aAhead.map((g) => g.repo.id),
      [3, 2, 1],
    );
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

describe("weightGaps and ownFile", () => {
  it("leads with each agent's own file where only one weighs it", () => {
    const ids = weightGaps(MODEL_BY_ID["claude-code"], MODEL_BY_ID.cursor).map((g) => g.id);
    assert.equal(ids[0], "cursor_rules");
    for (const id of ids) assert.ok(SIGNAL_BY_ID[id]);
  });

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
