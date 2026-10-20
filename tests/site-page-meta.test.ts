import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { examplesDescription, examplesTitle } from "../lib/agents-md-examples";
import { AGENTS_VS_CLAUDE_MD, OTHER_LANGUAGES_TITLE, otherLanguagesDescription, PAGE_COPY } from "../lib/page-meta";
import { hubTitle } from "../lib/utils/language";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, pageTitle } from "../lib/utils/page-title";

const fits = (title: string, description: string) => {
  assert.ok(pageTitle(title).absolute.length <= MAX_TITLE_LENGTH, title);
  assert.ok(description.length <= MAX_DESCRIPTION_LENGTH, `${description.length}: ${description}`);
};

describe("static page copy", () => {
  it("fits a search result", () => {
    for (const { title, description } of [...Object.values(PAGE_COPY), AGENTS_VS_CLAUDE_MD]) fits(title, description);
  });

  it("gives every page its own title and description", () => {
    const pages = [...Object.values(PAGE_COPY), { title: OTHER_LANGUAGES_TITLE, description: "" }];
    assert.equal(new Set(pages.map((p) => pageTitle(p.title).absolute)).size, pages.length);
    const descriptions = Object.values(PAGE_COPY).map((p) => p.description);
    assert.equal(new Set(descriptions).size, descriptions.length);
  });

  it("says 'best set up for', never 'fits best' or 'best fit'", () => {
    for (const { description } of Object.values(PAGE_COPY)) assert.doesNotMatch(description, /fits best|best[- ]fit/);
  });
});

describe("AGENTS.md examples copy", () => {
  it("fits at any count", () => {
    for (const n of [0, 7, 200, 99_999]) {
      fits(examplesTitle(n), examplesDescription({ rows: Array.from({ length: n }), passing: n }));
    }
  });

  it("states the live count", () => {
    assert.match(examplesTitle(200), /200 real files/);
  });
});

describe("other languages copy", () => {
  it("fits with many long language names", () => {
    const groups = Array.from({ length: 12 }, (_, i) => ({
      slug: `l${i}`,
      label: `An Unusually Long Language Name ${i}`,
      rows: [1, 2],
    }));
    fits(OTHER_LANGUAGES_TITLE, otherLanguagesDescription(groups));
  });

  it("leaves the undetected bucket out of the named languages", () => {
    const d = otherLanguagesDescription([
      { slug: "zig", label: "Zig", rows: [1] },
      { slug: "unknown", label: "Language not detected", rows: [1] },
    ]);
    assert.match(d, /^2 repos/);
    assert.match(d, /Zig/);
    assert.doesNotMatch(d, /not detected/);
  });
});

describe("hubTitle", () => {
  it("keeps the full wording for ordinary labels", () => {
    assert.equal(hubTitle("TypeScript"), "Most agent-friendly TypeScript repos");
  });

  it("stays within the limit for long labels", () => {
    for (const label of ["Jupyter Notebook", "Visual Basic .NET", "A".repeat(45), "B".repeat(80)]) {
      const t = hubTitle(label);
      assert.ok(pageTitle(t).absolute.length <= MAX_TITLE_LENGTH, t);
      assert.ok(t.endsWith("repos"), t);
    }
  });
});
