import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";
import { contributing } from "../../lib/scoring/signals/contributing";
import { makeFixture, removeFixture } from "../_helpers";

describe("contributing signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when no guide exists", () => {
    fixture = makeFixture({ "README.md": "nope" });
    assert.equal(contributing.check(fixture).pass, 0);
  });

  test("pass=1 for a root CONTRIBUTING.md", () => {
    fixture = makeFixture({ "CONTRIBUTING.md": "anything" });
    const r = contributing.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /CONTRIBUTING\.md$/);
  });

  test("pass=1 for a .github/CONTRIBUTING.md", () => {
    fixture = makeFixture({ ".github/CONTRIBUTING.md": "anything" });
    assert.equal(contributing.check(fixture).pass, 1);
  });
});
