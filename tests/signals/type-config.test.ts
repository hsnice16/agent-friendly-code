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

  test("pass=1 for pom.xml (typed JVM)", () => {
    fixture = makeFixture({ "pom.xml": "<project></project>" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for build.gradle.kts (typed JVM/Kotlin)", () => {
    fixture = makeFixture({ "build.gradle.kts": "plugins {}" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for Package.swift (typed Swift)", () => {
    fixture = makeFixture({ "Package.swift": "// swift-tools-version:5.9" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for a *.csproj at the root (typed C#)", () => {
    fixture = makeFixture({ "App.csproj": '<Project Sdk="Microsoft.NET.Sdk" />' });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for build.sbt (typed Scala)", () => {
    fixture = makeFixture({ "build.sbt": 'scalaVersion := "3.3.0"' });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for dune-project (typed OCaml)", () => {
    fixture = makeFixture({ "dune-project": "(lang dune 3.0)" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for stack.yaml (typed Haskell)", () => {
    fixture = makeFixture({ "stack.yaml": "resolver: lts-22.0" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for build.zig (typed Zig)", () => {
    fixture = makeFixture({ "build.zig": 'const std = @import("std");' });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for a *.cabal at the root (typed Haskell)", () => {
    fixture = makeFixture({ "app.cabal": "name: app\nversion: 0.1" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });
});
