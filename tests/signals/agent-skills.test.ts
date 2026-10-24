import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { agentSkills } from "../../lib/scoring/signals/agent-skills";
import { makeFixture, removeFixture } from "../_helpers";

describe("agentSkills signal", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("pass=0 without .agents/skills", () => {
    fixture = makeFixture({ "README.md": "irrelevant" });
    const r = agentSkills.check(fixture);

    assert.equal(r.pass, 0);
    assert.equal(r.matchedPath, undefined);
  });

  test("pass=1 and a count for each folder with a SKILL.md", () => {
    fixture = makeFixture({
      ".agents/skills/release/SKILL.md": "---\nname: release\n---\n",
      ".agents/skills/test/SKILL.md": "---\nname: test\n---\n",
      ".agents/skills/draft/notes.md": "no SKILL.md here",
    });
    const r = agentSkills.check(fixture);

    assert.equal(r.pass, 1);
    assert.equal(r.matchedPath, ".agents/skills/release/SKILL.md");
    assert.equal(r.detail, "2 skills in .agents/skills/");
  });

  test("a SKILL.md directly in .agents/skills/ or a folder named SKILL.md is not a skill", () => {
    fixture = makeFixture({ ".agents/skills/SKILL.md": "x", ".agents/skills/a/SKILL.md/x": "" });
    assert.equal(agentSkills.check(fixture).pass, 0);
  });

  test("Claude Code's .claude/skills is not .agents/skills", () => {
    fixture = makeFixture({ ".claude/skills/release/SKILL.md": "x" });
    assert.equal(agentSkills.check(fixture).pass, 0);
  });
});
