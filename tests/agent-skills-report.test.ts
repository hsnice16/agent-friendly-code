import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { agentSkillsCsv, buildAgentSkillsReport } from "../lib/agent-skills-report";
import type { AdoptionPoint } from "../lib/agents-md-adoption";
import type { CensusRepo } from "../lib/file-census-summary";
import type { LeaderboardRow } from "../lib/types/db";

function census(name: string, skills: CensusRepo["skills"], over: Partial<CensusRepo> = {}): CensusRepo {
  return {
    host: "github",
    owner: "o",
    name,
    truncated: false,
    agentsMd: [],
    claudeMd: [],
    geminiMd: [],
    rootLinks: {},
    claudeMdImportsAgentsMd: null,
    copilotInstructions: false,
    copilotPathInstructions: 0,
    windsurfRules: 0,
    windsurfrulesLegacy: false,
    cursorRules: 0,
    cursorrulesLegacy: false,
    llmsTxt: [],
    skills,
    ...over,
  };
}

function board(id: number, name: string): LeaderboardRow {
  return {
    id,
    host: "github",
    owner: "o",
    name,
    url: `https://github.com/o/${name}`,
    stars: id * 100,
    language: "Go",
    score: 50,
    overall_score: 50,
    default_branch: "main",
    badge_embedded: 0,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
  };
}

const point = (date: string, agentSkills: number | null): AdoptionPoint =>
  ({ date, repos: 100, withFile: 0, agentsMd: 0, claudeMd: 0, medianChars: null, agentSkills }) as AdoptionPoint;

describe("buildAgentSkillsReport", () => {
  const repos = [
    census("a", { agents: 3, claude: 0, other: 0 }),
    census("b", { agents: 0, claude: 5, other: 1 }),
    census("c", { agents: 2, claude: 2, other: 0 }),
    census("d", { agents: 0, claude: 0, other: 9 }),
    census("e", { agents: 0, claude: 0, other: 0 }),
    census("f", { agents: 9, claude: 9, other: 9 }, { error: "tree read failed" }),
  ];
  const points = Array.from({ length: 12 }, (_, i) =>
    point(`2026-11-${String(i + 1).padStart(2, "0")}`, i < 2 ? null : i),
  );
  const r = buildAgentSkillsReport(
    { generatedAt: "2026-11-16T11:21:33.837Z", repos },
    [board(1, "a"), board(2, "b"), board(3, "c")],
    [
      { repoId: 1, pass: 1, detail: "3 skills in .agents/skills/", matchedPath: ".agents/skills/x/SKILL.md" },
      { repoId: 3, pass: 0, detail: null, matchedPath: null },
    ],
    points,
  );

  it("counts each directory, leaving out failed reads", () => {
    assert.equal(r.repos, 5);
    assert.equal(r.date, "2026-11-16");
    assert.deepEqual(
      { agents: r.agents, claude: r.claude, both: r.both, files: r.skillFiles, median: r.medianSkills },
      { agents: 2, claude: 2, both: 1, files: 12, median: 4 },
    );
  });

  it("orders by skill count and keeps elsewhere-only repos apart", () => {
    assert.deepEqual(
      r.rows.map((s) => s.name),
      ["b", "c", "a"],
    );
    assert.deepEqual(
      r.elsewhereOnly.map((s) => s.name),
      ["d"],
    );
  });

  it("links .agents/skills only where the scorer found it at the root", () => {
    const by = Object.fromEntries(r.rows.map((s) => [s.name, s.agentsDirUrl]));
    assert.equal(by.a, "https://github.com/o/a/tree/main/.agents/skills");
    assert.equal(by.c, null);
  });

  it("samples the trend from the first measured point to the last", () => {
    assert.equal(r.trend[0].date, "2026-11-03");
    assert.equal(r.trend[r.trend.length - 1].date, "2026-11-12");
    assert.ok(r.trend.length <= 6);
  });

  it("writes a CSV row per repo", () => {
    const csv = agentSkillsCsv(r.rows).trim().split("\n");
    assert.equal(csv[0], "repo,host,agents_skills,claude_skills,skill_md_elsewhere,stars");
    assert.equal(csv[1], "o/b,github,0,5,1,200");
    assert.equal(csv.length, 4);
  });
});
