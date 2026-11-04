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
  it("sends each fix's text once and keeps every agent's order and gains", () => {
    const { agents, text } = suggestionSwitchProps([
      { id: "a", label: "A", suggestions: [fix("tests", 4.2), fix("ci", 1)] },
      { id: "b", label: "B", suggestions: [fix("ci", 3.5)] },
      { id: "c", label: "C", suggestions: [] },
    ]);
    assert.deepEqual(Object.keys(text).sort(), ["ci", "tests"]);
    assert.deepEqual(text.ci, { label: "ci label", suggestion: "Add ci" });
    assert.deepEqual(agents, [
      {
        id: "a",
        label: "A",
        fixes: [
          ["tests", 4.2],
          ["ci", 1],
        ],
      },
      { id: "b", label: "B", fixes: [["ci", 3.5]] },
      { id: "c", label: "C", fixes: [] },
    ]);
  });
});
