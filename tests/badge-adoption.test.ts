import { strict as assert } from "node:assert";
import { symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, test } from "node:test";

import { detectBadgeEmbed, selfBadgeRepos } from "../lib/badge-adoption";
import { makeFixture, removeFixture } from "./_helpers";

const SLUG = "github/honojs/hono";

describe("detectBadgeEmbed", () => {
  let fixture = "";

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = "";
    }
  });

  test("false when no README exists", () => {
    fixture = makeFixture({ "AGENTS.md": "unrelated" });
    assert.equal(detectBadgeEmbed(fixture, SLUG), false);
  });

  test("false when the README has no AFC badge", () => {
    fixture = makeFixture({
      "README.md": "[![CI](https://example.com/ci.svg)](https://example.com)",
    });

    assert.equal(detectBadgeEmbed(fixture, SLUG), false);
  });

  test("true when the README embeds this repo's badge endpoint", () => {
    fixture = makeFixture({
      "README.md": `# hono\n![Agent Friendly](https://agent-friendly-code.vercel.app/api/badge/${SLUG}.svg)`,
    });

    assert.equal(detectBadgeEmbed(fixture, SLUG), true);
  });

  test("host-agnostic — matches the endpoint path regardless of domain", () => {
    fixture = makeFixture({
      "README.md": `![badge](https://afc.example.dev/api/badge/${SLUG}.svg?model=claude-code)`,
    });

    assert.equal(detectBadgeEmbed(fixture, SLUG), true);
  });

  test("false when the badge belongs to a different repo slug", () => {
    fixture = makeFixture({
      "README.md": "![badge](https://agent-friendly-code.vercel.app/api/badge/github/other/repo.svg)",
    });

    assert.equal(detectBadgeEmbed(fixture, SLUG), false);
  });

  test("reads alternative README filenames", () => {
    fixture = makeFixture({
      "README.rst": `.. image:: https://agent-friendly-code.vercel.app/api/badge/${SLUG}.svg`,
    });

    assert.equal(detectBadgeEmbed(fixture, SLUG), true);
  });

  test("matches the badge URL whatever the owner's casing", () => {
    fixture = makeFixture({ "README.md": "![b](https://agentfriendlycode.com/api/badge/github/HonoJS/Hono.svg)" });
    assert.equal(detectBadgeEmbed(fixture, SLUG), true);
  });

  test("another repo's badge with this name as a prefix doesn't count", () => {
    fixture = makeFixture({ "README.md": `![b](https://agentfriendlycode.com/api/badge/${SLUG}-extra.svg)` });
    assert.equal(detectBadgeEmbed(fixture, SLUG), false);
  });

  test("does not follow a README symlink out of the repo", () => {
    const outside = makeFixture({});
    fixture = makeFixture({});
    try {
      writeFileSync(join(outside, "README.md"), `![b](https://x.dev/api/badge/${SLUG}.svg)`);
      symlinkSync(join(outside, "README.md"), join(fixture, "README.md"));

      assert.equal(detectBadgeEmbed(fixture, SLUG), false);
    } finally {
      removeFixture(outside);
    }
  });
});

describe("selfBadgeRepos", () => {
  const badge = (slug: string) => `[![Agent Friendly](https://agentfriendlycode.com/api/badge/github/${slug}.svg)]`;

  test("counts a repo whose root README shows its own badge, once", () => {
    const hits = [
      { repo: "axios/axios", fork: false, path: "README.md", fragments: [badge("axios/axios")] },
      { repo: "Axios/Axios", fork: false, path: "README.md", fragments: [badge("axios/axios")] },
    ];
    assert.deepEqual(selfBadgeRepos(hits), ["axios/axios"]);
  });

  test("ignores vendored copies, renamed copies, forks and other files", () => {
    const hits = [
      { repo: "someone/app", fork: false, path: "node_modules/axios/README.md", fragments: [badge("axios/axios")] },
      { repo: "someone/axios", fork: false, path: "README.md", fragments: [badge("axios/axios")] },
      { repo: "someone/hono", fork: true, path: "README.md", fragments: [badge("someone/hono")] },
      { repo: "someone/docs", fork: false, path: "notes.md", fragments: [badge("someone/docs")] },
    ];
    assert.deepEqual(selfBadgeRepos(hits), []);
  });

  test("doesn't read the badge of hono-extra as one for hono", () => {
    const hits = [{ repo: "honojs/hono", fork: false, path: "README.md", fragments: [badge("honojs/hono-extra")] }];
    assert.deepEqual(selfBadgeRepos(hits), []);
  });
});

describe("selfBadgeRepos .github README", () => {
  test("counts a README under .github/, which GitHub shows on the repo page", () => {
    const hits = [
      {
        repo: "o/r",
        fork: false,
        path: ".github/README.md",
        fragments: ["https://agentfriendlycode.com/api/badge/github/o/r.svg"],
      },
    ];
    assert.deepEqual(selfBadgeRepos(hits), ["o/r"]);
  });
});
