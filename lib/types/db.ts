import type { Host } from "../constants/hosts";
import type { ModelId } from "../scoring/weights";

export type RepoRow = {
  id: number;
  url: string;
  host: string;
  name: string;
  owner: string;
  stars: number | null;
  language: string | null;
  overall_score: number | null;
  badge_embedded: number | null;
  default_branch: string | null;
  last_scored_at: number | null;
  content_changed_at: number | null;
  previous_overall_score: number | null;
  /** Absent on a DB that predates the column. */
  description?: string | null;
  /** JSON array of strings; absent on a DB that predates the column. */
  topics?: string | null;
};

export type LeaderboardRow = RepoRow & { score: number | null };

export type LeaderboardOptions = {
  dir?: "asc" | "desc";
  sort?: "score" | "stars";
  host?: Host;
  model: ModelId | "overall";
};

export type TopPackageRow = {
  name: string;
  score: number;
  host: string;
  owner: string;
  repoName: string;
};

export type ModelScoreRow = { modelId: string; score: number };

export type AlternativeRow = {
  id: number;
  host: string;
  name: string;
  owner: string;
  score: number | null;
  stars: number | null;
  /** Set when the row may be in another language than the repo it is shown beside. */
  language?: string | null;
};

/** A signal_result row; matched_path is NULL where SignalResult has no matchedPath. */
export type SignalResultRow = { id: string; label: string; pass: number; detail: string; matchedPath: string | null };

export type SignalPassRate = { id: string; label: string; rate: number };

export type SignalFile = { repoId: number; pass: number; detail: string | null; matchedPath: string | null };

export type LeaderboardStats = {
  count: number;
  lastScoredAt: number | null;
  contentChangedAt: number | null;
};

export type RepoName = Pick<RepoRow, "host" | "owner" | "name">;

/** `url` is the canonical form; `was` holds the repo's former names. */
export type SeedTarget = RepoName & { url: string; was: RepoName[] };

export type ScoreTime = { url: string; lastScoredAt: number | null };
