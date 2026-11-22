import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { longerThan } from "../lib/agents-md-size";
import { headlineLines } from "../lib/og-card";

describe("headlineLines", () => {
  it("breaks after the title's first colon or question mark", () => {
    assert.deepEqual(headlineLines("How long should an AGENTS.md be? Sizes of 262 real files", 44), [
      "How long should an AGENTS.md be?",
      "Sizes of 262 real files",
    ]);
  });

  it("wraps a long part into even lines, leaving no word alone", () => {
    assert.deepEqual(headlineLines("Agent-friendly repos in languages too small for a hub of their own", 44), [
      "Agent-friendly repos in languages too",
      "small for a hub of their own",
    ]);
  });
});

describe("longerThan", () => {
  it("counts only measured files, rounding down", () => {
    const rows = [{ length: 100 }, { length: 200 }, { length: 300 }, { length: null }];
    assert.equal(longerThan(250, rows), 66);
    assert.equal(longerThan(100, rows), 0);
    assert.equal(longerThan(50, []), 0);
  });
});
