/** What to put in an AGENTS.md for one language or framework. */
export type AgentsMdGuide = {
  slug: string;
  label: string;
  intro: string;
  commands: { cmd: string; note: string }[];
  layout: string[];
  rules: string[];
  /** Official docs behind every command and rule above. */
  sources: string[];
};

export type FrameworkGuide = AgentsMdGuide & {
  /** For the description and JSON-LD: what kind of thing it is. */
  kind: string;
  /** Primary languages of an app built on it; a repo in another (a Python monorepo with a Next.js UI) lists after these. */
  languages: string[];
  /**
   * `host/owner/name` of repos built on the framework. Picked by hand: the board
   * stores no dependency list, and topics tag every integration (nx and vercel/ai
   * carry `nextjs`), so each is here because its AGENTS.md or manifest names it.
   */
  repos: string[];
  /** The framework's own repo, whose file is for contributors to it rather than apps on it. */
  frameworkRepo: string;
};
