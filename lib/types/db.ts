export type RepoRow = {
  id: number;
  url: string;
  host: string;
  name: string;
  owner: string;
  stars: number | null;
  language: string | null;
  overall_score: number | null;
  default_branch: string | null;
  last_scored_at: number | null;
  previous_overall_score: number | null;
};

export type LeaderboardRow = RepoRow & { score: number | null };

export type LeaderboardOptions = {
  dir?: "asc" | "desc";
  sort?: "score" | "stars";
  /** Restrict to a single host — "github" / "gitlab" / "bitbucket". */
  host?: string;
  /** "overall" or a specific model id — determines which score column is returned. */
  model: string;
};

export type TopPackageRow = {
  name: string;
  score: number;
  owner: string;
  repoName: string;
};

export type AlternativeRow = {
  id: number;
  host: string;
  name: string;
  owner: string;
  score: number | null;
  stars: number | null;
};

export type LeaderboardStats = {
  count: number;
  lastScoredAt: number | null;
};
