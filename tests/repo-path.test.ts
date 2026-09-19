import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { repoIdentity, repoPath } from "../lib/utils/repo-path";

describe("repoPath", () => {
  it("puts the host first and the repo name last", () => {
    assert.equal(
      repoPath({ host: "github", owner: "microsoft", name: "playwright" }),
      "/repo/github/microsoft/playwright",
    );
  });

  it("keeps a nested GitLab group as real path segments, not %2F", () => {
    assert.equal(repoPath({ host: "gitlab", owner: "kicad/code", name: "kicad" }), "/repo/gitlab/kicad/code/kicad");
  });

  it("percent-encodes characters that would otherwise change the path", () => {
    assert.equal(repoPath({ host: "github", owner: "a b", name: "c#d" }), "/repo/github/a%20b/c%23d");
  });

  it("leaves a dotted repo name alone", () => {
    assert.equal(repoPath({ host: "github", owner: "vercel", name: "next.js" }), "/repo/github/vercel/next.js");
  });
});

describe("repoIdentity", () => {
  it("reads back what repoPath wrote, including a nested owner", () => {
    for (const repo of [
      { host: "github", owner: "microsoft", name: "playwright" },
      { host: "gitlab", owner: "kicad/code", name: "kicad" },
      { host: "bitbucket", owner: "a/b/c", name: "deep" },
    ]) {
      const segments = repoPath(repo).replace("/repo/", "").split("/").map(decodeURIComponent);
      assert.deepEqual(repoIdentity(segments), repo);
    }
  });

  it("rejects anything shorter than host + owner + name", () => {
    assert.equal(repoIdentity(["github", "only-one"]), null);
    assert.equal(repoIdentity(["github"]), null);
    assert.equal(repoIdentity([]), null);
    assert.equal(repoIdentity(undefined), null);
  });

  it("rejects an unknown host", () => {
    assert.equal(repoIdentity(["sourcehut", "owner", "name"]), null);
  });

  it("rejects empty segments", () => {
    assert.equal(repoIdentity(["github", "", "name"]), null);
    assert.equal(repoIdentity(["github", "owner", ""]), null);
  });
});
