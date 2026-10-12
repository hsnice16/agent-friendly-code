import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CHECK_CONTENT } from "../lib/check-content";
import { SIGNALS } from "../lib/scoring/signals";
import { checkSlug, signalIdFromSlug } from "../lib/utils/check-path";
import { percent } from "../lib/utils/format";

describe("check pages", () => {
  it("has content for every signal and for nothing else", () => {
    assert.deepEqual(Object.keys(CHECK_CONTENT).sort(), SIGNALS.map((s) => s.id).sort());
  });

  it("round-trips every signal id through its slug", () => {
    for (const s of SIGNALS) {
      assert.equal(signalIdFromSlug(checkSlug(s.id)), s.id);
    }
  });

  it("gives each signal one address", () => {
    assert.equal(signalIdFromSlug("agents_md"), null);
    assert.equal(signalIdFromSlug("constructor"), null);
  });
});

describe("percent", () => {
  it("keeps a decimal for a share that would round to zero", () => {
    assert.equal(percent(1, 371), "0.3%");
    assert.equal(percent(0, 371), "0%");
    assert.equal(percent(183, 371), "49%");
    assert.equal(percent(0, 0), "0%");
  });
});
