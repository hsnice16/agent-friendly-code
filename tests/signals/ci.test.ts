import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";
import { ci } from "../../lib/scoring/signals/ci";
import { makeFixture, removeFixture } from "../_helpers";

describe("ci signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when no CI config exists", () => {
    fixture = makeFixture({ "README.md": "no ci here" });
    assert.equal(ci.check(fixture).pass, 0);
  });

  test("pass=1 when .github/workflows has a yaml file", () => {
    fixture = makeFixture({
      ".github/workflows/ci.yml": "name: ci\non: [push]",
    });
    const r = ci.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, ".github/workflows");
  });

  test("ignores empty .github/workflows directory via non-yaml content", () => {
    fixture = makeFixture({ ".github/workflows/notes.txt": "ignored" });
    assert.equal(ci.check(fixture).pass, 0);
  });

  test("pass=0.9 for a non-GitHub CI config", () => {
    fixture = makeFixture({ ".gitlab-ci.yml": "stages: []" });
    assert.equal(ci.check(fixture).pass, 0.9);
  });
});
