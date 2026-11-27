import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildContentsReport, type ContentsData, type ContentsRepo } from "../lib/agents-md-contents-report";
import { repoAgentsMdContents } from "../lib/repo-agents-md-contents";

function file(name: string, over: Partial<ContentsRepo> = {}): ContentsRepo {
  return {
    host: "github",
    owner: "o",
    name,
    path: "AGENTS.md",
    sha: "0123456789abcdef",
    scoredChars: 1000,
    linkTarget: null,
    claudeMd: "none",
    chars: 1000,
    lines: 30,
    headings: 4,
    titled: true,
    classified: 3,
    topics: ["testing", "commands"],
    topicChars: {},
    testCommand: true,
    singleTest: false,
    relativeLinks: 0,
    externalLinks: 0,
    imports: 0,
    mdRefs: 0,
    prohibitions: 0,
    capsEmphasis: 0,
    codeBlocks: 1,
    ...over,
  };
}

// Five files: "testing" and "commands" in all, "style" in 3 (60%), "git" in 1 (20%).
const repos = [
  file("a"),
  file("b", { topics: ["testing", "commands", "style"], singleTest: true, prohibitions: 4 }),
  file("c", { topics: ["testing", "commands", "style"], prohibitions: 2 }),
  file("d", { topics: ["testing", "commands", "style", "git"], relativeLinks: 2, mdRefs: 1 }),
  file("e", { testCommand: false }),
  file("broken", { error: "404", chars: undefined }),
];
const data: ContentsData = { generatedAt: "2026-11-23T10:00:00Z", quotes: [], repos };
const report = buildContentsReport(data);
const at = (name: string, chars: number | null = 1000) =>
  repoAgentsMdContents({ host: "github", owner: "O", name }, chars, data, report);

describe("repoAgentsMdContents", () => {
  it("shows nothing once the scored file no longer matches the one read", () => {
    assert.ok(at("a"));
    assert.equal(at("a", 1001), null);
    assert.equal(at("a", null), null);
    assert.equal(at("broken"), null);
    assert.equal(at("unknown"), null);
  });

  it("lists covered sections in TOPICS order and only common missing ones", () => {
    const c = at("a");
    assert.ok(c);
    assert.deepEqual(c.covered, ["Build and run commands", "Testing"]);
    assert.deepEqual(c.missing, [{ label: "Code style and conventions", share: "60%" }]);
    assert.equal(c.commit, "0123456");
    assert.equal(c.read.iso, "2026-11-23");
    assert.equal(c.files, 5);
  });

  it("words each test, link and rule case", () => {
    assert.match(at("a")?.test ?? "", /^Names an exact test command, but not how to run a single test, which 20%/);
    assert.match(at("b")?.test ?? "", /^Names an exact test command and how to run a single test, as 20%/);
    assert.match(at("e")?.test ?? "", /^No exact test command, which 80% of files give/);
    assert.equal(at("d")?.points, "2 relative links, 1 other Markdown file by name.");
    assert.match(at("a")?.points ?? "", /^Doesn't link, import or name another Markdown file, which 20%/);
    assert.equal(at("b")?.rules, "4 never / do not / avoid lines; the median file with any has 3.");
    assert.match(at("a")?.rules ?? "", /^No never \/ do not \/ avoid line; 40%/);
  });
});
