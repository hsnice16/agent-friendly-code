import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { geminiMd } from "../../lib/scoring/signals/gemini-md";
import { makeFixture, removeFixture } from "../_helpers";

describe("geminiMd signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when no GEMINI.md exists", () => {
    fixture = makeFixture({ "README.md": "irrelevant" });
    assert.equal(geminiMd.check(fixture).pass, 0);
  });

  test("pass=0.2 for empty GEMINI.md", () => {
    fixture = makeFixture({ "GEMINI.md": "" });
    assert.equal(geminiMd.check(fixture).pass, 0.2);
  });

  test("pass=0.5 for thin file (<200 chars)", () => {
    fixture = makeFixture({ "GEMINI.md": "Short notes." });
    assert.equal(geminiMd.check(fixture).pass, 0.5);
  });

  test("pass=0.8 for moderate file (200 ≤ len < 800)", () => {
    fixture = makeFixture({ "GEMINI.md": "x".repeat(500) });
    assert.equal(geminiMd.check(fixture).pass, 0.8);
  });

  test("pass=1 for substantive file (≥800 chars)", () => {
    fixture = makeFixture({ "GEMINI.md": "x".repeat(1200) });
    const r = geminiMd.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /GEMINI\.md$/i);
  });

  test("matches case-insensitively", () => {
    fixture = makeFixture({ "Gemini.md": "x".repeat(1200) });
    assert.equal(geminiMd.check(fixture).pass, 1);
  });
});
