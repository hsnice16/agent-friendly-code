import assert from "node:assert/strict";
import { describe, it } from "node:test";

import robots from "../app/robots";

const rules = [robots().rules].flat();
const ruleFor = (agent: string) => rules.find((r) => [r.userAgent].flat().includes(agent));

describe("robots", () => {
  it("shuts PetalBot and SemrushBot out of the whole site", () => {
    for (const agent of ["PetalBot", "SemrushBot"]) assert.equal(ruleFor(agent)?.disallow, "/", agent);
  });

  it("still lets every other crawler in", () => {
    for (const agent of ["*", "GPTBot", "PerplexityBot"]) {
      const rule = ruleFor(agent);
      assert.ok(rule, agent);
      assert.ok(![rule.disallow].flat().includes("/"), agent);
    }
  });

  it("keeps training crawlers and AI indexes off repo and topic pages but not the guides", () => {
    for (const agent of ["ShapBot", "GPTBot", "ClaudeBot", "ExaSearchBot"]) {
      const disallow = [ruleFor(agent)?.disallow].flat();
      for (const path of ["/repo/", "/topic/", "/api/", "/score/"])
        assert.ok(disallow.includes(path), `${agent} ${path}`);
      assert.ok(!disallow.includes("/"), agent);
    }
  });

  it("lets answer engines read repo pages", () => {
    for (const agent of ["PerplexityBot", "OAI-SearchBot", "Claude-SearchBot", "ChatGPT-User"]) {
      assert.ok(![ruleFor(agent)?.disallow].flat().includes("/repo/"), agent);
    }
  });

  it("lists each crawler in one group only", () => {
    const agents = rules.flatMap((r) => [r.userAgent].flat());
    assert.equal(new Set(agents).size, agents.length);
  });

  it("lets link unfurlers read Live Score pages that search crawlers can't", () => {
    assert.ok([ruleFor("*")?.disallow].flat().includes("/score/"));
    const preview = [ruleFor("Twitterbot")?.disallow].flat();
    assert.ok(!preview.includes("/score/"));
    assert.ok(preview.includes("/api/"));
  });
});
