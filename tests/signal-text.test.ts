import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SIGNALS } from "../lib/scoring/signals";
import { SIGNAL_TEXT } from "../lib/signal-text";

describe("SIGNAL_TEXT", () => {
  it("matches every signal's label and fix text", () => {
    const fromRegistry = Object.fromEntries(
      SIGNALS.map((s) => [s.id, { label: s.label, suggestion: s.improveSuggestion }]),
    );
    assert.deepEqual(SIGNAL_TEXT, fromRegistry);
  });
});
