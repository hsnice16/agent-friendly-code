import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CENSUS, type CensusRepo, summarizeCensus } from "../lib/file-census";

const base: CensusRepo = {
  host: "github",
  owner: "o",
  name: "n",
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
  skills: { agents: 0, claude: 0, other: 0 },
};

describe("file census", () => {
  it("counts a lone subdirectory AGENTS.md as nested", () => {
    const s = summarizeCensus([{ ...base, agentsMd: ["packages/a/AGENTS.md"] }], "2026-11-16T00:00:00Z");
    assert.equal(s.nestedAgentsMd, 1);
    assert.equal(s.rootAgentsMd, 0);
  });

  it("counts a root llms.txt apart from one in a docs site's public folder", () => {
    const s = summarizeCensus(
      [
        { ...base, llmsTxt: ["llms.txt"] },
        { ...base, llmsTxt: ["docs/public/llms.txt"] },
      ],
      "2026-11-16T00:00:00Z",
    );
    assert.equal(s.llmsTxt, 2);
    assert.equal(s.llmsTxtRoot, 1);
  });

  it("doesn't count .claude/CLAUDE.md as a nested CLAUDE.md", () => {
    const s = summarizeCensus(
      [
        { ...base, claudeMd: [".claude/CLAUDE.md"] },
        { ...base, claudeMd: ["CLAUDE.md", "web/CLAUDE.md"] },
      ],
      "2026-11-16T00:00:00Z",
    );
    assert.equal(s.anyClaudeMd, 2);
    assert.equal(s.rootClaudeMd, 1);
    assert.equal(s.nestedClaudeMd, 1);
  });

  it("doesn't count a linked or importing CLAUDE.md as a second copy", () => {
    const both = { ...base, agentsMd: ["AGENTS.md"], claudeMd: ["CLAUDE.md"] };
    const s = summarizeCensus(
      [
        { ...both, rootLinks: { "CLAUDE.md": "AGENTS.md" } },
        { ...both, claudeMdImportsAgentsMd: true },
        { ...both, claudeMdImportsAgentsMd: false },
      ],
      "2026-11-16T00:00:00Z",
    );
    assert.equal(s.claudeLinksToAgents, 1);
    assert.equal(s.claudeImportsAgents, 1);
    assert.equal(s.twoUnlinkedFiles, 1);
  });

  it("leaves a failed tree read out of every count and the total", () => {
    const s = summarizeCensus(
      [
        { ...base, agentsMd: ["AGENTS.md"] },
        { ...base, error: "HTTP 404" },
      ],
      "2026-11-16T00:00:00Z",
    );
    assert.equal(s.repos, 1);
    assert.equal(s.anyAgentsMd, 1);
  });

  it("loads the committed census without policy excerpts", () => {
    assert.ok(CENSUS.repos.length > 300);
    assert.ok(CENSUS.repos.every((r) => !("excerpt" in ((r as { aiPolicy?: object }).aiPolicy ?? {}))));
    assert.match(CENSUS.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  });
});
