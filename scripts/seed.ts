import { spawnSync } from "node:child_process";
import { join } from "node:path";

import { reconcileSeeds } from "../lib/db";
import { PRIVATE_EXIT_CODE, seedTargets } from "../lib/seeds";
import { SEEDS } from "./seed-list";
import { seedPackages } from "./seed-packages";

// More removals than this in one run is treated as a broken seed list, and the
// run aborts with no row changed. Raise it for a deliberate bulk removal.
const override = process.env.SEED_MAX_PRUNE?.trim();
const MAX_PRUNE = override && /^\d+$/.test(override) ? Number(override) : 10;

async function main() {
  // Before scoring, not after: scoring a renamed seed while its row still holds
  // the old name would insert a second row instead of updating the first.
  const { renamed, pruned } = reconcileSeeds(seedTargets(SEEDS), MAX_PRUNE);
  for (const r of renamed) console.log(`renamed ${r}`);
  for (const url of pruned) console.log(`pruned ${url} — not in the seed list`);

  const failed: string[] = [];
  const skipped: string[] = [];

  for (const s of SEEDS) {
    console.log(`\n━━━ seeding ${s.url}${s.note ? ` — ${s.note}` : ""} ━━━`);

    // This runtime and its loader flags (tsx's under Node), so the seed run needs no second toolchain.
    const r = spawnSync(process.execPath, [...process.execArgv, join(__dirname, "score.ts"), "score", s.url], {
      stdio: "inherit",
    });

    if (r.status === PRIVATE_EXIT_CODE) {
      skipped.push(s.url);
    } else if (r.status !== 0) {
      failed.push(s.url);
      console.error(`  (failed with status ${r.status}, continuing)`);
    }
  }

  const ok = SEEDS.length - failed.length - skipped.length;
  console.log(`\nseed done — ${ok} ok / ${failed.length} failed / ${skipped.length} private.`);

  if (skipped.length > 0) {
    console.error("\nPrivate, not rescored — remove these from the seed list:");
    for (const url of skipped) {
      console.error(`  ✗ ${url}`);
      if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Seed is private::${url}`);
    }
  }

  if (failed.length > 0) {
    console.error("\nNot rescored — these keep their previous score until a run succeeds:");
    for (const url of failed) {
      console.error(`  ✗ ${url}`);
      if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Seed failed to score::${url}`);
    }
  }

  await seedPackages();

  console.log(`\nrun \`bun run dev\` and open http://localhost:3000`);
}

void main();
