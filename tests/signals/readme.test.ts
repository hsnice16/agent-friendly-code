import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { readme } from "../../lib/scoring/signals/readme";
import { makeFixture, removeFixture } from "../_helpers";

describe("readme signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when no README exists", () => {
    fixture = makeFixture({ "AGENTS.md": "unrelated" });
    assert.equal(readme.check(fixture).pass, 0);
  });

  test("pass=0.3 for a thin README (<200 chars)", () => {
    fixture = makeFixture({ "README.md": "short" });
    assert.equal(readme.check(fixture).pass, 0.3);
  });

  test("pass=0.7 for a mid-length README (200 ≤ len < 1000)", () => {
    fixture = makeFixture({ "README.md": "x".repeat(500) });
    assert.equal(readme.check(fixture).pass, 0.7);
  });

  test("pass=1 for a detailed README (≥1000 chars)", () => {
    fixture = makeFixture({ "README.md": "x".repeat(1500) });
    const r = readme.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /README\.md$/);
  });

  test("accepts alternative README extensions", () => {
    fixture = makeFixture({ "README.rst": "x".repeat(400) });
    assert.equal(readme.check(fixture).pass, 0.7);
  });
});
