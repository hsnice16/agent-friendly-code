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
});
