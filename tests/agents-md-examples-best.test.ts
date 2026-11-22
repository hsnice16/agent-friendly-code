import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { type ExampleRow, examplesCsv, examplesWithoutLanguagePage } from "../lib/agents-md-examples";
import { censusLookup, pickBestExample } from "../lib/agents-md-examples-best";
import type { CensusRepo } from "../lib/file-census-summary";
import { repoRawFileUrl } from "../lib/utils/repo-file-url";

function row(id: number, over: Partial<ExampleRow> = {}): ExampleRow {
  return {
    id,
    host: "github",
    owner: "o",
    name: `r${id}`,
    url: `https://github.com/o/r${id}`,
    stars: 1000,
    language: "Go",
    score: 80,
    overall_score: 80,
    default_branch: "main",
    badge_embedded: 0,
    last_scored_at: null,
    content_changed_at: null,
    previous_overall_score: null,
    file: "AGENTS.md",
    length: 5000,
    pass: 1,
    fileUrl: `https://github.com/o/r${id}/blob/main/AGENTS.md`,
    ...over,
  };
}

function census(name: string, over: Partial<CensusRepo> = {}): CensusRepo {
  return {
    host: "github",
    owner: "o",
    name,
    truncated: false,
    agentsMd: ["AGENTS.md"],
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
    ...over,
  };
}

const none = censusLookup([]);

describe("pickBestExample", () => {
  it("takes the highest score among files of a copyable length", () => {
    const rows = [row(1, { score: 90, length: 900 }), row(2, { score: 95, length: 40_000 }), row(3, { score: 85 })];
    assert.equal(pickBestExample(rows, none)?.row.id, 3);
  });

  it("skips a high score with few stars", () => {
    const rows = [row(1, { score: 100, stars: 2 }), row(2, { score: 80, stars: 5000 }), row(3, { stars: 3000 })];
    assert.equal(pickBestExample(rows, none)?.row.id, 2);
  });

  it("prefers AGENTS.md to CLAUDE.md, and skips the site's own repos", () => {
    const rows = [
      row(1, { score: 99, file: "CLAUDE.md" }),
      row(2, { score: 99, owner: "hsnice16", name: "agent-friendly-code" }),
      row(3, { score: 70 }),
    ];
    assert.equal(pickBestExample(rows, none)?.row.id, 3);
  });

  it("is the same whatever the input order", () => {
    const rows = [row(1), row(2), row(3, { score: 81 }), row(4)];
    assert.equal(pickBestExample(rows, none)?.row.id, pickBestExample([...rows].reverse(), none)?.row.id);
  });

  it("returns null when nothing passes", () => {
    assert.equal(pickBestExample([row(1, { pass: 0.8 })], none), null);
  });

  it("notes nested files, the CLAUDE.md link and skills from the census", () => {
    const c = censusLookup([
      census("r1", {
        agentsMd: ["AGENTS.md", "web/AGENTS.md", "api/AGENTS.md"],
        rootLinks: { "CLAUDE.md": "AGENTS.md" },
        skills: { agents: 4, claude: 0, other: 0 },
      }),
    ]);
    const best = pickBestExample([row(1)], c);
    assert.equal(best?.rawUrl, "https://raw.githubusercontent.com/o/r1/main/AGENTS.md");
    assert.deepEqual(best?.notes, [
      "About 4.9 KiB: inside the 16 KiB Devin reads and the 32 KiB Codex reads",
      "2 more AGENTS.md files in subfolders, for the code below them",
      "CLAUDE.md is a symlink to it, so Claude Code reads the same file",
      "Long task steps live in 4 skills under .agents/skills/, not here",
    ]);
  });
});

describe("repoRawFileUrl", () => {
  it("builds each host's raw URL and needs a branch", () => {
    const at = (host: string, url: string) => ({ host, url, default_branch: "main" });
    assert.equal(
      repoRawFileUrl(at("gitlab", "https://gitlab.com/g/p"), "AGENTS.md"),
      "https://gitlab.com/g/p/-/raw/main/AGENTS.md",
    );
    assert.equal(
      repoRawFileUrl(at("bitbucket", "https://bitbucket.org/g/p"), "AGENTS.md"),
      "https://bitbucket.org/g/p/raw/main/AGENTS.md",
    );
    assert.equal(repoRawFileUrl({ host: "github", url: "https://github.com/o/r", default_branch: null }, "A.md"), null);
  });
});

describe("examples hub helpers", () => {
  const rows = [
    ...Array.from({ length: 5 }, (_, i) => row(i + 1)),
    row(6, { language: "Zig" }),
    row(7, { language: null, name: 'a,"b' }),
  ];
  const ex = { rows, languages: [{ slug: "go", label: "Go", withFile: 5, total: 6 }] };

  it("lists the files no language page covers", () => {
    assert.deepEqual(
      examplesWithoutLanguagePage(ex).map((r) => r.id),
      [6, 7],
    );
  });

  it("writes one CSV line per file, quoting fields that need it", () => {
    const csv = examplesCsv(rows).trim().split("\n");
    assert.equal(csv.length, rows.length + 1);
    assert.equal(csv[0], "repo,host,language,file,characters,passes,stars,score,file_url");
    assert.ok(csv[7].startsWith('"o/a,""b",github,,AGENTS.md,5000,yes,1000,80,'));
  });
});
