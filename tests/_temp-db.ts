import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Import for its side effect, before anything that loads lib/db.ts: that module
// opens its file on import, and without this it opens the committed database.
const dir = mkdtempSync(join(tmpdir(), "afc-db-"));
process.env.RANK_DB_PATH = join(dir, "rank.db");

process.on("exit", () => rmSync(dir, { recursive: true, force: true }));
