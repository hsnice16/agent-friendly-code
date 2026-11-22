import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { suggestionSwitchProps } from "../lib/utils/suggestion-switch";

const fix = (signalId: string, scoreGain: number) => ({
  signalId,
  scoreGain,
  label: `${signalId} label`,
  suggestion: `Add ${signalId}`,
});

describe("suggestionSwitchProps", () => {
  it("keeps every agent's order and gains, and no fix text", () => {
    const { agents, ...rest } = suggestionSwitchProps([
      { id: "a", label: "A", suggestions: [fix("tests", 4.2), fix("ci", 1)] },
      { id: "b", label: "B", suggestions: [fix("ci", 3.5)] },
      { id: "c", label: "C", suggestions: [] },
    ]);
    assert.deepEqual(rest, {});
    assert.deepEqual(agents, [
      {
        id: "a",
        fixes: [
          ["tests", 4.2],
          ["ci", 1],
        ],
      },
      { id: "b", fixes: [["ci", 3.5]] },
      { id: "c", fixes: [] },
    ]);
  });
});
