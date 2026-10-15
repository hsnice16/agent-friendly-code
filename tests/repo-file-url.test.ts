import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { matchesDirectory, repoFileUrl } from "../lib/utils/repo-file-url";

const gh = { host: "github", url: "https://github.com/axios/axios", default_branch: "v1.x" };
const gl = { host: "gitlab", url: "https://gitlab.com/kicad/code/kicad", default_branch: "master" };
const bb = { host: "bitbucket", url: "https://bitbucket.org/snakeyaml/snakeyaml", default_branch: "master" };

describe("repoFileUrl", () => {
  it("builds each host's file URL on the default branch", () => {
    assert.equal(repoFileUrl(gh, "AGENTS.md"), "https://github.com/axios/axios/blob/v1.x/AGENTS.md");
    assert.equal(repoFileUrl(gl, "AGENTS.md"), "https://gitlab.com/kicad/code/kicad/-/blob/master/AGENTS.md");
    assert.equal(repoFileUrl(bb, "LICENSE"), "https://bitbucket.org/snakeyaml/snakeyaml/src/master/LICENSE");
  });

  it("uses the tree route for a directory", () => {
    assert.equal(
      repoFileUrl(gh, ".github/workflows", true),
      "https://github.com/axios/axios/tree/v1.x/.github/workflows",
    );
    assert.equal(repoFileUrl(gl, "tests", true), "https://gitlab.com/kicad/code/kicad/-/tree/master/tests");
    assert.equal(repoFileUrl(bb, "tests", true), "https://bitbucket.org/snakeyaml/snakeyaml/src/master/tests");
  });

  it("encodes each segment but keeps the slashes", () => {
    assert.equal(
      repoFileUrl({ ...gh, default_branch: "release/1 x" }, "docs/a b#c.md"),
      "https://github.com/axios/axios/blob/release/1%20x/docs/a%20b%23c.md",
    );
  });

  it("is null without a default branch", () => {
    assert.equal(repoFileUrl({ ...gh, default_branch: null }, "AGENTS.md"), null);
  });
});

describe("matchesDirectory", () => {
  it("knows which matches are directories", () => {
    assert.equal(matchesDirectory({ id: "tests", pass: 1, matchedPath: "tests" }), true);
    assert.equal(matchesDirectory({ id: "tests", pass: 0.7, matchedPath: "src/a.test.ts" }), false);
    assert.equal(matchesDirectory({ id: "ci", pass: 1, matchedPath: ".github/workflows" }), true);
    assert.equal(matchesDirectory({ id: "ci", pass: 1, matchedPath: ".gitlab-ci.yml" }), false);
    assert.equal(matchesDirectory({ id: "pre_commit", pass: 1, matchedPath: ".husky" }), true);
    assert.equal(matchesDirectory({ id: "readme", pass: 1, matchedPath: "README.md" }), false);
  });
});
