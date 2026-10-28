import { unstable_cache } from "next/cache";
import { HOST_DOMAINS, isHost } from "../constants/hosts";
import { type ParsedRepo, parseRepoUrl } from "../repo-url";
import { TooLargeError } from "./hosts";
import { liveScore } from "./score";

const CACHE_SECONDS = 3600;
// A string, not a symbol: unstable_cache round-trips values through JSON.
const TOO_LARGE = "too-large";

export type LiveTarget = { host: string; owner: string; name: string };

// `?model=` makes the Live Score route dynamic, so the score is cached here
// instead, keyed by lowercased repo (hosts match names case-insensitively) and
// shared by the page, its card and its badge. Throws aren't cached; too-large is
// stable and costly to rediscover, so it is stored as a value and re-thrown.
export async function cachedLiveScore(parsed: ParsedRepo) {
  const key = ["live-score", parsed.host, parsed.owner.toLowerCase(), parsed.name.toLowerCase()];
  const result = await unstable_cache(
    () =>
      liveScore(parsed).catch((err: unknown) => {
        if (err instanceof TooLargeError) return TOO_LARGE;
        throw err;
      }),
    key,
    { revalidate: CACHE_SECONDS },
  )();
  if (typeof result === "string") throw new TooLargeError(parsed.host);
  return result;
}

// Every miss here is a tree-API call and a cold function, and the routes are
// crawler-reachable regardless of robots.txt. GitHub, GitLab and Bitbucket all
// restrict slugs to this alphabet, so anything else is a probe. `.` and `..`
// fit it but would walk the API path upwards.
const SLUG = /^(?!\.+$)[A-Za-z0-9._-]+$/;

export function parseLiveTarget({ host, owner, name }: LiveTarget): ParsedRepo | null {
  if (!isHost(host) || !SLUG.test(owner) || !SLUG.test(name)) return null;
  const parsed = parseRepoUrl(`https://${HOST_DOMAINS[host]}/${owner}/${name}`);
  return parsed && parsed.host === host ? parsed : null;
}
