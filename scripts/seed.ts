import { spawnSync } from "node:child_process";

import { SEEDS } from "./seed-list";
import { seedPackages } from "./seed-packages";

async function main() {
  let ok = 0,
    failed = 0;

  for (const s of SEEDS) {
    console.log(`\n━━━ seeding ${s.url}${s.note ? ` — ${s.note}` : ""} ━━━`);

    const r = spawnSync("bun", ["run", "score", s.url], {
      stdio: "inherit",
    });

    if (r.status === 0) {
      ok++;
    } else {
      failed++;
      console.error(`  (failed with status ${r.status}, continuing)`);
    }
  }

  console.log(`\nseed done — ${ok} ok / ${failed} failed.`);

  await seedPackages();

  console.log(`\nrun \`bun run dev\` and open http://localhost:3000`);
}

void main();
