import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { aiderConf } from "../../lib/scoring/signals/aider-conf";
import { makeFixture, removeFixture } from "../_helpers";

describe("aiderConf signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when there is no .aider.conf.yml", () => {
    fixture = makeFixture({ "README.md": "irrelevant" });
    assert.equal(aiderConf.check(fixture).pass, 0);
  });

  test("pass=1 for .aider.conf.yml", () => {
    fixture = makeFixture({
      ".aider.conf.yml": "test-cmd: bun run test\nlint-cmd: bun run lint",
    });
    const r = aiderConf.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.aider\.conf\.yml$/);
  });

  test("pass=0 for .aider.conf.yaml, which Aider never looks for", () => {
    fixture = makeFixture({ ".aider.conf.yaml": "test-cmd: bun run test" });
    assert.equal(aiderConf.check(fixture).pass, 0);
  });

  test("pass=1 for a config that only lists files to read", () => {
    fixture = makeFixture({ ".aider.conf.yml": "read:\n  - AGENTS.md\n" });
    assert.equal(aiderConf.check(fixture).pass, 1);
  });

  test("pass=0.5 for a config that sets none of test-cmd, lint-cmd, auto-test or read", () => {
    fixture = makeFixture({ ".aider.conf.yml": "model: sonnet\n# test-cmd: later\n" });
    assert.equal(aiderConf.check(fixture).pass, 0.5);
  });

  test("pass=0.5 when the settings are there but turn nothing on", () => {
    fixture = makeFixture({ ".aider.conf.yml": "auto-test: false\nread: []\ntest-cmd:\n" });
    assert.equal(aiderConf.check(fixture).pass, 0.5);
  });

  test("pass=1 for auto-test: true or an inline read list", () => {
    fixture = makeFixture({ ".aider.conf.yml": "auto-test: true\n" });
    assert.equal(aiderConf.check(fixture).pass, 1);
    removeFixture(fixture);

    fixture = makeFixture({ ".aider.conf.yml": "read: [AGENTS.md]\n" });
    assert.equal(aiderConf.check(fixture).pass, 1);
  });

  test("pass=0.2 for an empty config", () => {
    fixture = makeFixture({ ".aider.conf.yml": "  \n" });
    assert.equal(aiderConf.check(fixture).pass, 0.2);
  });
});
