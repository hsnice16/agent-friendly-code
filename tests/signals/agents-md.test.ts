import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { agentsMd } from "../../lib/scoring/signals/agents-md";
import { makeFixture, removeFixture } from "../_helpers";

describe("agentsMd signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when no candidate file exists", () => {
    fixture = makeFixture({ "README.md": "irrelevant" });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 0);
    assert.equal(r.matchedPath, undefined);
  });

  test("pass=0.2 for empty AGENTS.md", () => {
    fixture = makeFixture({ "AGENTS.md": "" });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 0.2);
  });

  test("pass=0.5 for a very thin file (<200 chars)", () => {
    fixture = makeFixture({ "AGENTS.md": "Short notes." });
    assert.equal(agentsMd.check(fixture).pass, 0.5);
  });

  test("pass=0.8 for a moderate file (200 ≤ len < 800)", () => {
    fixture = makeFixture({ "AGENTS.md": "x".repeat(500) });
    assert.equal(agentsMd.check(fixture).pass, 0.8);
  });

  test("pass=1 for a substantive file (≥800 chars)", () => {
    fixture = makeFixture({ "AGENTS.md": "x".repeat(1200) });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /AGENTS\.md$/);
  });

  test("falls back to CLAUDE.md when AGENTS.md is missing", () => {
    fixture = makeFixture({ "CLAUDE.md": "x".repeat(1000) });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /CLAUDE\.md$/);
  });

  test("Cursor rule files are the cursor_rules check's, not this one's", () => {
    fixture = makeFixture({ ".cursor/rules/style.mdc": "Use Tailwind.", ".cursorrules": "x".repeat(1000) });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 0);
    assert.equal(r.matchedPath, undefined);
  });

  test("an empty AGENTS.md does not hide a CLAUDE.md with content", () => {
    fixture = makeFixture({ "AGENTS.md": "  \n", "CLAUDE.md": "x".repeat(900) });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /CLAUDE\.md$/);
  });

  test("a non-empty AGENTS.md still wins over a longer CLAUDE.md", () => {
    fixture = makeFixture({ "AGENTS.md": "Short notes.", "CLAUDE.md": "x".repeat(900) });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 0.5);
    assert.match(r.matchedPath ?? "", /AGENTS\.md$/);
  });

  test("finds Claude Code's .claude/CLAUDE.md and .claude/AGENTS.md", () => {
    fixture = makeFixture({ ".claude/CLAUDE.md": "x".repeat(900) });
    assert.match(agentsMd.check(fixture).matchedPath ?? "", /\/\.claude\/CLAUDE\.md$/);
    removeFixture(fixture);

    fixture = makeFixture({ ".claude/AGENTS.md": "x".repeat(300) });
    assert.equal(agentsMd.check(fixture).pass, 0.8);
  });

  test("a root file comes before the .claude/ ones", () => {
    fixture = makeFixture({ "CLAUDE.md": "Short notes.", ".claude/CLAUDE.md": "x".repeat(900) });
    assert.doesNotMatch(agentsMd.check(fixture).matchedPath ?? "", /\.claude/);
  });

  test("pass=0.2 on the first empty file when every candidate is empty", () => {
    fixture = makeFixture({ "CLAUDE.md": "", "AGENT.md": "" });
    const r = agentsMd.check(fixture);

    assert.equal(r.pass, 0.2);
    assert.match(r.matchedPath ?? "", /CLAUDE\.md$/);
  });
});
