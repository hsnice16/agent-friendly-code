import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ownerAndName, redirectTarget, repoIdentity, repoPath, withQuery } from "../lib/utils/repo-path";

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

describe("ownerAndName", () => {
  it("splits a plain owner/name", () => {
    assert.deepEqual(ownerAndName("vercel/next.js"), { owner: "vercel", name: "next.js" });
  });

  it("keeps a nested GitLab group in the owner", () => {
    assert.deepEqual(ownerAndName("kicad/code/kicad"), { owner: "kicad/code", name: "kicad" });
  });

  it("rejects a missing or empty part", () => {
    for (const bad of ["", "name", "/name", "owner/", "a//b"]) {
      assert.equal(ownerAndName(bad), null, bad);
    }
  });
});

describe("redirectTarget", () => {
  const stored = { host: "github", owner: "honojs", name: "hono" };

  it("is null for the stored path itself, so it never redirects to itself", () => {
    assert.equal(redirectTarget({ ...stored }, stored), null);
  });

  it("sends another casing to the stored path", () => {
    assert.equal(redirectTarget({ host: "GitHub", owner: "HonoJS", name: "Hono" }, stored), "/repo/github/honojs/hono");
  });

  it("sends a former name to the new one", () => {
    assert.equal(
      redirectTarget({ host: "github", owner: "yusukebe", name: "hono" }, stored),
      "/repo/github/honojs/hono",
    );
  });
});

describe("withQuery", () => {
  it("gives the bare path for an empty query", () => {
    assert.equal(withQuery("/repo/github/o/r", {}), "/repo/github/o/r");
    assert.equal(withQuery("/repo/github/o/r", { model: undefined }), "/repo/github/o/r");
  });

  it("repeats a key for an array value and drops undefined", () => {
    assert.equal(withQuery("/p", { a: ["1", "2"], b: undefined, c: "3" }), "/p?a=1&a=2&c=3");
  });

  it("encodes keys and values", () => {
    assert.equal(withQuery("/p", { "a b": "c&d=e" }), "/p?a+b=c%26d%3De");
  });
});
