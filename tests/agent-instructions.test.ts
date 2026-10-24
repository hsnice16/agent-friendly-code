import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SignalResult } from "../lib/scoring/signals";
import { agentInstructions } from "../lib/utils/agent-instructions";

const s = (id: string, pass: number, detail: string, matchedPath?: string) =>
  ({ id, label: id, pass, detail, matchedPath }) as SignalResult;

const share = { has: 185, total: 371, language: { label: "Go", has: 12, total: 37 } };
const none = [
  s("cursor_rules", 0, "No .cursor/rules/*.mdc or .cursorrules"),
  s("gemini_md", 0, "No GEMINI.md at repo root"),
  s("openhands_setup", 0, "No .openhands/setup.sh"),
  s("aider_conf", 0, "No .aider.conf.yml at repo root"),
  s("agent_skills", 0, "No .agents/skills/<name>/SKILL.md"),
];

describe("agentInstructions", () => {
  it("reads the file and its length from the check's detail", () => {
    const d = agentInstructions([s("agents_md", 1, "Substantive (14,688 characters)", "AGENTS.md"), ...none], share);
    assert.ok(d?.main);
    assert.deepEqual(
      { name: d.main.name, note: d.main.note, state: d.main.state },
      { name: "AGENTS.md", note: "14,688 characters", state: "ok" },
    );
    // The check stops at AGENTS.md, so whether CLAUDE.md exists is unknown.
    assert.deepEqual(d.absentMain, []);
    assert.deepEqual(d.absentOthers, [
      "GEMINI.md",
      ".cursor/rules",
      ".openhands/setup.sh",
      ".aider.conf.yml",
      ".agents/skills",
    ]);
  });

  it("knows AGENTS.md is absent when an empty CLAUDE.md is what matched", () => {
    const d = agentInstructions([s("agents_md", 0.2, "File exists but empty", "CLAUDE.md")], share);
    assert.equal(d?.main?.state, "empty");
    assert.deepEqual(d?.absentMain, ["AGENTS.md"]);
  });

  it("does not call AGENTS.md absent when CLAUDE.md with content matched, as it may be empty", () => {
    const d = agentInstructions([s("agents_md", 0.5, "File exists (45 chars) — thin", "CLAUDE.md")], share);
    assert.equal(d?.main?.state, "thin");
    assert.deepEqual(d?.absentMain, []);
  });

  it("lists every main-file name when none matched", () => {
    const d = agentInstructions([s("agents_md", 0, "No agent instructions file found"), ...none], share);
    assert.equal(d?.main, null);
    assert.deepEqual(d?.absentMain, ["AGENTS.md", "CLAUDE.md", "AGENT.md", ".claude/CLAUDE.md", ".claude/AGENTS.md"]);
  });

  it("links Cursor rules as a directory and notes the older file", () => {
    const rules = agentInstructions(
      [s("agents_md", 0, ""), s("cursor_rules", 1, "13 .mdc files in .cursor/rules/", ".cursor/rules/a.mdc")],
      share,
    );
    assert.deepEqual(rules?.others, [
      { name: ".cursor/rules", path: ".cursor/rules", directory: true, note: "13 .mdc files" },
    ]);
    const legacy = agentInstructions(
      [s("agents_md", 0, ""), s("cursor_rules", 0.5, "Legacy .cursorrules — …", ".cursorrules")],
      share,
    );
    assert.equal(legacy?.others[0].note, "the older form");
    const nested = agentInstructions(
      [s("agents_md", 0, ""), s("cursor_rules", 1, "1 .mdc file in .cursor/rules/ folders", "web/.cursor/rules/a.mdc")],
      share,
    );
    assert.equal(nested?.others[0].path, "web/.cursor/rules");
  });

  it("links agent skills as a directory with their count", () => {
    const d = agentInstructions(
      [s("agents_md", 0, ""), s("agent_skills", 1, "3 skills in .agents/skills/", ".agents/skills/a/SKILL.md")],
      share,
    );
    assert.deepEqual(d?.others, [
      { name: ".agents/skills", path: ".agents/skills", directory: true, note: "3 skills" },
    ]);
  });

  it("notes an empty agent file instead of crediting it", () => {
    const d = agentInstructions(
      [
        s("agents_md", 0.2, "File exists but empty", "AGENTS.md"),
        s("gemini_md", 0.2, "GEMINI.md exists but empty", "GEMINI.md"),
      ],
      share,
    );
    assert.equal(d?.main?.state, "empty");
    assert.equal(d?.others[0].note, "empty");
  });

  it("is null without an agents_md result", () => {
    assert.equal(agentInstructions(none, share), null);
  });
});
