import type { LeaderboardRow, RepoRow } from "@/lib/types/db";
import { languageSlug } from "@/lib/utils/language";

// Compared by slug because stored casing varies ("C++", "c++").
function sameLanguageAs(language: string | null): (r: LeaderboardRow) => boolean {
  const slug = language ? languageSlug(language) : null;
  return (r) => slug != null && r.language != null && languageSlug(r.language) === slug;
}

function closest(rows: LeaderboardRow[], score: number, limit: number): LeaderboardRow[] {
  return rows
    .map((row, position) => ({ row, position, distance: Math.abs((row.score ?? 0) - score) }))
    .sort((a, b) => a.distance - b.distance || a.position - b.position)
    .slice(0, limit)
    .map((x) => x.row);
}

/**
 * Same language and host first, then same language on any host, then whatever
 * scores closest: a language-and-host match alone left GitLab, Bitbucket and
 * one-of-a-kind repos with an empty strip. Nearest by score within each tier,
 * because the top of a language would make every page link the same few repos.
 * `board` must be in leaderboard order; the result keeps it.
 */
export function similarRepos(repo: LeaderboardRow, board: LeaderboardRow[], limit: number): LeaderboardRow[] {
  const score = repo.score ?? 0;
  const sameLanguage = sameLanguageAs(repo.language);

  const tiers = [
    (r: LeaderboardRow) => sameLanguage(r) && r.host === repo.host,
    (r: LeaderboardRow) => sameLanguage(r),
    () => true,
  ];

  const picked = new Set<number>([repo.id]);
  for (const inTier of tiers) {
    const pool = board.filter((r) => !picked.has(r.id) && inTier(r));
    for (const r of closest(pool, score, limit - (picked.size - 1))) picked.add(r.id);
    if (picked.size - 1 >= limit) break;
  }

  return board.filter((r) => r.id !== repo.id && picked.has(r.id));
}

/**
 * Classified by row rather than replayed from `similarRepos`: the last tier only
 * runs once the same-language pool is used up, so a row's language and host say
 * which tier picked it.
 */
export function similarNote(repo: RepoRow, rows: LeaderboardRow[]): string {
  if (rows.length === 0) return "";
  const same = sameLanguageAs(repo.language);
  const sameHost = rows.some((r) => same(r) && r.host === repo.host);
  const otherHost = rows.some((r) => same(r) && r.host !== repo.host);
  const closest = rows.some((r) => !same(r));

  if (sameHost && !otherHost && !closest) return "Same language and host as this repo, closest in overall score.";
  if (otherHost && !sameHost && !closest) return "Same language as this repo on other hosts, closest in overall score.";
  if (closest && !sameHost && !otherHost) return "The repos closest to it in overall score.";

  const tiers = [
    sameHost && "same language and host",
    otherHost && "same language on other hosts",
    closest && "the repos closest in overall score",
  ].filter((t): t is string => typeof t === "string");

  const [first, ...rest] = tiers;
  const text = `${first} first, then ${rest.join(", then ")}${closest ? "" : ", closest in overall score"}.`;
  return text[0].toUpperCase() + text.slice(1);
}
