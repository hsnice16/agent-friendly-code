import sitemap from "../app/sitemap";
import { APP_URL } from "../lib/version";

// IndexNow proves ownership by fetching public/<KEY>.txt, so the two must match.
const KEY = "4dd7fff8f3939ce418407429808eb415";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10000;

function sinceArg(): Date | null {
  const i = process.argv.indexOf("--since");
  if (i === -1) return null;

  const since = new Date(process.argv[i + 1] ?? "");
  if (Number.isNaN(since.getTime())) {
    throw new Error("--since needs an ISO 8601 timestamp");
  }
  return since;
}

async function main() {
  const since = sinceArg();
  // With --since, an entry that carries no lastmod is one that did not change.
  const urls = sitemap()
    .filter((e) => !since || (e.lastModified != null && new Date(e.lastModified) >= since))
    .map((e) => e.url);

  if (urls.length === 0) {
    console.log("indexnow: nothing changed");
    return;
  }

  if (process.argv.includes("--dry-run")) {
    console.log(urls.join("\n"));
    return;
  }

  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        key: KEY,
        host: new URL(APP_URL).host,
        keyLocation: `${APP_URL}/${KEY}.txt`,
        urlList: urls.slice(i, i + MAX_URLS_PER_REQUEST),
      }),
    });

    if (!res.ok) {
      throw new Error(`indexnow: ${res.status} ${res.statusText} ${await res.text()}`);
    }
  }

  console.log(`indexnow: submitted ${urls.length} URLs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
