import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fitSentences } from "../lib/utils/page-title";

describe("fitSentences", () => {
  it("stops at the first sentence that overflows by default", () => {
    assert.equal(fitSentences(["One.", "x".repeat(20), "Two."], { max: 15 }), "One.");
  });

  it("passes over it with skip", () => {
    assert.equal(fitSentences(["One.", "x".repeat(20), "Two."], { max: 15, skip: true }), "One. Two.");
  });

  it("keeps the first even when it alone is too long", () => {
    assert.equal(fitSentences(["x".repeat(20), "Two."], { max: 10, skip: true }), "x".repeat(20));
  });
});
