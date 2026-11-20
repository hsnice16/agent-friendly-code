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

  test("pass=1 for a root *.slnx with projects only under src/ (.NET 10 default)", () => {
    fixture = makeFixture({
      "App.slnx": "<Solution />",
      "src/App/App.csproj": '<Project Sdk="Microsoft.NET.Sdk" />',
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /\.slnx$/);
  });

  test("pass=1 for a root *.sln", () => {
    fixture = makeFixture({ "App.sln": "Microsoft Visual Studio Solution File" });
    assert.equal(depsManifest.check(fixture).pass, 1);
  });

  test("pass=1 for Directory.Packages.props (.NET central package management)", () => {
    fixture = makeFixture({ "Directory.Packages.props": "<Project />" });
    assert.equal(depsManifest.check(fixture).pass, 1);
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

  test("a directory named like a manifest does not count", () => {
    fixture = makeFixture({ "package.json/x": "", "App.csproj/x": "" });
    assert.equal(depsManifest.check(fixture).pass, 0);
  });

  test("skips a directory named like a manifest for a real one further down the list", () => {
    fixture = makeFixture({ "package.json/x": "", "go.mod": "module x" });
    assert.match(depsManifest.check(fixture).matchedPath ?? "", /go\.mod$/);
  });

  test("pass=1 for settings.gradle.kts alone (gradle init puts the build file in app/)", () => {
    fixture = makeFixture({
      "settings.gradle.kts": 'include("app")',
      "app/build.gradle.kts": "",
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for deno.json", () => {
    fixture = makeFixture({
      "deno.json": "{}",
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for gleam.toml", () => {
    fixture = makeFixture({
      "gleam.toml": 'name = "app"',
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for Julia Project.toml", () => {
    fixture = makeFixture({
      "Project.toml": 'name = "App"',
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for MODULE.bazel", () => {
    fixture = makeFixture({
      "MODULE.bazel": 'module(name = "app")',
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for pixi.toml", () => {
    fixture = makeFixture({
      "pixi.toml": "",
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=1 for conda environment.yml", () => {
    fixture = makeFixture({
      "environment.yml": "name: app\ndependencies:\n  - python=3.12",
    });
    const r = depsManifest.check(fixture);

    assert.equal(r.pass, 1);
  });

  test("pass=0 for an environment.yml that is not a conda environment", () => {
    fixture = makeFixture({ "environment.yml": "db_host: localhost\nreplicas: 3" });
    assert.equal(depsManifest.check(fixture).pass, 0);
  });
});
