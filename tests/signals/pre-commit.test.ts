import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { preCommit } from "../../lib/scoring/signals/pre-commit";
import { makeFixture, removeFixture } from "../_helpers";

describe("preCommit signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 with no hook framework", () => {
    fixture = makeFixture({ "README.md": "none" });
    assert.equal(preCommit.check(fixture).pass, 0);
  });

  test("pass=1 for lefthook.yml", () => {
    fixture = makeFixture({ "lefthook.yml": "pre-commit:\n  commands: {}" });
    assert.equal(preCommit.check(fixture).pass, 1);
  });

  test("pass=1 for .pre-commit-config.yaml", () => {
    fixture = makeFixture({ ".pre-commit-config.yaml": "repos: []" });
    assert.equal(preCommit.check(fixture).pass, 1);
  });

  test("pass=1 for a .husky directory", () => {
    fixture = makeFixture({ ".husky/pre-commit": "#!/bin/sh" });
    assert.equal(preCommit.check(fixture).pass, 1);
  });
});
