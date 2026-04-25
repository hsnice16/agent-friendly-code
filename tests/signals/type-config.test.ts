import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { typeConfig } from "../../lib/scoring/signals/type-config";
import { makeFixture, removeFixture } from "../_helpers";

describe("typeConfig signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 with no type config", () => {
    fixture = makeFixture({ "README.md": "none" });
    assert.equal(typeConfig.check(fixture).pass, 0);
  });

  test("pass=1 for tsconfig.json", () => {
    fixture = makeFixture({ "tsconfig.json": "{}" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for Cargo.toml (typed language)", () => {
    fixture = makeFixture({ "Cargo.toml": "[package]" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 when pyproject.toml configures pyright", () => {
    fixture = makeFixture({ "pyproject.toml": "[tool.pyright]\nstrict = []" });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, "pyproject.toml");
  });
});
