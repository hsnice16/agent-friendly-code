import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { PassCounts } from "../lib/check-stats";
import {
  buildModelPanel,
  checksBySummedWeight,
  exclusiveSignal,
  MODEL_PANEL_CHECKS,
  sourceLabel,
  topWeightedChecks,
} from "../lib/leaderboard-model-panel";
import { SIGNALS } from "../lib/scoring/signals";
import { MODEL_BY_ID, MODELS } from "../lib/scoring/weights";

// One of the partials is an empty file, so it isn't present.
const counts: PassCounts = { total: 10, full: 4, partial: 2, none: 4, present: 5 };
const inputs = { countsOf: () => counts, claudeMd: 3 };

describe("topWeightedChecks", () => {
  it("returns each agent's heaviest checks, heaviest first, ties in SIGNALS order", () => {
    for (const m of MODELS) {
      const top = topWeightedChecks(m);
      assert.equal(top.length, MODEL_PANEL_CHECKS, m.id);
      for (let i = 1; i < top.length; i++) {
        const [a, b] = [top[i - 1], top[i]];
        assert.ok(
          a.weight > b.weight || SIGNALS.findIndex((s) => s.id === a.id) < SIGNALS.findIndex((s) => s.id === b.id),
        );
      }
      const floor = top[top.length - 1].weight;
      assert.ok(
        Object.entries(m.weights).every(([id, w]) => w <= floor || top.some((t) => t.id === id)),
        m.id,
      );
    }
  });
});

describe("exclusiveSignal", () => {
  it("finds the file that is mainly one agent's", () => {
    assert.equal(exclusiveSignal(MODEL_BY_ID.cursor), "cursor_rules");
    assert.equal(exclusiveSignal(MODEL_BY_ID["gemini-cli"]), "gemini_md");
    assert.equal(exclusiveSignal(MODEL_BY_ID.openhands), "openhands_setup");
    assert.equal(exclusiveSignal(MODEL_BY_ID.aider), "aider_conf");
    assert.equal(exclusiveSignal(MODEL_BY_ID["claude-code"]), null);
    assert.equal(exclusiveSignal(MODEL_BY_ID.devin), null);
    assert.equal(exclusiveSignal(MODEL_BY_ID.pi), null);
  });

  it("keeps a file the agent's own when another agent weights it lightly", () => {
    assert.ok(MODEL_BY_ID.devin.weights.cursor_rules > 0);
    assert.equal(exclusiveSignal(MODEL_BY_ID.cursor), "cursor_rules");
  });
});

describe("buildModelPanel", () => {
  it("counts a file with content whether or not it passes in full", () => {
    const p = buildModelPanel(MODEL_BY_ID.cursor, inputs);
    assert.deepEqual(p.file, { id: "cursor_rules", label: "Cursor rules (.cursor/rules)", present: 5, total: 10 });
    assert.deepEqual(p.sources, MODEL_BY_ID.cursor.sources);
    assert.equal(p.checks.length, MODEL_PANEL_CHECKS);
  });

  it("uses the CLAUDE.md count for Claude Code and nothing for agents without a file of their own", () => {
    assert.deepEqual(buildModelPanel(MODEL_BY_ID["claude-code"], inputs).file, {
      id: "claude_md",
      label: "CLAUDE.md",
      present: 3,
      total: 10,
    });
    assert.equal(buildModelPanel(MODEL_BY_ID["gpt-5-codex"], inputs).file, null);
  });
});

describe("checksBySummedWeight", () => {
  it("is sorted by the weight summed across every agent", () => {
    const all = checksBySummedWeight();
    assert.equal(all.length, SIGNALS.length);
    for (let i = 1; i < all.length; i++) assert.ok(all[i - 1].sum >= all[i].sum);
    const tests = MODELS.reduce((n, m) => n + (m.weights.tests ?? 0), 0);
    assert.equal(all.find((c) => c.id === "tests")?.sum, Math.round(tests * 100) / 100);
  });
});

describe("sourceLabel", () => {
  it("shortens a docs URL to host and last segment", () => {
    assert.equal(sourceLabel("https://www.example.com/docs/en/memory/"), "example.com/memory");
    assert.equal(sourceLabel("https://example.com"), "example.com");
  });
});
