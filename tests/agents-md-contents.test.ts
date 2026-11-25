import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  analyzeAgentsMd,
  claudeMdRelation,
  headingTopics,
  isSingleTestCommand,
  isTestCommand,
} from "../lib/agents-md-contents";
import {
  buildContentsReport,
  type ContentsData,
  type ContentsRepo,
  contentsCsv,
  contentsDescription,
  contentsTitle,
  pickQuotes,
  type QuoteCandidate,
} from "../lib/agents-md-contents-report";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/agents-md-contents/${name}`, import.meta.url), "utf8");

describe("headingTopics", () => {
  it("classifies common headings", () => {
    assert.deepEqual(headingTopics("Build and test"), ["commands", "testing"]);
    assert.deepEqual(headingTopics("Code Style"), ["style"]);
    assert.deepEqual(headingTopics("Project structure"), ["architecture"]);
    assert.deepEqual(headingTopics("Pull Request Guidelines"), ["git"]);
    assert.deepEqual(headingTopics("🔒 Security & secrets"), ["security"]);
    assert.deepEqual(headingTopics("Don’t"), ["boundaries"]);
    assert.deepEqual(headingTopics("Dev environment tips"), ["setup"]);
  });

  it("leaves a heading it can't place unclassified", () => {
    assert.deepEqual(headingTopics("Widgets"), []);
    assert.deepEqual(headingTopics("Contest entries"), []);
  });
});

describe("test commands", () => {
  it("recognizes runners and test subcommands", () => {
    for (const c of [
      "pnpm test",
      "npm run test:unit",
      "go test ./...",
      "cargo nextest run",
      "uv run pytest",
      "./gradlew test",
      "make test",
      "bin/test",
      "./run_tests.sh",
      "node --test test/a.test.ts",
      "build/reldebug/test/unittest",
      "./gradlew :module:jvmTest",
      "dart run tool.dart dart-test",
    ]) {
      assert.ok(isTestCommand(c), c);
    }
  });

  it("ignores paths and non-test commands", () => {
    for (const c of [
      "tests/",
      "src/test/java",
      "cargo check",
      "pnpm build",
      "pytest_parallel.jsonl",
      "tests/integrationtest",
      "pnpm install  # the tree CI tests",
      "contest",
      "pytest.ini",
      "test/__helpers/int/vitest.ts",
      "cargo clippy --all-targets --tests -- -D warnings",
    ]) {
      assert.ok(!isTestCommand(c), c);
    }
  });

  it("tells a single-test command apart", () => {
    assert.ok(isSingleTestCommand("pytest tests/test_api.py::test_login"));
    assert.ok(isSingleTestCommand("go test ./pkg -run TestParse"));
    assert.ok(isSingleTestCommand("pnpm vitest run src/parser.test.ts"));
    assert.ok(isSingleTestCommand("pytest -k login"));
    assert.ok(!isSingleTestCommand("pnpm test"));
    assert.ok(!isSingleTestCommand("cargo test --workspace"));
    assert.ok(!isSingleTestCommand("pnpm --filter @scope/pkg test:e2e"));
    assert.ok(!isSingleTestCommand("nx run-many -t test,build -p app"));
    assert.ok(isSingleTestCommand('pnpm test -t "parses dates"'));
    assert.ok(isSingleTestCommand("dotnet test --filter FullyQualifiedName~Parser"));
  });
});

describe("analyzeAgentsMd", () => {
  it("reads a sectioned file", () => {
    const a = analyzeAgentsMd(fixture("sectioned.md"));
    assert.equal(a.headings, 7);
    assert.equal(a.titled, true);
    assert.equal(a.classified, 5);
    assert.deepEqual(a.topics, ["overview", "setup", "commands", "testing", "style", "git"]);
    // "Build and test" spans its "Notes" subsection, counted once.
    assert.ok((a.topicChars.testing ?? 0) > (a.topicChars.setup ?? 0));
    assert.equal(a.topicChars.testing, a.topicChars.commands);
    assert.equal(a.testCommand, true);
    assert.equal(a.singleTest, true);
    assert.equal(a.relativeLinks, 2);
    assert.equal(a.externalLinks, 0);
    assert.equal(a.mdRefs, 2);
    assert.equal(a.prohibitions, 2);
    assert.equal(a.capsEmphasis, 1);
    assert.equal(a.codeBlocks, 3);
    assert.deepEqual(a.quotes.singleTest, { line: 18, text: "pnpm vitest run src/parser.test.ts" });
  });

  it("reads a file with no headings", () => {
    const a = analyzeAgentsMd(fixture("flat.md"));
    assert.equal(a.headings, 0);
    assert.deepEqual(a.topics, []);
    assert.equal(a.testCommand, false);
    assert.equal(a.imports, 1);
    assert.equal(a.prohibitions, 1);
    assert.equal(a.quotes.import?.text, "@docs/agents/testing.md");
  });

  it("does not count the file naming itself", () => {
    assert.equal(analyzeAgentsMd("See AGENTS.md and docs/AGENTS.md.").mdRefs, 0);
  });

  it("stays fast on a hostile line", () => {
    const start = Date.now();
    analyzeAgentsMd(`\`go ${"go ".repeat(200_000)}\` [${"[".repeat(200_000)}`);
    assert.ok(Date.now() - start < 2000);
  });

  it("stays fast on a flood of headings and a heading of blanks", () => {
    const start = Date.now();
    analyzeAgentsMd("# a\n## testing\n".repeat(100_000));
    analyzeAgentsMd(`# a${" \t".repeat(500_000)}x`.repeat(2));
    claudeMdRelation({ link: null, text: "\n".repeat(200_000) });
    assert.ok(Date.now() - start < 2000);
  });
});

describe("claudeMdRelation", () => {
  it("names each relation", () => {
    assert.equal(claudeMdRelation(null), "none");
    assert.equal(claudeMdRelation({ link: "AGENTS.md", text: null }), "symlink");
    assert.equal(claudeMdRelation({ link: "./docs/AGENTS.md", text: null }), "symlink");
    assert.equal(claudeMdRelation({ link: "README.md", text: null }), "separate");
    assert.equal(claudeMdRelation({ link: null, text: fixture("claude-import.md") }), "imports");
    assert.equal(claudeMdRelation({ link: null, text: "Read AGENTS.md first." }), "mentions");
    assert.equal(claudeMdRelation({ link: null, text: "# Notes\nUse pnpm." }), "separate");
  });
});

function row(name: string, body: string, over: Partial<ContentsRepo> = {}): ContentsRepo {
  const { quotes: _, ...a } = analyzeAgentsMd(body);
  return {
    host: "github",
    owner: "o",
    name,
    path: "AGENTS.md",
    sha: "abc",
    scoredChars: a.chars,
    linkTarget: null,
    claudeMd: "none",
    ...a,
    ...over,
  };
}

describe("buildContentsReport", () => {
  const data: ContentsData = {
    generatedAt: "2026-11-25T05:00:00.000Z",
    quotes: [],
    repos: [
      row("a", fixture("sectioned.md")),
      row("b", fixture("flat.md"), { claudeMd: "symlink" }),
      row("c", "## Testing\n\nRun `pytest`.", { path: "CLAUDE.md", claudeMd: null, scoredChars: 1 }),
      {
        host: "github",
        owner: "o",
        name: "d",
        path: "AGENTS.md",
        sha: null,
        scoredChars: 10,
        linkTarget: null,
        claudeMd: null,
        error: "HTTP 500",
      },
    ],
  };
  const r = buildContentsReport(data);

  it("counts only files read, and says how many were attempted", () => {
    assert.equal(r.attempted, 4);
    assert.equal(r.files, 3);
    assert.equal(r.agentsMd, 2);
    assert.equal(r.claudeMdOnly, 1);
    assert.equal(r.sameAsScored, 2);
    assert.equal(r.testCommand, 2);
    assert.equal(r.singleTest, 1);
    assert.equal(r.noHeadings, 1);
    assert.equal(r.imports, 1);
    assert.equal(r.claude.symlink, 1);
    assert.equal(r.claude.none, 1);
    assert.equal(r.topics[0].id, "testing");
    assert.equal(r.topics[0].files, 2);
  });

  it("writes a CSV row per file read", () => {
    const lines = contentsCsv(data.repos).trim().split("\n");
    assert.equal(lines.length, 4);
    assert.match(lines[0], /^repo,host,file,commit,chars,headings,overview,/);
  });

  it("keeps the title and description inside the caps", () => {
    assert.ok(pageTitle(contentsTitle(r)).absolute.length <= MAX_TITLE_LENGTH);
    assert.ok(contentsDescription(r).length <= MAX_DESCRIPTION_LENGTH);
  });
});

describe("pickQuotes", () => {
  const q = (kind: QuoteCandidate["kind"], repo: string, stars: number): QuoteCandidate => ({
    kind,
    repo,
    stars,
    url: `https://github.com/${repo}`,
    path: "AGENTS.md",
    sha: "abc",
    line: 1,
    text: "pnpm test",
  });

  it("takes the most-starred repo per kind, never one repo twice", () => {
    const picked = pickQuotes([
      q("testCommand", "a/x", 10),
      q("testCommand", "b/y", 50),
      q("singleTest", "b/y", 50),
      q("singleTest", "c/z", 5),
    ]);
    assert.deepEqual(
      picked.map((p) => [p.kind, p.repo]),
      [
        ["testCommand", "b/y"],
        ["singleTest", "c/z"],
      ],
    );
  });

  it("skips the author's own repos", () => {
    assert.equal(pickQuotes([q("testCommand", "hsnice16/agent-friendly-code", 99)]).length, 0);
  });
});
