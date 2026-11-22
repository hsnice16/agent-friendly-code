import { AUTHOR_NAME } from "@/lib/author";
import { CHANGELOG } from "@/lib/changelog";
import { BOARD_CACHE_CONTROL } from "@/lib/constants/cache";
import { APP_HOST, APP_NAME, APP_URL } from "@/lib/version";

export const dynamic = "force-static";

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Highlights are Markdown-lite: only inline code is marked up.
const highlightHtml = (h: string) => xml(h).replace(/`([^`]+)`/g, "<code>$1</code>");

export function GET(): Response {
  const entries = CHANGELOG.map((e) => {
    const html = `<ul>${e.highlights.map((h) => `<li>${highlightHtml(h)}</li>`).join("")}</ul>`;
    return `  <entry>
    <title>${xml(`${e.label}: ${e.title}`)}</title>
    <id>tag:${APP_HOST},${e.date}:${e.label}</id>
    <link href="${APP_URL}/changelog"/>
    <updated>${e.date}T00:00:00Z</updated>
    <content type="html">${xml(html)}</content>
  </entry>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xml(`${APP_NAME} changelog`)}</title>
  <id>${APP_URL}/changelog</id>
  <link rel="self" href="${APP_URL}/changelog.xml"/>
  <link href="${APP_URL}/changelog"/>
  <updated>${CHANGELOG[0].date}T00:00:00Z</updated>
  <author><name>${xml(AUTHOR_NAME)}</name></author>
${entries}
</feed>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": BOARD_CACHE_CONTROL },
  });
}
