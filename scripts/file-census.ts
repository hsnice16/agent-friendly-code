// The board stores one matched path per signal; this records every agent-file
// path in each repo's full tree, which a shallow scoring clone can't answer
// cheaply. Repo contents are untrusted: only API JSON and size-capped blobs
// are read, nothing is checked out.

import { writeFileSync } from "node:fs";

import { type BoardRepo, readBoardRepos } from "../lib/db-snapshot";
import { type CensusRepo, summarizeCensus } from "../lib/file-census-summary";

try {
  process.loadEnvFile();
} catch {}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is required: ~400 tree reads exceed the 60/hr anonymous limit.");
  process.exit(1);
}

const DB = process.env.RANK_DB_PATH ?? "data/rank.db";
const OUT = "data/file-census.json";
const summaryArg = process.argv.indexOf("--summary");
const SUMMARY_FILE = summaryArg > -1 ? process.argv[summaryArg + 1] : undefined;

// GitHub asks integrators to avoid concurrent bursts; secondary limits trip well below the hourly quota.
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 6;
const LINK_MAX = 1024;
const CLAUDE_MD_MAX = 64 * 1024;
const POLICY_MAX = 200 * 1024;

type TreeEntry = { path: string; mode: string; type: string; sha: string; size?: number };

// Fields here and not in CensusRepo are written for the record; no page reads them.
type Census = CensusRepo & {
  branch: string | null;
  conventionsMd: boolean;
  aiPolicy: null | { path: string; heading: string | null };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

async function gh(path: string, accept = "application/vnd.github+json"): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`https://api.github.com${path}`, {
        headers: {
          "User-Agent": "agent-friendly-code",
          Accept: accept,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(60_000),
      });
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) throw err;
      await sleep(2 ** attempt * 1000);
      continue;
    }
    if (res.headers.get("x-ratelimit-remaining") === "0" && res.ok) {
      await waitForReset(res);
      return res;
    }
    const limited = res.status === 429 || (res.status === 403 && (await isRateLimited(res.clone())));
    if ((limited || res.status >= 500) && attempt < MAX_ATTEMPTS) {
      const retryAfter = Number(res.headers.get("retry-after"));
      if (retryAfter > 0) await sleep(retryAfter * 1000);
      else if (res.headers.get("x-ratelimit-remaining") === "0") await waitForReset(res);
      else await sleep((limited ? 60 : 2 ** attempt) * 1000);
      continue;
    }
    return res;
  }
}

async function isRateLimited(res: Response): Promise<boolean> {
  if (res.headers.get("x-ratelimit-remaining") === "0" || res.headers.get("retry-after")) return true;
  return /rate limit/i.test(await res.text());
}

async function waitForReset(res: Response) {
  const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
  const ms = Math.max(0, reset - Date.now()) + 1000;
  console.warn(`  rate limit exhausted; waiting ${Math.round(ms / 1000)}s`);
  await sleep(ms);
}

async function blob(repo: BoardRepo, entry: TreeEntry, max: number): Promise<string | null> {
  if ((entry.size ?? 0) > max) return null;
  const res = await gh(`/repos/${repo.owner}/${repo.name}/git/blobs/${entry.sha}`, "application/vnd.github.raw");
  if (!res.ok) return null;
  return (await res.text()).slice(0, max);
}

async function tree(repo: BoardRepo): Promise<{ entries: TreeEntry[]; truncated: boolean }> {
  const ref = encodeURIComponent(repo.branch ?? "HEAD");
  const res = await gh(`/repos/${repo.owner}/${repo.name}/git/trees/${ref}?recursive=1`);
  if (!res.ok) throw new HttpError(res.status);
  const body = (await res.json()) as { tree?: TreeEntry[]; truncated?: boolean };
  return { entries: (body.tree ?? []).filter((e) => e.type === "blob"), truncated: !!body.truncated };
}

const lower = (p: string) => p.toLowerCase();
const base = (p: string) => lower(p.slice(p.lastIndexOf("/") + 1));
const dir = (p: string) => lower(p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "");
const isLink = (e: TreeEntry) => e.mode === "120000";

const LINK_PATHS: Record<string, string> = {
  "claude.md": "CLAUDE.md",
  "agents.md": "AGENTS.md",
  "gemini.md": "GEMINI.md",
  ".claude/claude.md": ".claude/CLAUDE.md",
};

const IMPORTS_AGENTS_MD = /^@(\.\/)?agents\.md\b/i;

const POLICY_FILE = /^ai[-_ ]?(policy|usage|contributions?)\.md$|llm[-_]?policy.*\.md$/i;
const CONTRIBUTING_FILE = /^contributing\.(md|markdown)$/i;
const CONTRIBUTING_DIRS = new Set(["", ".github", "docs"]);

// Bare "AI", "Cursor", "Claude" stay case-sensitive: lowercase "cursor" is a UI term in half the board.
const AI_TERM_STRICT = /\b(AI|A\.I\.|LLMs?|GenAI|Gen-AI|Copilot|ChatGPT|Claude|Cursor)\b/;
const AI_TERM_LOOSE =
  /\b(large language models?|generative (ai|models?|tools?)|gen-?ai|machine[- ]generated|ai[- ](assisted|generated|tools?)|coding agents?|llms?)\b/i;
const CONTRIBUTION_TERM =
  /\b(contribut\w*|pull requests?|submi\w*|patch(es)?|disclos\w*|generated|assist\w*)\b|\bPRs?\b/i;
// Without a usage cue, "AI" + "contribute" is mostly an AI product's "contributing a new provider" section.
const USAGE_CUE =
  /generat|assist|written|writ(e|ing) (code|it)|author|produc|\btools?\b|disclos|polic|use of|\busing\b|\busage\b|slop|hallucinat/i;

const mentionsAi = (s: string) => AI_TERM_STRICT.test(s) || AI_TERM_LOOSE.test(s);
// Comments are cut by hand: `<!--[\s\S]*?-->` rescans to the end for every
// unclosed `<!--`, quadratic on a hostile file.
function stripComments(s: string): string {
  let out = "";
  let at = 0;
  for (let open = s.indexOf("<!--"); open >= 0; open = s.indexOf("<!--", at)) {
    const close = s.indexOf("-->", open + 4);
    if (close < 0) break;
    out += `${s.slice(at, open)} `;
    at = close + 3;
  }
  return out + s.slice(at);
}

const collapse = (s: string) => stripComments(s).replace(/\s+/g, " ").trim();

// Closing `#`s are stripped by hand: `(.*?)\s*#*\s*$`, the obvious pattern,
// backtracks quadratically on a hostile line. Null where that pattern's `.`
// would have hit a line terminator.
function headingText(raw: string): string | null {
  const t = raw.trimEnd();
  let i = t.length;
  while (i > 0 && t[i - 1] === "#") i--;
  const text = t.slice(0, i).trimEnd();
  return /[\r\u2028\u2029]/.test(text) ? null : text;
}

type Section = { heading: string | null; level: number; start: number; ownEnd: number; end: number };

function sections(lines: string[]): Section[] {
  const heads: { heading: string | null; level: number; line: number }[] = [{ heading: null, level: 0, line: -1 }];
  let fence: string | null = null;
  lines.forEach((line, i) => {
    const f = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      return;
    }
    if (fence) return;
    const h = line.match(/^\s{0,3}(#{1,6})\s+([\s\S]*)$/);
    const heading = h && headingText(h[2]);
    if (h && heading != null) heads.push({ heading, level: h[1].length, line: i });
  });
  return heads.map((h, k) => {
    const next = heads[k + 1];
    let c = k + 1;
    while (c < heads.length && heads[c].level > h.level) c++;
    const closer = heads[c];
    return {
      heading: h.heading,
      level: h.level,
      start: h.line + 1,
      ownEnd: next ? next.line : lines.length,
      end: closer && h.level > 0 ? closer.line : lines.length,
    };
  });
}

const paragraphs = (lines: string[]) =>
  lines
    .join("\n")
    .split(/\n\s*\n/)
    .map(collapse)
    .filter(Boolean);

function aiSection(text: string): { heading: string | null } | null {
  const lines = text.split(/\r?\n/);
  for (const s of sections(lines)) {
    const heading = s.heading ? collapse(s.heading) : null;
    const headingAi = heading ? mentionsAi(heading) : false;
    const own = paragraphs(lines.slice(s.start, s.ownEnd));
    const hit = own.some((para) => {
      // A table of contents links to the AI section without being it.
      // Each class stops at the next opener, so a run of `[` can't backtrack quadratically.
      const p = para.replace(/\[[^[\]\n]*\]\(#[^()\n]*\)/g, "");
      return (mentionsAi(p) || headingAi) && CONTRIBUTION_TERM.test(p) && (USAGE_CUE.test(p) || headingAi);
    });
    if (hit) return { heading };
    if (headingAi && heading && CONTRIBUTION_TERM.test(heading)) {
      if (paragraphs(lines.slice(s.start, s.end)).length) return { heading };
    }
  }
  return null;
}

async function findAiPolicy(repo: BoardRepo, entries: TreeEntry[]): Promise<Census["aiPolicy"]> {
  const depth = (p: string) => p.split("/").length;
  const policies = entries
    .filter((e) => !isLink(e) && POLICY_FILE.test(base(e.path)))
    .sort((a, b) => depth(a.path) - depth(b.path) || a.path.localeCompare(b.path));
  for (const e of policies) {
    const text = await blob(repo, e, POLICY_MAX);
    if (text === null) continue;
    const found = aiSection(text);
    if (found) return { path: e.path, ...found };
    // A file named for an AI policy is the policy even when no section passes the filter.
    const first = sections(text.split(/\r?\n/)).find((s) => s.heading);
    return { path: e.path, heading: first?.heading ?? null };
  }
  const contributing = entries
    .filter((e) => !isLink(e) && CONTRIBUTING_FILE.test(base(e.path)) && CONTRIBUTING_DIRS.has(dir(e.path)))
    .sort((a, b) => depth(a.path) - depth(b.path) || a.path.localeCompare(b.path));
  for (const e of contributing) {
    const text = await blob(repo, e, POLICY_MAX);
    if (text === null) continue;
    const found = aiSection(text);
    if (found) return { path: e.path, ...found };
  }
  return null;
}

function empty(repo: BoardRepo): Census {
  return {
    host: repo.host,
    owner: repo.owner,
    name: repo.name,
    branch: repo.branch,
    truncated: false,
    agentsMd: [],
    claudeMd: [],
    geminiMd: [],
    rootLinks: {},
    claudeMdImportsAgentsMd: null,
    copilotInstructions: false,
    copilotPathInstructions: 0,
    windsurfRules: 0,
    windsurfrulesLegacy: false,
    cursorRules: 0,
    cursorrulesLegacy: false,
    conventionsMd: false,
    llmsTxt: [],
    skills: { agents: 0, claude: 0, other: 0 },
    aiPolicy: null,
  };
}

async function census(repo: BoardRepo): Promise<Census> {
  const c = empty(repo);
  let entries: TreeEntry[];
  try {
    const t = await tree(repo);
    entries = t.entries;
    c.truncated = t.truncated;
  } catch (err) {
    // 409 is an empty repository; 404 is gone, renamed past redirects, or a stale default branch.
    c.error = err instanceof HttpError ? `HTTP ${err.status}` : String(err);
    return c;
  }
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  for (const e of entries) {
    const p = lower(e.path);
    const b = base(e.path);
    if (b === "agents.md") c.agentsMd.push(e.path);
    if (b === "claude.md") c.claudeMd.push(e.path);
    if (b === "gemini.md") c.geminiMd.push(e.path);
    if (b === "llms.txt" || b === "llms-full.txt") c.llmsTxt.push(e.path);
    if (p === ".github/copilot-instructions.md") c.copilotInstructions = true;
    if (p.startsWith(".github/instructions/") && p.endsWith(".instructions.md")) c.copilotPathInstructions++;
    if (p.startsWith(".windsurf/rules/")) c.windsurfRules++;
    if (p === ".windsurfrules") c.windsurfrulesLegacy = true;
    if (p.startsWith(".cursor/rules/") && p.endsWith(".mdc")) c.cursorRules++;
    if (p === ".cursorrules") c.cursorrulesLegacy = true;
    if (p === "conventions.md") c.conventionsMd = true;
    if (b === "skill.md") {
      if (/(^|\/)\.agents\/skills\//.test(p)) c.skills.agents++;
      else if (/(^|\/)\.claude\/skills\//.test(p)) c.skills.claude++;
      else c.skills.other++;
    }
  }

  for (const e of entries) {
    const key = LINK_PATHS[lower(e.path)];
    if (!key || !isLink(e)) continue;
    const target = await blob(repo, e, LINK_MAX);
    if (target !== null) c.rootLinks[key] = target.trim();
  }

  const rootClaude = entries.find((e) => lower(e.path) === "claude.md");
  if (rootClaude && !isLink(rootClaude)) {
    const text = await blob(repo, rootClaude, CLAUDE_MD_MAX);
    if (text !== null) c.claudeMdImportsAgentsMd = text.split(/\r?\n/).some((l) => IMPORTS_AGENTS_MD.test(l.trim()));
  }

  c.aiPolicy = await findAiPolicy(repo, entries);
  return c;
}

async function pool<T, R>(items: T[], n: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

const cmp = (a: string, b: string) => (lower(a) < lower(b) ? -1 : lower(a) > lower(b) ? 1 : a < b ? -1 : a > b ? 1 : 0);
const slug = (c: Census) => `${c.owner}/${c.name}`;

// Every metric a page also shows comes from summarizeCensus, so this report and the site can't disagree.
function summarize(rows: Census[], skipped: BoardRepo[]): string {
  const ok = rows.filter((r) => !r.error);
  const c = summarizeCensus(rows, new Date().toISOString());
  const count = (f: (r: Census) => boolean) => ok.filter(f).length;
  const sum = (f: (r: Census) => number) => ok.reduce((n, r) => n + f(r), 0);
  const policies = ok.filter((r) => r.aiPolicy);

  const out: string[] = [];
  const line = (s = "") => out.push(s);
  line("# File census summary");
  line();
  line(`${rows.length} GitHub repos read, ${c.repos} with a tree. ${skipped.length} non-GitHub rows skipped.`);
  line();
  line("| Metric | Repos |");
  line("| --- | --- |");
  const metric = (label: string, n: number) => line(`| ${label} | ${n} |`);
  metric("any AGENTS.md", c.anyAgentsMd);
  metric("root AGENTS.md", c.rootAgentsMd);
  metric("nested AGENTS.md (more than one, or not at root)", c.nestedAgentsMd);
  metric("any CLAUDE.md", c.anyClaudeMd);
  metric("root CLAUDE.md", c.rootClaudeMd);
  metric("CLAUDE.md in a subdirectory (not .claude/)", c.nestedClaudeMd);
  metric("root CLAUDE.md symlink -> AGENTS.md", c.claudeLinksToAgents);
  metric("root AGENTS.md or CLAUDE.md symlink (any target)", c.anyRootLink);
  metric("root CLAUDE.md imports @AGENTS.md", c.claudeImportsAgents);
  metric("root AGENTS.md and CLAUDE.md as two unlinked files", c.twoUnlinkedFiles);
  metric("any GEMINI.md", c.geminiMd);
  metric(
    "root GEMINI.md symlink",
    count((r) => !!r.rootLinks["GEMINI.md"]),
  );
  metric(".github/copilot-instructions.md", c.copilot);
  metric("  of which with a root AGENTS.md", c.copilotAndAgentsMd);
  metric(`.github/instructions/**/*.instructions.md (${c.copilotPathFiles} files)`, c.copilotPath);
  metric(`.windsurf/rules/ (${sum((r) => r.windsurfRules)} files)`, c.windsurf);
  metric(".windsurfrules (legacy)", c.windsurfLegacy);
  metric(`.cursor/rules/**/*.mdc (${sum((r) => r.cursorRules)} files)`, c.cursorRules);
  metric(".cursorrules (legacy)", c.cursorrulesLegacy);
  metric(
    "root CONVENTIONS.md",
    count((r) => r.conventionsMd),
  );
  metric("llms.txt / llms-full.txt anywhere", c.llmsTxt);
  metric("  of which at the root", c.llmsTxtRoot);
  metric(`SKILL.md under .agents/skills/ (${sum((r) => r.skills.agents)} files)`, c.skillsAgents);
  metric(`SKILL.md under .claude/skills/ (${sum((r) => r.skills.claude)} files)`, c.skillsClaude);
  metric("  under both", c.skillsBoth);
  metric(
    `SKILL.md elsewhere (${sum((r) => r.skills.other)} files)`,
    count((r) => r.skills.other > 0),
  );
  metric("trees truncated", c.truncated);
  metric("aiPolicy candidates", policies.length);
  line();

  line("## Most AGENTS.md files");
  line();
  for (const r of c.mostAgentsMd) line(`- ${r.repo}: ${r.files}`);
  line();

  const links = ok.filter((r) => Object.keys(r.rootLinks).length);
  line("## Symlinked agent files");
  line();
  for (const r of links)
    line(
      `- ${slug(r)}: ${Object.entries(r.rootLinks)
        .map(([k, v]) => `${k} -> ${v}`)
        .join(", ")}`,
    );
  line();

  line("## aiPolicy candidates");
  line();
  line("| Repo | Path | Heading |");
  line("| --- | --- | --- |");
  const cell = (s: string | null) => (s ?? "").replace(/\|/g, "\\|");
  for (const r of policies) line(`| ${slug(r)} | ${cell(r.aiPolicy!.path)} | ${cell(r.aiPolicy!.heading)} |`);
  line();

  line("## Failed or truncated");
  line();
  const bad = rows.filter((r) => r.error || r.truncated);
  if (!bad.length) line("None.");
  for (const r of bad) line(`- ${slug(r)} (${r.branch ?? "no branch"}): ${r.error ?? "tree truncated"}`);
  line();

  line("## Skipped (not GitHub)");
  line();
  for (const r of skipped) line(`- ${r.host}: ${r.owner}/${r.name}`);
  return out.join("\n");
}

async function main() {
  const all = readBoardRepos(DB).sort((a, b) => cmp(a.host, b.host) || cmp(a.owner, b.owner) || cmp(a.name, b.name));
  const repos = all.filter((r) => r.host === "github");
  const skipped = all.filter((r) => r.host !== "github");

  const rows = await pool(repos, CONCURRENCY, async (repo, i) => {
    const c = await census(repo);
    console.error(
      `[${i + 1}/${repos.length}] ${slug(c)}${c.error ? ` ${c.error}` : ""}${c.truncated ? " truncated" : ""}`,
    );
    return c;
  });

  // One repo per line keeps the file small and its diffs readable.
  const json = `{"generatedAt":${JSON.stringify(new Date().toISOString())},"skipped":${JSON.stringify(
    skipped.map(({ host, owner, name }) => ({ host, owner, name })),
  )},"repos":[\n${rows.map((r) => JSON.stringify(r)).join(",\n")}\n]}\n`;
  writeFileSync(OUT, json);

  const summary = summarize(rows, skipped);
  console.log(summary);
  if (SUMMARY_FILE) writeFileSync(SUMMARY_FILE, `${summary}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
