import "./_temp-db";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AGENT_SETUP, AGENT_SETUP_SOURCES } from "../lib/agent-setup";
import { GUIDES, guideBySlug } from "../lib/guides";
import { SIGNAL_BY_ID } from "../lib/scoring/signals";
import { MODELS } from "../lib/scoring/weights";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
// Code spans show link syntax as text, e.g. the llms.txt format.
const links = (text: string) => [...text.replace(/`[^`]*`/g, "").matchAll(LINK)].map((m) => m[2]);
const noHash = (u: string) => u.split("#")[0];

describe("agent setup", () => {
  it("covers every agent on the board", () => {
    assert.deepEqual(Object.keys(AGENT_SETUP).sort(), MODELS.map((m) => m.id).sort());
  });

  it("cites, for every linked fact, a page in its sources", () => {
    for (const [id, a] of Object.entries(AGENT_SETUP)) {
      assert.ok(a.setup.length > 0, id);
      for (const text of [a.reads, a.needs, a.limit, a.confirm, a.reload])
        for (const href of links(text)) {
          assert.match(href, /^https:\/\//, `${id}: ${href}`);
          assert.ok(a.sources.includes(noHash(href)), `${id}: ${href} not in sources`);
        }
      for (const step of a.setup) assert.equal(links(step).length, 0, `${id}: setup steps render without links`);
    }
  });

  it("links only to real checks", () => {
    for (const [id, a] of Object.entries(AGENT_SETUP))
      for (const c of a.checks) assert.ok(SIGNAL_BY_ID[c], `${id}: ${c}`);
  });

  it("feeds the troubleshooting guide's sources", () => {
    assert.deepEqual(guideBySlug("agents-md-ignored")?.sources, AGENT_SETUP_SOURCES);
  });
});

describe("guide links", () => {
  it("stay out of the FAQ, HowTo steps and lead, whose text also goes to JSON-LD", () => {
    for (const g of GUIDES) {
      for (const t of [g.title, g.description, g.lead, ...(g.faq ?? []).flatMap((f) => [f.q, f.a])])
        assert.equal(links(t).length, 0, `${g.slug}: ${t}`);
      for (const s of g.sections.filter((x) => x.howTo))
        for (const b of s.blocks) if (b.kind === "list") for (const i of b.items) assert.equal(links(i).length, 0, i);
    }
  });

  it("point at https pages or guides that exist", () => {
    for (const g of GUIDES)
      for (const s of g.sections)
        for (const b of s.blocks) {
          const texts =
            b.kind === "p" ? [b.text] : b.kind === "list" ? b.items : b.kind === "table" ? b.rows.flat() : [];
          for (const href of texts.flatMap(links)) {
            assert.match(href, /^(https:\/\/|\/)/, `${g.slug}: ${href}`);
            const guide = /^\/guide\/([^#]+)/.exec(href);
            if (guide) assert.ok(guideBySlug(guide[1]), `${g.slug}: ${href}`);
          }
        }
  });
});
