import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";
import { license } from "../../lib/scoring/signals/license";
import { makeFixture, removeFixture } from "../_helpers";

describe("license signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 with no license file", () => {
    fixture = makeFixture({ "README.md": "nope" });
    assert.equal(license.check(fixture).pass, 0);
  });

  test("pass=1 for LICENSE", () => {
    fixture = makeFixture({ LICENSE: "MIT License..." });
    assert.equal(license.check(fixture).pass, 1);
  });

  test("pass=1 for COPYING", () => {
    fixture = makeFixture({ COPYING: "GPL..." });
    assert.equal(license.check(fixture).pass, 1);
  });
});
