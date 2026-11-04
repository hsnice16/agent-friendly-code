import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { languageExamplesDescription, languageExamplesTitle } from "../lib/agents-md-examples";
import { LINGUIST_NAMES } from "../lib/clients/language";
import { FRAMEWORKS } from "../lib/framework-guides";
import { LANGUAGE_GUIDES } from "../lib/language-guides";
import { languageSlug } from "../lib/utils/language";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

const guides = Object.entries(LANGUAGE_GUIDES);

describe("language guides", () => {
  it("are keyed by a language slug no framework uses", () => {
    const languages = new Set(LINGUIST_NAMES.map(languageSlug));
    const frameworks = new Set(FRAMEWORKS.map((f) => f.slug));
    for (const [slug, g] of guides) {
      assert.equal(g.slug, slug);
      assert.ok(languages.has(slug), slug);
      assert.ok(!frameworks.has(slug), slug);
    }
  });

  it("cite official docs and repeat no command", () => {
    for (const [slug, g] of guides) {
      assert.ok(g.sources.length > 0, slug);
      assert.ok(
        g.sources.every((u) => u.startsWith("https://")),
        slug,
      );
      assert.equal(new Set(g.commands.map((c) => c.cmd)).size, g.commands.length, slug);
    }
  });

  it("lead the title with the query and fit a search result with a three-digit count", () => {
    for (const [slug, guide] of guides) {
      const lang = { slug, label: guide.label, rows: Array(100).fill(null), total: 200, passing: 100, guide };
      const title = languageExamplesTitle(lang);
      assert.ok(title.startsWith("AGENTS.md for "), title);
      assert.ok(pageTitle(title).absolute.length <= MAX_TITLE_LENGTH, title);
      assert.ok(languageExamplesDescription(lang).length <= MAX_DESCRIPTION_LENGTH, slug);
    }
  });

  it("names Go the way people search for it", () => {
    const lang = { slug: "go", label: "Go", rows: [], total: 1, passing: 0, guide: LANGUAGE_GUIDES.go };
    assert.match(languageExamplesTitle(lang), /^AGENTS\.md for Go \(Golang\): guide/);
  });
});
