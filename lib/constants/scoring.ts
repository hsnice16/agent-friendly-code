export const SCORE_THRESHOLD_MID = 60;
export const SCORE_THRESHOLD_GOOD = 80;

// The board matches on `owner/name`; nothing longer can match, and `q` arrives
// from the URL, so the input's own maxLength is not the boundary.
export const MAX_SEARCH_LENGTH = 120;

// One size for every device: `/?page=N` is a shareable, indexable address,
// so the rows it resolves to must not depend on the user agent.
export const LEADERBOARD_PAGE_SIZE = 32;

export const DEFAULT_SUGGESTION_LIMIT = 3;
export const ALTERNATIVES_LIMIT = 3;
export const STRENGTHS_GAPS_VISIBLE_LIMIT = 5;
