import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { firstExisting, resolveAllRelative, resolveRelative } from "../lib/scoring/signals/helpers";
import { makeFixture, removeFixture } from "./_helpers";

describe("case-insensitive path resolution", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("resolves a differently-cased file", () => {
    fixture = makeFixture({ "Readme.md": "x" });
    assert.equal(resolveRelative(fixture, "README.md"), "Readme.md");
  });

  // Asserting the on-disk spelling (not the candidate spelling) is what makes
  // these fail on a case-insensitive filesystem too, where a plain existence
  // check would happily pass.
  test("returns the on-disk spelling, not the candidate spelling", () => {
    fixture = makeFixture({ "license.md": "MIT" });
    assert.equal(firstExisting(fixture, ["LICENSE", "LICENSE.md"]), `${fixture}/license.md`);
  });

  test("prefers an exact match over a differently-cased sibling", () => {
    fixture = makeFixture({ "README.md": "exact", "readme.MD": "other" });
    assert.equal(resolveRelative(fixture, "README.md"), "README.md");
  });

  test("resolves every segment of a nested path", () => {
    fixture = makeFixture({ "Docs/Contributing.md": "x" });
    assert.equal(resolveRelative(fixture, "docs/CONTRIBUTING.md"), "Docs/Contributing.md");
  });

  test("returns null when nothing matches", () => {
    fixture = makeFixture({ "README.md": "x" });
    assert.equal(resolveRelative(fixture, "LICENSE"), null);
    assert.equal(firstExisting(fixture, ["LICENSE", "COPYING"]), null);
  });

  test("returns null when an intermediate segment is a file", () => {
    fixture = makeFixture({ docs: "not a directory" });
    assert.equal(resolveRelative(fixture, "docs/CONTRIBUTING.md"), null);
  });

  test("resolveAllRelative collapses candidate spellings of one file", () => {
    fixture = makeFixture({ Makefile: "all:" });
    assert.deepEqual(resolveAllRelative(fixture, ["Makefile", "makefile"]), ["Makefile"]);
  });

  test("resolveAllRelative keeps genuinely distinct hits", () => {
    fixture = makeFixture({ Dockerfile: "FROM node:20", "compose.yaml": "services: {}" });
    assert.equal(resolveAllRelative(fixture, ["Dockerfile", "compose.yaml"]).length, 2);
  });

  // readdir never yields "." or "..", so resolution cannot climb out of the
  // repo — the scorer reads arbitrary cloned trees and must stay inside them.
  test("cannot escape the repo root", () => {
    fixture = makeFixture({ "sub/README.md": "x" });

    assert.equal(resolveRelative(fixture, "../README.md"), null);
    assert.equal(resolveRelative(fixture, "sub/../../README.md"), null);
    assert.equal(resolveRelative(fixture, "/etc/hosts"), null);
    assert.equal(firstExisting(fixture, ["../README.md", "./README.md"]), null);
  });
});
