import "./_temp-db";

import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ACTION_FAQ } from "../app/action/faq";
import { METHODOLOGY_FAQ } from "../app/methodology/faq";
import { SCORE_FAQ } from "../app/score/faq";
import { FaqSection } from "../components/FaqSection";
import { PageHeader } from "../components/PageHeader";
import { agentsMdFaq } from "../lib/agents-faq";
import type { AdoptionPoint } from "../lib/agents-md-adoption";
import { AUTHOR_NAME } from "../lib/author";
import { VS_CLAUDE_MD_FAQ } from "../lib/check-content/vs-claude-md";
import { GUIDES } from "../lib/guides";
import { guideModified, seriesChangedOn } from "../lib/guides/modified";
import { fillStats, getGuideStats } from "../lib/guides/stats";
import { SKILL_FAQ } from "../lib/skill-content";

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

function renderFaq(items: { q: string; a: string }[]) {
  const html = renderToStaticMarkup(createElement(FaqSection, { heading: "Questions people ask", items }));
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? "{}");
  const visible = [...html.matchAll(/<dt[^>]*>(.*?)<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/gs)].map((m) => ({
    q: text(m[1]),
    a: text(m[2]),
  }));
  return { ld, visible };
}

describe("FaqSection", () => {
  const sets = [
    { name: "vs-claude-md", items: VS_CLAUDE_MD_FAQ },
    { name: "skill", items: SKILL_FAQ },
    { name: "methodology", items: METHODOLOGY_FAQ },
    { name: "action", items: ACTION_FAQ },
    { name: "score", items: SCORE_FAQ },
    { name: "agents", items: agentsMdFaq().map((f) => ({ q: f.question, a: f.answer })) },
    ...GUIDES.filter((g) => g.faq?.length).map((g) => ({
      name: g.slug,
      items: (g.faq ?? []).map((f) => ({ q: fillStats(f.q, getGuideStats()), a: fillStats(f.a, getGuideStats()) })),
    })),
  ];

  for (const { name, items } of sets) {
    test(`FAQPage JSON-LD on ${name} matches the visible questions and answers`, () => {
      const { ld, visible } = renderFaq(items);
      assert.equal(ld["@type"], "FAQPage");
      assert.equal(visible.length, items.length);
      assert.deepEqual(
        ld.mainEntity.map((e: { name: string; acceptedAnswer: { text: string } }) => ({
          q: e.name,
          a: e.acceptedAnswer.text,
        })),
        visible,
      );
    });
  }
});

describe("PageHeader byline", () => {
  const render = (updated?: string | null) =>
    renderToStaticMarkup(createElement(PageHeader, { title: "T", lead: "L", updated }));

  test("shows author, the given date and the methodology link", () => {
    const html = render("2026-11-21T11:48:29.000Z");
    assert.match(html, new RegExp(`By <a[^>]*href="/about"[^>]*>${AUTHOR_NAME}</a>`));
    assert.match(html, /<time dateTime="2026-11-21T11:48:29.000Z">21 Nov 2026<\/time>/);
    assert.match(html, /href="\/methodology"[^>]*>How we score →/);
  });

  test("is left out without a date", () => {
    assert.doesNotMatch(render(null), /Updated/);
    assert.doesNotMatch(render(), /Updated/);
  });
});

describe("guideModified", () => {
  const point = (date: string, repos: number, withFile: number) =>
    ({ date, repos, withFile, agentsMd: 0, claudeMd: 0, medianChars: 1 }) as unknown as AdoptionPoint;
  const points = [point("2026-11-01", 10, 5), point("2026-11-05", 11, 5), point("2026-11-20", 11, 5)];

  test("seriesChangedOn finds the last day a field moved, not the last snapshot", () => {
    assert.equal(seriesChangedOn(points, ["repos"]), "2026-11-05");
    assert.equal(seriesChangedOn(points, ["withFile"]), "2026-11-01");
  });

  test("a guide's date moves with its prose, its census and its board stats, not with every rescore", () => {
    const base = GUIDES[0];
    const plain = { ...base, updated: "2026-11-02", sections: [], faq: [], lead: "x", title: "x", description: "x" };
    assert.equal(guideModified(plain, points, "2026-11-16"), "2026-11-02");
    assert.equal(guideModified({ ...plain, lead: "{{censusRepos}}" }, points, "2026-11-16"), "2026-11-16");
    assert.equal(guideModified({ ...plain, lead: "{{boardSize}}" }, points, "2026-11-16"), "2026-11-05");
  });
});
