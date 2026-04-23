import { db } from "../lib/db";

db.exec("SELECT 1");
console.log("DB initialized at", `${process.cwd()}/data/rank.db`);
