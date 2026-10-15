import "./_temp-db";

import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { db, saveScoredRepo } from "../lib/db";
import { TOPIC_PAGE_MIN_REPOS } from "../lib/topics";
import { APP_URL } from "../lib/version";

// Seeded before the pages load: their loaders are cache()d.
for (let i = 0; i < TOPIC_PAGE_MIN_REPOS; i++) {
  saveScoredRepo({
    name: `r${i}`,
    owner: "o",
    host: "github",
    language: "Go",
    overall: 40 + i,
    modelScores: [],
    url: `https://github.com/o/r${i}`,
    signals: [{ id: "agents_md", label: "AGENTS.md", pass: i < 2 ? 1 : 0, detail: "", matchedPath: "AGENTS.md" }],
    about: { description: null, topics: ["command-line", "golang", "hacktoberfest"] },
  });
}

after(() => db.close());

describe("topic pages from the DB", async () => {
  const { default: sitemap } = await import("../app/sitemap");
  const { generateStaticParams } = await import("../app/topic/[slug]/page");
  const { getTopicPage } = await import("../lib/topic-pages");

  it("prerenders only the topics past the threshold", () => {
    assert.deepEqual(generateStaticParams(), [{ slug: "cli" }]);
  });

  it("lists the index and each topic page in the sitemap, dated", () => {
    const entries = sitemap();
    for (const path of ["/topics", "/topic/cli"]) {
      assert.ok(entries.find((e) => e.url === `${APP_URL}${path}`)?.lastModified, path);
    }
    assert.ok(!entries.some((e) => e.url.includes("/topic/go") || e.url.includes("hacktoberfest")));
  });

  it("counts repos with an instructions file", () => {
    const page = getTopicPage("cli");
    assert.equal(page?.rows.length, TOPIC_PAGE_MIN_REPOS);
    assert.equal(page?.withAgentFile, 2);
    assert.equal(page?.top.name, `r${TOPIC_PAGE_MIN_REPOS - 1}`);
  });
});
