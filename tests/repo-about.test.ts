import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RepoAbout } from "../components/RepoAbout";
import {
  MAX_ABOUT_LENGTH,
  MAX_TOPIC_LENGTH,
  MAX_TOPICS,
  repoAbout,
  sanitizeDescription,
  sanitizeTopics,
  topicsColumn,
} from "../lib/utils/repo-about";

describe("sanitizeDescription", () => {
  test("collapses whitespace and strips control and invisible characters", () => {
    assert.equal(sanitizeDescription("  A\n\tfast\u0000 \u202Eclient\u200B  "), "A fast client");
    assert.equal(sanitizeDescription("zero\u200Bwidth"), "zerowidth");
  });

  test("strips emoji shortcodes, keeps real emoji and colon-separated text", () => {
    assert.equal(sanitizeDescription(":rocket: Blazing fast :zap:."), "Blazing fast.");
    assert.equal(sanitizeDescription("🚀 Runs at 10:30:45, see a:b:c"), "🚀 Runs at 10:30:45, see a:b:c");
  });

  test("empty, whitespace-only, shortcode-only and non-strings are null", () => {
    for (const raw of ["", "   ", ":tada:", null, undefined, 42]) assert.equal(sanitizeDescription(raw), null);
  });

  test("caps the length on a word boundary without splitting an emoji", () => {
    const out = sanitizeDescription(`${"word ".repeat(100)}end`)!;
    assert.ok(Array.from(out).length <= MAX_ABOUT_LENGTH, out);
    assert.match(out, /word…$/);

    const emoji = sanitizeDescription("😀".repeat(400))!;
    assert.equal(Array.from(emoji).length, MAX_ABOUT_LENGTH);
    assert.ok(!/[\uD800-\uDBFF]…$/.test(emoji));
  });
});

describe("sanitizeTopics", () => {
  test("lowercases, trims, dedupes and drops empty or over-long topics", () => {
    const long = "x".repeat(MAX_TOPIC_LENGTH + 1);
    assert.deepEqual(sanitizeTopics(["Go", " go ", "", long, "CLI", 7]), ["go", "cli"]);
  });

  test("keeps at most the first 20", () => {
    const many = Array.from({ length: 30 }, (_, i) => `t${i}`);
    assert.equal(sanitizeTopics(many).length, MAX_TOPICS);
  });

  test("anything but an array is no topics", () => {
    assert.deepEqual(sanitizeTopics(null), []);
    assert.deepEqual(sanitizeTopics("go"), []);
  });
});

describe("repoAbout", () => {
  test("a row from before the columns, or with NULLs, is empty", () => {
    assert.deepEqual(repoAbout({}), { description: null, topics: [] });
    assert.deepEqual(repoAbout({ description: null, topics: null }), { description: null, topics: [] });
  });

  test("round-trips the stored JSON, and survives a corrupt value", () => {
    assert.deepEqual(repoAbout({ description: "d", topics: topicsColumn(["a", "b"]) }).topics, ["a", "b"]);
    assert.deepEqual(repoAbout({ topics: "not json" }).topics, []);
    assert.equal(topicsColumn([]), null);
  });
});

describe("RepoAbout", () => {
  const render = (about: Parameters<typeof RepoAbout>[0]["about"], topicLinks?: Record<string, string>) =>
    renderToStaticMarkup(createElement(RepoAbout, { about, topicLinks }));

  test("renders nothing when there is no description and no topics", () => {
    assert.equal(render({ description: null, topics: [] }), "");
  });

  test("links a topic only when it has a page here", () => {
    const html = render({ description: "<b>x</b>", topics: ["go", "cli"] }, { go: "/language/go" });
    assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
    assert.match(html, /<a [^>]*href="\/language\/go"[^>]*>go<\/a>/);
    assert.match(html, /<span [^>]*>cli<\/span>/);
    assert.equal(html.match(/<a /g)?.length, 1);
  });
});
