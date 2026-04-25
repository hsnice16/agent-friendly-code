import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { shallowClone } from "../lib/clients/git";
import { fetchRepoMeta, parseRepoUrl } from "../lib/clients/github";
import { saveScoredRepo } from "../lib/db";
import { scoreRepo } from "../lib/scoring/scorer";

try {
  process.loadEnvFile();
} catch {}

const CLONE_ROOT = join(process.cwd(), "tmp-clones");

async function scoreCommand(target: string): Promise<void> {
  const startedAt = Date.now();

  let url = "";
  let name = "";
  let owner = "";
  let host = "local";
  let repoPath: string;
  let stars: number | undefined;
  let defaultBranch: string | undefined;
  let language: string | null | undefined;

  if (existsSync(target) && statSync(target).isDirectory()) {
    repoPath = target;

    const parts = target.split("/").filter(Boolean);
    name = parts[parts.length - 1] || "local";

    owner = "local";
    url = `local:${target}`;
  } else {
    const parsed = parseRepoUrl(target);

    if (!parsed) {
      throw new Error(`Could not parse repo URL: ${target}`);
    }

    host = parsed.host;
    name = parsed.name;
    owner = parsed.owner;
    url = parsed.canonicalUrl;
    mkdirSync(CLONE_ROOT, { recursive: true });

    repoPath = join(CLONE_ROOT, `${parsed.host}__${parsed.owner.replace(/\//g, "_")}__${parsed.name}`);

    console.log(`[clone] ${parsed.cloneUrl} → ${repoPath}`);
    await shallowClone(parsed.cloneUrl, repoPath);

    const meta = await fetchRepoMeta(parsed);

    if (meta) {
      defaultBranch = meta.defaultBranch;
      stars = meta.stars;
      language = meta.language;
    }
  }

  console.log(`[score] scanning ${repoPath}`);
  const result = scoreRepo(repoPath);

  saveScoredRepo({
    url,
    host,
    name,
    owner,
    stars: stars ?? null,
    overall: result.overall,
    signals: result.signals,
    language: language ?? null,
    modelScores: result.modelScores,
    defaultBranch: defaultBranch ?? null,
  });

  console.log(`\n═══ ${owner}/${name} ═══`);
  console.log(`Overall: ${result.overall.toFixed(1)} / 100`);
  console.log("Per-model:");

  for (const m of result.modelScores) {
    console.log(`  ${m.modelLabel.padEnd(14)}  ${m.score.toFixed(1)}`);
  }

  console.log("\nSignals:");
  for (const s of result.signals) {
    const mark = s.pass >= 1 ? "✔" : s.pass > 0 ? "~" : "✗";
    console.log(`  ${mark} ${s.label.padEnd(28)} ${s.detail}`);
  }

  console.log(`\n(scored in ${((Date.now() - startedAt) / 1000).toFixed(1)}s)`);
}

const [, , cmd, arg] = process.argv;

if (cmd === "score" && arg) {
  scoreCommand(arg).catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.error("Usage: bun run score <github|gitlab|bitbucket url|local-path>");

  process.exit(1);
}
