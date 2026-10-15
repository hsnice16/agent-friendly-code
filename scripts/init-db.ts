import { db } from "../lib/db";
import { ensureIndexes, ensureRepoAbout } from "../lib/db-schema";

ensureRepoAbout(db);
ensureIndexes(db);
console.log("DB initialized at", db.name);
