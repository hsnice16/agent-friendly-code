import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isNoiseTopic,
  normalizeTopic,
  relatedTopics,
  reposSharingTopics,
  TOPIC_PAGE_MIN_REPOS,
  topicDescription,
  topicGroups,
  topicLinks,
  topicTitle,
} from "../lib/topics";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

type Row = { id: number; language: string | null; topics: string | null };

let nextId = 1;
const rows = (n: number, topics: string[], language: string | null = "TypeScript"): Row[] =>
  Array.from({ length: n }, () => ({ id: nextId++, language, topics: JSON.stringify(topics) }));

describe("normalizeTopic", () => {
  it("merges spellings of one subject", () => {
    assert.equal(normalizeTopic("golang"), "go");
    assert.equal(normalizeTopic("postgres"), "postgresql");
    assert.equal(normalizeTopic("command-line"), "cli");
    assert.equal(normalizeTopic("artificial-intelligence"), "ai");
    assert.equal(normalizeTopic("node"), "nodejs");
    assert.equal(normalizeTopic("llms"), "llm");
    assert.equal(normalizeTopic("database"), "database");
  });

  it("counts a repo once when it carries both spellings", () => {
    const [cli] = topicGroups(rows(TOPIC_PAGE_MIN_REPOS, ["cli", "command-line"]));
    assert.equal(cli.slug, "cli");
    assert.equal(cli.rows.length, TOPIC_PAGE_MIN_REPOS);
  });
});

describe("topicGroups", () => {
  it("leaves out noise topics", () => {
    for (const t of ["hacktoberfest", "hacktoberfest2023", "hacktoberfest-accepted", "open-source", "awesome"]) {
      assert.ok(isNoiseTopic(t), t);
    }
    assert.deepEqual(topicGroups(rows(TOPIC_PAGE_MIN_REPOS, ["hacktoberfest", "opensource"])), []);
  });

  it("leaves out topics that name a language on the board, in any spelling", () => {
    const board = [
      ...rows(TOPIC_PAGE_MIN_REPOS, ["golang", "python3", "c++", "typescript"], "Go"),
      ...rows(1, [], "Python"),
      ...rows(1, [], "C++"),
      ...rows(1, [], "TypeScript"),
    ];
    assert.deepEqual(
      topicGroups(board).map((g) => g.slug),
      [],
    );
  });

  it("needs the threshold number of repos", () => {
    const board = [...rows(TOPIC_PAGE_MIN_REPOS, ["cli"]), ...rows(TOPIC_PAGE_MIN_REPOS - 1, ["vue"])];
    assert.deepEqual(
      topicGroups(board).map((g) => g.slug),
      ["cli"],
    );
  });

  it("makes no pages when topics are NULL, missing or malformed", () => {
    const board = [
      ...Array.from({ length: 20 }, (_, i) => ({ id: 1000 + i, language: "Go", topics: null })),
      ...Array.from({ length: 20 }, (_, i) => ({ id: 2000 + i, language: "Go" })),
      ...Array.from({ length: 20 }, (_, i) => ({ id: 3000 + i, language: "Go", topics: "not json" })),
    ];
    assert.deepEqual(topicGroups(board), []);
  });

  it("labels acronyms and brands, and lowercases the rest", () => {
    const groups = topicGroups([...rows(8, ["cli", "machine-learning", "nextjs"])]);
    assert.deepEqual(groups.map((g) => g.label).sort(), ["CLI", "Next.js", "machine learning"]);
  });
});

describe("relatedTopics", () => {
  it("ranks by shared repos, needs two, and caps the list", () => {
    const board = [
      ...rows(8, ["ai", "llm"]),
      ...rows(3, ["ai", "react"]),
      ...rows(5, ["react"]),
      ...rows(1, ["ai", "cli"]),
      ...rows(7, ["cli"]),
    ];
    const groups = topicGroups(board);
    const ai = groups.find((g) => g.slug === "ai");
    assert.ok(ai);
    assert.deepEqual(
      relatedTopics(ai, groups).map((g) => g.slug),
      ["llm", "react"],
    );
    assert.equal(relatedTopics(ai, groups, 1).length, 1);
  });
});

describe("topicLinks", () => {
  it("links a topic page first, then a language hub, else nothing", () => {
    const links = topicLinks(
      ["command-line", "golang", "zig", "misc"],
      [{ slug: "cli" }],
      [{ slug: "go", href: "/language/go" }],
    );
    assert.deepEqual(links, { "command-line": "/topic/cli", golang: "/language/go" });
  });
});

describe("topic page copy", () => {
  const labels = ["AI", "CLI", "machine learning", "distributed database", "a very long topic label that goes on"];

  it("fits a search result", () => {
    for (const label of labels) {
      assert.ok(pageTitle(topicTitle(label)).absolute.length <= MAX_TITLE_LENGTH, label);
      const d = topicDescription({
        label,
        count: 123,
        average: 61.25,
        top: "someone/some-long-repo-name",
        topScore: 99,
      });
      assert.ok(d.length <= MAX_DESCRIPTION_LENGTH, d);
    }
  });

  it("gives each topic its own title and description", () => {
    const titles = labels.map((l) => pageTitle(topicTitle(l)).absolute);
    const descriptions = labels.map((label) =>
      topicDescription({ label, count: 9, average: 50, top: "a/b", topScore: 70 }),
    );
    assert.equal(new Set(titles).size, labels.length);
    assert.equal(new Set(descriptions).size, labels.length);
  });

  it("reads like the example", () => {
    assert.equal(topicTitle("CLI"), "Agent-ready CLI repos ranked");
  });
});

describe("reposSharingTopics", () => {
  type Scored = Row & { score: number | null };
  const at = (id: number, topics: string[], score = 50, language: string | null = "Go"): Scored => ({
    id,
    language,
    topics: JSON.stringify(topics),
    score,
  });
  const ids = (out: { row: Scored }[]) => out.map((x) => x.row.id);
  // The generic cut is a share of the board, so small boards need bystanders.
  const filler = Array.from({ length: 80 }, (_, i) => at(100 + i, [`other-${i}`]));

  it("ranks by shared topics, then rarer topics, then score, across languages", () => {
    const repo = at(1, ["wsgi", "web", "http"]);
    const board = [
      repo,
      at(2, ["web"], 99),
      at(3, ["wsgi", "web"], 10, "Python"),
      at(4, ["http"], 60),
      at(5, ["web", "http"], 40),
      at(6, ["web"], 20),
      ...filler,
    ];
    assert.deepEqual(ids(reposSharingTopics(repo, board, new Set(), 4)), [3, 5, 4, 2]);
  });

  it("skips excluded repos and reports what is shared", () => {
    const repo = at(1, ["golang", "cli"]);
    const out = reposSharingTopics(repo, [repo, at(2, ["cli"]), at(3, ["cli", "tui"]), ...filler], new Set([2]), 6);
    assert.deepEqual(ids(out), [3]);
    assert.deepEqual(out[0].shared, ["cli"]);
  });

  it("ignores languages, noise and topics on a large share of the board", () => {
    const repo = at(1, ["go", "hacktoberfest", "ai"]);
    const board = [
      repo,
      at(2, ["go", "hacktoberfest", "ai"]),
      ...Array.from({ length: 10 }, (_, i) => at(10 + i, ["ai"])),
      ...filler,
    ];
    assert.deepEqual(reposSharingTopics(repo, board, new Set(), 6), []);
  });
});
