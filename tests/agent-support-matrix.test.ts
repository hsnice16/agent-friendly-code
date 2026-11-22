import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AGENT_READS, OTHER_TOOLS } from "../lib/agent-reads";
import { MATRIX_COLUMNS, supportMatrix } from "../lib/agent-support-matrix";
import { MODELS } from "../lib/scoring/weights";

const col = (label: string) => MATRIX_COLUMNS.findIndex((c) => c.label === label);

describe("supportMatrix", () => {
  const rows = supportMatrix();

  it("has a row per scored agent, then per other tool", () => {
    assert.deepEqual(
      rows.map((r) => r.label),
      [...MODELS.map((m) => m.label), ...OTHER_TOOLS.map((t) => t.name)],
    );
  });

  it("links every filled cell to one of that agent's own docs, and no empty one", () => {
    for (const r of rows) {
      const m = MODELS.find((x) => x.label === r.label);
      const sources = m
        ? [...m.sources, ...(AGENT_READS[m.id].sources ?? [])]
        : (OTHER_TOOLS.find((t) => t.name === r.label)?.sources ?? []);
      for (const c of r.cells) {
        if (c.value) assert.ok(c.doc && sources.includes(c.doc), `${r.label}: ${c.doc}`);
        else assert.equal(c.doc, null);
      }
    }
  });

  it("reads AGENTS.md the way agent-reads.ts says", () => {
    const cell = (label: string, column: string) => rows.find((r) => r.label === label)?.cells[col(column)].value;
    assert.equal(cell("Claude Code", "AGENTS.md"), "fallback");
    assert.equal(cell("Aider", "AGENTS.md"), "setting");
    assert.equal(cell("Codex", "AGENTS.md in subfolders"), "yes");
    assert.equal(cell("Claude Code", ".claude/skills"), "yes");
    assert.equal(cell("Cursor", ".cursor/rules"), "yes");
    assert.equal(cell("GitHub Copilot", ".github/copilot-instructions.md"), "yes");
  });

  it("points a skills cell at the skills doc when the agent has one", () => {
    const cursor = rows.find((r) => r.label === "Cursor");
    assert.equal(cursor?.cells[col(".agents/skills")].doc, "https://cursor.com/docs/skills");
  });
});
