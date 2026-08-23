// Seeds rot silently: repos get archived, renamed, turned into forks, or replaced
// by a mirror of somewhere else. None of that errors during scoring — the score
// just quietly describes the wrong thing. This is the check that catches it.

import { type ParsedRepo, parseRepoUrl } from "../lib/clients/github";
import { SEEDS } from "./seed-list";

try {
  process.loadEnvFile();
} catch {}

type Finding = { url: string; flags: string[] };

const UA = { "User-Agent": "agent-friendly-code" };

// A rejected token would otherwise be reported once per repo. Drop it on the
// first 401 and keep going unauthenticated — slower, but it still answers.
let githubToken = process.env.GITHUB_TOKEN;

function localFindings(): Finding[] {
  const out: Finding[] = [];
  const byCanonical = new Map<string, string[]>();

  for (const s of SEEDS) {
    const flags: string[] = [];
    const p = parseRepoUrl(s.url);

    if (!p) {
      out.push({ url: s.url, flags: ["unparseable"] });
      continue;
    }

    if (!s.url.startsWith("https://")) flags.push("not-https");
    if (s.url.endsWith("/") || s.url.endsWith(".git")) flags.push("non-canonical-url");
    if (!s.note?.trim()) flags.push("missing-note");
    if (flags.length) out.push({ url: s.url, flags });

    const key = `${p.host}/${p.owner.toLowerCase()}/${p.name.toLowerCase()}`;
    byCanonical.set(key, [...(byCanonical.get(key) ?? []), s.url]);
  }

  for (const [key, urls] of byCanonical) {
    if (urls.length > 1) out.push({ url: urls.join(" + "), flags: [`duplicate of ${key}`] });
  }

  return out;
}

async function checkGithub(p: ParsedRepo): Promise<string[] | "rate-limited"> {
  const headers: Record<string, string> = { ...UA, Accept: "application/vnd.github+json" };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

  const res = await fetch(`https://api.github.com/repos/${p.owner}/${p.name}`, { headers });
  if (res.status === 401 && githubToken) {
    console.warn("  ! GITHUB_TOKEN rejected (401) — continuing unauthenticated at 60 req/hr.");
    githubToken = undefined;
    return checkGithub(p);
  }
  // 403 and 429 are both how GitHub says "slow down"; the remaining-header is
  // not always present, so never read them as a repo-level problem.
  if (res.status === 403 || res.status === 429) return "rate-limited";
  if (res.status === 404) return ["missing-or-private"];
  if (!res.ok) return [`http-${res.status}`];

  const j: any = await res.json();
  const flags: string[] = [];
  if (j.fork) flags.push(`fork of ${j.parent?.full_name ?? "?"}`);
  if (j.mirror_url) flags.push(`mirror of ${j.mirror_url}`);
  if (j.archived) flags.push("archived");
  if (j.disabled) flags.push("disabled");
  if (j.private) flags.push("private");
  if ((j.size ?? 0) === 0) flags.push("empty");
  if (/\bmirror\b/i.test(j.description ?? "")) flags.push("description-says-mirror");
  // GitHub redirects renamed repos, so the seed URL can drift from the real one.
  const want = `${p.owner}/${p.name}`.toLowerCase();
  if (j.full_name && j.full_name.toLowerCase() !== want) flags.push(`renamed to ${j.full_name}`);
  return flags;
}

async function checkGitlab(p: ParsedRepo): Promise<string[]> {
  const headers: Record<string, string> = { ...UA };
  if (process.env.GITLAB_TOKEN) headers["PRIVATE-TOKEN"] = process.env.GITLAB_TOKEN;

  const slug = encodeURIComponent(`${p.owner}/${p.name}`);
  const res = await fetch(`https://gitlab.com/api/v4/projects/${slug}`, { headers });
  if (!res.ok) return [res.status === 404 ? "missing-or-private" : `http-${res.status}`];

  const j: any = await res.json();
  const flags: string[] = [];
  if (j.forked_from_project) flags.push(`fork of ${j.forked_from_project.path_with_namespace}`);
  if (j.archived) flags.push("archived");
  if (j.visibility !== "public") flags.push(`visibility=${j.visibility}`);
  if (j.empty_repo) flags.push("empty");
  if (/\bmirror\b/i.test(j.description ?? "")) flags.push("description-says-mirror");
  return flags;
}

async function checkBitbucket(p: ParsedRepo): Promise<string[]> {
  const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${p.owner}/${p.name}`, { headers: UA });
  if (!res.ok) return [res.status === 404 ? "missing-or-private" : `http-${res.status}`];

  const j: any = await res.json();
  const flags: string[] = [];
  if (j.is_private) flags.push("private");
  if (j.parent) flags.push(`fork of ${j.parent.full_name}`);
  if (/\bmirror\b/i.test(j.description ?? "")) flags.push("description-says-mirror");
  return flags;
}

async function main(): Promise<void> {
  const findings = localFindings();
  console.log(`Local checks — ${SEEDS.length} seeds, ${findings.length} finding(s).`);
  for (const f of findings) console.log(`  ✗ ${f.url} — ${f.flags.join(", ")}`);

  let checked = 0;
  let skipped = 0;
  let githubExhausted = false;
  const remote: Finding[] = [];

  for (const s of SEEDS) {
    const p = parseRepoUrl(s.url);
    if (!p) continue;

    // Once the budget is gone every further call is a guaranteed miss; stop
    // spending them so the run still finishes and reports what it did cover.
    if (p.host === "github" && githubExhausted) {
      skipped++;
      continue;
    }

    let flags: string[] | "rate-limited" = [];
    if (p.host === "github") flags = await checkGithub(p);
    else if (p.host === "gitlab") flags = await checkGitlab(p);
    else if (p.host === "bitbucket") flags = await checkBitbucket(p);

    if (flags === "rate-limited") {
      githubExhausted = true;
      skipped++;
      continue;
    }

    checked++;
    if (flags.length) remote.push({ url: s.url, flags });
  }

  console.log(`\nRemote checks — ${checked} checked, ${skipped} skipped (rate limit), ${remote.length} finding(s).`);
  for (const f of remote) console.log(`  ✗ ${f.url}\n      ${f.flags.join("; ")}`);

  if (skipped > 0) {
    console.log(`\n${skipped} repo(s) unchecked — set a valid GITHUB_TOKEN in .env and re-run.`);
  }

  process.exit(findings.length + remote.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
