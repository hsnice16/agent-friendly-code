import assert from "node:assert/strict";
import { describe, it } from "node:test";

import robots from "../app/robots";

const rules = [robots().rules].flat();
const ruleFor = (agent: string) => rules.find((r) => [r.userAgent].flat().includes(agent));

describe("robots", () => {
  it("shuts PetalBot out of the whole site", () => {
    assert.equal(ruleFor("PetalBot")?.disallow, "/");
  });

  it("still lets every other crawler in", () => {
    for (const agent of ["*", "GPTBot"]) {
      const rule = ruleFor(agent);
      assert.ok(rule, agent);
      assert.ok(![rule.disallow].flat().includes("/"), agent);
    }
  });
});
