import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MODEL_LABEL } from "../lib/model-labels";
import { MODELS } from "../lib/scoring/weights";

describe("MODEL_LABEL", () => {
  it("matches every agent's label", () => {
    assert.deepEqual(MODEL_LABEL, Object.fromEntries(MODELS.map((m) => [m.id, m.label])));
  });
});
