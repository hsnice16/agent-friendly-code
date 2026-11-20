import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { ci } from "../../lib/scoring/signals/ci";
import { depsManifest } from "../../lib/scoring/signals/deps-manifest";
import { devEnv } from "../../lib/scoring/signals/dev-env";
import { license } from "../../lib/scoring/signals/license";
import { linter } from "../../lib/scoring/signals/linter";
import { childDirs, MAX_CHILD_DIRS } from "../../lib/scoring/signals/nearby";
import { preCommit } from "../../lib/scoring/signals/pre-commit";
import { readme } from "../../lib/scoring/signals/readme";
import { tests } from "../../lib/scoring/signals/tests";
import { typeConfig } from "../../lib/scoring/signals/type-config";
import type { Signal } from "../../lib/scoring/signals/types";
import { makeFixture, removeFixture } from "../_helpers";

let fixture = "";
afterEach(() => {
  if (fixture) removeFixture(fixture);
  fixture = "";
});

function run(signal: Signal, files: Record<string, string>) {
  if (fixture) removeFixture(fixture);
  fixture = makeFixture(files);
  return signal.check(fixture);
}

describe("one folder down", () => {
  test("finds a manifest, linter config and type file in a top-level folder", () => {
    assert.equal(run(depsManifest, { "dotnet/SK.slnx": "" }).matchedPath, "dotnet/SK.slnx");
    assert.equal(run(linter, { "src/.editorconfig": "[*.cs]\ncsharp_style_var_elsewhere = true" }).pass, 1);
    assert.equal(run(typeConfig, { "codex-rs/Cargo.toml": "[package]" }).matchedPath, "codex-rs/Cargo.toml");
  });

  test("prefers the root over a subfolder", () => {
    assert.equal(run(depsManifest, { "App.slnx": "", "src/package.json": "{}" }).matchedPath, "App.slnx");
  });

  test("ignores sample, docs, vendored and hidden folders", () => {
    for (const dir of ["examples", "docs", "vendor", "third_party", "fixtures", ".github", "node_modules"]) {
      assert.equal(run(depsManifest, { [`${dir}/package.json`]: "{}" }).pass, 0, dir);
    }
  });

  test("lists at most MAX_CHILD_DIRS folders, in a stable order", () => {
    const files: Record<string, string> = {};
    for (let i = 0; i < MAX_CHILD_DIRS + 20; i++) files[`d${String(i).padStart(3, "0")}/x`] = "";
    fixture = makeFixture(files);
    const dirs = childDirs(fixture);
    assert.equal(dirs.length, MAX_CHILD_DIRS);
    assert.equal(dirs[0], "d000");
  });
});

describe("dependency manifests across languages", () => {
  for (const file of ["build.mill", "elm.json", "DESCRIPTION", "cpanfile", "fpm.toml", "MODULE.bazel", "xmake.lua"]) {
    test(`pass=1 for ${file}`, () => assert.equal(run(depsManifest, { [file]: "" }).pass, 1));
  }
  for (const file of ["Build.proj", "app.gemspec", "lib.opam", "x-1.0-1.rockspec", "native.vcxproj"]) {
    test(`pass=1 for ${file}`, () => assert.equal(run(depsManifest, { [file]: "" }).pass, 1));
  }
});

describe("type config", () => {
  test("counts C and C++ build files as a typed language", () => {
    const r = run(typeConfig, { "CMakeLists.txt": "project(x)" });
    assert.equal(r.pass, 1);
    assert.equal(r.detail, "Typed language (C/C++)");
  });

  test("does not call a Python package with C extensions typed", () => {
    const mesonpy = '[build-system]\nbuild-backend = "mesonpy"';
    assert.equal(run(typeConfig, { "pyproject.toml": mesonpy, "meson.build": "" }).pass, 0);
    const skbuild = '[build-system]\nbuild-backend = "scikit_build_core.build"';
    assert.equal(run(typeConfig, { "pyproject.toml": skbuild, "CMakeLists.txt": "" }).pass, 0);
  });

  test("keeps a C++ repo typed when its pyproject.toml only serves helper scripts", () => {
    const poetry = '[tool.poetry]\nname = "convert"\n\n[build-system]\nbuild-backend = "poetry.core.masonry.api"';
    assert.equal(run(typeConfig, { "pyproject.toml": poetry, "CMakeLists.txt": "" }).pass, 1);
  });

  test("counts PHPStan, Psalm and tsconfig variants as type checkers", () => {
    for (const file of ["phpstan.src.neon.dist", "psalm.xml", "tsconfig.base.json", "sorbet/config", "Steepfile"]) {
      assert.equal(run(typeConfig, { [file]: "" }).pass, 1, file);
    }
  });

  test("reads [mypy] in setup.cfg and [tool.pyrefly] in pyproject.toml", () => {
    assert.equal(run(typeConfig, { "setup.cfg": "[metadata]\nname=x\n\n[mypy]\nstrict = True" }).pass, 1);
    assert.equal(run(typeConfig, { "pyproject.toml": "[tool.pyrefly]\nproject-includes = ['src']" }).pass, 1);
    assert.equal(run(typeConfig, { "setup.cfg": "[metadata]\nname=x" }).pass, 0);
  });

  test("labels an Xcode project Swift/Objective-C", () => {
    assert.equal(run(typeConfig, { "App.xcodeproj/project.pbxproj": "" }).detail, "Typed language (Swift/Objective-C)");
  });

  test("names the build file it credited", () => {
    assert.equal(run(typeConfig, { "go.mod": "module x" }).matchedPath, "go.mod");
  });
});

describe("linter configs across languages", () => {
  for (const file of [
    ".eslintrc.yml",
    ".eslintrc.yaml",
    ".oxlintrc.json",
    "dprint.json",
    ".hlint.yaml",
    "fourmolu.yaml",
    ".csharpierrc",
    ".style.yapf",
    "_clang-format",
    ".shellcheckrc",
    ".lintr",
  ]) {
    test(`pass=1 for ${file}`, () => assert.equal(run(linter, { [file]: "x" }).pass, 1));
  }

  test("finds Checkstyle rules wherever a Java build keeps them", () => {
    for (const path of [
      "style/rmq_checkstyle.xml",
      ".baseline/checkstyle/checkstyle.xml",
      "src/checkstyle/checkstyle.xml",
    ]) {
      assert.equal(run(linter, { [path]: "<module/>" }).matchedPath, path);
    }
  });

  test("reads Spotless, Checkstyle and detekt from Gradle and Maven build files", () => {
    assert.equal(run(linter, { "build.gradle.kts": 'plugins { id("com.diffplug.spotless") }' }).pass, 1);
    assert.equal(run(linter, { "build.gradle": "plugins {\n  id 'checkstyle'\n}" }).pass, 1);
    assert.equal(run(linter, { "pom.xml": "<artifactId>maven-checkstyle-plugin</artifactId>" }).pass, 1);
    assert.equal(
      run(linter, { "gradle/libs.versions.toml": 'detekt = { id = "io.gitlab.arturbosch.detekt" }' }).pass,
      1,
    );
    assert.equal(run(linter, { "build.gradle": "plugins { id 'java' }" }).pass, 0);
  });

  test("reads top-level linter keys in package.json, not devDependencies", () => {
    assert.equal(run(linter, { "package.json": '{"eslintConfig":{"extends":"x"}}' }).pass, 1);
    assert.equal(run(linter, { "package.json": '{"devDependencies":{"prettier":"3"}}' }).pass, 0);
  });

  test("reads Cargo lints, Zig's fmt step, tox sections and Deno's lint key", () => {
    assert.equal(run(linter, { "Cargo.toml": "[package]\n\n[lints.clippy]\npedantic = 'warn'" }).pass, 1);
    assert.equal(run(linter, { "build.zig": 'const fmt = b.addFmt(.{ .paths = &.{"src"} });' }).pass, 1);
    assert.equal(run(linter, { "tox.ini": "[tox]\n\n[flake8]\nmax-line-length = 100" }).pass, 1);
    assert.equal(run(linter, { "deno.json": '{ "lint": { "rules": {} } }' }).pass, 1);
    assert.equal(run(linter, { "Cargo.toml": "[package]\nname = 'x'" }).pass, 0);
  });

  test("stays linear on a long run of spaces after a plugin id", () => {
    const t = performance.now();
    run(linter, { "build.gradle": `id${" ".repeat(1 << 20)}` });
    assert.ok(performance.now() - t < 2000);
  });
});

describe("tests", () => {
  test("full credit for tests beside the code", () => {
    assert.equal(run(tests, { "pkg/server/handler_test.go": "" }).pass, 1);
    assert.equal(run(tests, { "test.js": "" }).pass, 1);
  });

  test("finds module test folders and source sets one level down", () => {
    assert.equal(run(tests, { "app/src/test/java/AppTest.java": "" }).matchedPath, "app/src/test");
    assert.equal(run(tests, { "core/src/commonTest/kotlin/A.kt": "" }).matchedPath, "core/src/commonTest");
    assert.equal(run(tests, { "guava-tests/test/A.java": "" }).matchedPath, "guava-tests/test");
    assert.equal(run(tests, { "App.Tests/UnitTest1.cs": "" }).matchedPath, "App.Tests");
  });

  test("covers C++, Erlang, R and Perl test names", () => {
    for (const path of ["src/net_unittest.cc", "src/x_SUITE.erl", "R/test-parse.R", "t/basic.t"]) {
      assert.equal(run(tests, { [path]: "" }).pass, 1, path);
    }
  });

  test("does not take test-named config files for tests", () => {
    for (const path of ["docker-compose.test.yml", "tsconfig.spec.json", "contests/a.md"]) {
      assert.equal(run(tests, { [path]: "" }).pass, 0, path);
    }
  });

  test("70% for a real test script, none for npm's placeholder", () => {
    assert.equal(run(tests, { "package.json": '{"scripts":{"test":"vitest run"}}' }).pass, 0.7);
    assert.equal(
      run(tests, { "package.json": '{"scripts":{"test":"echo \\"Error: no test specified\\" && exit 1"}}' }).pass,
      0,
    );
  });
});

describe("dev env", () => {
  test("a language toolchain counts as one setup artifact", () => {
    assert.equal(run(devEnv, { "Cargo.toml": "" }).pass, 0.7);
    assert.equal(run(devEnv, { "go.mod": "", Makefile: "" }).pass, 1);
    assert.equal(run(devEnv, { "App.slnx": "" }).pass, 0.7);
  });

  test("Mix counts only with a setup alias", () => {
    assert.equal(run(devEnv, { "mix.exs": 'defp aliases, do: [setup: ["deps.get"]]' }).pass, 0.7);
    assert.equal(run(devEnv, { "mix.exs": "defmodule X.MixProject do end" }).pass, 0);
  });

  test("a Taskfile and its dist override are one tool", () => {
    assert.equal(run(devEnv, { "Taskfile.yml": "", "Taskfile.dist.yml": "" }).pass, 0.7);
  });
});

describe("hostile input stays linear", () => {
  const fast = (signal: Signal, files: Record<string, string>) => {
    const t = performance.now();
    run(signal, files);
    assert.ok(performance.now() - t < 2000, `${signal.id} took ${performance.now() - t} ms`);
  };

  test("a Cargo.toml of blank lines", () => fast(preCommit, { "Cargo.toml": "\n".repeat(1 << 20) }));

  test("a test script of spaces", () =>
    fast(tests, { "package.json": JSON.stringify({ scripts: { test: `echo${" ".repeat(1 << 19)}x&` } }) }));
});

describe("no false positives", () => {
  test("setup.cfg counts only with a linter section", () => {
    assert.equal(run(linter, { "setup.cfg": "[metadata]\nname = x\n\n[options]\npackages = find:" }).pass, 0);
    assert.equal(run(linter, { "setup.cfg": "[metadata]\nname = x\n\n[flake8]\nmax-line-length = 100" }).pass, 1);
  });

  test("a Checkstyle report under build/ or reports/ is not a config", () => {
    assert.equal(run(linter, { "build/logs/checkstyle.xml": "<checkstyle/>" }).pass, 0);
    assert.equal(run(linter, { "reports/checkstyle-result.xml": "<checkstyle/>" }).pass, 0);
  });

  test("an all-caps file ending in IT is not an integration test", () => {
    assert.equal(run(tests, { "src/main/AUDIT.java": "" }).pass, 0);
    assert.equal(run(tests, { "src/main/OrderServiceIT.java": "" }).pass, 1);
  });
});

describe("pre-commit, CI, license, README guards", () => {
  test("hooks configured in package.json or Cargo.toml", () => {
    assert.equal(run(preCommit, { "package.json": '{"simple-git-hooks":{"pre-commit":"x"}}' }).pass, 1);
    assert.equal(run(preCommit, { "package.json": '{"husky":{"hooks":{"pre-commit":"x"}}}' }).pass, 1);
    assert.equal(run(preCommit, { "Cargo.toml": "[dev-dependencies]\ncargo-husky = '1'" }).pass, 1);
    assert.equal(run(preCommit, { "package.json": '{"devDependencies":{"husky":"9"}}' }).pass, 0);
  });

  test("a CI folder needs a workflow file in it", () => {
    assert.equal(run(ci, { ".gitea/workflows/README.md": "" }).pass, 0);
    assert.equal(run(ci, { ".forgejo/workflows/ci.yml": "" }).pass, 0.9);
    assert.equal(run(ci, { ".build.yml": "" }).pass, 0.9);
  });

  test("REUSE LICENSES/ counts; a licenses/ folder of notices does not", () => {
    assert.equal(run(license, { "LICENSES/MIT.txt": "" }).pass, 1);
    assert.equal(run(license, { "licenses/lodash-notice.md": "" }).pass, 0);
  });

  test("a readme/ assets folder does not hide .github/README.md", () => {
    const r = run(readme, { "readme/shot.png": "", ".github/README.md": "x".repeat(1200) });
    assert.equal(r.matchedPath?.endsWith(".github/README.md"), true);
  });
});
