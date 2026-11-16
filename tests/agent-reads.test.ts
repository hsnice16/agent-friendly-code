import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AGENT_READS, agentsReading, agentsUsingAgentsMd, OTHER_TOOLS } from "../lib/agent-reads";
import { agentsMdFaq, plainText } from "../lib/agents-faq";
import { AGENT_FILE_CHECKS } from "../lib/check-content/agent-files";
import { AGENTS_MD_PRACTICES } from "../lib/check-content/agents-md-guide";
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

  // The /check prose names these agents by hand.
  it("agrees with the agents the check pages name", () => {
    const named = (text: string) => MODELS.filter((m) => text.includes(m.label)).map((m) => m.label);
    for (const label of agentsUsingAgentsMd("always"))
      assert.ok(AGENT_FILE_CHECKS.agents_md.why.includes(label), label);
    const skills = AGENT_FILE_CHECKS.agent_skills.why.split(" all load ")[0];
    assert.deepEqual(named(skills), agentsReading(".agents/skills/"));
  });
});

describe("OTHER_TOOLS", () => {
  it("cites an https doc for every tool and lists its files", () => {
    for (const t of OTHER_TOOLS) {
      assert.ok(t.sources.length > 0, t.name);
      for (const url of t.sources) assert.equal(new URL(url).protocol, "https:", `${t.name}: ${url}`);
      assert.ok(t.files.length > 0, t.name);
    }
  });

  it("holds only tools that are not on the board", () => {
    const labels = new Set(MODELS.map((m) => m.label));
    for (const t of OTHER_TOOLS) assert.ok(!labels.has(t.name), t.name);
    assert.equal(new Set(OTHER_TOOLS.map((t) => t.name)).size, OTHER_TOOLS.length);
  });
});

describe("agentsMdFaq", () => {
  it("asks once per board agent and per other tool", () => {
    const faqs = agentsMdFaq();
    assert.equal(faqs.length, MODELS.length + OTHER_TOOLS.length);
    assert.equal(new Set(faqs.map((f) => f.question)).size, faqs.length);
  });

  it("opens with the answer the table gives", () => {
    const claude = agentsMdFaq().find((f) => f.question.startsWith("Does Claude Code"));
    assert.match(claude?.answer ?? "", /^Yes, when there is no CLAUDE\.md\./);
  });

  it("strips CodeText backticks for JSON-LD", () => {
    assert.equal(plainText("run `/memory`"), "run /memory");
  });
});

describe("AGENTS_MD_PRACTICES", () => {
  it("cites an https doc for every practice", () => {
    for (const p of AGENTS_MD_PRACTICES) {
      assert.ok(p.sources.length > 0, p.label);
      for (const url of p.sources) assert.equal(new URL(url).protocol, "https:", url);
    }
  });
});
