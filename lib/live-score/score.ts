import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { detectBadgeEmbed } from "../badge-adoption";
import { fetchRepoMeta, type ParsedRepo } from "../clients/github";
import type { ModelScore, RepoScore } from "../scoring/scorer";
import { scoreRepo } from "../scoring/scorer";
import { hostToken, resolveCommit } from "./hosts";
import { materialize } from "./materialize";

export type LiveScore = {
  sha: string;
  overall: number;
  language: string | null;
  stars: number | null;
  defaultBranch: string | null;
  badgeEmbedded: boolean;
  signals: RepoScore["signals"];
  modelScores: ModelScore[];
};

/**
 * Score a repo from its host tree API. Nothing is persisted — `lib/db.ts` copies
 * the bundled SQLite to /tmp per lambda instance, so a write here would land on
 * one instance and vanish.
 *
 * Returns null only when the host says the ref does not exist. Everything else
 * throws: the caller renders into an ISR cache, so a swallowed rate limit or
 * network blip would pin "this repo doesn't exist" on a real repo for an hour.
 */
export async function liveScore(parsed: ParsedRepo): Promise<LiveScore | null> {
  const dir = mkdtempSync(join(tmpdir(), "afc-live-"));

  try {
    // Metadata runs alongside the commit lookup, so it costs no extra latency —
    // and on an ISR cache hit it costs no request at all.
    const [meta, sha] = await Promise.all([
      fetchRepoMeta(parsed),
      resolveCommit(parsed.host, parsed.owner, parsed.name, "HEAD", hostToken(parsed.host)),
    ]);

    if (!sha) return null;

    const resolved = await materialize(parsed.host, parsed.owner, parsed.name, sha, dir);

    const result = scoreRepo(dir);

    return {
      sha: resolved.sha,
      overall: result.overall,
      signals: result.signals,
      stars: meta?.stars ?? null,
      modelScores: result.modelScores,
      language: meta?.language ?? null,
      defaultBranch: meta?.defaultBranch ?? null,
      badgeEmbedded: detectBadgeEmbed(dir, `${parsed.host}/${parsed.owner}/${parsed.name}`),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
