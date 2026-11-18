import type { RepoRow } from "@/lib/types/db";
import { type RepoAboutData, repoAbout } from "@/lib/utils/repo-about";

import { type HeroProps, RepoHeroView } from "./RepoHeroView";

/** The repo row is cut to what the hero shows: a client view's props are its payload. */
export function RepoHero({
  repo,
  about,
  ...rest
}: Omit<HeroProps, "repo" | "about"> & {
  repo: RepoRow;
  /** Parsed from `repo` when not passed; the repo page passes the copy it already has. */
  about?: RepoAboutData;
}) {
  const hero = {
    owner: repo.owner,
    name: repo.name,
    host: repo.host,
    url: repo.url,
    stars: repo.stars,
    language: repo.language,
    default_branch: repo.default_branch,
    last_scored_at: repo.last_scored_at,
    overall_score: repo.overall_score,
    previous_overall_score: repo.previous_overall_score,
    badge_embedded: repo.badge_embedded,
  };

  return <RepoHeroView repo={hero} about={about ?? repoAbout(repo)} {...rest} />;
}
