import "./_temp-db";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GUIDE_NOTES, GUIDES } from "../lib/guides";
import { fillStats, getGuideStats, statKeys } from "../lib/guides/stats";
import type { Guide } from "../lib/guides/types";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

function strings(g: Guide): string[] {
  const blocks = g.sections.flatMap((s) => [s.heading, ...s.blocks.flatMap(blockStrings)]);
  return [g.title, g.description, g.lead, ...blocks, ...(g.faq ?? []).flatMap((f) => [f.q, f.a])];
}

function blockStrings(b: Guide["sections"][number]["blocks"][number]): string[] {
  switch (b.kind) {
    case "p":
      return [b.text];
    case "list":
      return b.items;
    case "table":
      return [...b.head, ...b.rows.flat(), ...(b.caption ? [b.caption] : [])];
    case "snippet":
      return [b.caption];
    case "examples":
      return [];
  }
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("guides", () => {
  const stats = getGuideStats();

  it("have unique slugs that don't shadow the hub", () => {
    const slugs = GUIDES.map((g) => g.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/, s);
  });

  it("only use stats that exist", () => {
    for (const g of GUIDES)
      for (const t of strings(g)) for (const k of statKeys(t)) assert.ok(k in stats, `${g.slug}: {{${k}}}`);
  });

  it("hold no markdown emphasis, which renders as literal asterisks", () => {
    for (const g of GUIDES) for (const t of strings(g)) assert.doesNotMatch(t, /\*\*[A-Za-z][^*]*\*\*/, g.slug);
  });

  it("fit a search result once filled", () => {
    for (const g of GUIDES) {
      const title = pageTitle(fillStats(g.title, stats)).absolute;
      const description = fillStats(g.description, stats);
      assert.ok(title.length <= MAX_TITLE_LENGTH, `${g.slug} title ${title.length}: ${title}`);
      assert.ok(description.length <= MAX_DESCRIPTION_LENGTH, `${g.slug} description ${description.length}`);
    }
  });

  it("cite https docs and date themselves", () => {
    for (const g of GUIDES) {
      assert.ok(g.sources.length > 0, g.slug);
      for (const u of g.sources) assert.match(u, /^https:\/\//, `${g.slug}: ${u}`);
      assert.match(g.published, DATE, g.slug);
      assert.match(g.updated, DATE, g.slug);
      assert.ok(g.updated >= g.published, g.slug);
    }
  });

  it("keep table rows as wide as their head", () => {
    for (const g of GUIDES)
      for (const s of g.sections)
        for (const b of s.blocks)
          if (b.kind === "table") {
            for (const r of b.rows) assert.equal(r.length, b.head.length, `${g.slug}#${s.id}`);
            assert.equal(new Set(b.rows.map((r) => r[0])).size, b.rows.length, `${g.slug}#${s.id} repeats a row label`);
          }
  });

  it("each have one hub note", () => {
    assert.deepEqual(Object.keys(GUIDE_NOTES).sort(), GUIDES.map((g) => g.slug).sort());
  });

  it("keep section ids unique within a guide", () => {
    for (const g of GUIDES) {
      const ids = g.sections.map((s) => s.id);
      assert.equal(new Set(ids).size, ids.length, g.slug);
    }
  });
});
