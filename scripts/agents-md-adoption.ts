import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  type AdoptionPoint,
  type AdoptionSeries,
  buildCohort,
  lastPerDay,
  MIN_REPOS,
  parseAdoption,
  repoFlags,
  snapshotPoint,
} from "../lib/agents-md-adoption";
import { readSnapshotRows } from "../lib/db-snapshot";

// Every committed version of rank.db is one snapshot of the board, so the
// series is rebuilt from git history each run instead of appended to: a run
// that fails or is discarded leaves nothing to reconcile.
const DB = "data/rank.db";
const OUT = "data/agents-md-adoption.json";

const git = (...args: string[]) => execFileSync("git", args, { maxBuffer: 1 << 30 });

type Snapshot = { at: Date; write: (to: string) => void };

function snapshots(): Snapshot[] {
  if (git("rev-parse", "--is-shallow-repository").toString().trim() === "true") {
    throw new Error("shallow clone: the series needs every commit of rank.db (fetch-depth: 0)");
  }
  const list: Snapshot[] = git("log", "--reverse", "--format=%H %cI", "--", DB)
    .toString()
    .trim()
    .split("\n")
    .map((line) => {
      const [sha, at] = line.split(" ");
      return { at: new Date(at), write: (to) => writeFileSync(to, git("show", `${sha}:${DB}`)) };
    });

  // The rescore job runs this before its rank.db is committed; today's point is that file.
  if (git("hash-object", DB).toString().trim() !== git("rev-parse", `HEAD:${DB}`).toString().trim()) {
    list.push({ at: new Date(), write: (to) => copyFileSync(DB, to) });
  }
  return list;
}

function main() {
  // A temp copy even for the working file: opening data/rank.db leaves -wal and -shm beside it.
  const dir = mkdtempSync(join(tmpdir(), "afc-adoption-"));
  const file = join(dir, "rank.db");
  const points: AdoptionPoint[] = [];
  let first: ReturnType<typeof repoFlags> | null = null;
  let last: ReturnType<typeof repoFlags> | null = null;

  try {
    for (const s of lastPerDay(snapshots())) {
      rmSync(file, { force: true });
      s.write(file);
      const rows = readSnapshotRows(file);
      const point = snapshotPoint(s.date, rows);
      if (point.repos < MIN_REPOS) continue;
      points.push(point);
      last = repoFlags(rows);
      first ??= last;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  const series: AdoptionSeries = {
    minRepos: MIN_REPOS,
    points,
    cohort: first && last ? buildCohort(points[0].date, first, last) : null,
  };
  parseAdoption(series);

  // One point per line keeps the daily diff to a line or two.
  const json = [
    "{",
    `  "minRepos": ${series.minRepos},`,
    `  "cohort": ${JSON.stringify(series.cohort)},`,
    '  "points": [',
    points.map((p) => `    ${JSON.stringify(p)}`).join(",\n"),
    "  ]",
    "}",
    "",
  ].join("\n");
  writeFileSync(`${OUT}.tmp`, json);
  renameSync(`${OUT}.tmp`, OUT);

  const latest = points.at(-1);
  console.log(`${OUT}: ${points.length} days, ${points[0]?.date} to ${latest?.date}, ${latest?.repos} repos now`);
}

main();
