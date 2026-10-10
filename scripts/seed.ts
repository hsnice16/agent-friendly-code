import { spawnSync } from "node:child_process";

import { reconcileSeeds } from "../lib/db";
import { seedTargets } from "../lib/seeds";
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

  for (const s of SEEDS) {
    console.log(`\n━━━ seeding ${s.url}${s.note ? ` — ${s.note}` : ""} ━━━`);

    const r = spawnSync("bun", ["run", "score", s.url], {
      stdio: "inherit",
    });

    if (r.status !== 0) {
      failed.push(s.url);
      console.error(`  (failed with status ${r.status}, continuing)`);
    }
  }

  console.log(`\nseed done — ${SEEDS.length - failed.length} ok / ${failed.length} failed.`);

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
