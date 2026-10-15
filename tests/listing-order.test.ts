import { strict as assert } from "node:assert";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { afterEach, describe, mock, test } from "node:test";

import { cursorRules } from "../lib/scoring/signals/cursor-rules";
import { depsManifest } from "../lib/scoring/signals/deps-manifest";
import { tests as testsSignal } from "../lib/scoring/signals/tests";
import { makeFixture, removeFixture } from "./_helpers";

// APFS lists names sorted, so on macOS an order bug only shows up if the
// listing is forced out of order. Linux CI clones (ext4 hash order) and the
// live-score tree (creation order) are where it bit.
function reverseListings(): void {
  const original = fs.readdirSync;

  mock.method(fs, "readdirSync", (...args: Parameters<typeof fs.readdirSync>) => {
    const out = original(...args);
    return Array.isArray(out) ? [...out].reverse() : out;
  });
  syncBuiltinESMExports();
}

describe("matchedPath ignores directory listing order", () => {
  let fixture = "";

  afterEach(() => {
    mock.restoreAll();
    syncBuiltinESMExports();

    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("tests: first test file by name, not by listing", () => {
    fixture = makeFixture({ "a/one.test.js": "", "b/two.test.js": "" });
    reverseListings();

    assert.equal(testsSignal.check(fixture).matchedPath, "a/one.test.js");
  });

  test("cursor_rules: first .mdc by name", () => {
    fixture = makeFixture({ ".cursor/rules/a.mdc": "x", ".cursor/rules/b.mdc": "x" });
    reverseListings();

    assert.equal(cursorRules.check(fixture).matchedPath, ".cursor/rules/a.mdc");
  });

  test("deps_manifest: first glob manifest by name", () => {
    fixture = makeFixture({ "A.csproj": "<Project />", "B.csproj": "<Project />" });
    reverseListings();

    assert.match(depsManifest.check(fixture).matchedPath ?? "", /(^|\/)A\.csproj$/);
  });
});
