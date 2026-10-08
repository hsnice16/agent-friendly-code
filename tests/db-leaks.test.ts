import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { findLeaks } from "../lib/db-leaks";

const bytes = (s: string) => Buffer.from(s, "latin1");

describe("findLeaks", () => {
  test("passes repo-relative paths and URLs", () => {
    assert.deepEqual(findLeaks(bytes("AGENTS.md\x00.cursor/rules\x00https://github.com/task-runner/task-runner")), []);
  });

  // The shape of the 2026-04 leak: a record-header letter right before the path.
  test("flags an absolute path glued to a header byte", () => {
    const leaks = findLeaks(bytes("\x01t/Users/someone/project/tmp-clones/x/README.md"));
    assert.equal(leaks.length, 1);
    assert.equal(leaks[0].label, "local path");
    assert.equal(leaks[0].offset, 2);
  });

  test("flags Linux, macOS temp and Windows paths", () => {
    const labels = findLeaks(bytes("/home/runner/x /var/folders/ab/T/x C:\\Users\\x")).map((l) => l.label);
    assert.deepEqual(labels, ["local path", "local path", "local path"]);
  });

  test("flags tokens and private keys", () => {
    const labels = findLeaks(
      bytes(`ghp_${"a".repeat(36)} glpat-${"b".repeat(20)} AKIA${"C".repeat(16)} -----BEGIN RSA PRIVATE ${"KEY"}-----`),
    ).map((l) => l.label);
    assert.deepEqual(labels, ["GitHub token", "GitLab token", "AWS key", "private key"]);
  });

  test("reports a token by its prefix only", () => {
    assert.equal(findLeaks(bytes(`ghp_${"a".repeat(36)}`))[0].match, "ghp_aaaa…");
  });

  test("replaces unprintable bytes in the reported match", () => {
    assert.match(findLeaks(bytes("/Users/x\x00\x01y"))[0].match, /^\/Users\/x\?\?y$/);
  });
});
