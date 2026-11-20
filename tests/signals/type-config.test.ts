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

  test("pass=1 for a root *.slnx (typed C#)", () => {
    fixture = makeFixture({ "App.slnx": "<Solution />" });
    assert.equal(typeConfig.check(fixture).pass, 1);
  });

  test("pass=1 for Directory.Packages.props (typed C#)", () => {
    fixture = makeFixture({ "Directory.Packages.props": "<Project />" });
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

  test("directories named like type configs or typed-language manifests do not count", () => {
    fixture = makeFixture({ "tsconfig.json/x": "", "Cargo.toml/x": "", "app.cabal/x": "" });
    assert.equal(typeConfig.check(fixture).pass, 0);
  });

  test("pass=1 for deno.json", () => {
    fixture = makeFixture({
      "deno.json": "{}",
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for settings.gradle (typed Java/Kotlin)", () => {
    fixture = makeFixture({
      "settings.gradle": "",
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for pubspec.yaml (typed Dart)", () => {
    fixture = makeFixture({
      "pubspec.yaml": "name: app",
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for a root *.nimble (typed Nim)", () => {
    fixture = makeFixture({
      "app.nimble": "",
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for an Xcode project directory (typed Swift)", () => {
    fixture = makeFixture({
      "App.xcodeproj/project.pbxproj": "",
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for [tool.basedpyright] in pyproject.toml", () => {
    fixture = makeFixture({
      "pyproject.toml": '[tool.basedpyright]\ntypeCheckingMode = "strict"',
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for [tool.ty] in pyproject.toml", () => {
    fixture = makeFixture({
      "pyproject.toml": "[tool.ty.rules]\n",
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("[tool.typos] is not a type checker", () => {
    fixture = makeFixture({
      "pyproject.toml": "[tool.typos]\n",
    });
    const r = typeConfig.check(fixture);

    assert.equal(r.pass, 0);
  });
});
