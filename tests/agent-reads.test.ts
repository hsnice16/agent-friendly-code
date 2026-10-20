import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AGENT_READS } from "../lib/agent-reads";
import { MODELS } from "../lib/scoring/weights";

describe("AGENT_READS", () => {
  it("lists AGENTS.md exactly for the agents that read it without a setting", () => {
    for (const m of MODELS) {
      const r = AGENT_READS[m.id];
      const listed = r.files.includes("AGENTS.md");
      assert.equal(listed, r.agentsMd === "always" || r.agentsMd === "fallback", m.id);
    }
  });

  it("lists CLAUDE.md exactly for the agents that read it", () => {
    for (const m of MODELS) {
      assert.equal(AGENT_READS[m.id].files.includes("CLAUDE.md"), AGENT_READS[m.id].claudeMd, m.id);
    }
  });
});
