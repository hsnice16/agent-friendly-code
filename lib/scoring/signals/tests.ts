import { readdirSync } from "node:fs";
import { join } from "node:path";
import { TESTS_DIR_DETAIL_PREFIX, TESTS_FILES_DETAIL_PREFIX, TESTS_SCRIPT_DETAIL } from "../details";
import { createResolver, entryKind, readSafe, walkFind } from "./helpers";
import { childDirs } from "./nearby";
import type { Signal } from "./types";

const DIRS = ["tests", "test", "__tests__", "spec", "specs", "src/test", "testsuite"];
// A module's own suite one level down: Gradle/Maven `app/src/test`, Kotlin
// Multiplatform `src/commonTest`, `guava-tests/test`.
const MODULE_DIRS = ["tests", "test", "__tests__", "spec", "src/test"];
// Source sets named `<x>Test` (commonTest, jvmTest, androidTest, integTest).
const SOURCE_SET_RE = /^[a-z]\w*Test$/;
// .NET and Xcode name test projects `App.Tests` / `AppTests`. Case-sensitive, so `contests/` stays out.
const TEST_PROJECT_RE = /^[\w.-]+Tests$/;

const CODE_EXT =
  "(?:[cm]?[jt]sx?|vue|svelte|py|rb|go|rs|java|kts?|swift|cs|fs|php|dart|exs?|lua|c|cc|cpp|cxx|hpp|m|mm|scala|groovy|clj[cs]?|hs|ml|nim|cr|jl|[rR]|erl|gleam|sh)";

// Each tested against the file name alone, so none can backtrack across a path.
const TEST_FILE_RES = [
  new RegExp(`^.+[._](test|spec)\\.${CODE_EXT}$`),
  /^test_.+\.(py|c|cc|cpp)$/,
  /^tests?\.py$/,
  /^.+_unittest\.(c|cc|cpp)$/,
  /^.+(Tests?|TestCase|Spec|Suite)\.(java|kts?|scala|groovy|php|cs|fs|swift|m|mm|hs)$/,
  /^.+[a-z0-9]IT\.(java|kt)$/,
  /^.+_(SUITE|tests)\.erl$/,
  /^test-.+\.[rR]$/,
];
// Perl's `t/*.t`, the root `test.js` of a small npm package, and anything Jest
// runs by default from a `__tests__/` folder (react-router's `*-test.tsx`).
const PATH_RES = [/(^|\/)t\/[^/]+\.t$/, /^test\.[cm]?[jt]s$/, /(^|\/)__tests__\/[^/]+\.[cm]?[jt]sx?$/];

function isTestFile(rel: string): boolean {
  const name = rel.slice(rel.lastIndexOf("/") + 1);
  return TEST_FILE_RES.some((re) => re.test(name)) || PATH_RES.some((re) => re.test(rel));
}

function listDirs(abs: string): string[] {
  try {
    return readdirSync(abs).sort();
  } catch {
    return [];
  }
}

function testDir(repo: string): string | null {
  const resolve = createResolver(repo);
  const isDir = (rel: string | null): rel is string => !!rel && entryKind(repo, join(repo, rel)) === "dir";

  for (const d of DIRS) {
    const rel = resolve(d);
    if (isDir(rel)) {
      return rel;
    }
  }

  for (const name of listDirs(repo)) {
    if (TEST_PROJECT_RE.test(name) && isDir(name)) {
      return name;
    }
  }

  for (const base of ["", ...childDirs(repo)]) {
    if (base) {
      for (const d of MODULE_DIRS) {
        const rel = resolve(`${base}/${d}`);
        if (isDir(rel)) {
          return rel;
        }
      }
    }

    const src = resolve(base ? `${base}/src` : "src");
    if (!isDir(src)) {
      continue;
    }
    for (const name of listDirs(join(repo, src))) {
      if (SOURCE_SET_RE.test(name) && isDir(`${src}/${name}`)) {
        return `${src}/${name}`;
      }
    }
  }

  return null;
}

// npm writes this placeholder into every new package.json.
// Tested against the trimmed script: a trailing \s* after `[^&|;]*` backtracks quadratically.
const PLACEHOLDER_RE = /no test specified|^(exit\s+\d+|true|echo\b[^&|;]*)$/i;

function testScript(repo: string): boolean {
  const pkg = createResolver(repo)("package.json");
  if (!pkg) {
    return false;
  }

  try {
    const script: unknown = JSON.parse(readSafe(join(repo, pkg), repo))?.scripts?.test;
    return typeof script === "string" && script.trim() !== "" && !PLACEHOLDER_RE.test(script.trim());
  } catch {
    return false;
  }
}

export const tests: Signal = {
  id: "tests",
  label: "Test suite",
  description: "Tests the agent can run to check its changes.",
  improveSuggestion:
    "Add a tests/ (or test/, __tests__/, spec/) directory with runnable tests. Document how to run them in AGENTS.md.",
  check: (repo) => {
    const dir = testDir(repo);
    if (dir) {
      return {
        pass: 1,
        id: "tests",
        matchedPath: dir,
        label: "Test suite",
        detail: `${TESTS_DIR_DETAIL_PREFIX}${dir}`,
      };
    }

    // Go, Rust and JS keep tests beside the code by convention; that is a suite too.
    const [file] = walkFind(repo, isTestFile, 4, 1);
    if (file) {
      return {
        pass: 1,
        id: "tests",
        label: "Test suite",
        matchedPath: file,
        detail: `${TESTS_FILES_DETAIL_PREFIX} (${file})`,
      };
    }

    if (testScript(repo)) {
      return {
        pass: 0.7,
        id: "tests",
        label: "Test suite",
        matchedPath: "package.json",
        detail: TESTS_SCRIPT_DETAIL,
      };
    }

    return {
      pass: 0,
      id: "tests",
      label: "Test suite",
      detail: "No test directory or test files found",
    };
  },
};
