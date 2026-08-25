// Asserts the live-score path scores identically to `bun run score`.
//
// Both paths run fresh from a repo URL, with the materializer pinned to the SHA
// the clone fetched, so a push mid-run cannot fake a difference. `detail` is
// compared as well as `overall`: past defects moved only a file count, leaving
// the overall score untouched one bucket boundary away from mattering.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { shallowClone } from "../lib/clients/git";
import { parseRepoUrl } from "../lib/clients/github";
import { materialize } from "../lib/live-score/materialize";
import { scoreRepo } from "../lib/scoring/scorer";

try {
  process.loadEnvFile();
} catch {}

// Chosen for the failure classes they reproduce, not for popularity. `pr` marks
// the subset a pull request runs (`--pr`): the classes most likely to regress
// from a scoring change, without the full sweep's clone time. Keeping the
// selection here rather than in the workflow YAML stops the two from drifting.
const FIXTURES = [
  { url: "https://github.com/expressjs/express", why: "README spelled `Readme.md`", pr: true },
  { url: "https://github.com/cloudflare/vinext", why: "dangling symlink (CLAUDE.md -> missing AGENTS.md)", pr: true },
  { url: "https://github.com/vercel/ai", why: "link target with a trailing newline", pr: true },
  { url: "https://github.com/honojs/hono", why: "small baseline", pr: true },
  { url: "https://github.com/zed-industries/zed", why: "251 symlinks" },
  { url: "https://github.com/ClickHouse/ClickHouse", why: "AGENTS.md symlinked into .claude/" },
  { url: "https://github.com/JetBrains/kotlin", why: "tree API truncates" },
  { url: "https://gitlab.com/graphviz/graphviz", why: "submodules, GitLab pagination" },
  { url: "https://bitbucket.org/snakeyaml/snakeyaml", why: "Bitbucket" },
];

type Diff = { slug: string; lines: string[] };

function signalDiffs(clone: ReturnType<typeof scoreRepo>, live: ReturnType<typeof scoreRepo>): string[] {
  const lines: string[] = [];

  for (const [i, s] of clone.signals.entries()) {
    const t = live.signals[i];
    if (!t || s.id !== t.id) {
      lines.push(`    signal order differs at ${i}`);
      continue;
    }
    if (Math.abs(s.pass - t.pass) > 0.0001 || s.detail !== t.detail || s.matchedPath !== t.matchedPath) {
      lines.push(`    ${s.id}: clone=${s.pass} "${s.detail}" | live=${t.pass} "${t.detail}"`);
    }
  }

  for (const [i, m] of clone.modelScores.entries()) {
    const t = live.modelScores[i];
    if (!t || m.score.toFixed(2) !== t.score.toFixed(2)) {
      lines.push(`    model ${m.modelId}: clone=${m.score.toFixed(2)} | live=${t?.score.toFixed(2)}`);
    }
  }

  return lines;
}

async function compare(url: string, work: string): Promise<Diff | null> {
  const parsed = parseRepoUrl(url);
  if (!parsed) throw new Error(`unparseable: ${url}`);

  const slug = `${parsed.owner}/${parsed.name}`;
  const cloneDir = join(work, "clone");
  const liveDir = join(work, "live");

  try {
    await shallowClone(parsed.cloneUrl, cloneDir);
    const cloned = scoreRepo(cloneDir);
    const sha = execFileSync("git", ["-C", cloneDir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();

    await materialize(parsed.host, parsed.owner, parsed.name, sha, liveDir);
    const live = scoreRepo(liveDir);

    const lines = signalDiffs(cloned, live);
    if (cloned.overall.toFixed(2) !== live.overall.toFixed(2)) {
      lines.unshift(`    overall: clone=${cloned.overall.toFixed(1)} | live=${live.overall.toFixed(1)}`);
    }

    if (lines.length === 0) {
      console.log(`  ok   ${slug}  ${cloned.overall.toFixed(1)}`);
      return null;
    }

    console.log(`  DIFF ${slug}`);
    for (const l of lines) console.log(l);
    return { slug, lines };
  } finally {
    // Unguarded, this kills the run: delta-io/delta nests fixtures deep enough
    // to blow PATH_MAX on macOS during cleanup.
    try {
      rmSync(cloneDir, { recursive: true, force: true });
      rmSync(liveDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const urls = args.filter((a) => !a.startsWith("-"));
  const fixtures = args.includes("--pr") ? FIXTURES.filter((f) => f.pr) : FIXTURES;
  const targets = urls.length > 0 ? urls : fixtures.map((f) => f.url);

  // Serial on purpose: at four parallel workers, kotlin and pytorch produced
  // spurious diffs that vanished on isolated re-run.
  const work = mkdtempSync(join(tmpdir(), "afc-parity-"));
  const diffs: Diff[] = [];
  const errors: string[] = [];

  console.log(`Parity check — ${targets.length} repo(s)\n`);

  for (const url of targets) {
    try {
      const diff = await compare(url, work);
      if (diff) diffs.push(diff);
    } catch (err) {
      const message = (err as Error).message.slice(0, 160);
      console.log(`  ERR  ${url} — ${message}`);
      errors.push(url);
    }
  }

  rmSync(work, { recursive: true, force: true });

  console.log(
    `\n${targets.length - diffs.length - errors.length} identical | ${diffs.length} differ | ${errors.length} errored`,
  );

  if (diffs.length > 0 || errors.length > 0) process.exit(1);
}

void main();
