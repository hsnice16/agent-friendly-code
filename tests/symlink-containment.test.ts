import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import { scoreRepo } from "../lib/scoring/scorer";
import { entryKind, MAX_READ_BYTES, readSafe, walkFind } from "../lib/scoring/signals/helpers";

const base = mkdtempSync(join(tmpdir(), "afc-links-"));
after(() => rmSync(base, { recursive: true, force: true }));

let n = 0;
function repo(files: Record<string, string> = {}): string {
  const dir = join(base, `r${n++}`);
  mkdirSync(dir);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), body);
  }
  return dir;
}

const signal = (dir: string, id: string) => scoreRepo(dir).signals.find((s) => s.id === id);

describe("scorer never follows a link out of the repo", () => {
  const outside = repo({ "secret.txt": "x".repeat(5000), "tests/a.test.ts": "", "w/ci.yml": "" });

  it("reads nothing through a README linked to /dev/zero", () => {
    const dir = repo();
    symlinkSync("/dev/zero", join(dir, "README.md"));
    assert.equal(readSafe(join(dir, "README.md"), dir), "");
    assert.equal(signal(dir, "readme")?.detail, "README thin (0 characters)");
  });

  it("refuses absolute and ../ targets, which would be a length oracle", () => {
    const dir = repo();
    symlinkSync(join(outside, "secret.txt"), join(dir, "README.md"));
    symlinkSync("../r0/secret.txt", join(dir, "AGENTS.md"));
    assert.equal(entryKind(dir, join(dir, "README.md")), "escaped");
    assert.equal(entryKind(dir, join(dir, "AGENTS.md")), "escaped");
    assert.equal(signal(dir, "readme")?.detail, "README thin (0 characters)");
    assert.equal(readSafe(join(dir, "AGENTS.md"), dir), "");
  });

  // JS realpathSync resolves `..` after a link textually; the OS doesn't. This
  // chain looks like a/x to the former and reaches the repo's parent for real.
  it("refuses a link chain whose `..` climbs out through another link", () => {
    const dir = repo({ "a/x": "inside" });
    writeFileSync(join(dir, "..", "x"), "outside");
    mkdirSync(join(dir, "a", "b"));
    symlinkSync("..", join(dir, "a", "b", "t"));
    symlinkSync("t/../../x", join(dir, "a", "b", "s"));
    symlinkSync("a/b/s", join(dir, "README.md"));
    assert.equal(entryKind(dir, join(dir, "README.md")), "escaped");
    assert.equal(readSafe(join(dir, "README.md"), dir), "");
  });

  it("does not descend into a directory link that leaves the repo", () => {
    const dir = repo();
    symlinkSync(join(outside, "tests"), join(dir, "tests"));
    symlinkSync(outside, join(dir, "zz"));
    mkdirSync(join(dir, ".github"));
    symlinkSync(join(outside, "w"), join(dir, ".github", "workflows"));

    assert.equal(signal(dir, "tests")?.pass, 0);
    assert.equal(signal(dir, "ci")?.pass, 0);
    // Each escaping link still counts as the one file git stores.
    assert.equal(signal(dir, "size")?.detail, "2 files — very small");
    assert.deepEqual(
      walkFind(dir, () => true, 3, 10),
      [".github/workflows", "tests", "zz"],
    );
  });

  // The live path stands a placeholder file in for each of these, so a clone
  // must count them as the files they are named for.
  it("counts an escaping link as a file where only its name is checked", () => {
    const dir = repo();
    mkdirSync(join(dir, ".github", "workflows"), { recursive: true });
    mkdirSync(join(dir, ".cursor", "rules"), { recursive: true });
    symlinkSync(join(outside, "w"), join(dir, ".github", "workflows", "ci.yml"));
    symlinkSync(join(outside, "w"), join(dir, ".cursor", "rules", "a.mdc"));
    symlinkSync(join(outside, "w"), join(dir, "Cargo.toml"));

    assert.equal(signal(dir, "ci")?.pass, 1);
    assert.equal(signal(dir, "cursor_rules")?.pass, 1);
    assert.equal(signal(dir, "deps_manifest")?.pass, 1);
    assert.equal(signal(dir, "type_config")?.detail, "Typed language (Rust)");
  });

  it("refuses an intermediate directory that leaves the repo", () => {
    const dir = repo();
    symlinkSync(outside, join(dir, ".openhands"));
    writeFileSync(join(outside, "setup.sh"), "echo hi".repeat(50));
    assert.equal(signal(dir, "openhands_setup")?.pass, 0);
  });

  it("still follows links that stay inside", () => {
    const dir = repo({ "docs/README.md": "y".repeat(1500), "spec/a.ts": "" });
    symlinkSync("docs/README.md", join(dir, "README.md"));
    symlinkSync("spec", join(dir, "tests"));
    assert.equal(signal(dir, "readme")?.pass, 1);
    assert.equal(signal(dir, "tests")?.pass, 1);
  });

  it("skips special files and caps reads", () => {
    const dir = repo({ "README.md": "z".repeat(MAX_READ_BYTES + 10) });
    assert.equal(readSafe(join(dir, "README.md"), dir).length, MAX_READ_BYTES);

    const fifo = join(dir, "AGENTS.md");
    execFileSync("mkfifo", [fifo]);
    assert.equal(entryKind(dir, fifo), null);
    assert.equal(readSafe(fifo, dir), "");
    assert.equal(readSafe(fifo), "");
  });
});
