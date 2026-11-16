import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CHECK_PRACTICE } from "../lib/check-content/practice";
import { SIGNAL_BY_ID } from "../lib/scoring/signals";

describe("check practice panels", () => {
  it("belong to real checks and cite official docs", () => {
    for (const [id, p] of Object.entries(CHECK_PRACTICE)) {
      assert.ok(SIGNAL_BY_ID[id], id);
      assert.ok(p.items.length >= 3 && p.items.length <= 5, id);
      assert.ok(p.sources.length > 0, id);
      for (const url of p.sources) assert.match(url, /^https:\/\//, id);
    }
  });

  it("ship snippets that parse", () => {
    for (const [id, p] of Object.entries(CHECK_PRACTICE)) {
      if (p.snippet?.caption.endsWith(".json")) assert.doesNotThrow(() => JSON.parse(p.snippet?.text ?? ""), id);
    }
  });
});
