import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { parseRepoUrl } from "../lib/clients/github";

describe("parseRepoUrl — GitHub", () => {
  test("parses canonical https url", () => {
    const p = parseRepoUrl("https://github.com/honojs/hono");

    assert.deepEqual(p, {
      host: "github",
      owner: "honojs",
      name: "hono",
      cloneUrl: "https://github.com/honojs/hono.git",
      canonicalUrl: "https://github.com/honojs/hono",
    });
  });

  test("strips trailing .git", () => {
    const p = parseRepoUrl("https://github.com/honojs/hono.git");

    assert.equal(p?.name, "hono");
    assert.equal(p?.cloneUrl, "https://github.com/honojs/hono.git");
  });

  test("tolerates www. and http://", () => {
    assert.equal(parseRepoUrl("http://www.github.com/honojs/hono")?.host, "github");
  });

  test("accepts schemeless input", () => {
    assert.equal(parseRepoUrl("github.com/honojs/hono")?.owner, "honojs");
  });

  test("ignores deep paths after owner/name", () => {
    const p = parseRepoUrl("https://github.com/honojs/hono/tree/main/src");
    assert.equal(p?.name, "hono");
  });

  test("trims surrounding whitespace", () => {
    assert.equal(parseRepoUrl("  https://github.com/honojs/hono  \n")?.name, "hono");
  });
});

describe("parseRepoUrl — GitLab", () => {
  test("parses canonical group/project url", () => {
    const p = parseRepoUrl("https://gitlab.com/gitlab-org/gitlab");

    assert.equal(p?.host, "gitlab");
    assert.equal(p?.name, "gitlab");
    assert.equal(p?.owner, "gitlab-org");
    assert.equal(p?.canonicalUrl, "https://gitlab.com/gitlab-org/gitlab");
  });

  test("parses nested subgroup paths", () => {
    const p = parseRepoUrl("https://gitlab.com/gitlab-org/quality/triage-ops");

    assert.equal(p?.host, "gitlab");
    assert.equal(p?.name, "triage-ops");
    assert.equal(p?.owner, "gitlab-org/quality");
  });

  test("strips /-/tree/... suffixes", () => {
    const p = parseRepoUrl("https://gitlab.com/gitlab-org/gitlab/-/tree/master/lib");

    assert.equal(p?.name, "gitlab");
    assert.equal(p?.owner, "gitlab-org");
  });

  test("strips trailing .git", () => {
    assert.equal(parseRepoUrl("https://gitlab.com/gitlab-org/gitlab.git")?.name, "gitlab");
  });
});

describe("parseRepoUrl — Bitbucket", () => {
  test("parses canonical workspace/repo url", () => {
    const p = parseRepoUrl("https://bitbucket.org/atlassian/python-bitbucket");

    assert.equal(p?.host, "bitbucket");
    assert.equal(p?.owner, "atlassian");
    assert.equal(p?.name, "python-bitbucket");
  });

  test("strips trailing .git and deep paths", () => {
    assert.equal(parseRepoUrl("https://bitbucket.org/atlassian/python-bitbucket.git")?.name, "python-bitbucket");

    assert.equal(parseRepoUrl("https://bitbucket.org/atlassian/python-bitbucket/src/main/")?.name, "python-bitbucket");
  });
});

describe("parseRepoUrl — rejects", () => {
  test("returns null for unsupported hosts", () => {
    assert.equal(parseRepoUrl("https://sourcehut.org/~foo/bar"), null);
  });

  test("returns null for empty or garbage input", () => {
    assert.equal(parseRepoUrl(""), null);
    assert.equal(parseRepoUrl("not a url"), null);
  });
});
