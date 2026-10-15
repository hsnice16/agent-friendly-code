import "./_temp-db";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SIGNALS } from "../lib/scoring/signals";
import { MODELS } from "../lib/scoring/weights";
import { checkSlug } from "../lib/utils/check-path";
import { APP_URL } from "../lib/version";

describe("sitemap", async () => {
  const { default: sitemap } = await import("../app/sitemap");
  const urls = sitemap().map((e) => e.url);

  it("lists the examples page and the other-languages hub", () => {
    assert.ok(urls.includes(`${APP_URL}/check/agents-md/examples`));
    assert.ok(urls.includes(`${APP_URL}/language/other`));
  });

  it("has no topic pages while no repo has topics", () => {
    assert.ok(!urls.some((u) => u.includes("/topic")));
  });

  it("leaves out llms.txt", () => {
    assert.ok(!urls.some((u) => u.endsWith("/llms.txt")));
  });

  it("dates the methodology and changelog", () => {
    for (const path of ["/methodology", "/changelog"]) {
      assert.ok(sitemap().find((e) => e.url === `${APP_URL}${path}`)?.lastModified, path);
    }
  });
});

describe("OG image params", async () => {
  const model = await import("../app/og/model/[slug]/route");
  const check = await import("../app/og/check/[slug]/route");

  it("cover every agent and every check", () => {
    assert.deepEqual(
      model.generateStaticParams().map((p) => p.slug),
      MODELS.map((m) => m.id),
    );
    assert.deepEqual(
      check.generateStaticParams().map((p) => p.slug),
      SIGNALS.map((s) => checkSlug(s.id)),
    );
  });
});
