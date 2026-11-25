import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RepoRecordView } from "../components/RepoRecordView";
import { AGENT_READS } from "../lib/agent-reads";
import type { CensusRepo } from "../lib/file-census";
import { FIRST_FILE_ONLY, fileReaders } from "../lib/repo-readers";
import { censusFacts, firstSeenFacts, NESTED_SHOWN, policyFact, repoRecord } from "../lib/repo-record";
import type { SignalResult } from "../lib/scoring/signals";
import { propertyDescription } from "../lib/utils/repo-page-meta";

const REPO = { host: "github", owner: "o", name: "r", url: "https://github.com/o/r" };

function signal(id: string, pass: number, matchedPath?: string, detail = ""): SignalResult {
  return { id, label: id, pass, detail, matchedPath } as SignalResult;
}

function censusRepo(over: Partial<CensusRepo>): CensusRepo {
  return {
    host: "github",
    owner: "o",
    name: "r",
    branch: "main",
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
    ...over,
  };
}

describe("firstSeenFacts", () => {
  const at = (checkedFrom: string, firstFound: string, lastMissed: string | null = null) => ({
    "https://github.com/o/r": { agentsMd: { checkedFrom, firstFound, lastMissed } },
  });
  const history = at("2026-04-24", "2026-08-02", "2026-08-01");
  const agentsMd = [signal("agents_md", 1, "AGENTS.md")];

  test("dates a file the checks still find, and says when it was there from the start", () => {
    const [fact] = firstSeenFacts(REPO, agentsMd, history);
    assert.equal(fact.file, "AGENTS.md");
    assert.equal(fact.checkedFrom.iso, "2026-04-24");
    assert.equal(fact.firstFound?.iso, "2026-08-02");
    assert.equal(fact.lastMissed?.text, "1 Aug 2026");

    const [same] = firstSeenFacts(REPO, agentsMd, at("2026-04-24", "2026-04-24"));
    assert.equal(same.firstFound, null);
    assert.equal(firstSeenFacts(REPO, agentsMd, at("2026-04-24", "2026-08-02"))[0].lastMissed, null);
  });

  test("says nothing about a file that is gone or empty now", () => {
    assert.deepEqual(firstSeenFacts(REPO, [signal("agents_md", 1, "CLAUDE.md")], history), []);
    assert.deepEqual(firstSeenFacts(REPO, [signal("agents_md", 0.2, "AGENTS.md")], history), []);
    assert.deepEqual(firstSeenFacts({ ...REPO, url: "https://github.com/o/other" }, [], history), []);
  });
});

describe("censusFacts", () => {
  const census = (r: Partial<CensusRepo>) => ({ generatedAt: "2026-11-16T11:21:33.837Z", repos: [censusRepo(r)] });

  test("lists paths below the root, shallowest first, capped, linked on the census branch", () => {
    const deep = Array.from({ length: NESTED_SHOWN + 2 }, (_, i) => `packages/p${i}/src/AGENTS.md`);
    const facts = censusFacts(REPO, census({ agentsMd: ["AGENTS.md", ...deep, "docs/AGENTS.md"] }));
    assert.ok(facts);
    assert.equal(facts.nestedTotal, NESTED_SHOWN + 3);
    assert.equal(facts.nested.length, NESTED_SHOWN);
    assert.equal(facts.nested[0].name, "docs/AGENTS.md");
    assert.equal(facts.nested[0].href, "https://github.com/o/r/blob/main/docs/AGENTS.md");
    assert.equal(facts.date.iso, "2026-11-16");
  });

  test("records symlinks, imports and other tools' files; null when there is nothing beyond the root", () => {
    const facts = censusFacts(
      REPO,
      census({
        claudeMd: ["CLAUDE.md"],
        rootLinks: { "CLAUDE.md": "AGENTS.md" },
        copilotInstructions: true,
        skills: { agents: 0, claude: 2, other: 0 },
      }),
    );
    assert.deepEqual(facts?.relations, ["CLAUDE.md is a symlink to AGENTS.md"]);
    assert.deepEqual(facts?.other, [".github/copilot-instructions.md", ".claude/skills/ (2 skills)"]);
    assert.equal(censusFacts(REPO, census({ agentsMd: ["AGENTS.md"], claudeMd: ["CLAUDE.md"] })), null);
    assert.equal(censusFacts(REPO, census({ error: "HTTP 404", agentsMd: ["a/AGENTS.md"] })), null);
  });
});

describe("fileReaders", () => {
  test("AGENTS.md names who always reads it and who only sometimes does", () => {
    const [line] = fileReaders([signal("agents_md", 1, "AGENTS.md")], null);
    assert.equal(line.file, "AGENTS.md");
    assert.match(line.readers, /Codex/);
    assert.match(line.readers, /Claude Code only when there is no CLAUDE\.md/);
    assert.match(line.readers, /Gemini CLI and Aider only once configured to/);

    const imports = fileReaders([signal("agents_md", 1, "AGENTS.md")], {
      agentsMd: true,
      claudeMdLoadsAgentsMd: "imports",
    });
    assert.match(imports[0].readers, /Claude Code through CLAUDE\.md, which imports it/);
  });

  test("CLAUDE.md lists Pi only once the census rules out a root AGENTS.md", () => {
    assert.equal(
      FIRST_FILE_ONLY.every((id) => AGENT_READS[id].note.includes("first of")),
      true,
    );
    const s = [signal("agents_md", 1, "CLAUDE.md")];
    assert.doesNotMatch(fileReaders(s, null)[0].readers, /Pi/);
    assert.doesNotMatch(fileReaders(s, { agentsMd: true, claudeMdLoadsAgentsMd: null })[0].readers, /Pi/);
    assert.match(fileReaders(s, { agentsMd: false, claudeMdLoadsAgentsMd: null })[0].readers, /Claude Code.*Pi/);
  });

  test("only root files, and nothing for a repo without agent files", () => {
    assert.deepEqual(fileReaders([signal("agents_md", 0), signal("gemini_md", 0)], null), []);
    const lines = fileReaders(
      [signal("cursor_rules", 1, "web/.cursor/rules/a.mdc"), signal("gemini_md", 1, "GEMINI.md")],
      null,
    );
    assert.deepEqual(lines, [{ file: "GEMINI.md", readers: "Gemini CLI" }]);
  });
});

describe("policyFact and repoRecord", () => {
  test("a recorded policy keeps its stance, summary and source", () => {
    const data = {
      checked: "2026-11-16",
      source: "",
      scanned: 1,
      policies: [
        {
          ...REPO,
          stance: "bans" as const,
          summary: "No AI code.",
          url: "https://github.com/o/r/blob/main/CONTRIBUTING.md#ai",
          path: "CONTRIBUTING.md",
          disclosure: false,
          noAiText: true,
          noAutonomousAgents: false,
        },
      ],
    };
    const p = policyFact({ ...REPO, owner: "O" }, data);
    assert.equal(p?.label, "Bans");
    assert.equal(p?.href, data.policies[0].url);
    assert.equal(p?.reportHref, "/report/ai-contribution-policy#stance-bans");
    assert.equal(policyFact({ ...REPO, name: "x" }, data), null);
  });

  test("a repo the data files know nothing about gets no section", () => {
    const none = { host: "github", owner: "nobody", name: "nothing", url: "https://github.com/nobody/nothing" };
    assert.equal(repoRecord(none, [signal("agents_md", 0)]), null);
  });

  test("the view renders only the rows it has data for", () => {
    const html = renderToStaticMarkup(
      createElement(RepoRecordView, {
        slug: "o/r",
        record: {
          firstSeen: [
            {
              file: "AGENTS.md",
              checkedFrom: { iso: "2026-04-24", text: "24 Apr 2026" },
              firstFound: null,
              lastMissed: null,
            },
            {
              file: "GEMINI.md",
              checkedFrom: { iso: "2026-04-24", text: "24 Apr 2026" },
              firstFound: { iso: "2026-08-02", text: "2 Aug 2026" },
              lastMissed: { iso: "2026-08-01", text: "1 Aug 2026" },
            },
          ],
          census: null,
          readers: [],
          policy: null,
        },
      }),
    );
    assert.match(html, /already there when first checked, <time dateTime="2026-04-24">24 Apr 2026<\/time>/);
    assert.match(html, /first found <time dateTime="2026-08-02">2 Aug 2026<\/time>.*not there on <time/);
    assert.doesNotMatch(html, /More agent files|Which agents|AI contribution policy/);
  });
});

describe("propertyDescription", () => {
  test("names the build file when the typed language came from a subfolder", () => {
    const s = { detail: "Typed language (Rust)", matchedPath: "compiler/Cargo.toml" };
    assert.equal(propertyDescription(s), "Typed language (Rust), from compiler/Cargo.toml");
    assert.equal(propertyDescription({ ...s, matchedPath: "Cargo.toml" }), "Typed language (Rust)");
    assert.equal(
      propertyDescription({ detail: "Type config present", matchedPath: "a/tsconfig.json" }),
      "Type config present",
    );
  });
});
