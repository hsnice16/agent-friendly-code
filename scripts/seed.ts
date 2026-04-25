import { spawnSync } from "node:child_process";
import { SEEDS } from "./seed-list";

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

console.log(`\nseed done — ${ok} ok / ${failed} failed. Run \`bun run dev\` and open http://localhost:3000`);
