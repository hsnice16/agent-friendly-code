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

  test("pass=0 when neither .aider.conf.yml nor .aider.conf.yaml exists", () => {
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

  test("pass=1 for .aider.conf.yaml (alternate extension)", () => {
    fixture = makeFixture({ ".aider.conf.yaml": "model: gpt-4" });
    const r = aiderConf.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.aider\.conf\.yaml$/);
  });
});
