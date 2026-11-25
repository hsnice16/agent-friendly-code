import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { finishHistory, historyJson, newHistory, parseFileHistory, recordSnapshot } from "../lib/agent-file-history";
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
const HISTORY_OUT = "data/agent-file-history.json";

const git = (...args: string[]) => execFileSync("git", args, { maxBuffer: 1 << 30 });

type Snapshot = { at: Date; scorer: string; write: (to: string) => void };

// The checks' code as of a commit. A rescore commits rank.db on top of the code
// that scored it, so this is the version that wrote that snapshot.
const SIGNALS_DIR = "lib/scoring/signals";
const scorerAt = (rev: string) => {
  try {
    return git("rev-parse", `${rev}:${SIGNALS_DIR}`).toString().trim();
  } catch {
    return "";
  }
};

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
      return { at: new Date(at), scorer: scorerAt(sha), write: (to) => writeFileSync(to, git("show", `${sha}:${DB}`)) };
    });

  // The rescore job runs this before its rank.db is committed; today's point is that file.
  if (git("hash-object", DB).toString().trim() !== git("rev-parse", `HEAD:${DB}`).toString().trim()) {
    list.push({ at: new Date(), scorer: scorerAt("HEAD"), write: (to) => copyFileSync(DB, to) });
  }
  return list;
}

function main() {
  // A temp copy even for the working file: opening data/rank.db leaves -wal and -shm beside it.
  const dir = mkdtempSync(join(tmpdir(), "afc-adoption-"));
  const file = join(dir, "rank.db");
  const points: AdoptionPoint[] = [];
  const history = newHistory();
  let first: ReturnType<typeof repoFlags> | null = null;
  let last: ReturnType<typeof repoFlags> | null = null;

  try {
    for (const s of lastPerDay(snapshots())) {
      rmSync(file, { force: true });
      s.write(file);
      const rows = readSnapshotRows(file);
      // Every snapshot, even below MIN_REPOS: a repo's first day on the board is one.
      recordSnapshot(history, s.date, rows, s.scorer);
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

  const perRepo = finishHistory(history);
  parseFileHistory(JSON.parse(historyJson(perRepo)));
  writeFileSync(`${HISTORY_OUT}.tmp`, historyJson(perRepo));
  renameSync(`${HISTORY_OUT}.tmp`, HISTORY_OUT);

  const latest = points.at(-1);
  console.log(`${OUT}: ${points.length} days, ${points[0]?.date} to ${latest?.date}, ${latest?.repos} repos now`);
  console.log(`${HISTORY_OUT}: ${Object.keys(perRepo).length} repos with an agent file on record`);
}

main();
