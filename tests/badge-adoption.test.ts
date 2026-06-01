import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "node:test";

import { detectBadgeEmbed } from "../lib/badge-adoption";
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
});
