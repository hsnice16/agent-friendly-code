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

  test("pass=1 for mix.exs (Elixir)", () => {
    fixture = makeFixture({ "mix.exs": "defmodule X.MixProject do\nend" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for Package.swift (Swift)", () => {
    fixture = makeFixture({ "Package.swift": "// swift-tools-version:5.9" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for a *.csproj at the root (C#)", () => {
    fixture = makeFixture({ "App.csproj": '<Project Sdk="Microsoft.NET.Sdk" />' });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.csproj$/);
  });

  test("pass=1 for build.sbt (Scala)", () => {
    fixture = makeFixture({ "build.sbt": 'scalaVersion := "3.3.0"' });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for deps.edn (Clojure)", () => {
    fixture = makeFixture({ "deps.edn": "{:deps {}}" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for project.clj (Leiningen)", () => {
    fixture = makeFixture({ "project.clj": '(defproject x "0.1")' });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for CMakeLists.txt (C/C++)", () => {
    fixture = makeFixture({ "CMakeLists.txt": "cmake_minimum_required(VERSION 3.20)" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for stack.yaml (Haskell)", () => {
    fixture = makeFixture({ "stack.yaml": "resolver: lts-22.0" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for dune-project (OCaml)", () => {
    fixture = makeFixture({ "dune-project": "(lang dune 3.0)" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for build.zig (Zig)", () => {
    fixture = makeFixture({ "build.zig": 'const std = @import("std");' });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for shard.yml (Crystal)", () => {
    fixture = makeFixture({ "shard.yml": "name: app\nversion: 0.1.0" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for a *.cabal at the root (Haskell)", () => {
    fixture = makeFixture({ "app.cabal": "name: app\nversion: 0.1" });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.cabal$/);
  });

  test("pass=1 for a *.nimble at the root (Nim)", () => {
    fixture = makeFixture({ "app.nimble": 'version = "0.1.0"' });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.nimble$/);
  });
});
