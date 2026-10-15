export const MAX_ABOUT_LENGTH = 300;
export const MAX_TOPICS = 20;
export const MAX_TOPIC_LENGTH = 50;

export type RepoAboutData = { description: string | null; topics: string[] };

// Bidi overrides can reorder the text a visitor sees; zero-width spaces and the
// BOM are invisible. U+200D stays: it joins multi-part emoji.
const INVISIBLE = /[\p{Cc}\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/gu;

// GitHub renders these as emoji on its own pages; here they'd show as
// ":rocket:". Bounded by whitespace so "10:30:45" and "a:b:c" survive.
const SHORTCODE = /(^|\s):[a-z0-9_+-]+:(?=\s|$|[.,;!?)])/g;

function clean(raw: string): string {
  return raw.replace(/\s+/g, " ").replace(INVISIBLE, "").replace(/ {2,}/g, " ").trim();
}

export function sanitizeDescription(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  const text = clean(
    clean(raw).replace(SHORTCODE, (m, pre: string, at: number, all: string) =>
      /[.,;!?)]/.test(all[at + m.length] ?? "") ? "" : pre,
    ),
  );
  // By code point, so the cut never splits an emoji's surrogate pair.
  const chars = Array.from(text);
  if (chars.length <= MAX_ABOUT_LENGTH) return text || null;

  const cut = chars.slice(0, MAX_ABOUT_LENGTH - 1).join("");
  const space = cut.lastIndexOf(" ");
  return `${(space > cut.length - 40 ? cut.slice(0, space) : cut).replace(/[\s,;:.-]+$/, "")}…`;
}

// An over-long topic is dropped, not cut: a truncated topic is a different topic.
export function sanitizeTopics(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const out = new Set<string>();
  for (const t of raw) {
    if (typeof t !== "string") continue;
    const topic = clean(t).toLowerCase();
    if (topic && Array.from(topic).length <= MAX_TOPIC_LENGTH) out.add(topic);
    if (out.size === MAX_TOPICS) break;
  }
  return [...out];
}

/** The stored form: a JSON array, or null for none. */
export function topicsColumn(topics: string[]): string | null {
  return topics.length > 0 ? JSON.stringify(topics) : null;
}

// A DB from before the columns existed returns rows without them. Re-sanitised
// on read so a rule change here applies without waiting for a rescore.
export function repoAbout(row: { description?: string | null; topics?: string | null }): RepoAboutData {
  let topics: unknown = [];
  try {
    topics = row.topics ? JSON.parse(row.topics) : [];
  } catch {}
  return { description: sanitizeDescription(row.description), topics: sanitizeTopics(topics) };
}
