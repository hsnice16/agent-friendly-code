import { languageSlug } from "./utils/language";
import { fitDescription, MAX_TITLE_LENGTH } from "./utils/page-title";
import { repoAbout } from "./utils/repo-about";

// Below this a topic page is a thin list next to the language hubs and the
// board, which search engines read as a doorway page; the topic stays a chip.
export const TOPIC_PAGE_MIN_REPOS = 8;
export const RELATED_TOPICS_LIMIT = 6;
// One shared repo is a coincidence, not a relation.
const RELATED_MIN_SHARED = 2;

// Spellings of one subject that owners pick between; unmerged, each would
// fall under the threshold or split one page in two. Language spellings map
// to the language slug, so they link to its hub.
const SYNONYMS: Record<string, string> = {
  golang: "go",
  "rust-lang": "rust",
  python3: "python",
  js: "javascript",
  "c-plus-plus": "cpp",
  postgres: "postgresql",
  "command-line": "cli",
  "artificial-intelligence": "ai",
  node: "nodejs",
  reactjs: "react",
  llms: "llm",
  "large-language-models": "llm",
  agents: "ai-agents",
  agent: "ai-agents",
  "real-time": "realtime",
};

// Tags about the repo's community or listing, not what the code does.
const NOISE = new Set([
  "awesome",
  "beginner-friendly",
  "good-first-issue",
  "help-wanted",
  "open-source",
  "open-source-project",
  "opensource",
]);
const NOISE_PATTERN = /^hacktoberfest/;

// Only where lowercasing the slug gets the name wrong.
const LABELS: Record<string, string> = {
  ai: "AI",
  "ai-agents": "AI agents",
  android: "Android",
  api: "API",
  cli: "CLI",
  graphql: "GraphQL",
  http: "HTTP",
  ios: "iOS",
  kubernetes: "Kubernetes",
  llm: "LLM",
  markdown: "Markdown",
  mysql: "MySQL",
  nextjs: "Next.js",
  nodejs: "Node.js",
  openai: "OpenAI",
  postgresql: "PostgreSQL",
  pytorch: "PyTorch",
  react: "React",
  "self-hosted": "self-hosted",
  sql: "SQL",
  vue: "Vue",
};

export type TopicGroup<T> = { slug: string; label: string; rows: T[] };

type Row = { id: number; language: string | null; topics?: string | null };

export function normalizeTopic(topic: string): string {
  return SYNONYMS[topic] ?? topic;
}

export function isNoiseTopic(topic: string): boolean {
  return NOISE.has(topic) || NOISE_PATTERN.test(topic);
}

export function topicLabel(slug: string): string {
  return LABELS[slug] ?? slug.replace(/-/g, " ");
}

export function topicPath(slug: string): string {
  return `/topic/${slug}`;
}

export const TOPICS_PATH = "/topics";

function languageSlugs(rows: Row[]): Set<string> {
  return new Set(rows.flatMap((r) => (r.language ? [languageSlug(r.language)] : [])));
}

/** A row's topics, merged and deduped, without noise or languages. */
function rowTopics(row: Row, languages: Set<string>): string[] {
  const out = new Set<string>();
  for (const raw of repoAbout(row).topics) {
    const t = normalizeTopic(raw);
    if (!isNoiseTopic(t) && !languages.has(languageSlug(t))) out.add(t);
  }
  return [...out];
}

/** Topics with enough repos for a page, largest first; rows keep the input order. */
export function topicGroups<T extends Row>(rows: T[]): TopicGroup<T>[] {
  const languages = languageSlugs(rows);
  const bySlug = new Map<string, T[]>();
  for (const row of rows) {
    for (const t of rowTopics(row, languages)) bySlug.set(t, [...(bySlug.get(t) ?? []), row]);
  }
  return [...bySlug.entries()]
    .filter(([, g]) => g.length >= TOPIC_PAGE_MIN_REPOS)
    .map(([slug, g]) => ({ slug, label: topicLabel(slug), rows: g }))
    .sort((a, b) => b.rows.length - a.rows.length || a.slug.localeCompare(b.slug));
}

/** The topic pages that share the most repos with this one. */
export function relatedTopics<T extends Row>(
  group: TopicGroup<T>,
  groups: TopicGroup<T>[],
  limit = RELATED_TOPICS_LIMIT,
): TopicGroup<T>[] {
  const ids = new Set(group.rows.map((r) => r.id));
  return groups
    .filter((g) => g.slug !== group.slug)
    .map((g) => ({ g, shared: g.rows.filter((r) => ids.has(r.id)).length }))
    .filter((x) => x.shared >= RELATED_MIN_SHARED)
    .sort((a, b) => b.shared - a.shared || b.g.rows.length - a.g.rows.length)
    .slice(0, limit)
    .map((x) => x.g);
}

// Above this share of the board a topic ("ai") ties together repos that have
// little else in common, so it never counts as a shared topic.
const GENERIC_TOPIC_SHARE = 0.08;

export type TopicNeighbour<T> = { row: T; shared: string[] };

/**
 * Repos in any language that share the most specific topics with `repo`.
 * Rarer shared topics break ties before score, so "wsgi" outranks "web".
 * `exclude` holds ids already linked elsewhere on the page.
 */
export function reposSharingTopics<T extends Row & { score: number | null }>(
  repo: T,
  rows: T[],
  exclude: Set<number>,
  limit: number,
): TopicNeighbour<T>[] {
  const languages = languageSlugs(rows);
  const topicsOf = new Map(rows.map((r) => [r.id, rowTopics(r, languages)]));
  const counts = new Map<string, number>();
  for (const ts of topicsOf.values()) for (const t of ts) counts.set(t, (counts.get(t) ?? 0) + 1);

  const maxCount = rows.length * GENERIC_TOPIC_SHARE;
  const own = new Set(
    (topicsOf.get(repo.id) ?? rowTopics(repo, languages)).filter((t) => (counts.get(t) ?? 0) <= maxCount),
  );
  if (own.size === 0) return [];

  return rows
    .filter((r) => r.id !== repo.id && !exclude.has(r.id))
    .map((row) => {
      const shared = (topicsOf.get(row.id) ?? []).filter((t) => own.has(t));
      const rarity = shared.reduce((sum, t) => sum + 1 / (counts.get(t) ?? 1), 0);
      return { row, shared, rarity };
    })
    .filter((x) => x.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length || b.rarity - a.rarity || (b.row.score ?? 0) - (a.row.score ?? 0))
    .slice(0, limit)
    .map(({ row, shared }) => ({ row, shared }));
}

/**
 * Where each of a repo's topic chips links: its topic page, else the hub of
 * the language it names. A topic with neither is left out and stays plain.
 */
export function topicLinks(
  topics: string[],
  pages: { slug: string }[],
  hubs: { slug: string; href: string }[],
): Record<string, string> {
  const pageSlugs = new Set(pages.map((p) => p.slug));
  const out: Record<string, string> = {};
  for (const raw of topics) {
    const t = normalizeTopic(raw);
    const hub = hubs.find((h) => h.slug === languageSlug(t));
    if (pageSlugs.has(t)) out[raw] = topicPath(t);
    else if (hub) out[raw] = hub.href;
  }
  return out;
}

/** Falls back to shorter wordings, then a cut label, so a long topic cannot push a title past the limit. */
export function topicTitle(label: string, max = MAX_TITLE_LENGTH): string {
  const options = [`Agent-ready ${label} repos ranked`, `Agent-ready ${label} repos`, `${label} repos`];
  return options.find((t) => t.length <= max) ?? `${label.slice(0, max - " repos".length - 1).trimEnd()}… repos`;
}

export function topicDescription(t: { label: string; count: number; average: number; top: string; topScore: number }) {
  return fitDescription(
    `${t.count} ${t.label} repos ranked by how ready they are for AI coding agents like Claude Code and Cursor.`,
    `Average score ${t.average.toFixed(1)}.`,
    `${t.top} leads with ${t.topScore.toFixed(1)}.`,
  );
}
