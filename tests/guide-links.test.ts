import "./_temp-db";

import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { GUIDES, guideBySlug } from "../lib/guides";
import type { GuideBlock } from "../lib/guides/types";
import { signalIdFromSlug } from "../lib/utils/check-path";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
// Link syntax inside a code span renders as text (LinkedText), so it isn't a link.
const links = (text: string) => [...text.replace(/`[^`]*`/g, "").matchAll(LINK)].map((m) => m[2]);

const blockTexts = (b: GuideBlock): string[] =>
  b.kind === "p" ? [b.text] : b.kind === "list" ? b.items : b.kind === "table" ? b.rows.flat() : [];

const APP = join(import.meta.dirname, "..", "app");
const ENDPOINT = ["page.tsx", "route.ts", "route.tsx"];

/** Whether a Next.js route under app/ serves this path, static segments before dynamic ones. */
function routeExists(dir: string, segs: string[]): boolean {
  if (segs.length === 0) return ENDPOINT.some((f) => existsSync(join(dir, f)));
  const dirs = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  const [head, ...rest] = segs;
  if (dirs.includes(head) && routeExists(join(dir, head), rest)) return true;
  if (dirs.some((d) => /^\[[^.[\]]+\]$/.test(d) && routeExists(join(dir, d), rest))) return true;
  return dirs.some((d) => /^\[{1,2}\.\.\./.test(d) && routeExists(join(dir, d), []));
}

function sitePathExists(href: string): boolean {
  const segs = href.split(/[?#]/)[0].split("/").filter(Boolean);
  if (segs[0] === "guide" && segs[1] && !guideBySlug(segs[1])) return false;
  if (segs[0] === "check" && segs[1] && !signalIdFromSlug(segs[1])) return false;
  return routeExists(APP, segs);
}

describe("guide inline links", () => {
  const all = GUIDES.flatMap((g) =>
    g.sections.flatMap((s) => s.blocks.flatMap(blockTexts).flatMap((t) => links(t).map((href) => ({ g, href })))),
  );

  it("exist", () => {
    assert.ok(all.length > 0);
  });

  it("are https or a site path that resolves to a route", () => {
    for (const { g, href } of all) {
      if (href.startsWith("https://")) continue;
      assert.match(href, /^\/(?![/\\])/, `${g.slug}: ${href}`);
      assert.ok(sitePathExists(href), `${g.slug}: no route for ${href}`);
    }
  });

  it("cite only pages listed in the guide's sources", () => {
    for (const { g, href } of all)
      if (href.startsWith("https://"))
        assert.ok(
          g.sources.includes(href) || g.sources.includes(href.split("#")[0]),
          `${g.slug}: ${href} not in sources`,
        );
  });
});
