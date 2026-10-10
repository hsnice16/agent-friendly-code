import { type ParsedRepo, parseRepoUrl } from "./clients/github";
import type { RepoName, ScoreTime, SeedTarget } from "./types/db";

export const FINDING_KINDS = [
  "unparseable",
  "not-https",
  "non-canonical-url",
  "missing-note",
  "duplicate",
  "bad-was",
  "missing-or-private",
  "renamed",
  "fork",
  "mirror",
  "archived",
  "disabled",
  "private",
  "empty",
  "http-error",
  "unscored",
  "stale-score",
  "rescore-stalled",
] as const;

export type FindingKind = (typeof FINDING_KINDS)[number];

export type Flag = { kind: FindingKind; detail?: string };
export type Finding = Flag & { url: string };

export type Seed = {
  url: string;
  note?: string;
  /** URLs this repo was seeded under before a rename or transfer. Its old pages and badges resolve through these. */
  was?: string[];
  /** Audit findings that are known and intended for this seed, e.g. an archived repo kept on purpose. */
  accept?: FindingKind[];
};

export const STALE_AFTER_SECONDS = 7 * 24 * 60 * 60;

const key = (p: RepoName): string => `${p.host}/${p.owner}/${p.name}`.toLowerCase();

/**
 * Throws rather than skipping a bad entry: the result decides which rows the
 * seed run deletes, and a seed that silently drops out is a deleted repo.
 */
export function seedTargets(seeds: Seed[]): SeedTarget[] {
  const bad = localFindings(seeds).filter((f) => ["unparseable", "duplicate", "bad-was"].includes(f.kind));
  if (seeds.length === 0 || bad.length > 0) {
    throw new Error(
      `seed list is unusable: ${bad.map((f) => `${f.url} (${f.detail ?? f.kind})`).join("; ") || "no seeds"}`,
    );
  }

  return seeds.map((s) => {
    const p = parseRepoUrl(s.url) as ParsedRepo;
    const was = (s.was ?? []).map((w) => parseRepoUrl(w) as ParsedRepo);

    return { url: p.canonicalUrl, host: p.host, owner: p.owner, name: p.name, was };
  });
}

export function localFindings(seeds: Seed[]): Finding[] {
  const out: Finding[] = [];
  const seen = new Map<string, string>();

  for (const s of seeds) {
    const p = parseRepoUrl(s.url);
    if (!p) {
      out.push({ url: s.url, kind: "unparseable" });
      continue;
    }

    if (!s.url.startsWith("https://")) out.push({ url: s.url, kind: "not-https" });
    if (s.url.endsWith("/") || s.url.endsWith(".git")) out.push({ url: s.url, kind: "non-canonical-url" });
    if (!s.note?.trim()) out.push({ url: s.url, kind: "missing-note" });

    const first = seen.get(key(p));
    if (first) out.push({ url: s.url, kind: "duplicate", detail: `same repo as ${first}` });
    else seen.set(key(p), s.url);
  }

  // A former name that is also a current seed would redirect one live repo to another.
  for (const s of seeds) {
    for (const w of s.was ?? []) {
      const p = parseRepoUrl(w);
      const owner = p && seen.get(key(p));

      if (!p) out.push({ url: s.url, kind: "bad-was", detail: `unparseable former URL ${w}` });
      else if (owner) out.push({ url: s.url, kind: "bad-was", detail: `former URL ${w} is the seed ${owner}` });
      else seen.set(key(p), s.url);
    }
  }

  return out;
}

const saysMirror = (description: unknown): boolean => /\bmirror\b/i.test(String(description ?? ""));

function unreachable(status: number): Flag[] {
  return [status === 404 ? { kind: "missing-or-private" } : { kind: "http-error", detail: `HTTP ${status}` }];
}

// Hosts redirect a renamed repo, so the API answers 200 under the old name; the
// name it reports back is the only sign the seed URL has drifted.
function renamed(p: RepoName, actual: unknown): Flag[] {
  return typeof actual === "string" && actual.toLowerCase() !== `${p.owner}/${p.name}`.toLowerCase()
    ? [{ kind: "renamed", detail: `now ${actual}` }]
    : [];
}

export function githubFlags(p: RepoName, status: number, j: any): Flag[] {
  if (status !== 200) return unreachable(status);

  const flags: Flag[] = renamed(p, j.full_name);
  if (j.fork) flags.push({ kind: "fork", detail: `of ${j.parent?.full_name ?? "?"}` });
  if (j.mirror_url) flags.push({ kind: "mirror", detail: `of ${j.mirror_url}` });
  else if (saysMirror(j.description)) flags.push({ kind: "mirror", detail: "description says mirror" });
  if (j.archived) flags.push({ kind: "archived" });
  if (j.disabled) flags.push({ kind: "disabled" });
  if (j.private) flags.push({ kind: "private" });
  if ((j.size ?? 0) === 0) flags.push({ kind: "empty" });
  return flags;
}

export function gitlabFlags(p: RepoName, status: number, j: any): Flag[] {
  if (status !== 200) return unreachable(status);

  const flags: Flag[] = renamed(p, j.path_with_namespace);
  if (j.forked_from_project) flags.push({ kind: "fork", detail: `of ${j.forked_from_project.path_with_namespace}` });
  if (saysMirror(j.description)) flags.push({ kind: "mirror", detail: "description says mirror" });
  if (j.archived) flags.push({ kind: "archived" });
  if (j.visibility !== "public") flags.push({ kind: "private", detail: `visibility=${j.visibility}` });
  if (j.empty_repo) flags.push({ kind: "empty" });
  return flags;
}

export function bitbucketFlags(p: RepoName, status: number, j: any): Flag[] {
  if (status !== 200) return unreachable(status);

  const flags: Flag[] = renamed(p, j.full_name);
  if (j.parent) flags.push({ kind: "fork", detail: `of ${j.parent.full_name}` });
  if (saysMirror(j.description)) flags.push({ kind: "mirror", detail: "description says mirror" });
  if (j.is_private) flags.push({ kind: "private" });
  return flags;
}

/**
 * Seeds the rescore is no longer refreshing. Age is measured against the
 * freshest row, not the clock: the workflow skips the commit when nothing but
 * timestamps changed, so a quiet week ages every row without anything being wrong.
 */
export function freshnessFindings(seeds: Seed[], rows: ScoreTime[], now: number): Finding[] {
  const scored = new Map<string, number | null>();
  for (const r of rows) {
    const p = parseRepoUrl(r.url);
    if (p) scored.set(key(p), r.lastScoredAt);
  }

  const newest = Math.max(0, ...rows.map((r) => r.lastScoredAt ?? 0));
  const out: Finding[] = [];
  const days = (seconds: number) => Math.floor(seconds / 86400);

  if (rows.length > 0 && now - newest > STALE_AFTER_SECONDS) {
    out.push({ url: "data/rank.db", kind: "rescore-stalled", detail: `no row scored in ${days(now - newest)} days` });
  }

  for (const s of seeds) {
    const names = [s.url, ...(s.was ?? [])].map(parseRepoUrl).filter((p): p is ParsedRepo => p !== null);
    const hit = names.find((p) => scored.has(key(p)));

    if (!hit) {
      out.push({ url: s.url, kind: "unscored", detail: "no row in data/rank.db" });
      continue;
    }

    const at = scored.get(key(hit)) ?? 0;
    if (newest - at > STALE_AFTER_SECONDS) {
      out.push({
        url: s.url,
        kind: "stale-score",
        detail: `last scored ${days(newest - at)} days before the newest row`,
      });
    }
  }

  return out;
}

export function partitionAccepted(seeds: Seed[], findings: Finding[]): { open: Finding[]; accepted: Finding[] } {
  const accepts = new Map(seeds.map((s) => [s.url, s.accept ?? []]));
  const open: Finding[] = [];
  const accepted: Finding[] = [];

  for (const f of findings) {
    (accepts.get(f.url)?.includes(f.kind) ? accepted : open).push(f);
  }

  return { open, accepted };
}

export function formatFinding(f: Finding): string {
  return `${f.url} — ${f.kind}${f.detail ? ` (${f.detail})` : ""}`;
}
