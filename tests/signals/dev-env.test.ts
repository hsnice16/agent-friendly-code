import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { devEnv } from "../../lib/scoring/signals/dev-env";
import { type FixtureFiles, makeFixture, removeFixture } from "../_helpers";

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

  test("pass=0.7 for tox.ini alone (Python)", () => {
    fixture = makeFixture({ "tox.ini": "[tox]\nenvlist = py310" });
    const r = devEnv.check(fixture);

    assert.equal(r.pass, 0.7);
    assert.equal(r.matchedPath, "tox.ini");
  });

  test("pass=1 for tox.ini + Makefile (pytest-style)", () => {
    fixture = makeFixture({
      Makefile: "test:\n\tpytest",
      "tox.ini": "[tox]\nenvlist = py310",
    });

    assert.equal(devEnv.check(fixture).pass, 1);
  });

  test("pass=0.7 for gradlew alone (JVM wrapper)", () => {
    fixture = makeFixture({ gradlew: "#!/bin/sh" });
    assert.equal(devEnv.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for bin/setup alone (Ruby convention)", () => {
    fixture = makeFixture({ "bin/setup": "#!/usr/bin/env bash" });
    assert.equal(devEnv.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for compose.yaml alone (modern Compose canonical name)", () => {
    fixture = makeFixture({ "compose.yaml": "services: {}" });
    assert.equal(devEnv.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for a lone Makefile — one file is never two hits", () => {
    fixture = makeFixture({ Makefile: "test:\n\tpytest" });
    assert.equal(devEnv.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for docker-compose.yaml alone", () => {
    fixture = makeFixture({ "docker-compose.yaml": "services: {}" });
    const r = devEnv.check(fixture);

    assert.equal(r.pass, 0.7);
    assert.equal(r.matchedPath, "docker-compose.yaml");
  });

  test("counts a nested .devcontainer/<name>/devcontainer.json", () => {
    fixture = makeFixture({
      ".devcontainer/python/devcontainer.json": "{}",
    });
    const r = devEnv.check(fixture);

    assert.equal(r.pass, 0.7);
    assert.equal(r.matchedPath, ".devcontainer/python/devcontainer.json");
  });

  test("counts .justfile and Taskfile.yaml", () => {
    fixture = makeFixture({
      ".justfile": "",
      "Taskfile.yaml": "",
    });
    const r = devEnv.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("counts Copilot's copilot-setup-steps.yml", () => {
    fixture = makeFixture({
      ".github/workflows/copilot-setup-steps.yml": "",
    });
    const r = devEnv.check(fixture);

    assert.equal(r.pass, 0.7);
  });

  test("counts each tool once: Compose, Nix and devcontainer spellings", () => {
    const sets: FixtureFiles[] = [
      { "compose.yaml": "services: {}", "docker-compose.yml": "services: {}" },
      { "flake.nix": "{}", "shell.nix": "{}", "default.nix": "{}" },
      { ".devcontainer.json": "{}", ".devcontainer/devcontainer.json": "{}" },
    ];
    for (const files of sets) {
      fixture = makeFixture(files);
      const r = devEnv.check(fixture);
      removeFixture(fixture);
      fixture = "";

      assert.equal(r.pass, 0.7, Object.keys(files).join(", "));
    }
  });

  test("a directory named like an artifact does not count", () => {
    fixture = makeFixture({ "Makefile/x": "", "Dockerfile/y": "" });
    assert.equal(devEnv.check(fixture).pass, 0);
  });

  test("package.json scripts must be an object", () => {
    fixture = makeFixture({ "package.json": JSON.stringify({ scripts: "npm run build && npm test" }) });
    assert.equal(devEnv.check(fixture).pass, 0);
  });
});
