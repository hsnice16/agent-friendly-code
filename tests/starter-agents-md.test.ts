import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import type { SignalResult } from "../lib/scoring/signals";
import { tests } from "../lib/scoring/signals/tests";
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

  it("names one test file as an example, not a test location", () => {
    const md = starterAgentsMd(repo, [sig("tests", 0.7, "src/a.test.ts", "Test files detected (src/a.test.ts)")]) ?? "";
    assert.match(md, /- Test files are spread through the tree, e\.g\. `src\/a\.test\.ts`\./);
    assert.doesNotMatch(md, /Tests live in/);
  });

  it("tells a test directory from one test file, as the real tests check reports them", () => {
    const factFor = (files: string[]) => {
      const dir = mkdtempSync(join(tmpdir(), "afc-starter-"));
      try {
        for (const f of files) {
          mkdirSync(join(dir, f, ".."), { recursive: true });
          writeFileSync(join(dir, f), "");
        }
        return (starterAgentsMd(repo, [tests.check(dir)]) ?? "")
          .split("\n")
          .find((l) => l.startsWith("- Test") && !l.includes("TODO"));
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    };
    assert.equal(factFor(["src/a.test.ts"]), "- Test files are spread through the tree, e.g. `src/a.test.ts`.");
    assert.equal(factFor(["tests/a.py"]), "- Tests live in `tests`.");
  });

  it("keeps only the description's first sentence", () => {
    const md = starterAgentsMd({ ...repo, description: "A tool. Fast, small and typed! Works on node.js." }, [
      sig("tests", 1, "tests"),
    ]);
    assert.match(md ?? "", /o\/r\. A tool\. Written mainly in Python\./);
  });

  it("says what kind of dev env artifact was found", () => {
    const line = (path: string) =>
      (starterAgentsMd(repo, [sig("dev_env", 1, path)]) ?? "")
        .split("\n")
        .find((l) => l.startsWith("- ") && !l.includes("TODO"));
    assert.equal(line("package.json"), "- Project tasks are the `scripts` in `package.json`.");
    assert.equal(line("Makefile"), "- Common tasks are targets in `Makefile`.");
    assert.equal(line("justfile"), "- Common tasks are targets in `justfile`.");
    assert.equal(line("Taskfile.yml"), "- Common tasks are targets in `Taskfile.yml`.");
    assert.equal(line("gradlew"), "- Use the `./gradlew` wrapper, not a system install.");
    assert.equal(line("mvnw"), "- Use the `./mvnw` wrapper, not a system install.");
    assert.equal(line("tox.ini"), "- Test environments are defined in `tox.ini`.");
    assert.equal(line("bin/setup"), "- Setup is scripted in `bin/setup`.");
    assert.equal(
      line(".devcontainer/devcontainer.json"),
      "- A reproducible environment is defined in `.devcontainer/devcontainer.json`.",
    );
    assert.equal(line("flake.nix"), "- A reproducible environment is defined in `flake.nix`.");
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
