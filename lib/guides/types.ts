// Prose in every string goes through CodeText, so `backticks` render as code.
// `{{key}}` in a string is replaced from getGuideStats(); tests/guides.test.ts
// fails the build on a key it can't fill, so a number never ships as a token.
export type GuideBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "table"; head: string[]; rows: string[][]; caption?: string }
  | { kind: "snippet"; caption: string; text: string; wrap?: boolean }
  /** Board repos whose instructions file is this one, most-starred first. */
  | { kind: "examples"; file: "AGENTS.md" | "CLAUDE.md"; limit: number; language?: string };

export type GuideSection = {
  id: string;
  /** Phrased as the question a searcher types, like the /check panel headings. */
  heading: string;
  tone?: "tip" | "info" | "warn";
  blocks: GuideBlock[];
};

export type Guide = {
  slug: string;
  /** Breadcrumb and link label. */
  name: string;
  title: string;
  description: string;
  lead: string;
  /** YYYY-MM-DD. */
  published: string;
  /** YYYY-MM-DD of the last prose change; the sitemap takes the later of this and the board's. */
  updated: string;
  about: string[];
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
  /** Official docs behind the facts above; never blogs. */
  sources: string[];
  related: { href: string; label: string }[];
};
