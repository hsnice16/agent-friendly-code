import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import committed from "../data/agent-file-history.json";
import { finishHistory, historyJson, newHistory, parseFileHistory, recordSnapshot } from "../lib/agent-file-history";
import type { SnapshotRow } from "../lib/agents-md-adoption";

function row(repoId: number, url: string, signalId: string, pass: number, matchedPath: string | null): SnapshotRow {
  return { repoId, url, signalId, pass, detail: "", matchedPath };
}

function build(days: [string, SnapshotRow[], string?][]) {
  const acc = newHistory();
  for (const [date, rows, scorer] of days) recordSnapshot(acc, date, rows, scorer);
  return finishHistory(acc);
}

const seen = (checkedFrom: string, firstFound: string, lastMissed: string | null = null) => ({
  checkedFrom,
  firstFound,
  lastMissed,
});

describe("agent-file history", () => {
  test("records the first check and the first day the file was found", () => {
    const h = build([
      ["2026-05-01", [row(1, "https://github.com/a/b", "agents_md", 0, null)]],
      ["2026-05-02", [row(1, "https://github.com/a/b", "agents_md", 0.2, "AGENTS.md")]],
      ["2026-05-03", [row(1, "https://github.com/a/b", "agents_md", 1, "AGENTS.md")]],
      ["2026-05-04", [row(1, "https://github.com/a/b", "agents_md", 0, null)]],
      ["2026-05-05", [row(1, "https://github.com/a/b", "agents_md", 1, "AGENTS.md")]],
    ]);
    // The empty file on 05-02 doesn't count; the later gap doesn't move the first day.
    assert.deepEqual(h["https://github.com/a/b"], { agentsMd: seen("2026-05-01", "2026-05-03", "2026-05-02") });
  });

  test("a miss by an older version of the checks doesn't date the file", () => {
    const h = build([
      ["2026-05-01", [row(1, "https://github.com/a/b", "agents_md", 0, null)], "v1"],
      ["2026-05-02", [row(1, "https://github.com/a/b", "agents_md", 0, null)], "v1"],
      ["2026-05-03", [row(1, "https://github.com/a/b", "agents_md", 1, "AGENTS.md")], "v2"],
    ]);
    assert.deepEqual(h["https://github.com/a/b"].agentsMd, seen("2026-05-01", "2026-05-03"));
  });

  test("a repo listed twice in one snapshot counts as found if either row found it", () => {
    const h = build([
      [
        "2026-05-01",
        [
          row(1, "https://github.com/a/b", "agents_md", 1, "AGENTS.md"),
          row(2, "https://github.com/a/b", "agents_md", 0, null),
        ],
      ],
    ]);
    assert.deepEqual(h["https://github.com/a/b"].agentsMd, seen("2026-05-01", "2026-05-01"));
  });

  test("an id handed to another repo doesn't merge the two", () => {
    const h = build([
      [
        "2026-05-01",
        [
          row(5, "https://github.com/a/old", "agents_md", 0, null),
          row(6, "https://github.com/a/b", "agents_md", 1, "AGENTS.md"),
        ],
      ],
      [
        "2026-05-02",
        [
          row(6, "https://github.com/a/old", "agents_md", 0, null),
          row(5, "https://github.com/a/b", "agents_md", 1, "AGENTS.md"),
        ],
      ],
    ]);
    assert.deepEqual(h, { "https://github.com/a/b": { agentsMd: seen("2026-05-01", "2026-05-01") } });
  });

  test("follows a rename by repo id and keys the result by the current URL", () => {
    const h = build([
      ["2026-05-01", [row(7, "https://github.com/Old/R", "agents_md", 1, "CLAUDE.md")]],
      ["2026-05-02", [row(7, "https://github.com/New/R", "agents_md", 1, "CLAUDE.md")]],
    ]);
    assert.deepEqual(Object.keys(h), ["https://github.com/new/r"]);
    assert.deepEqual(h["https://github.com/new/r"].claudeMd, seen("2026-05-01", "2026-05-01"));
  });

  test("never dates a CLAUDE.md the check could not see past an AGENTS.md", () => {
    const h = build([
      ["2026-05-01", [row(1, "https://github.com/a/b", "agents_md", 1, "AGENTS.md")]],
      ["2026-05-02", [row(1, "https://github.com/a/b", "agents_md", 1, "CLAUDE.md")]],
    ]);
    assert.equal(h["https://github.com/a/b"].claudeMd, undefined);
  });

  test("starts a later-added check's window on its own first run", () => {
    const h = build([
      ["2026-05-01", [row(1, "https://github.com/a/b", "agents_md", 1, "AGENTS.md")]],
      [
        "2026-06-01",
        [
          row(1, "https://github.com/a/b", "agents_md", 1, "AGENTS.md"),
          row(1, "https://github.com/a/b", "gemini_md", 1, "GEMINI.md"),
        ],
      ],
    ]);
    assert.deepEqual(h["https://github.com/a/b"].geminiMd, seen("2026-06-01", "2026-06-01"));
  });

  test("leaves out repos off the board by the last snapshot, and repos with no file", () => {
    const h = build([
      [
        "2026-05-01",
        [
          row(1, "https://github.com/a/gone", "agents_md", 1, "AGENTS.md"),
          row(2, "https://github.com/a/none", "agents_md", 0, null),
        ],
      ],
      ["2026-05-02", [row(2, "https://github.com/a/none", "agents_md", 0, null)]],
    ]);
    assert.deepEqual(h, {});
  });

  test("round-trips through its JSON, and rejects anything but dates", () => {
    const h = {
      "https://github.com/a/b": { agentsMd: seen("2026-05-01", "2026-05-03", "2026-05-02") },
      "https://github.com/a/c": { geminiMd: seen("2026-05-01", "2026-05-03") },
    };
    assert.deepEqual(parseFileHistory(JSON.parse(historyJson(h))), h);
    assert.match(historyJson(h), /"geminiMd":\["2026-05-01","2026-05-03"\]/);
    assert.throws(() => parseFileHistory({ repos: { "https://github.com/a/b": { agentsMd: ["<b>", "x"] } } }));
    assert.throws(() => parseFileHistory({ repos: { "https://github.com/A/b": {} } }));
    assert.throws(() =>
      parseFileHistory({ repos: { "https://github.com/a/b": { agentsMd: ["2026-05-03", "2026-05-01"] } } }),
    );
    assert.throws(() =>
      parseFileHistory({
        repos: { "https://github.com/a/b": { agentsMd: ["2026-05-01", "2026-05-03", "2026-05-03"] } },
      }),
    );
  });

  test("the committed file parses", () => {
    assert.ok(Object.keys(parseFileHistory(committed)).length > 0);
  });
});
