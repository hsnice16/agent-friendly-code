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

  test("pass=1 for .rubocop.yml (Ruby)", () => {
    fixture = makeFixture({ ".rubocop.yml": "AllCops:\n  NewCops: enable" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for .swiftlint.yml (Swift)", () => {
    fixture = makeFixture({ ".swiftlint.yml": "disabled_rules:\n  - line_length" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for phpstan.neon (PHP)", () => {
    fixture = makeFixture({ "phpstan.neon": "parameters:\n  level: 8" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=0 for .editorconfig alone (formatting baseline, not a real linter)", () => {
    fixture = makeFixture({ ".editorconfig": "root = true" });
    assert.equal(linter.check(fixture).pass, 0);
  });

  test("pass=0 for an indent-only .editorconfig in a .NET repo", () => {
    fixture = makeFixture({
      ".editorconfig":
        "root = true\n\n[*.cs]\nindent_style = space\nindent_size = 4\n# dotnet_style_qualification_for_field = false",
      "App.sln": "",
    });
    assert.equal(linter.check(fixture).pass, 0);
  });

  test("pass=1 for .editorconfig with .NET code-style rules", () => {
    fixture = makeFixture({
      ".editorconfig": "root = true\n\n[*.cs]\n  csharp_style_var_elsewhere = true:suggestion\n",
    });
    const r = linter.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, ".editorconfig");
  });

  test("pass=1 for .editorconfig with analyzer severities", () => {
    fixture = makeFixture({ ".editorconfig": "[*.{cs,vb}]\ndotnet_diagnostic.CA1822.severity = warning" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for .editorconfig with ktlint or Fantomas keys", () => {
    fixture = makeFixture({ ".editorconfig": "[*.{kt,kts}]\nktlint_code_style = ktlint_official" });
    assert.equal(linter.check(fixture).pass, 1);
    removeFixture(fixture);

    fixture = makeFixture({ ".editorconfig": "[*.fs]\nfsharp_max_line_length = 120" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for .globalconfig and stylecop.json (.NET analyzers)", () => {
    fixture = makeFixture({ ".globalconfig": "is_global = true\ndotnet_diagnostic.CA2007.severity = none" });
    assert.equal(linter.check(fixture).pass, 1);
    removeFixture(fixture);

    fixture = makeFixture({ "stylecop.json": '{"settings":{}}' });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for Directory.Build.props that enforces code style or sets AnalysisLevel", () => {
    fixture = makeFixture({
      "Directory.Build.props":
        "<Project><PropertyGroup><EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild></PropertyGroup></Project>",
    });
    assert.equal(linter.check(fixture).pass, 1);
    removeFixture(fixture);

    fixture = makeFixture({
      "Directory.Build.props":
        "<Project><PropertyGroup><AnalysisLevel>latest</AnalysisLevel></PropertyGroup></Project>",
    });
    assert.equal(linter.check(fixture).matchedPath, "Directory.Build.props");
  });

  test("pass=0 for Directory.Build.props that only treats warnings as errors", () => {
    fixture = makeFixture({
      "Directory.Build.props":
        "<Project><PropertyGroup><TreatWarningsAsErrors>true</TreatWarningsAsErrors><EnforceCodeStyleInBuild>false</EnforceCodeStyleInBuild></PropertyGroup></Project>",
    });
    assert.equal(linter.check(fixture).pass, 0);
  });

  test("pass=1 for config/detekt/detekt.yml (Gradle plugin convention)", () => {
    fixture = makeFixture({ "config/detekt/detekt.yml": "build:\n  maxIssues: 0" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for config/checkstyle/checkstyle.xml (Gradle convention)", () => {
    fixture = makeFixture({ "config/checkstyle/checkstyle.xml": '<module name="Checker"/>' });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for .swift-format (Apple's swift-format)", () => {
    fixture = makeFixture({ ".swift-format": '{"version":1}' });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for analysis_options.yaml (Dart/Flutter)", () => {
    fixture = makeFixture({ "analysis_options.yaml": "include: package:flutter_lints/flutter.yaml" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for .clang-format (C/C++)", () => {
    fixture = makeFixture({ ".clang-format": "BasedOnStyle: LLVM" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for .clang-tidy (C/C++)", () => {
    fixture = makeFixture({ ".clang-tidy": "Checks: '-*,clang-analyzer-*'" });
    assert.equal(linter.check(fixture).pass, 1);
  });

  test("pass=1 for .clj-kondo/config.edn (Clojure)", () => {
    fixture = makeFixture({ ".clj-kondo/config.edn": "{:linters {}}" });
    assert.equal(linter.check(fixture).pass, 1);
  });
});
