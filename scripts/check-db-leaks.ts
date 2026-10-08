import { readFileSync } from "node:fs";

import { findLeaks } from "../lib/db-leaks";

const files = process.argv.slice(2);
let found = 0;

for (const file of files.length ? files : ["data/rank.db"]) {
  for (const leak of findLeaks(readFileSync(file))) {
    console.error(`✗ ${file} @${leak.offset}: ${leak.label}: ${leak.match}`);
    found++;
  }
}

if (found) {
  console.error(
    `\n${found} match(es). Fix the writer, rescore the rows, then VACUUM so freed pages drop the old bytes. Don't commit the DB until this passes.`,
  );
  process.exit(1);
}
