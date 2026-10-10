// Seeds rot silently: repos get archived, renamed, turned into forks, or replaced
// by a mirror of somewhere else. None of that errors during scoring — the score
// just quietly describes the wrong thing. This is the check that catches it.

import { writeFileSync } from "node:fs";

import { type ParsedRepo, parseRepoUrl } from "../lib/clients/github";
import { listScoreTimes } from "../lib/db";
import {
  bitbucketFlags,
  type Finding,
  type Flag,
  formatFinding,
  freshnessFindings,
  githubFlags,
  gitlabFlags,
  localFindings,
  partitionAccepted,
} from "../lib/seeds";
import { SEEDS } from "./seed-list";

try {
  process.loadEnvFile();
} catch {}

const UA = { "User-Agent": "agent-friendly-code" };

// A rejected token would otherwise be reported once per repo. Drop it on the
// first 401 and keep going unauthenticated — slower, but it still answers.
let githubToken = process.env.GITHUB_TOKEN;

async function body(res: Response): Promise<unknown> {
  return res.ok ? res.json() : null;
}

async function checkGithub(p: ParsedRepo): Promise<Flag[] | "rate-limited"> {
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

  return githubFlags(p, res.status, await body(res));
}

async function checkGitlab(p: ParsedRepo): Promise<Flag[]> {
  const headers: Record<string, string> = { ...UA };
  if (process.env.GITLAB_TOKEN) headers["PRIVATE-TOKEN"] = process.env.GITLAB_TOKEN;

  const slug = encodeURIComponent(`${p.owner}/${p.name}`);
  const res = await fetch(`https://gitlab.com/api/v4/projects/${slug}`, { headers });
  return gitlabFlags(p, res.status, await body(res));
}

async function checkBitbucket(p: ParsedRepo): Promise<Flag[]> {
  const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${p.owner}/${p.name}`, { headers: UA });
  return bitbucketFlags(p, res.status, await body(res));
}

async function remoteFindings(): Promise<{ findings: Finding[]; checked: number; skipped: number }> {
  const findings: Finding[] = [];
  let checked = 0;
  let skipped = 0;
  let githubExhausted = false;

  for (const s of SEEDS) {
    const p = parseRepoUrl(s.url);
    if (!p) continue;

    // Once the budget is gone every further call is a guaranteed miss; stop
    // spending them so the run still finishes and reports what it did cover.
    if (p.host === "github" && githubExhausted) {
      skipped++;
      continue;
    }

    let flags: Flag[] | "rate-limited" = [];
    if (p.host === "github") flags = await checkGithub(p);
    else if (p.host === "gitlab") flags = await checkGitlab(p);
    else if (p.host === "bitbucket") flags = await checkBitbucket(p);

    if (flags === "rate-limited") {
      githubExhausted = true;
      skipped++;
      continue;
    }

    checked++;
    findings.push(...flags.map((f) => ({ url: s.url, ...f })));
  }

  return { findings, checked, skipped };
}

function report(open: Finding[], accepted: Finding[], skipped: number): string {
  const lines = [
    `${open.length} seed finding(s) need a decision. For each: fix the entry in \`scripts/seed-list.ts\` (a rename keeps the old URL in \`was\`), remove the seed, or add the finding's kind to the seed's \`accept\`. CONTRIBUTING.md has the steps.`,
    "",
    ...open.map((f) => `- [ ] ${formatFinding(f)}`),
  ];

  if (accepted.length > 0)
    lines.push("", "Accepted in the seed list:", "", ...accepted.map((f) => `- ${formatFinding(f)}`));
  if (skipped > 0) lines.push("", `${skipped} repo(s) were not checked — the host API rate limit ran out.`);

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const reportAt = process.argv.indexOf("--report");
  const reportPath = reportAt > -1 ? process.argv[reportAt + 1] : undefined;

  const local = [...localFindings(SEEDS), ...freshnessFindings(SEEDS, listScoreTimes(), Math.floor(Date.now() / 1000))];
  const remote = await remoteFindings();
  const { open, accepted } = partitionAccepted(SEEDS, [...local, ...remote.findings]);

  console.log(`${SEEDS.length} seeds — ${remote.checked} checked remotely, ${remote.skipped} skipped (rate limit).`);
  console.log(`\n${open.length} finding(s):`);
  for (const f of open) console.log(`  ✗ ${formatFinding(f)}`);

  if (accepted.length > 0) {
    console.log(`\n${accepted.length} accepted:`);
    for (const f of accepted) console.log(`  · ${formatFinding(f)}`);
  }

  if (remote.skipped > 0) {
    console.log(`\n${remote.skipped} repo(s) unchecked — set a valid GITHUB_TOKEN in .env and re-run.`);
  }

  if (reportPath) writeFileSync(reportPath, report(open, accepted, remote.skipped));

  // A partial run proves nothing: exiting 0 would close the issue as clean, and
  // exiting 1 would overwrite it with a shorter list.
  if (remote.skipped > 0) process.exit(2);

  process.exit(open.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  // Distinct from "findings": the workflow must not file an issue for a crash.
  process.exit(2);
});
