import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { detectBadgeEmbed } from "../badge-adoption";
import { fetchRepoMetaOrPrivate, type ParsedRepo } from "../clients/github";
import type { ModelScore, RepoScore } from "../scoring/scorer";
import { scoreRepo } from "../scoring/scorer";
import { hostToken, resolveCommit } from "./hosts";
import { materialize } from "./materialize";

// Under the route's 60s maxDuration, so a slow tree fails into the retry page.
const DEADLINE_MS = 50_000;

type LiveScore = {
  sha: string;
  overall: number;
  language: string | null;
  stars: number | null;
  defaultBranch: string | null;
  description: string | null;
  topics: string[];
  badgeEmbedded: boolean;
  signals: RepoScore["signals"];
  modelScores: ModelScore[];
};

/**
 * Score a repo from its host tree API. Nothing is persisted — `lib/db-connection.ts` copies
 * the bundled SQLite to /tmp per lambda instance, so a write here would land on
 * one instance and vanish.
 *
 * Returns null when the host says the ref does not exist, or that the repo is
 * private: a token with private access must not publish its repos. Everything else
 * throws: the caller caches the result for an hour, so a swallowed rate limit or
 * network blip would pin "this repo doesn't exist" on a real repo for an hour.
 */
export async function liveScore(parsed: ParsedRepo): Promise<LiveScore | null> {
  const dir = mkdtempSync(join(tmpdir(), "afc-live-"));
  const deadline = AbortSignal.timeout(DEADLINE_MS);

  try {
    // Alongside the commit lookup, so it adds no latency.
    const [meta, sha] = await Promise.all([
      fetchRepoMetaOrPrivate(parsed),
      resolveCommit(parsed.host, parsed.owner, parsed.name, "HEAD", hostToken(parsed.host), deadline),
    ]);

    if (!sha || meta === "private") return null;
    // Unknown visibility is not public: throw, so it isn't cached as missing.
    if (!meta) throw new Error(`Could not confirm ${parsed.owner}/${parsed.name} is public`);

    const resolved = await materialize(parsed.host, parsed.owner, parsed.name, sha, dir, deadline);

    const result = scoreRepo(dir);

    return {
      sha: resolved.sha,
      overall: result.overall,
      signals: result.signals,
      stars: meta.stars ?? null,
      modelScores: result.modelScores,
      language: meta.language ?? null,
      defaultBranch: meta.defaultBranch ?? null,
      description: meta.description,
      topics: meta.topics,
      badgeEmbedded: detectBadgeEmbed(dir, `${parsed.host}/${parsed.owner}/${parsed.name}`),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
