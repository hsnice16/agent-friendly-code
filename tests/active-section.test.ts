import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { activeSectionId } from "../lib/utils/active-section";

const LINE = 128;
const at = (...tops: (number | null)[]) => tops.map((top, i) => ({ id: `s${i}`, top }));

describe("activeSectionId", () => {
  it("is the last section whose top has passed the line", () => {
    assert.equal(activeSectionId(at(-900, -200, 100, 600), LINE, false), "s2");
    assert.equal(activeSectionId(at(-900, -200, LINE + 1, 600), LINE, false), "s1");
  });

  it("is the first section before any has reached the line", () => {
    assert.equal(activeSectionId(at(300, 900), LINE, false), "s0");
  });

  it("is the last section at the bottom of the page, though its top never reaches the line", () => {
    assert.equal(activeSectionId(at(-900, -200, 100, 600), LINE, true), "s3");
  });

  it("skips sections missing from the page", () => {
    assert.equal(activeSectionId(at(-900, 100, null), LINE, true), "s1");
    assert.equal(activeSectionId(at(-900, null, null), LINE, false), "s0");
  });
});
