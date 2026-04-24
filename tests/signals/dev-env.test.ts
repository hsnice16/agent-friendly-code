import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";
import { devEnv } from "../../lib/scoring/signals/dev-env";
import { makeFixture, removeFixture } from "../_helpers";

describe("devEnv signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 with no artifacts and no script-rich package.json", () => {
    fixture = makeFixture({ "README.md": "nothing useful" });
    assert.equal(devEnv.check(fixture).pass, 0);
  });

  test("pass=0.6 when only package.json with ≥3 scripts", () => {
    fixture = makeFixture({
      "package.json": JSON.stringify({
        scripts: { dev: "x", build: "y", test: "z" },
      }),
    });

    assert.equal(devEnv.check(fixture).pass, 0.6);
  });

  test("pass=0.7 for exactly one env artifact", () => {
    fixture = makeFixture({ Dockerfile: "FROM node:20" });
    assert.equal(devEnv.check(fixture).pass, 0.7);
  });

  test("pass=1 for two or more env artifacts", () => {
    fixture = makeFixture({
      Dockerfile: "FROM node:20",
      "docker-compose.yml": "services: {}",
    });

    assert.equal(devEnv.check(fixture).pass, 1);
  });
});
