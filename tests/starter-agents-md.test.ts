import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SignalResult } from "../lib/scoring/signals";
import { starterAgentsMd } from "../lib/starter-agents-md";

const sig = (id: string, pass: number, matchedPath?: string, detail = ""): SignalResult => ({
  id,
  label: id,
  detail,
  pass,
  matchedPath,
});

const repo = { owner: "o", name: "r", language: "Python", description: "A tool." };

describe("starterAgentsMd", () => {
  it("lists only what the checks found, in a fixed order", () => {
    const md = starterAgentsMd(repo, [
      sig("tests", 1, "tests"),
      sig("deps_manifest", 1, "pyproject.toml"),
      sig("ci", 1, ".github/workflows", "5 GitHub Actions workflows"),
      sig("linter", 0),
    ]);
    assert.ok(md);
    assert.match(md, /o\/r\. A tool\. Written mainly in Python\./);
    const facts = md.split("\n").filter((l) => l.startsWith("- ") && !l.includes("TODO"));
    assert.deepEqual(facts, [
      "- Dependencies are declared in `pyproject.toml`.",
      "- Tests live in `tests`.",
      "- CI is defined in `.github/workflows`; read it for the exact install, lint and test steps.",
    ]);
  });

  it("never states a command", () => {
    const md = starterAgentsMd(repo, [sig("tests", 1, "tests"), sig("pre_commit", 1, ".husky")]) ?? "";
    assert.match(md, /- Test: TODO/);
    assert.doesNotMatch(md, /npm |pytest|make /);
  });

  it("ends a description without punctuation before the next sentence", () => {
    const md = starterAgentsMd({ ...repo, description: "HTTP client for node.js" }, [sig("tests", 1, "tests")]) ?? "";
    assert.match(md, /HTTP client for node\.js\. Written mainly in Python\./);
  });

  it("skips partial passes and returns null when nothing is known", () => {
    assert.equal(starterAgentsMd(repo, [sig("tests", 0.2, "tests"), sig("ci", 0)]), null);
  });
});
