// Board repos record their badge at rescore time; a repo off the board can
// embed one too, and GitHub code search is the only place that shows it.

import { type CodeSearchHit, selfBadgeRepos } from "../lib/badge-adoption";

try {
  process.loadEnvFile();
} catch {}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is required: GitHub code search rejects anonymous requests.");
  process.exit(1);
}

const QUERY = '"agentfriendlycode.com/api/badge"';
const PER_PAGE = 100;
// Code search returns at most 1,000 results.
const MAX_PAGES = 10;

type Item = {
  path: string;
  repository: { full_name: string; fork: boolean };
  text_matches?: { fragment: string }[];
};

type Page = { total: number; incomplete: boolean; items: Item[] } | "rate-limited";

async function page(n: number): Promise<Page> {
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(QUERY)}&per_page=${PER_PAGE}&page=${n}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "agent-friendly-code",
      Accept: "application/vnd.github.text-match+json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(15_000),
  });
  // Code search allows about 10 requests a minute; keep what was already read.
  if (res.status === 403 || res.status === 429) return "rate-limited";
  if (!res.ok) throw new Error(`code search page ${n}: HTTP ${res.status}`);
  const body = (await res.json()) as { total_count: number; incomplete_results: boolean; items: Item[] };
  return { total: body.total_count, incomplete: body.incomplete_results, items: body.items };
}

async function main() {
  const hits: CodeSearchHit[] = [];
  let total = 0;
  let partial = false;
  for (let n = 1; n <= MAX_PAGES; n++) {
    const res = await page(n);
    if (res === "rate-limited") {
      partial = true;
      break;
    }
    total = res.total;
    partial ||= res.incomplete;
    hits.push(
      ...res.items.map((i) => ({
        repo: i.repository.full_name,
        fork: i.repository.fork,
        path: i.path,
        fragments: (i.text_matches ?? []).map((m) => m.fragment),
      })),
    );
    if (hits.length >= total || res.items.length < PER_PAGE) break;
  }
  if (total > MAX_PAGES * PER_PAGE) partial = true;

  const adopters = selfBadgeRepos(hits);
  console.log(`${adopters.length} repos show their own badge (${hits.length} of ${total} code search hits read):`);
  for (const repo of adopters) console.log(`  https://github.com/${repo}`);
  if (partial) console.warn("Partial: rate-limited or past code search's 1,000-result cap. Rerun later for the rest.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
