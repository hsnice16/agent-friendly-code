import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";
import { depsManifest } from "../../lib/scoring/signals/deps-manifest";
import { makeFixture, removeFixture } from "../_helpers";

describe("depsManifest signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 when no manifest file exists", () => {
    fixture = makeFixture({ "README.md": "no manifest" });
    assert.equal(depsManifest.check(fixture).pass, 0);
  });

  test("pass=1 for a package.json", () => {
    fixture = makeFixture({ "package.json": "{}" });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath?.endsWith("package.json"), true);
  });

  test("pass=1 for a Cargo.toml (Rust)", () => {
    fixture = makeFixture({ "Cargo.toml": '[package]\nname = "x"' });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for a go.mod (Go)", () => {
    fixture = makeFixture({ "go.mod": "module example" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });
});
