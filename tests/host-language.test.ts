import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { canonicalLanguage, primaryLanguage } from "../lib/clients/language";

describe("canonicalLanguage", () => {
  test("folds Bitbucket's lowercase names onto the Linguist spelling", () => {
    assert.equal(canonicalLanguage("c++"), "C++");
    assert.equal(canonicalLanguage("java"), "Java");
    assert.equal(canonicalLanguage("objective-c"), "Objective-C");
  });

  test("keeps an unknown name as given, and empty as null", () => {
    assert.equal(canonicalLanguage("Kaitai Struct"), "Kaitai Struct");
    assert.equal(canonicalLanguage(" "), null);
    assert.equal(canonicalLanguage(undefined), null);
  });
});

describe("primaryLanguage", () => {
  test("picks GitLab's largest share", () => {
    assert.equal(primaryLanguage({ "C++": 57.94, C: 22.56, ALGOL: 16.48 }), "C++");
  });

  test("breaks an even split by name, whatever the key order", () => {
    assert.equal(primaryLanguage({ Rust: 50, Go: 50 }), "Go");
    assert.equal(primaryLanguage({ Go: 50, Rust: 50 }), "Go");
  });

  test("null for an empty or unusable response", () => {
    assert.equal(primaryLanguage({}), null);
    assert.equal(primaryLanguage(null), null);
  });
});
