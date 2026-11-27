// Reads each board repo's AGENTS.md / CLAUDE.md at the commit its branch was
// on when the board last scored it, and keeps only what lib/agents-md-contents
// derives from it: rank.db stores no file contents and no commit. Repo
// contents are untrusted: they are read as text and nothing is executed.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { analyzeAgentsMd, claudeMdRelation, type FileAnatomy } from "../lib/agents-md-contents";
import {
  type ContentsQuote,
  type ContentsRepo,
  pickQuotes,
  type QuoteCandidate,
} from "../lib/agents-md-contents-report";
import { type InstructionFileRow, readInstructionFiles } from "../lib/db-snapshot";
import { MAX_READ_BYTES } from "../lib/scoring/signals/helpers";
import { fileLength, hasAgentFile } from "../lib/utils/agent-instructions";

try {
  process.loadEnvFile();
} catch {}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is required: two API reads per GitHub repo exceed the 60/hr anonymous limit.");
  process.exit(1);
}

const DB = process.env.RANK_DB_PATH ?? "data/rank.db";
const OUT = "data/agents-md-contents.json";
const cacheArg = process.argv.indexOf("--cache");
const CACHE = cacheArg > -1 ? process.argv[cacheArg + 1] : undefined;
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Number.POSITIVE_INFINITY;
// A NaN limit slices to nothing, and the run would overwrite OUT with no repos.
if (!(LIMIT > 0)) {
  console.error("--limit needs a positive number");
  process.exit(1);
}

// Sequential with a pause: a by-hand run has no deadline, and GitHub's secondary limits punish bursts.
const DELAY_MS = 250;
const MAX_ATTEMPTS = 5;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string, headers: Record<string, string> = {}): Promise<Response | null> {
  for (let attempt = 1; ; attempt++) {
    await sleep(DELAY_MS);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "agent-friendly-code", ...headers },
        signal: AbortSignal.timeout(60_000),
      });
      if (res.status === 404) return null;
      const retry = res.status === 429 || res.status === 403 || res.status >= 500;
      if (!retry || attempt >= MAX_ATTEMPTS) {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
        return res;
      }
      const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
      const wait = res.headers.get("x-ratelimit-remaining") === "0" && reset ? reset - Date.now() + 1000 : 0;
      await sleep(Math.max(wait, Number(res.headers.get("retry-after")) * 1000 || 0, 2 ** attempt * 1000));
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) throw err;
      await sleep(2 ** attempt * 1000);
    }
  }
}

const GH_API = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

// API answers are cached too: the commit before a fixed time and that commit's tree never change.
async function json<T>(url: string, headers?: Record<string, string>): Promise<T | null> {
  const file = CACHE ? join(CACHE, `api_${url.replace(/^https:\/\//, "").replace(/[^\w.-]+/g, "_")}.json`) : null;
  if (file) {
    try {
      return JSON.parse(readFileSync(file, "utf8")) as T;
    } catch {}
  }
  const res = await get(url, headers);
  const body = res ? ((await res.json()) as T) : null;
  if (file && body != null) writeFileSync(file, JSON.stringify(body));
  return body;
}

async function text(url: string, cacheKey: string): Promise<string | null> {
  const file = CACHE ? join(CACHE, cacheKey.replace(/[^\w.-]+/g, "_")) : null;
  if (file) {
    try {
      return readFileSync(file, "utf8");
    } catch {}
  }
  const res = await get(url);
  if (!res) return null;
  const body = Buffer.from(await res.arrayBuffer())
    .subarray(0, MAX_READ_BYTES)
    .toString("utf8");
  if (file) writeFileSync(file, body);
  return body;
}

type Entry = { name: string; link: boolean };

type Host = {
  commit(r: InstructionFileRow, until: string): Promise<string | null>;
  root(r: InstructionFileRow, sha: string): Promise<Entry[]>;
  raw(r: InstructionFileRow, sha: string, path: string): Promise<string | null>;
};

const enc = (path: string) => path.split("/").map(encodeURIComponent).join("/");

const github: Host = {
  async commit(r, until) {
    const ref = r.branch ? `&sha=${encodeURIComponent(r.branch)}` : "";
    const list = await json<{ sha: string }[]>(
      `https://api.github.com/repos/${r.owner}/${r.name}/commits?per_page=1&until=${until}${ref}`,
      GH_API,
    );
    return list?.[0]?.sha ?? null;
  },
  async root(r, sha) {
    const t = await json<{ tree: { path: string; mode: string }[] }>(
      `https://api.github.com/repos/${r.owner}/${r.name}/git/trees/${sha}`,
      GH_API,
    );
    return (t?.tree ?? []).map((e) => ({ name: e.path, link: e.mode === "120000" }));
  },
  raw: (r, sha, path) =>
    text(
      `https://raw.githubusercontent.com/${r.owner}/${r.name}/${sha}/${enc(path)}`,
      `github/${r.owner}/${r.name}/${sha}/${path}`,
    ),
};

const glProject = (r: InstructionFileRow) =>
  `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${r.owner}/${r.name}`)}/repository`;

const gitlab: Host = {
  async commit(r, until) {
    const ref = r.branch ? `&ref_name=${encodeURIComponent(r.branch)}` : "";
    const list = await json<{ id: string }[]>(`${glProject(r)}/commits?per_page=1&until=${until}${ref}`);
    return list?.[0]?.id ?? null;
  },
  async root(r, sha) {
    const t = await json<{ name: string; mode: string }[]>(`${glProject(r)}/tree?per_page=100&ref=${sha}`);
    return (t ?? []).map((e) => ({ name: e.name, link: e.mode === "120000" }));
  },
  raw: (r, sha, path) =>
    text(
      `${glProject(r)}/files/${encodeURIComponent(path)}/raw?ref=${sha}`,
      `gitlab/${r.owner}/${r.name}/${sha}/${path}`,
    ),
};

const HOSTS: Record<string, Host> = { github, gitlab };

/** A root symlink's target, kept inside the tree; null for one that leaves it. */
function inTree(target: string): string | null {
  if (target.trim().startsWith("/")) return null;
  const parts: string[] = [];
  for (const p of target.trim().split("/")) {
    if (p === "" || p === ".") continue;
    if (p === "..") {
      if (!parts.pop()) return null;
    } else parts.push(p);
  }
  return parts.length ? parts.join("/") : null;
}

type Read = { row: ContentsRepo; anatomy: FileAnatomy | null; url: string; stars: number | null };

async function read(r: InstructionFileRow): Promise<Read> {
  const base: ContentsRepo = {
    host: r.host,
    owner: r.owner,
    name: r.name,
    path: r.path,
    sha: null,
    scoredChars: null,
    linkTarget: null,
    claudeMd: null,
  };
  const out = (row: ContentsRepo, anatomy: FileAnatomy | null = null): Read => ({
    row,
    anatomy,
    url: r.url,
    stars: r.stars,
  });
  const host = HOSTS[r.host];
  if (!host || r.scoredAt == null) return out({ ...base, error: `unsupported host ${r.host}` });

  try {
    const sha = await host.commit(r, new Date(r.scoredAt * 1000).toISOString());
    if (!sha) return out({ ...base, error: "no commit found (repo or branch gone, or none before the scoring time)" });
    const entries = r.path.includes("/") ? [] : await host.root(r, sha);
    const entry = (name: string) => entries.find((e) => e.name.toLowerCase() === name.toLowerCase());

    let path = r.path;
    let linkTarget: string | null = null;
    if (entry(r.path)?.link) {
      linkTarget = ((await host.raw(r, sha, r.path)) ?? "").trim();
      const resolved = inTree(linkTarget);
      if (!resolved) return out({ ...base, sha, linkTarget, error: "symlink leaves the tree" });
      path = resolved;
    }
    const body = await host.raw(r, sha, path);
    if (body == null) return out({ ...base, sha, linkTarget, error: "file not found at commit" });

    let claudeMd: ContentsRepo["claudeMd"] = null;
    if (r.path.toLowerCase() === "agents.md") {
      const c = entry("CLAUDE.md");
      const raw = c ? await host.raw(r, sha, c.name) : null;
      claudeMd = claudeMdRelation(c ? { link: c.link ? raw : null, text: c.link ? null : raw } : null);
    }
    const anatomy = analyzeAgentsMd(body, r.path);
    const { quotes: _, ...fields } = anatomy;
    return out({ ...base, sha, linkTarget, claudeMd, ...fields }, anatomy);
  } catch (err) {
    return out({ ...base, error: String(err instanceof Error ? err.message : err) });
  }
}

async function main() {
  if (CACHE) mkdirSync(CACHE, { recursive: true });
  const rows = readInstructionFiles(DB)
    .filter((r) => hasAgentFile({ pass: r.pass, matchedPath: r.path }))
    .slice(0, LIMIT);
  const reads: Read[] = [];
  for (const [i, r] of rows.entries()) {
    const res = await read(r);
    res.row.scoredChars = fileLength(r.detail);
    reads.push(res);
    console.error(
      `[${i + 1}/${rows.length}] ${r.host}/${r.owner}/${r.name}${res.row.error ? ` ${res.row.error}` : ""}`,
    );
  }

  const candidates: QuoteCandidate[] = reads.flatMap(({ row, anatomy, url, stars }) =>
    anatomy && row.sha
      ? Object.entries(anatomy.quotes).map(([kind, q]) => ({
          kind: kind as ContentsQuote["kind"],
          repo: `${row.owner}/${row.name}`,
          url,
          path: row.linkTarget ? (inTree(row.linkTarget) ?? row.path) : row.path,
          sha: row.sha as string,
          stars,
          ...q,
        }))
      : [],
  );

  // One repo per line keeps the file small and its diffs readable.
  const json = `{"generatedAt":${JSON.stringify(new Date().toISOString())},"quotes":${JSON.stringify(
    pickQuotes(candidates),
  )},"repos":[\n${reads.map((r) => JSON.stringify(r.row)).join(",\n")}\n]}\n`;
  writeFileSync(OUT, json);
  const failed = reads.filter((r) => r.row.error);
  console.log(`${reads.length - failed.length} of ${reads.length} files read; wrote ${OUT}`);
  for (const f of failed) console.log(`  ${f.row.owner}/${f.row.name}: ${f.row.error}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
