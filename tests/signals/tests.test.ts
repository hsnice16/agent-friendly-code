import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { tests as testsSignal } from "../../lib/scoring/signals/tests";
import { makeFixture, removeFixture } from "../_helpers";

describe("tests signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 with neither a tests dir nor test files", () => {
    fixture = makeFixture({ "README.md": "no tests" });
    assert.equal(testsSignal.check(fixture).pass, 0);
  });

  test("pass=1 when a tests/ directory exists", () => {
    fixture = makeFixture({ "tests/.keep": "" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, "tests");
  });

  test("pass=1 for __tests__", () => {
    fixture = makeFixture({ "__tests__/.keep": "" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, "__tests__");
  });

  test("pass=0.7 when only a *.spec.js file is present", () => {
    fixture = makeFixture({ "src/widget.spec.js": "// tests here" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 0.7);
    assert.match(r.matchedPath ?? "", /widget\.spec\.js$/);
  });

  test("pass=0.7 for a Go _test.go file", () => {
    fixture = makeFixture({ "pkg/foo_test.go": "package foo" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=1 for src/test (JVM convention)", () => {
    fixture = makeFixture({ "src/test/.keep": "" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, "src/test");
  });

  test("pass=1 for capital-T Tests/ (Swift convention)", () => {
    fixture = makeFixture({ "Tests/.keep": "" });
    const r = testsSignal.check(fixture);

    assert.equal(r.pass, 1);
    assert.match(r.matchedPath ?? "", /^tests$/i);
  });

  test("pass=0.7 for a Java *Test.java file", () => {
    fixture = makeFixture({ "src/main/java/FooTest.java": "class FooTest {}" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for an Elixir *_test.exs file", () => {
    fixture = makeFixture({ "lib/foo_test.exs": "defmodule FooTest do\nend" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for a Dart *_test.dart file", () => {
    fixture = makeFixture({ "lib/foo_test.dart": "void main() {}" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for a Scala *Spec.scala file", () => {
    fixture = makeFixture({ "src/main/scala/FooSpec.scala": "class FooSpec {}" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for a PHP *Test.php file", () => {
    fixture = makeFixture({ "src/FooTest.php": "<?php class FooTest {}" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for a Ruby *_test.rb file (Minitest)", () => {
    fixture = makeFixture({ "lib/foo_test.rb": "require 'minitest'" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for a Ruby *_spec.rb file (RSpec)", () => {
    fixture = makeFixture({ "lib/foo_spec.rb": "describe Foo do\nend" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });

  test("pass=0.7 for a C# *Tests.cs file", () => {
    fixture = makeFixture({ "src/Foo/FooTests.cs": "class FooTests {}" });
    assert.equal(testsSignal.check(fixture).pass, 0.7);
  });
});
