import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";
import { linter } from "../../lib/scoring/signals/linter";
import { makeFixture, removeFixture } from "../_helpers";

describe("linter signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 with no config", () => {
    fixture = makeFixture({ "README.md": "no config" });
    assert.equal(linter.check(fixture).pass, 0);
  });

  test("pass=1 for a biome.json", () => {
    fixture = makeFixture({ "biome.json": "{}" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for an eslint config", () => {
    fixture = makeFixture({ ".eslintrc.json": "{}" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 when pyproject.toml declares a linter tool", () => {
    fixture = makeFixture({
      "pyproject.toml": "[tool.ruff]\nline-length = 100",
    });
    const r = linter.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, "pyproject.toml");
  });

  test("pass=0 when pyproject.toml has no linter tool section", () => {
    fixture = makeFixture({ "pyproject.toml": '[project]\nname = "x"' });
    assert.equal(linter.check(fixture).pass, 0);
  });
});
