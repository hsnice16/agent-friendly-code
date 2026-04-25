import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { tests as testsSignal } from "../../lib/scoring/signals/tests";
import { makeFixture, removeFixture } from "../_helpers";

describe("tests signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 with neither a tests dir nor test files", () => {
    fixture = makeFixture({ "README.md": "no tests" });
    assert.equal(testsSignal.check(fixture).pass, 0);
  });

  test("pass=1 when a tests/ directory exists", () => {
    fixture = makeFixture({ "tests/.keep": "" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, "tests");
  });

  test("pass=1 for __tests__", () => {
    fixture = makeFixture({ "__tests__/.keep": "" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, "__tests__");
  });

  test("pass=0.7 when only a *.spec.js file is present", () => {
    fixture = makeFixture({ "src/widget.spec.js": "// tests here" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 0.7);
    assert.match(r.matchedPath ?? "", /widget\.spec\.js$/);
  });

  test("pass=0.7 for a Go _test.go file", () => {
    fixture = makeFixture({ "pkg/foo_test.go": "package foo" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });
});
