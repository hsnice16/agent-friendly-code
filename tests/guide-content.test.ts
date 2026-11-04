import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { agentsReading } from "../lib/agent-reads";
import { VS_AGENTS_MD } from "../lib/check-content/vs-agents-md";
import { FILE_CHECKS, GUIDE_THEMES } from "../lib/guide-content";
import { SIGNAL_BY_ID, SIGNALS } from "../lib/scoring/signals";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

describe("guide themes", () => {
  it("place every check exactly once", () => {
    const ids = GUIDE_THEMES.flatMap((t) => t.checks.map((c) => c.id));
    assert.deepEqual([...ids].sort(), SIGNALS.map((s) => s.id).sort());
  });

  it("count file checks only for real checks", () => {
    for (const id of FILE_CHECKS) assert.ok(SIGNAL_BY_ID[id], id);
  });
});

describe("vs AGENTS.md pages", () => {
  it("exist only for checks, and fit a search result", () => {
    for (const [id, c] of Object.entries(VS_AGENTS_MD)) {
      assert.ok(SIGNAL_BY_ID[id], id);
      assert.ok(pageTitle(c.title).absolute.length <= MAX_TITLE_LENGTH, c.title);
      assert.ok(c.description.length <= MAX_DESCRIPTION_LENGTH, `${c.description.length}: ${c.description}`);
      assert.ok(c.sources.length > 0, id);
      assert.ok(agentsReading(c.file).length > 0, `no agent reads ${c.file}`);
    }
  });
});
