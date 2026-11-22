export const SCORE_THRESHOLD_MID = 60;
export const SCORE_THRESHOLD_GOOD = 80;

// The board matches on `owner/name`; nothing longer can match, and `q` arrives
// from the URL, so the input's own maxLength is not the boundary.
export const MAX_SEARCH_LENGTH = 120;

// One size for every device: `/page/N` is a shareable address, so the rows it
// resolves to must not depend on the user agent. Page 1 stays short: at 32 rows
// Clarity showed visitors leaving mid-board, never reaching the footer's links,
// and each row adds ~2 KB billed as ISR reads. Deeper pages are read mostly by
// crawlers, where fewer, longer pages cost less.
export const LEADERBOARD_FIRST_PAGE_SIZE = 12;
export const LEADERBOARD_PAGE_SIZE = 50;

// The repo a board's copy names as its leader. A tiny repo can score 100, and
// naming it there reads as a broken ranking; the table itself is unfiltered.
export const LEAD_MIN_STARS = 100;

export const DEFAULT_SUGGESTION_LIMIT = 3;
export const ALTERNATIVES_LIMIT = 6;
// similarRepos always fills ALTERNATIVES_LIMIT, so topic matches get reserved
// places in the repo page's strip or they would never show.
export const TOPIC_MATCHES_LIMIT = 3;

// Below this a hub is a near-empty list, which reads to search engines as a
// thin page; those languages are listed on /language instead.
export const LANGUAGE_HUB_MIN_REPOS = 5;
export const HUB_GAPS_LIMIT = 3;
export const STRENGTHS_GAPS_VISIBLE_LIMIT = 5;

export const CHECK_EXAMPLES_LIMIT = 12;
export const CHECK_MISSING_LIMIT = 8;

// How many of the most-weighted checks /check and /guide single out.
export const START_WITH_CHECKS = 3;

// "Best agent for <language>" ranks every agent by average; below this many repos one
// repo's setup moves the ranking, so the page would rank noise. /contribute uses
// it too: below it a language's top picks are most of its repos.
export const LANGUAGE_AGENTS_MIN_REPOS = 15;

export const CONTRIBUTE_TOP = 25;
export const CONTRIBUTE_LANGUAGE_TOP = 8;

// Fewer files than this give a median that one repo can swing.
export const SIZE_GROUP_MIN = 8;
export const SIZE_LANGUAGE_LIMIT = 6;

export const GAP_LIST_LIMIT = 5;
export const WEIGHT_GAP_LIMIT = 6;
