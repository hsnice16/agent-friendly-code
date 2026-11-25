export type CheckContent = {
  /** YYYY-MM-DD the page first shipped. */
  published: string;
  /**
   * YYYY-MM-DD of the last edit to this check's copy, here or in questions.ts / practice.ts.
   * Bump it with the edit: nothing else can tell a copy change from a refactor.
   */
  updated: string;
  /** Page heading, and the `<title>` unless `metaTitle` is set. */
  title: string;
  /** Only where `title` runs past what a search result shows (see lib/utils/page-title.ts). */
  metaTitle?: string;
  description: string;
  what: string;
  why: string;
  /** One entry per outcome the check can return, best first. Must match the signal's `check`. */
  scoring: string[];
  fix: string;
};

/** A /check page's panel headings, one per panel. */
export type CheckQuestions = { pass: string; why: string; scoring: string; fix: string; agents: string };
