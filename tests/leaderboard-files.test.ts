import "./_temp-db";

import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { db, saveScoredRepo } from "../lib/db";
import { getInstructionFileCounts } from "../lib/leaderboard-files";
import type { SignalResult } from "../lib/scoring/signals";

const signal = (id: string, pass: number, matchedPath?: string): SignalResult => ({
  id,
  pass,
  label: id,
  detail: "",
  matchedPath,
});

function save(name: string, signals: SignalResult[]): void {
  saveScoredRepo({
    name,
    signals,
    owner: "o",
    overall: 50,
    host: "github",
    modelScores: [],
    url: `https://github.com/o/${name}`,
  });
}

save("upper", [signal("agents_md", 1, "AGENTS.md"), signal("gemini_md", 1, "GEMINI.md")]);
save("lower", [signal("agents_md", 0.8, "agents.md")]);
save("claude", [signal("agents_md", 1, "CLAUDE.md"), signal("gemini_md", 0.2, "GEMINI.md")]);
save("empty", [signal("agents_md", 0.2, "AGENTS.md")]);

after(() => db.close());

describe("getInstructionFileCounts", () => {
  it("counts every spelling of a name and leaves out empty files", () => {
    const { total, files } = getInstructionFileCounts();
    const count = (file: string) => files.find((f) => f.file === file)?.count;
    assert.equal(total, 4);
    assert.equal(count("AGENTS.md"), 2);
    assert.equal(count("CLAUDE.md"), 1);
    assert.equal(count("GEMINI.md"), 1);
    assert.equal(files[0].file, "AGENTS.md");
  });
});
